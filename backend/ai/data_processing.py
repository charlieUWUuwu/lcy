import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime
from typing import Dict, List, Tuple, Any

def data_processing(selected_features: List[str], selected_label: str, save_folder_path: str, csv_path: str, target_filter_mode: str) -> Dict[str, Any]:
    """
    Complete data processing pipeline:
    1. Data cleaning (only selected_features + selected_label)
    2. Label separation (positive/negative)
    3. Time series feature engineering
    4. Correlation calculation
    5.1 Generate TARGET_CONFIG
    5.2 Save feature weights to CSV
    6. Correlation images generation
    7. Save processed data
    
    Args:
        selected_features: List of selected feature names
        selected_label: Target label name
        save_folder_path: Path to save processed data and images
        csv_path: Path to the original CSV file
        file_name: File name without extension for processed file naming
    
    Returns:
        target_config, image paths, processed data path, and weights data path
    """
    
    try:
        # Ensure save directory exists
        os.makedirs(save_folder_path, exist_ok=True)
        os.makedirs(os.path.join(save_folder_path, "images"), exist_ok=True)
        file_name = os.path.splitext(os.path.basename(csv_path))[0]
                
        # Load data
        if not os.path.exists(csv_path):
            raise Exception(f"CSV file not found: {csv_path}")
            
        data = pd.read_csv(csv_path)
        
        # Step 1 - Data cleaning (only selected features + label)
        cleaned_data = _clean_data(data, selected_features)
        
        # Step 2 - Label separation (positive/negative)
        processed_data = _separate_label_classes(cleaned_data, selected_label, target_filter_mode)
        
        # Step 3 - Time series feature engineering
        engineered_data = _create_time_series_features(processed_data, selected_features, selected_label)
        
        # Step 4 - Calculate correlations
        correlations = _calculate_correlations(engineered_data, selected_label, selected_features)
        
        # Step 5 - Generate TARGET_CONFIG, Save weights as separate CSV file
        target_config = _generate_target_config(correlations, selected_label, selected_features, engineered_data)
        weights_data_path = _save_feature_weights_csv(engineered_data, correlations, selected_label, save_folder_path, file_name)

        # Step 6 - Generate correlation images (only selected_features, no time series)
        image_paths = _generate_correlation_images(
            cleaned_data, selected_features, selected_label, save_folder_path, file_name
        )
        
        # Step 7 - Save processed data
        processed_data_path = _save_processed_data(engineered_data, save_folder_path, file_name)
        
        return {
            'corr_img_path': image_paths,
            'training_csv_path': processed_data_path,
            'weight_csv_path': weights_data_path,
            'weight_base_config': target_config,
        }
        
    except Exception as e:
        raise Exception(f"Error in data processing: {str(e)}")

def _reorder_label_columns_to_end(data: pd.DataFrame, selected_label: str) -> pd.DataFrame:
    """
    Reorder columns to move selected_label to the end
    
    Args:
        data: DataFrame to reorder
        selected_label: Label column to move to the end
    
    Returns:
        Reordered DataFrame
    """
    # Check if selected_label exists in the dataframe
    if selected_label not in data.columns:
        # If the label doesn't exist, return the dataframe unchanged
        return data.copy()
    
    # Get all columns except the selected_label
    other_columns = [col for col in data.columns if col != selected_label]
    
    # Create new column order: other columns first, then label column
    new_column_order = other_columns + [selected_label]
    
    # Reorder the dataframe
    reordered_data = data[new_column_order].copy()
    
    return reordered_data
        
def _clean_data(data: pd.DataFrame, selected_features: List[str]) -> pd.DataFrame:
    """
    Step 1: Data cleaning - only clean selected_features
    """
    
    # Only keep selected features + label + timestamp column
    timestamp_col = data.columns[0]  # Assume first column is timestamp
    columns_to_keep = [timestamp_col] + selected_features
    
    # Check if all columns exist
    missing_columns = [col for col in columns_to_keep if col not in data.columns]
    if missing_columns:
        raise Exception(f"Missing columns in data: {missing_columns}")
    
    df = data[columns_to_keep].copy()
    
    # Convert timestamp to datetime and set as index
    try:
        df[timestamp_col] = pd.to_datetime(df[timestamp_col])
        df = df.set_index(timestamp_col)
    except Exception as e:
        df = df.drop(columns=[timestamp_col])
        df.index = pd.date_range(start='2023-01-01', periods=len(df), freq='10s')
    
    # Resample to 10s intervals and take mean
    resample_interval = '10s'
    df_resampled = df.resample(resample_interval).mean()
    
    # Interpolate missing values
    df_interpolated = df_resampled.interpolate(method='linear')
    
    # Fill remaining NaN with 0
    df_processed = df_interpolated.fillna(0)
    
    df_final = df_processed.reset_index()
    
    return df_final

def _separate_label_classes(data: pd.DataFrame, selected_label: str, target_filter_mode: str) -> pd.DataFrame:
    """
    Filter data based on target_filter_mode:
    - "all": Keep all rows (no filtering)
    - "positive": Only keep rows where selected_label > 0
    - "negative": Only keep rows where selected_label < 0
    
    Args:
        data: Input DataFrame
        selected_label: Target label column name
        target_filter_mode: Filtering mode ("all", "positive", or "negative")
        
    Returns:
        Filtered DataFrame
    """
    df = data.copy()
    
    # Return all data if mode is "all" or invalid
    if target_filter_mode not in ["positive", "negative"]:
        return df
    
    # Apply filtering based on target_filter_mode
    if target_filter_mode == "positive":
        # Keep only rows where selected_label > 0
        df = df[df[selected_label] > 0]
    elif target_filter_mode == "negative":
        # Keep only rows where selected_label < 0
        df = df[df[selected_label] < 0]
    
    # Reset index after filtering
    df = df.reset_index(drop=True)
    
    # If no rows match the filter, warn and return empty DataFrame
    if len(df) == 0:
        print(f"Warning: No rows match the {target_filter_mode} filter for {selected_label}")
    
    return df

def _create_time_series_features(data: pd.DataFrame, selected_features: List[str], selected_label: str) -> pd.DataFrame:
    """
    Step 3: Time series feature engineering - add time series features to the CSV
    """
    
    df_feat = data.copy()
    
    # Ensure datetime index for time-based features
    if not isinstance(df_feat.index, pd.DatetimeIndex):
        timestamp_col = df_feat.columns[0]  # First column should be timestamp
        try:
            df_feat[timestamp_col] = pd.to_datetime(df_feat[timestamp_col])
            df_feat = df_feat.set_index(timestamp_col)
        except:
            df_feat.index = pd.date_range(start='2023-01-01', periods=len(df_feat), freq='10s')
    
    # Add cyclical time features
    df_feat['hour_sin'] = np.sin(2 * np.pi * df_feat.index.hour / 24)
    df_feat['hour_cos'] = np.cos(2 * np.pi * df_feat.index.hour / 24)
    df_feat['dayofweek_sin'] = np.sin(2 * np.pi * df_feat.index.dayofweek / 7)
    df_feat['dayofweek_cos'] = np.cos(2 * np.pi * df_feat.index.dayofweek / 7)
    
    # Add lag features for the target
    lags = [360, 720, 1440, 2880]  # Adjusted for 10s intervals
    for lag in lags:
        df_feat[f'{selected_label}_lag_{lag}'] = df_feat[selected_label].shift(lag)
    
    # Add rolling window statistics for the target
    rolling_windows = [360, 1080, 2160]  # Adjusted for 10s intervals
    for window in rolling_windows:
        df_feat[f'{selected_label}_roll_mean_{window}'] = df_feat[selected_label].rolling(window=window, min_periods=1).mean()
        df_feat[f'{selected_label}_roll_std_{window}'] = df_feat[selected_label].rolling(window=window, min_periods=1).std()
    
    # Drop rows with NaN values from lag features
    df_feat.dropna(inplace=True)

    engineered_data = df_feat.reset_index()

    # Reorder columns to move selected_label to the end
    engineered_data = _reorder_label_columns_to_end(engineered_data, selected_label)
    
    return engineered_data

def _calculate_correlations(data: pd.DataFrame, selected_label: str, selected_features: List[str]) -> Dict[str, Dict[str, float]]:
    """
    Step 4: Calculate correlations - only selected_label vs (selected_features + time_series_features)
    """
    # Get time series features (all columns that are not original features or label)
    original_cols = set(selected_features + [selected_label])
    timestamp_col = data.columns[0] if not isinstance(data.index, pd.DatetimeIndex) else None
    if timestamp_col:
        original_cols.add(timestamp_col)
    
    time_series_features = [col for col in data.columns if col not in original_cols]
    all_features = selected_features + time_series_features
    
    correlations = {}
    
    # Selected label vs (selected_features + time_series_features)
    label_corr = data[all_features].corrwith(data[selected_label])
    correlations['label_vs_all_features'] = label_corr.dropna().to_dict()
    
    return correlations

def _generate_target_config(correlations: Dict[str, Dict[str, float]], selected_label: str, 
                           selected_features: List[str], data: pd.DataFrame) -> Dict[str, Any]:
    """
    Step 5: Generate target config dictionary with feature weights
    """
    # Get all correlations
    base_corr = correlations['label_vs_all_features']
    
    # Filter base features to include only those in base_corr and exclude selected_label
    base_features = [feature for feature in selected_features if feature in base_corr and feature != selected_label]
    base_weights = [float(abs(base_corr[feature]), 4) for feature in base_features]
    
    # Get time series features (all columns that are not original features or labels)
    original_cols = set(selected_features + [selected_label])
    timestamp_col = data.columns[0] if not isinstance(data.index, pd.DatetimeIndex) else None
    if timestamp_col:
        original_cols.add(timestamp_col)
    
    # Create target_config
    target_config = {
        selected_label: {
            'base_features': base_features,
            'base_feature_weights': base_weights,
        }
    }
    
    return target_config

def _save_feature_weights_csv(data: pd.DataFrame, correlations: Dict[str, Dict[str, float]], selected_label: str,
                             save_folder_path: str, file_name: str) -> str:
    """
    Save feature weights to a separate CSV file (single row only)
    """
    # Get all correlations
    all_corr = correlations['label_vs_all_features']
    
    # Create a new row with feature weights
    weights_row = {}

    # Identify timestamp column (typically first column)
    timestamp_col = data.columns[0] if not isinstance(data.index, pd.DatetimeIndex) else None
    
    # For each column in the dataframe, assign the corresponding weight or 0.0
    for column in data.columns:
        # Skip timestamp and selected label columns
        if column == timestamp_col or column == selected_label:
            continue
            
        if column in all_corr:
            # Use absolute correlation value as weight
            weights_row[column] = abs(all_corr[column], 4)
        else:
            # For columns without correlation, use 0.0
            weights_row[column] = 0.0000
    
    # Create a DataFrame with just the weights row
    weights_df = pd.DataFrame([weights_row])
    
    # Create a filename for the weights CSV
    weights_filename = f"{file_name}_weights.csv"
    weights_path = os.path.join(save_folder_path, weights_filename)
    
    # Save ONLY the weights row to CSV
    weights_df.to_csv(weights_path, index=False, float_format='%.4f')
    
    return weights_path

def _generate_correlation_images(data: pd.DataFrame, selected_features: List[str], 
                                selected_label: str, save_folder_path: str, file_name: str) -> Dict[str, str]:
    """
    Step 6: Generate correlation images - only for selected_features (no time series)
    """
    
    images_folder = os.path.join(save_folder_path, "images")
    
    image_paths = {}
    
    # Selected label vs selected features
    fig, ax = plt.subplots(figsize=(12, 8))
    
    label_corr = data[selected_features].corrwith(data[selected_label])
    label_corr = label_corr.dropna()
    
    if not label_corr.empty:
        colors = ['green' if x > 0 else 'red' for x in label_corr.values]
        bars = ax.bar(range(len(label_corr)), label_corr.values, color=colors, alpha=0.7)
        
        for i, (feature, corr) in enumerate(label_corr.items()):
            ax.text(i, corr + (0.01 if corr >= 0 else -0.03), f'{corr:.3f}', 
                   ha='center', va='bottom' if corr >= 0 else 'top', fontsize=10)
        
        ax.set_xlabel('Selected Features')
        ax.set_ylabel('Correlation Coefficient')
        ax.set_title(f'Correlations: {selected_label} vs Selected Features', fontsize=14)
        ax.set_xticks(range(len(label_corr)))
        ax.set_xticklabels(label_corr.index, rotation=45, ha='right')
        ax.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax.grid(True, alpha=0.3)
    else:
        ax.text(0.5, 0.5, 'No correlations found', ha='center', va='center', transform=ax.transAxes)
    
    plt.tight_layout()

    selected_path = os.path.join(images_folder, f"{file_name}_correlation.png")
    plt.savefig(selected_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    image_paths['correlation'] = selected_path  # Use a more generic key name
    
    return image_paths

def _save_processed_data(data: pd.DataFrame, save_folder_path: str, file_name: str) -> str:
    """
    Step 7: Save final CSV with all features (original + time series + label classes)
    Args:
        data: DataFrame to save
        save_folder_path: Path to save the file
        file_name: Original file name without extension
    """
    
    # Use the original file name in the processed file name
    processed_filename = f"{file_name}_processed.csv"
    processed_path = os.path.join(save_folder_path, processed_filename)
    
    # Save the data with all engineered features
    data.to_csv(processed_path, index=False, float_format='%.4f')
    
    return processed_path