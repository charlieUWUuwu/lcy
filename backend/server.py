# just a simple template for a Flask server that adds two numbers
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/add', methods=['POST'])
def add_numbers():
    try:
        data = request.get_json()
        num1 = data.get('num1')
        num2 = data.get('num2')
        
        if num1 is None or num2 is None:
            return jsonify({'error': 'Missing num1 or num2'}), 400
        
        if not isinstance(num1, (int, float)) or not isinstance(num2, (int, float)):
            return jsonify({'error': 'num1 and num2 must be numbers'}), 400
        
        result = num1 + num2
        return jsonify({'sum': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3500, debug=True)