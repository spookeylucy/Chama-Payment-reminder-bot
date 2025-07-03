from flask import Blueprint, request, jsonify
from db import execute_query
from twilio.rest import Client
import os
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Twilio configuration
twilio_client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', '+14155238886')

@api_bp.route('/members', methods=['GET'])
def get_members():
    """Get all members"""
    try:
        members = execute_query("SELECT * FROM members ORDER BY created_at DESC", fetch=True)
        return jsonify({'members': members or []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/members', methods=['POST'])
def add_member():
    """Add new member"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        phone_number = data.get('phone_number', '').strip()
        
        if not name or not phone_number:
            return jsonify({'error': 'Name and phone number are required'}), 400
        
        # Check if member already exists
        existing = execute_query(
            "SELECT id FROM members WHERE phone_number = %s", 
            (phone_number,), 
            fetch=True
        )
        
        if existing:
            return jsonify({'error': 'Member with this phone number already exists'}), 400
        
        # Insert new member
        execute_query(
            "INSERT INTO members (name, phone_number) VALUES (%s, %s)",
            (name, phone_number)
        )
        
        return jsonify({'message': 'Member added successfully'}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/members/<int:member_id>/pay', methods=['PATCH'])
def mark_member_paid(member_id):
    """Mark member as paid"""
    try:
        # Update member payment status
        execute_query(
            "UPDATE members SET has_paid = 1, last_payment = NOW() WHERE id = %s",
            (member_id,)
        )
        
        return jsonify({'message': 'Member marked as paid'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/send-reminders', methods=['POST'])
def send_reminders():
    """Send WhatsApp reminders to unpaid members"""
    try:
        # Get unpaid members
        unpaid_members = execute_query(
            "SELECT * FROM members WHERE has_paid = 0", 
            fetch=True
        )
        
        if not unpaid_members:
            return jsonify({'message': 'No unpaid members found', 'sent': 0}), 200
        
        sent_count = 0
        errors = []
        
        for member in unpaid_members:
            try:
                message = f"Hi {member['name']}! This is a friendly reminder that your Chama contribution is due. Please make your payment and reply 'PAID' to confirm. Thank you!"
                
                twilio_client.messages.create(
                    from_=f'whatsapp:{TWILIO_WHATSAPP_NUMBER}',
                    body=message,
                    to=f"whatsapp:{member['phone_number']}"
                )
                
                sent_count += 1
                
            except Exception as e:
                errors.append(f"Failed to send to {member['name']}: {str(e)}")
        
        response_data = {
            'message': f'Reminders sent to {sent_count} members',
            'sent': sent_count,
            'total_unpaid': len(unpaid_members)
        }
        
        if errors:
            response_data['errors'] = errors
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        # Get member counts
        total_members = execute_query("SELECT COUNT(*) as count FROM members", fetch=True)[0]['count']
        paid_members = execute_query("SELECT COUNT(*) as count FROM members WHERE has_paid = 1", fetch=True)[0]['count']
        unpaid_members = total_members - paid_members
        
        # Get due date
        due_date_result = execute_query("SELECT due_date FROM settings WHERE id = 1", fetch=True)
        due_date = due_date_result[0]['due_date'].strftime('%Y-%m-%d') if due_date_result else None
        
        return jsonify({
            'total_members': total_members,
            'paid_members': paid_members,
            'unpaid_members': unpaid_members,
            'due_date': due_date
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500