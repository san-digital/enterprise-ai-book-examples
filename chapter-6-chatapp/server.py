from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage for chats
chats = {}

@app.route('/chats', methods=['GET'])
def get_chats():
    return jsonify(list(chats.values()))

@app.route('/chats', methods=['POST'])
def create_chat():
    chat_id = str(datetime.datetime.now().timestamp())
    chat = {
        'id': chat_id,
        'name': request.json.get('name', chat_id),
        'messages': []
    }
    chats[chat_id] = chat
    return jsonify(chat), 201

@app.route('/chats/<chat_id>/messages', methods=['GET'])
def get_messages(chat_id):
    chat = chats.get(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    return jsonify(chat['messages'])

@app.route('/chats/<chat_id>/messages', methods=['POST'])
def send_message(chat_id):
    chat = chats.get(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    message = {
        'text': request.json.get('text'),
        'source': request.json.get('source'),
        'time': datetime.datetime.now().strftime('%H:%M:%S')
    }
    chat['messages'].append(message)
    return jsonify(message), 201

if __name__ == '__main__':
    app.run(debug=True)
