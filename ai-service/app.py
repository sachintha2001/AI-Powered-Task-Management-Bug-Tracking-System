from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Train කරපු Model එක Load කරගැනීම
try:
    model = joblib.load('task_model.pkl')
    print("AI Model loaded successfully!")
except Exception as e:
    print("Error loading model. Did you run train_model.py?")

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'success',
        'message': 'AI Task Prediction Service is running (Trained ML Model loaded)!',
        'endpoint': 'POST http://127.0.0.1:5001/api/predict'
    })

@app.route('/api/predict', methods=['POST'])
def predict_task():
    data = request.get_json(silent=True) or {}
    description = data.get('description', '')
    
    # නියම ML Model එක හරහා Prediction එක ලබා ගැනීම
    try:
        predicted_type = model.predict([description])[0]
    except Exception:
        predicted_type = "Bug" if any(w in description.lower() for w in ['bug', 'error', 'fail', 'issue', 'crash']) else "Feature"
    
    estimated_time = "1 - 3 Hours" if predicted_type == "Bug" else "1 - 2 Days"
    
    return jsonify({
        'predicted_type': predicted_type,
        'estimated_time': estimated_time
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)