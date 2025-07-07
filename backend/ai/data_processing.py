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
    5. TARGET_CONFIG generation
    6. Correlation images generation
    7. Save processed data
    
    Args:
        selected_features: List of selected feature names
        selected_label: Target label name
        save_folder_path: Path to save processed data and images
        csv_path: Path to the original CSV file
        file_name: File name without extension for processed file naming
    
    Returns:
        Dictionary containing TARGET_CONFIG, image paths, and processed data path
    """
    
    try:
        # Ensure save directory exists
        os.makedirs(save_folder_path, exist_ok=True)
        os.makedirs(os.path.join(save_folder_path, "images"), exist_ok=True)
        
        print(f"Loading data from: {csv_path}")
        print(f"Selected features: {selected_features}")
        print(f"Selected label: {selected_label}")
        print(f"File name for processing: {file_name}")
                
        # Load data
        if not os.path.exists(csv_path):
            raise Exception(f"CSV file not found: {csv_path}")
            
        data = pd.read_csv(csv_path)
        print(f"Loaded data shape: {data.shape}")
        
        # Step 1 - Data cleaning (only selected features + label)
        print("Step 1: Data cleaning...")
        cleaned_data = _clean_data(data, selected_features)
        
        # Step 2 - Label separation (positive/negative)
        print("Step 2: Label separation...")
        processed_data = _separate_label_classes(cleaned_data, selected_label)
        
        # Save the position of label columns before step 3
        positive_col = f"{selected_label}_positive"
        negative_col = f"{selected_label}_negative"
        label_columns = [selected_label, positive_col, negative_col]
        
        print(f"  - Saving label column positions: {label_columns}")
        print(f"  - Data shape before step 3: {processed_data.shape}")
        print(f"  - Columns before step 3: {list(processed_data.columns)}")
        
        # Step 3 - Time series feature engineering
        print("Step 3: Time series feature engineering...")
        engineered_data = _create_time_series_features(processed_data, selected_features, selected_label)
        
        # Reorder columns: put label columns (selected_label + positive + negative) at the end
        print("  - Reordering columns to move label columns to the end...")
        engineered_data = _reorder_label_columns_to_end(engineered_data, label_columns)
        
        # Step 4 - Calculate correlations
        print("Step 4: Calculating correlations...")
        correlations = _calculate_correlations(engineered_data, selected_label, selected_features)
        
        # Step 5 - Generate TARGET_CONFIG
        print("Step 5: Generating TARGET_CONFIG...")
        target_config = _generate_target_config(correlations, selected_label, selected_features, engineered_data)
        
        # Step 6 - Generate correlation images (only selected_features, no time series)
        print("Step 6: Generating correlation images...")
        image_paths = _generate_correlation_images(
            processed_data, selected_features, selected_label, save_folder_path, file_name
        )
        
        # Step 7 - Save processed data
        print("Step 7: Saving processed data...")
        processed_data_path = _save_processed_data(engineered_data, save_folder_path, file_name)
        
        print("Data processing completed successfully!")
        
        return {
            'target_config': target_config,
            'correlation_images': image_paths,
            'processed_data_path': processed_data_path,
            'status': 'completed'
        }
        
    except Exception as e:
        print(f"Error in data processing: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Error in data processing: {str(e)}")

def _reorder_label_columns_to_end(data: pd.DataFrame, label_columns: List[str]) -> pd.DataFrame:
    """
    Reorder columns to move label columns (selected_label + positive + negative) to the end
    """
    print(f"  - Reordering columns to move {label_columns} to the end...")
    
    # Get all columns that are not label columns
    other_columns = [col for col in data.columns if col not in label_columns]
    
    # Check if all label columns exist in the data
    missing_label_cols = [col for col in label_columns if col not in data.columns]
    if missing_label_cols:
        print(f"  - Warning: Missing label columns: {missing_label_cols}")
        # Only use existing label columns
        existing_label_cols = [col for col in label_columns if col in data.columns]
    else:
        existing_label_cols = label_columns
    
    # Create new column order: other columns first, then label columns
    new_column_order = other_columns + existing_label_cols
    
    print(f"  - Original column count: {len(data.columns)}")
    print(f"  - Other columns: {len(other_columns)}")
    print(f"  - Label columns to move: {len(existing_label_cols)}")
    print(f"  - New column order: {new_column_order}")
    
    # Reorder the dataframe
    reordered_data = data[new_column_order].copy()
    
    print(f"  - Reordered data shape: {reordered_data.shape}")
    print(f"  - Final column order: {list(reordered_data.columns)}")
    print(f"  - Label columns are now at positions: {[reordered_data.columns.get_loc(col) for col in existing_label_cols]}")
    
    return reordered_data

def _clean_data(data: pd.DataFrame, selected_features: List[str]) -> pd.DataFrame:
    """
    Step 1: Data cleaning - only clean selected_features
    """
    print("  - Data cleaning for selected features and label only...")
    
    # Only keep selected features + label + timestamp column
    timestamp_col = data.columns[0]  # Assume first column is timestamp
    columns_to_keep = [timestamp_col] + selected_features
    
    # Check if all columns exist
    missing_columns = [col for col in columns_to_keep if col not in data.columns]
    if missing_columns:
        raise Exception(f"Missing columns in data: {missing_columns}")
    
    print(f"  - Keeping only: {columns_to_keep}")
    df = data[columns_to_keep].copy()
    
    # Convert timestamp to datetime and set as index
    try:
        df[timestamp_col] = pd.to_datetime(df[timestamp_col])
        df = df.set_index(timestamp_col)
        print(f"  - Successfully converted timestamp to datetime")
    except Exception as e:
        print(f"  - Warning: Could not convert timestamp ({str(e)}), creating artificial datetime index")
        df = df.drop(columns=[timestamp_col])
        df.index = pd.date_range(start='2023-01-01', periods=len(df), freq='10s')
    
    print(f"  - Data after filtering: {df.shape}")
    
    # Resample to 10s intervals and take mean
    print("  - Resampling data (10s intervals)...")
    resample_interval = '10s'
    df_resampled = df.resample(resample_interval).mean()
    
    # Interpolate missing values
    print("  - Interpolating missing values...")
    df_interpolated = df_resampled.interpolate(method='linear')
    
    # Fill remaining NaN with 0
    print("  - Filling remaining NaN with 0...")
    df_processed = df_interpolated.fillna(0)
    
    df_final = df_processed.reset_index()
    
    print(f"  - Cleaned data shape: {df_final.shape}")
    print(f"  - Final columns order: {list(df_final.columns)}")
    
    return df_final

def _separate_label_classes(data: pd.DataFrame, selected_label: str) -> pd.DataFrame:
    """
    Step 2: Label separation - create positive and negative class columns as last 2 columns
    Positive column: copy value if value > 0, else 0
    Negative column: copy value if value < 0, else 0
    """
    print(f"  - Separating {selected_label} into positive/negative classes by sign...")
    
    df = data.copy()
    
    # Debug information
    print(f"  - DataFrame shape: {df.shape}")
    print(f"  - DataFrame columns: {list(df.columns)}")
    
    # Check for duplicate columns
    duplicate_cols = df.columns[df.columns.duplicated()].tolist()
    if duplicate_cols:
        print(f"  - Warning: Found duplicate columns: {duplicate_cols}")
        # Remove duplicate columns, keep first occurrence
        df = df.loc[:, ~df.columns.duplicated()]
        print(f"  - After removing duplicates, shape: {df.shape}")
    
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
        print(f"  - Error extracting label series: {str(e)}")
        # Fallback: use direct column access
        label_series = df[selected_label]
        if isinstance(label_series, pd.DataFrame):
            label_series = label_series.iloc[:, 0]
    
    # Create masks for positive and negative values
    print("  - Creating positive/negative masks by sign...")
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
    
    print(f"  - Adding column: {positive_col} (copy value if positive, else 0)")
    df[positive_col] = np.where(positive_mask, label_series, 0)
    
    print(f"  - Adding column: {negative_col} (copy value if negative, else 0)")
    df[negative_col] = np.where(negative_mask, label_series, 0)
        
    return df

def _create_time_series_features(data: pd.DataFrame, selected_features: List[str], selected_label: str) -> pd.DataFrame:
    """
    Step 3: Time series feature engineering - add time series features to the CSV
    """
    print("  - Creating time series features...")
    
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
    print("    - Adding cyclical time features...")
    df_feat['hour_sin'] = np.sin(2 * np.pi * df_feat.index.hour / 24)
    df_feat['hour_cos'] = np.cos(2 * np.pi * df_feat.index.hour / 24)
    df_feat['dayofweek_sin'] = np.sin(2 * np.pi * df_feat.index.dayofweek / 7)
    df_feat['dayofweek_cos'] = np.cos(2 * np.pi * df_feat.index.dayofweek / 7)
    
    # Add lag features for the target
    print("    - Adding lag features...")
    lags = [360, 720, 1440, 2880]  # Adjusted for 10s intervals
    for lag in lags:
        df_feat[f'{selected_label}_lag_{lag}'] = df_feat[selected_label].shift(lag)
    
    # Add rolling window statistics for the target
    print("    - Adding rolling window features...")
    rolling_windows = [360, 1080, 2160]  # Adjusted for 10s intervals
    for window in rolling_windows:
        df_feat[f'{selected_label}_roll_mean_{window}'] = df_feat[selected_label].rolling(window=window, min_periods=1).mean()
        df_feat[f'{selected_label}_roll_std_{window}'] = df_feat[selected_label].rolling(window=window, min_periods=1).std()
    
    # Drop rows with NaN values from lag features
    print("    - Removing NaN values from feature engineering...")
    initial_length = len(df_feat)
    df_feat.dropna(inplace=True)
    final_length = len(df_feat)
    
    print(f"    - Rows before NaN removal: {initial_length}")
    print(f"    - Rows after NaN removal: {final_length}")
    print(f"    - Engineered data shape: {df_feat.shape}")
    
    return df_feat.reset_index()

