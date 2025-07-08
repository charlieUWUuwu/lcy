import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime
from typing import Dict, List, Tuple, Any

def data_processing(selected_features: List[str], selected_label: str, save_folder_path: str, csv_path: str, file_name: str = 'data') -> Dict[str, Any]:
    """
    Complete data processing pipeline:
    1. Data cleaning (only selected_features + selected_label)
    2. Label separation (positive/negative)
    3. Time series feature engineering
    4. Correlation calculation
    5. Insert weights into the dataframe
    6. Correlation images generation
    7. Save processed data
    
    Args:
        selected_features: List of selected feature names
        selected_label: Target label name
        save_folder_path: Path to save processed data and images
        csv_path: Path to the original CSV file
        file_name: File name without extension for processed file naming
    
    Returns:
        image paths, and processed data path
    """
    
    try:
        # Ensure save directory exists
        os.makedirs(save_folder_path, exist_ok=True)
        os.makedirs(os.path.join(save_folder_path, "images"), exist_ok=True)
                
        # Load data
        if not os.path.exists(csv_path):
            raise Exception(f"CSV file not found: {csv_path}")
            
        data = pd.read_csv(csv_path)
        
        _clean_old_processed_files(save_folder_path)
        
        # Step 1 - Data cleaning (only selected features + label)
        cleaned_data = _clean_data(data, selected_features)
        
        # Step 2 - Label separation (positive/negative)
        processed_data = _separate_label_classes(cleaned_data, selected_label)
        
        # Save the position of label columns before step 3
        positive_col = f"{selected_label}_positive"
        negative_col = f"{selected_label}_negative"
        label_columns = [selected_label, positive_col, negative_col]
        
        # Step 3 - Time series feature engineering
        engineered_data = _create_time_series_features(processed_data, selected_features, selected_label)
        
        # Reorder columns: put label columns (selected_label + positive + negative) at the end
        engineered_data = _reorder_label_columns_to_end(engineered_data, label_columns)
        
        # Step 4 - Calculate correlations
        correlations = _calculate_correlations(engineered_data, selected_label, selected_features)
        
        # Step 5 - Insert weights into the dataframe
        engineered_data_with_weights = _insert_feature_weights_into_dataframe(engineered_data, correlations, selected_label)        
        # Step 6 - Generate correlation images (only selected_features, no time series)
        image_paths = _generate_correlation_images(
            processed_data, selected_features, selected_label, save_folder_path, file_name
        )
        
        # Step 7 - Save processed data
        processed_data_path = _save_processed_data(engineered_data_with_weights, save_folder_path, file_name)
        
        return {
            'correlation_images': image_paths,
            'processed_data_path': processed_data_path,
            'status': 'completed'
        }
        
    except Exception as e:
        raise Exception(f"Error in data processing: {str(e)}")

def _reorder_label_columns_to_end(data: pd.DataFrame, label_columns: List[str]) -> pd.DataFrame:
    """
    Reorder columns to move label columns (selected_label + positive + negative) to the end
    """
    
    # Get all columns that are not label columns
    other_columns = [col for col in data.columns if col not in label_columns]
    
    # Check if all label columns exist in the data
    missing_label_cols = [col for col in label_columns if col not in data.columns]
    if missing_label_cols:
        # Only use existing label columns
        existing_label_cols = [col for col in label_columns if col in data.columns]
    else:
        existing_label_cols = label_columns
    
    # Create new column order: other columns first, then label columns
    new_column_order = other_columns + existing_label_cols
    
    # Reorder the dataframe
    reordered_data = data[new_column_order].copy()
    
    
    return reordered_data

def _clean_old_processed_files(save_folder_path: str) -> None:
    """
    Clean ALL old processed CSV files to ensure only the latest file remains
    """
    if not os.path.exists(save_folder_path):
        return
    
    # Get all files in the save folder (not including subdirectories)
    all_files = [f for f in os.listdir(save_folder_path) 
                if os.path.isfile(os.path.join(save_folder_path, f))]
    
    # Filter ALL processed CSV files (any file with "_processed_" pattern)
    files_to_remove = []
    for file in all_files:
        if file.endswith('.csv') and '_processed_' in file:
            files_to_remove.append(file)
    
    # Remove old files
    removed_count = 0
    for file in files_to_remove:
        file_path = os.path.join(save_folder_path, file)
        os.remove(file_path)
        removed_count += 1

def _clean_old_images(images_folder: str) -> None:
    """
    Clean ALL old correlation images to ensure only the latest 3 images remain
    """
    if not os.path.exists(images_folder):
        return
    
    # Get all files in the images folder
    all_files = os.listdir(images_folder)
    
    # Filter ALL image files (any PNG files)
    files_to_remove = []
    for file in all_files:
        if file.endswith('.png'):
            files_to_remove.append(file)
    
    # Remove all image files
    removed_count = 0
    for file in files_to_remove:
        file_path = os.path.join(images_folder, file)
        os.remove(file_path)
        removed_count += 1
        

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

def _separate_label_classes(data: pd.DataFrame, selected_label: str) -> pd.DataFrame:
    """
    Step 2: Label separation - create positive and negative class columns as last 2 columns
    Positive column: copy value if value > 0, else 0
    Negative column: copy value if value < 0, else 0
    """
    
    df = data.copy()
    
    # Check for duplicate columns
    duplicate_cols = df.columns[df.columns.duplicated()].tolist()
    if duplicate_cols:
        # Remove duplicate columns, keep first occurrence
        df = df.loc[:, ~df.columns.duplicated()]
    
    # Ensure the selected_label exists
    if selected_label not in df.columns:
        raise Exception(f"Selected label '{selected_label}' not found in columns: {list(df.columns)}")
    
    # Extract the label column as a Series
    try:
        # Use column location to ensure we get a Series
        label_col_index = df.columns.get_loc(selected_label)
        if isinstance(label_col_index, slice) or hasattr(label_col_index, '__iter__'):
            label_col_index = label_col_index[0] if hasattr(label_col_index, '__iter__') else label_col_index.start
        
        label_series = df.iloc[:, label_col_index]
    except Exception as e:
        # Fallback: use direct column access
        label_series = df[selected_label]
        if isinstance(label_series, pd.DataFrame):
            label_series = label_series.iloc[:, 0]
    
    # Create masks for positive and negative values
    positive_mask = label_series > 0
    negative_mask = label_series < 0
    
    # Ensure masks are Series, not DataFrame
    if isinstance(positive_mask, pd.DataFrame):
        positive_mask = positive_mask.iloc[:, 0]
    if isinstance(negative_mask, pd.DataFrame):
        negative_mask = negative_mask.iloc[:, 0]
    
    # Create positive and negative class columns
    positive_col = f"{selected_label}_positive"
    negative_col = f"{selected_label}_negative"
    
    df[positive_col] = np.where(positive_mask, label_series, 0)
    
    df[negative_col] = np.where(negative_mask, label_series, 0)
        
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
    initial_length = len(df_feat)
    df_feat.dropna(inplace=True)
    final_length = len(df_feat)
    
    return df_feat.reset_index()

def _calculate_correlations(data: pd.DataFrame, selected_label: str, selected_features: List[str]) -> Dict[str, Dict[str, float]]:
    """
    Step 4: Calculate correlations - only selected_label vs (selected_features + time_series_features)
    """
    
    # Get positive and negative label columns
    positive_col = f"{selected_label}_positive"
    negative_col = f"{selected_label}_negative"
    
    # Get time series features (all columns that are not original features or labels)
    original_cols = set(selected_features + [selected_label, positive_col, negative_col])
    timestamp_col = data.columns[0] if not isinstance(data.index, pd.DatetimeIndex) else None
    if timestamp_col:
        original_cols.add(timestamp_col)
    
    time_series_features = [col for col in data.columns if col not in original_cols]
    all_features = selected_features + time_series_features
    
    correlations = {}
    
    # 1. Selected label vs (selected_features + time_series_features)
    label_corr = data[all_features].corrwith(data[selected_label])
    correlations['label_vs_all_features'] = label_corr.dropna().to_dict()
    
    # 2. Positive label vs (selected_features + time_series_features)
    positive_corr = data[all_features].corrwith(data[positive_col])
    correlations['positive_vs_all_features'] = positive_corr.dropna().to_dict()
    
    # 3. Negative label vs (selected_features + time_series_features)
    negative_corr = data[all_features].corrwith(data[negative_col])
    correlations['negative_vs_all_features'] = negative_corr.dropna().to_dict()
    
    return correlations

def _insert_feature_weights_into_dataframe(data: pd.DataFrame, correlations: Dict[str, Dict[str, float]], selected_label: str) -> pd.DataFrame:
    """
    Insert feature weights directly into the dataframe as the second row
    """
    # Create a copy to avoid modifying the original
    df = data.copy()
    
    # Get all correlations
    all_corr = correlations['label_vs_all_features']
    
    # Create a new row with feature weights
    weights_row = {}
    
    # For each column in the dataframe, assign the corresponding weight or 0.0
    for column in df.columns:
        if column in all_corr:
            # Use absolute correlation value as weight
            weights_row[column] = abs(all_corr[column])
        else:
            # For columns without correlation (like timestamp or label columns), use 0.0
            weights_row[column] = 0.0
    
    # Insert the weights row at the top (index 0)
    # First, shift all existing indices down by 1
    df.index = df.index + 1
    
    # Then insert the weights row at index 0
    weights_df = pd.DataFrame([weights_row], index=[0])
    
    # Concatenate the weights row with the original data
    result_df = pd.concat([weights_df, df], sort=False).reset_index(drop=True)
    
    return result_df

def _generate_correlation_images(data: pd.DataFrame, selected_features: List[str], 
                                selected_label: str, save_folder_path: str, file_name: str = 'data') -> Dict[str, str]:
    """
    Step 6: Generate correlation images - only for selected_features (no time series)
    """
    
    images_folder = os.path.join(save_folder_path, "images")
    
    # Clean old images before generating new ones
    _clean_old_images(images_folder)
    
    image_paths = {}
    
    # Get positive and negative label columns
    positive_col = f"{selected_label}_positive"
    negative_col = f"{selected_label}_negative"
    
    # 1. Selected label vs selected features - ALL (Updated naming)
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

    selected_path = os.path.join(images_folder, f"{file_name}_all.png")
    plt.savefig(selected_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    image_paths['all'] = selected_path  # Changed key from 'selected_features' to 'all'
    
    # 2. Positive label vs selected features - POSITIVE (Updated naming)
    fig, ax = plt.subplots(figsize=(12, 8))
    
    positive_corr = data[selected_features].corrwith(data[positive_col])
    positive_corr = positive_corr.dropna()
    
    if not positive_corr.empty:
        colors = ['lightgreen' if x > 0 else 'lightcoral' for x in positive_corr.values]
        bars = ax.bar(range(len(positive_corr)), positive_corr.values, color=colors, alpha=0.7)
        
        for i, (feature, corr) in enumerate(positive_corr.items()):
            ax.text(i, corr + (0.01 if corr >= 0 else -0.03), f'{corr:.3f}', 
                   ha='center', va='bottom' if corr >= 0 else 'top', fontsize=10)
        
        ax.set_xlabel('Selected Features')
        ax.set_ylabel('Correlation Coefficient')
        ax.set_title(f'Correlations: {selected_label} Positive Class vs Selected Features', fontsize=14)
        ax.set_xticks(range(len(positive_corr)))
        ax.set_xticklabels(positive_corr.index, rotation=45, ha='right')
        ax.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax.grid(True, alpha=0.3)
    else:
        ax.text(0.5, 0.5, 'No correlations found', ha='center', va='center', transform=ax.transAxes)
        ax.set_title(f'Correlations: {selected_label} Positive Class vs Selected Features', fontsize=14)
    
    plt.tight_layout()
    positive_path = os.path.join(images_folder, f"{file_name}_positive.png")
    plt.savefig(positive_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    image_paths['positive'] = positive_path  # Changed key from 'positive_label' to 'positive'
    
    # 3. Negative label vs selected features - NEGATIVE (Updated naming)
    fig, ax = plt.subplots(figsize=(12, 8))
    
    negative_corr = data[selected_features].corrwith(data[negative_col])
    negative_corr = negative_corr.dropna()
    
    if not negative_corr.empty:
        colors = ['lightgreen' if x > 0 else 'lightcoral' for x in negative_corr.values]
        bars = ax.bar(range(len(negative_corr)), negative_corr.values, color=colors, alpha=0.7)
        
        for i, (feature, corr) in enumerate(negative_corr.items()):
            ax.text(i, corr + (0.01 if corr >= 0 else -0.03), f'{corr:.3f}', 
                   ha='center', va='bottom' if corr >= 0 else 'top', fontsize=10)
        
        ax.set_xlabel('Selected Features')
        ax.set_ylabel('Correlation Coefficient')
        ax.set_title(f'Correlations: {selected_label} Negative Class vs Selected Features', fontsize=14)
        ax.set_xticks(range(len(negative_corr)))
        ax.set_xticklabels(negative_corr.index, rotation=45, ha='right')
        ax.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax.grid(True, alpha=0.3)
    else:
        ax.text(0.5, 0.5, 'No correlations found', ha='center', va='center', transform=ax.transAxes)
        ax.set_title(f'Correlations: {selected_label} Negative Class vs Selected Features', fontsize=14)
    
    plt.tight_layout()

    negative_path = os.path.join(images_folder, f"{file_name}_negative.png")
    plt.savefig(negative_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    image_paths['negative'] = negative_path  # Changed key from 'negative_label' to 'negative'
    
    
    return image_paths

def _save_processed_data(data: pd.DataFrame, save_folder_path: str, file_name: str = 'data') -> str:
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
    data.to_csv(processed_path, index=False)
    
    return processed_path