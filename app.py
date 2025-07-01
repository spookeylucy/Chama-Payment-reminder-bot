from flask import Flask, request
from flask_cors import CORS
from twilio.twiml.messaging_response import MessagingResponse
import os
from dotenv import load_dotenv

# Import modules
from db import init_database, execute_query
from scheduler import start_scheduler
from routes.api import api_bp
from routes.dashboard import dashboard_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Enable CORS
CORS(app)

# Register blueprints
app.register_blueprint(api_bp)
app.register_blueprint(dashboard_bp)

# WhatsApp webhook endpoint
@app.route('/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Handle incoming WhatsApp messages"""
    try:
        incoming_msg = request.values.get('Body', '').strip().lower()
        from_number = request.values.get('From', '')
        
        # Remove WhatsApp prefix
        phone_number = from_number.replace('whatsapp:', '')
        
        response = MessagingResponse()
        msg = response.message()
        
        # Find member by phone number
        member_result = execute_query(
            "SELECT * FROM members WHERE phone_number = %s", 
            (phone_number,), 
            fetch=True
        )
        
        if not member_result:
            msg.body("Sorry, your number is not registered in our Chama system. Please contact the admin.")
            return str(response)
        
        member = member_result[0]
        
        if incoming_msg in ['paid', 'done', 'complete', 'yes']:
            if member['has_paid']:
                msg.body(f"Hi {member['name']}! Our records show you've already paid. Thank you!")
            else:
                # Mark as paid
                execute_query(
                    "UPDATE members SET has_paid = 1, last_payment = NOW() WHERE id = %s",
                    (member['id'],)
                )
                
                msg.body(f"Thank you {member['name']}! Your payment has been recorded. You're all set!")
                
        elif incoming_msg in ['status', 'check']:
            if member['has_paid']:
                msg.body(f"Hi {member['name']}! You're all paid up. Thank you!")
            else:
                msg.body(f"Hi {member['name']}! You still have a pending payment. Reply 'PAID' when you've made your contribution.")
                
        else:
            msg.body(f"Hi {member['name']}! Reply 'PAID' if you've made your payment, or 'STATUS' to check your payment status.")
        
        return str(response)
        
    except Exception as e:
        app.logger.error(f"WhatsApp webhook error: {str(e)}")
        response = MessagingResponse()
        msg = response.message()
        msg.body("Sorry, there was an error processing your message. Please try again later.")
        return str(response)

# Initialize database and start scheduler
@app.before_first_request
def startup():
    """Initialize database and start scheduler on first request"""
    init_database()
    start_scheduler()

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Start scheduler
    scheduler = start_scheduler()
    
    try:
        # Run Flask app
        app.run(
            host='0.0.0.0', 
            port=int(os.getenv('PORT', 5000)), 
            debug=os.getenv('FLASK_ENV') == 'development'
        )
    except KeyboardInterrupt:
        scheduler.shutdown()