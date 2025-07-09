import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime

DEFAULT_TOP_N = 10
DEFAULT_THRESHOLD = 0.4

def get_top_features(csv_pth, selected_label, selected_features, target_filter_mode):
    """
    Calculate top N features with correlations >threshold to the selected label
    If not enough features meet the threshold, use all features >threshold

    Args:
    csv_pth: Path to the CSV file
    selected_label: Target label column name
    selected_features: List of features to analyze
    target_filter_mode: Filter mode ("all", "positive", or "negative")
        
    Returns:
        Dictionary with top features and correlation details
    """
    
    try:
        top_n = DEFAULT_TOP_N
        if len(selected_features) < top_n:
            top_n = len(selected_features)  # Use all features if less than top_n available

        data = pd.read_csv(csv_pth)

        # Get available features (exclude the label itself)
        available_features = [col for col in selected_features 
                            if col in data.columns and col != selected_label] # get first column is better

        if not available_features:
            raise Exception("No valid features found for analysis")
        
        # Filter data based on target_filter_mode
        if target_filter_mode == "positive":
            # Keep only rows where selected_label > 0
            data = data[data[selected_label] > 0]
            if len(data) == 0:
                raise Exception(f"No positive values found for {selected_label}")
        elif target_filter_mode == "negative":
            # Keep only rows where selected_label < 0
            data = data[data[selected_label] < 0]
            if len(data) == 0:
                raise Exception(f"No negative values found for {selected_label}")

        # Calculate correlations with the selected label
        correlations = data[available_features].corrwith(data[selected_label])
        
        # Remove NaN values
        correlations = correlations.dropna()
        
        if correlations.empty:
            raise Exception("No valid correlations could be calculated")
        
        # Filter features with absolute correlation > threshold
        strong_correlations = correlations[correlations.abs() > DEFAULT_THRESHOLD]
        
        if len(strong_correlations) == 0:
            # If no features meet threshold, fall back to top features by absolute correlation
            top_correlations_abs = correlations.abs().sort_values(ascending=False)[:top_n]
            top_features = top_correlations_abs.index.tolist()
            used_threshold = False
        elif len(strong_correlations) <= top_n:
            # Use all features that meet threshold
            top_features = strong_correlations.abs().sort_values(ascending=False).index.tolist()
            used_threshold = True
        else:
            # More than top_n features meet threshold, take the strongest top_n
            top_correlations_abs = strong_correlations.abs().sort_values(ascending=False)[:top_n]
            top_features = top_correlations_abs.index.tolist()
            used_threshold = True
        
        # Create detailed correlation information
        correlation_details = {}
        for i, feature in enumerate(top_features):
            correlation_details[feature] = {
                'correlation': float(correlations[feature]),
                'abs_correlation': float(abs(correlations[feature])),
                'rank': int(i + 1),  # Convert to int
                'meets_threshold': bool(abs(correlations[feature]) > DEFAULT_THRESHOLD)  # Explicitly convert to bool
            }
        
        return {
            'top_features': top_features,
            'correlations': {feature: float(correlations[feature]) for feature in top_features},
            'correlation_details': correlation_details,
            'total_features_analyzed': int(len(available_features)),  # Convert to int
            'threshold_used': float(DEFAULT_THRESHOLD),  # Convert to float
            'features_above_threshold': int(len(strong_correlations)),  # Convert to int
            'used_threshold_filter': bool(used_threshold)  # Explicitly convert to bool
        }
        
    except Exception as e:
        raise Exception(f"Error calculating top features: {str(e)}")