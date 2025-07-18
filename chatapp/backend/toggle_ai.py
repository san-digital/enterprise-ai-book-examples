from flask import request, jsonify
from .server import chats

def register_toggle_ai_route(app):
    @app.route('/chats/<chat_id>/toggle_ai', methods=['POST'])
    def toggle_ai(chat_id):
        chat = chats.get(chat_id)
        if not chat:
            return jsonify({'error': 'Chat not found'}), 404
        # Toggle bot_allowed based on request
        enabled = request.json.get('enabled')
        if enabled is None:
            return jsonify({'error': 'Missing enabled parameter'}), 400
        chat['bot_allowed'] = enabled
        return jsonify({'bot_allowed': chat['bot_allowed']})
