import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime

def feature_impact(selected_features, selected_label, save_path="C:\\Users\\USCC\\Documents\\MBR膜壓預測計劃_LCY\\images"):
    """
    Analyze correlation between selected label and each selected feature individually
    """
    # Load the processed dataset
    csv_path = "C:\\Users\\USCC\\Documents\\MBR膜壓預測計劃_LCY\\database\\processed_0306-0408.csv"
    
    try:
        data = pd.read_csv(csv_path)
        
        # Ensure save directory exists
        os.makedirs(save_path, exist_ok=True)
        
        # Calculate correlations between selected label and each selected feature
        label_feature_correlations = data[selected_features].corrwith(data[selected_label])
        
        # Remove any NaN correlations
        label_feature_correlations = label_feature_correlations.dropna()
        
        results = {}
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # All correlations - bar chart showing label vs each feature
        fig, ax = plt.subplots(figsize=(12, 8))
        colors = ['green' if corr > 0 else 'red' for corr in label_feature_correlations.values]
        bars = ax.bar(range(len(label_feature_correlations)), 
                     label_feature_correlations.values, 
                     color=colors, alpha=0.7)
        
        # Add correlation values on top of bars
        for i, (feature, corr) in enumerate(label_feature_correlations.items()):
            ax.text(i, corr + (0.01 if corr >= 0 else -0.03), f'{corr:.3f}', 
                   ha='center', va='bottom' if corr >= 0 else 'top', fontsize=10)
        
        ax.set_xlabel('Selected Features')
        ax.set_ylabel('Correlation Coefficient')
        ax.set_title(f'Correlations: {selected_label} vs Selected Features', fontsize=14)
        ax.set_xticks(range(len(label_feature_correlations)))
        ax.set_xticklabels(label_feature_correlations.index, rotation=45, ha='right')
        ax.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        
        all_path = os.path.join(save_path, f"feature_impact_all_{timestamp}.png")
        plt.savefig(all_path, dpi=300, bbox_inches='tight')
        plt.close(fig)
        results['all'] = all_path
        
        # Positive correlations with label
        positive_corr = label_feature_correlations[label_feature_correlations > 0.1]
        
        if not positive_corr.empty:
            fig, ax = plt.subplots(figsize=(10, 6))
            bars = ax.bar(range(len(positive_corr)), positive_corr.values, 
                         color='green', alpha=0.7)
            
            # Add correlation values on bars
            for i, (feature, corr) in enumerate(positive_corr.items()):
                ax.text(i, corr + 0.01, f'{corr:.3f}', ha='center', va='bottom', fontsize=10)
            
            ax.set_title(f'Positive Correlations: {selected_label} vs Features (>0.1)', fontsize=14)
            ax.set_xlabel('Features')
            ax.set_ylabel('Correlation Coefficient')
            ax.set_xticks(range(len(positive_corr)))
            ax.set_xticklabels(positive_corr.index, rotation=45, ha='right')
            ax.grid(True, alpha=0.3)
            plt.tight_layout()
            
            positive_path = os.path.join(save_path, f"feature_impact_positive_{timestamp}.png")
            plt.savefig(positive_path, dpi=300, bbox_inches='tight')
            plt.close(fig)
            results['positive'] = positive_path
        else:
            results['positive'] = ""
        
        # Negative correlations with label
        negative_corr = label_feature_correlations[label_feature_correlations < -0.1]
        
        if not negative_corr.empty:
            fig, ax = plt.subplots(figsize=(10, 6))
            bars = ax.bar(range(len(negative_corr)), negative_corr.values, 
                         color='red', alpha=0.7)
            
            # Add correlation values on bars
            for i, (feature, corr) in enumerate(negative_corr.items()):
                ax.text(i, corr - 0.01, f'{corr:.3f}', ha='center', va='top', fontsize=10)
            
            ax.set_title(f'Negative Correlations: {selected_label} vs Features (<-0.1)', fontsize=14)
            ax.set_xlabel('Features')
            ax.set_ylabel('Correlation Coefficient')
            ax.set_xticks(range(len(negative_corr)))
            ax.set_xticklabels(negative_corr.index, rotation=45, ha='right')
            ax.grid(True, alpha=0.3)
            plt.tight_layout()
            
            negative_path = os.path.join(save_path, f"feature_impact_negative_{timestamp}.png")
            plt.savefig(negative_path, dpi=300, bbox_inches='tight')
            plt.close(fig)
            results['negative'] = negative_path
        else:
            results['negative'] = ""
        
        return results
        
    except Exception as e:
        raise Exception(f"Error in feature analysis: {str(e)}")

def get_top_features(selected_label, all_features, top_n=10, threshold=0.4):
    """
    Calculate top N features with correlations >threshold to the selected label
    If not enough features meet the threshold, use all features >threshold
    """
    # Load the processed dataset
    csv_path = "C:\\Users\\USCC\\Documents\\MBR膜壓預測計劃_LCY\\database\\processed_0306-0408.csv"
    
    try:
        data = pd.read_csv(csv_path)
        
        # Get available features (exclude timestamp and the label itself)
        available_features = [col for col in all_features 
                            if col in data.columns and col != selected_label and col != 'timestamp']
        
        if not available_features:
            raise Exception("No valid features found for analysis")
        
        # Calculate correlations with the selected label
        correlations = data[available_features].corrwith(data[selected_label])
        
        # Remove NaN values
        correlations = correlations.dropna()
        
        if correlations.empty:
            raise Exception("No valid correlations could be calculated")
        
        # Filter features with absolute correlation > threshold
        strong_correlations = correlations[correlations.abs() > threshold]
        
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
                'meets_threshold': bool(abs(correlations[feature]) > threshold)  # Explicitly convert to bool
            }
        
        return {
            'top_features': top_features,
            'correlations': {feature: float(correlations[feature]) for feature in top_features},
            'correlation_details': correlation_details,
            'total_features_analyzed': int(len(available_features)),  # Convert to int
            'threshold_used': float(threshold),  # Convert to float
            'features_above_threshold': int(len(strong_correlations)),  # Convert to int
            'used_threshold_filter': bool(used_threshold)  # Explicitly convert to bool
        }
        
    except Exception as e:
        raise Exception(f"Error calculating top features: {str(e)}")