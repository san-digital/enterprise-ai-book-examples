from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import uuid
from crewai import Agent, Task, Crew
from threading import Thread
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type


app = Flask(__name__)
CORS(app)

# In-memory storage for chats
chats = {}

class ResetPasswordInput(BaseModel):
    """Input schema for GetOrderDetails."""
    email: str = Field(..., description="Email associated with the order.")

class ResetPassword(BaseTool):
    name: str = "ResetPassword"
    description: str = "Reset user password."
    args_schema: Type[BaseModel] = ResetPasswordInput

    def _run(self, email: str) -> str:
        if email == "test@example.com":
            return "Password reset link sent to {}".format(email)
        return "No user found with email {}".format(email)

reset_password = ResetPassword()

class GetOrderDetailsInput(BaseModel):
    """Input schema for GetOrderDetails."""
    order_number: str = Field(..., description="Order number to retrieve details for.")
    email: str = Field(..., description="Email associated with the order.")

class GetOrderDetails(BaseTool):
    name: str = "GetOrderDetails"
    description: str = "Get order details."
    args_schema: Type[BaseModel] = GetOrderDetailsInput

    def _run(self, order_number: str, email: str) -> str:
        if order_number == '1' and email == "test@example.com":
            response = "Order 1: Item A, Quantity: 2, Status: Shipped"
            return response
        if order_number == '2' and email == "test2@example.com":
            response = "Order 2: Item B, Quantity: 1, Status: Lost"
            return response
        return "No order found for the provided details."

get_order_details = GetOrderDetails()

classifier = Agent(
    role="TicketClassifier",
    goal="Decide whether a support ticket is about orders or passwords",
    backstory="""You are an expert in customer-support triage.
                 A AI ticket can be answered with ai using our documentation, or order checker or password reset.;
                 a HUMAN one needs a human.""",
    allow_delegation=False,
)

responder = Agent(
    role="Helpdesk Bot",
    goal="""
    You are a customer support bot that helps customers with their orders.

    You can use the following tools:
    - GetOrderDetails: To retrieve order details.
    - ResetPassword: To reset user passwords.
    - RequestHumanInput: To request human input when necessary.

    You can help customers with:
    - Order details.
    - Password resets
    - General inquiries related to our business

    Reply to the customers messages in a concise and empathetic manner. Following our company guidelines.""",
    backstory="You write concise, empathetic messages in British English.",
    tools=[get_order_details, reset_password],
)

@app.route('/chats', methods=['GET'])
def get_chats():
    return jsonify(list(chats.values()))

@app.route('/chats', methods=['POST'])
def create_chat():
    chat_id = str(uuid.uuid4())
    chat = {
        'id': chat_id,
        'name': request.json.get('name', chat_id),
        'messages': [],
        'created_at': datetime.datetime.now(),
        'bot_allowed': True,
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
        'time': datetime.datetime.now().strftime('%H:%M:%S'),
        'from': request.json.get('from', 'Unknown')
    }
    chat['messages'].append(message)

    # Respond asynchronously: return immediately, trigger bot reply in background

    def bot_reply(chat):
        print("Classifying...")
        classification_task = Task(
           description=f"""
            We should select human if the human is angry or requests a human.
            If they ask about an order i.e. an order is delayed. We should only classify human once the bot has found the order details.
            If they ask about not being able to login the bot should reset the password before classifying the ticket as human.
           
            Classify this ticket as for humans or our ai and
            respond only with the single word AI or HUMAN:\n\n{chat['messages']}\n\n.""",
            expected_output="AI or HUMAN",
            agent=classifier,
        )
        result = Crew(tasks=[classification_task]).kickoff()
        
        label = result.raw.strip().upper()

        print("Classification result:", label)

        if label == "AI":
            reply_task = Task(
                description=f"""Write a polite reply to this customer
                (less than 150 words).\n\nThe last messages are: {chat['messages']}. The chat id is {chat['id']}""",
                expected_output="A polite message in British English",
                agent=responder,
            )
            draft = Crew(tasks=[reply_task]).kickoff().raw

            print("Draft reply:", draft)

            chat['messages'].append({
                'text': draft,
                'source': 'bot',
                'from': 'Our Support Bot (AI)',
                'time': datetime.datetime.now().strftime('%H:%M:%S')
            })
        else:
            print("Human intervention required for chat:", chat_id)
            chat = chats.get(chat_id)
            chat['bot_allowed'] = False
            chat['messages'].append({
                'text': "Requesting a human support agent for you.",
                'source': 'meta',
                'from': '',
                'time': datetime.datetime.now().strftime('%H:%M:%S')
            })

    if chat.get('bot_allowed') == True and message['source'] == 'left':
        Thread(target=bot_reply, args=(chat,)).start()

    return jsonify(message), 201

@app.route('/chats/<chat_id>/ai', methods=['POST', 'GET'])
def toggle_ai(chat_id):
    chat = chats.get(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    if request.method == 'GET':
        return jsonify({'bot_allowed': chat.get('bot_allowed', True)})

    # Toggle bot_allowed based on request
    enabled = request.json.get('enabled')
    if enabled is None:
        return jsonify({'error': 'Missing enabled parameter'}), 400
    chat['bot_allowed'] = enabled
    return jsonify({'bot_allowed': chat['bot_allowed']})


if __name__ == '__main__':
    app.run(debug=True)
