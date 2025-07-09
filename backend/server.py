from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np

from ai.feature_impact import get_top_features
from ai.data_processing import data_processing

app = Flask(__name__)
CORS(app)

# Custom JSON encoder to handle numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.bool_):
            return bool(obj)
        return super(NumpyEncoder, self).default(obj)
    
@app.route('/api/top-features', methods=['POST'])
def top_features():
    try:
        raw_training_csv_path = request.json.get('raw_training_csv_path', '')
        data = request.get_json()
        selected_label = data.get('selected_label')
        selected_features = data.get('selected_features', [])
        
        if not selected_label:
            return jsonify({'error': 'No label selected', 'status': 'failed'}), 400
        
        if not selected_features:
            return jsonify({'error': 'No features available', 'status': 'failed'}), 400
        
        # Get top features with threshold
        result = get_top_features(raw_training_csv_path, selected_label, selected_features)
        
        # Ensure all values are JSON serializable
        response_data = {
            'top_features': result['top_features'],
            'correlations': result['correlations'],
            'correlation_details': result['correlation_details'],
            'total_features_analyzed': int(result['total_features_analyzed']),
            'threshold_used': float(result['threshold_used']),
            'features_above_threshold': int(result['features_above_threshold']),
            'used_threshold_filter': bool(result['used_threshold_filter']),
            'status': 'completed'
        }
        
        # Use custom encoder for JSON serialization
        return app.response_class(
            response=json.dumps(response_data, cls=NumpyEncoder),
            status=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'failed'}), 500

@app.route('/api/data-processing', methods=['POST'])
def data_processing_endpoint():
    try:
        data = request.get_json()
        selected_features = data.get('selected_features', [])
        selected_label = data.get('selected_label')
        exp_folder_path = data.get('exp_folder_path', '')
        raw_training_csv_path = data.get('raw_training_csv_path', '') # Get CSV path from frontend
        file_name = data.get('fileName', 'data') # Get fileName from frontend
        
        
        if not selected_features:
            return jsonify({'error': 'No features selected', 'status': 'failed'}), 400
        
        if not selected_label:
            return jsonify({'error': 'No label selected', 'status': 'failed'}), 400
            
        if not exp_folder_path:
            return jsonify({'error': 'No save folder selected', 'status': 'failed'}), 400
            
        if not raw_training_csv_path:
            return jsonify({'error': 'No CSV path provided', 'status': 'failed'}), 400
        
        # Run the complete data processing pipeline with fileName
        result = data_processing(selected_features, selected_label, exp_folder_path, raw_training_csv_path, file_name)
        
        
        # Ensure all values are JSON serializable
        response_data = {
            'corr_img_path': result['corr_img_path'],
            'training_csv_path': result['training_csv_path'],
            'weight_csv_path': result['weight_csv_path'],
            'weight_base_config': result['weight_base_config'],
            'status': 'completed'
        }
        
        # Use custom encoder for JSON serialization
        return app.response_class(
            response=json.dumps(response_data, cls=NumpyEncoder),
            status=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'failed'}), 500
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3500, debug=True)