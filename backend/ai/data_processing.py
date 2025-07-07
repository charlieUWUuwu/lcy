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
        cleaned_data = _clean_data(data, selected_features, selected_label)
        
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
