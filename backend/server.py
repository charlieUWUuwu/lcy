from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np

from ai.feature_impact import get_top_features

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

# @app.route('/api/feature-analysis', methods=['POST'])
# def feature_analysis():
#     try:
#         data = request.get_json()
#         selected_features = data.get('selectedFeatures', [])
#         selected_label = data.get('selectedLabel')
#         save_path = data.get(csv_path, '')
        
#         if not selected_features:
#             return jsonify({'error': 'No features selected', 'status': 'failed'}), 400
        
#         if not selected_label:
#             return jsonify({'error': 'No label selected', 'status': 'failed'}), 400
        
#         # Run the feature analysis with selected features and label
#         image_paths = feature_impact(selected_features, selected_label)
        
#         # # Convert absolute paths to relative URLs for frontend
#         # base_url = "file:///"
#         # results = {
#         #     'all': base_url + image_paths['all'].replace('\\', '/'),
#         #     'positive': base_url + image_paths.get('positive', '').replace('\\', '/'),
#         #     'negative': base_url + image_paths.get('negative', '').replace('\\', '/'),
#         #     'status': 'completed'
#         # }
        
#         return jsonify(results)
#     except Exception as e:
#         return jsonify({'error': str(e), 'status': 'failed'}), 500
    
@app.route('/api/top-features', methods=['POST'])
def top_features():
    try:
        raw_training_csv_path = request.json.get('raw_training_csv_path', '')
        data = request.get_json()
        selected_label = data.get('selected_label')
        selected_features = data.get('selected_features', [])
        target_filter_mode = data.get('target_filter_mode') 

        if target_filter_mode not in ['positive', 'negative', 'all']:
            return jsonify({'error': 'Invalid target filter mode', 'msg': 'failed'}), 400
         
        if not selected_label:
            return jsonify({'error': 'No label selected', 'status': 'failed'}), 400
        
        if not selected_features:
            return jsonify({'error': 'No features available', 'status': 'failed'}), 400
        
        # Get top features with threshold
        result = get_top_features(raw_training_csv_path, selected_label, selected_features, target_filter_mode)
        
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
        print(f"Error in top_features endpoint: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace for debugging
        return jsonify({'error': str(e), 'status': 'failed'}), 500

    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3500, debug=True)