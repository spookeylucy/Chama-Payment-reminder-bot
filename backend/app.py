from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
import schedule
import time
import threading
from weasyprint import HTML, CSS
from jinja2 import Template
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://user:password@localhost/chama_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Twilio configuration
twilio_client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER')

# Database Models
class Member(db.Model):
    __tablename__ = 'members'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False, unique=True)
    has_paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('Payment', backref='member', lazy=True)

class Chama(db.Model):
    __tablename__ = 'chamas'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    amount_expected = db.Column(db.Float, default=1000.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    chama_id = db.Column(db.Integer, db.ForeignKey('chamas.id'), nullable=True)

# API Routes
@app.route('/api/add-member', methods=['POST'])
def add_member():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('phone_number'):
            return jsonify({'error': 'Name and phone number are required'}), 400
        
        # Check if member already exists
        existing_member = Member.query.filter_by(phone_number=data['phone_number']).first()
        if existing_member:
            return jsonify({'error': 'Member with this phone number already exists'}), 400
        
        member = Member(
            name=data['name'],
            phone_number=data['phone_number'],
            has_paid=data.get('has_paid', False)
        )
        
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            'message': 'Member added successfully',
            'member': {
                'id': member.id,
                'name': member.name,
                'phone_number': member.phone_number,
                'has_paid': member.has_paid
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/mark-paid', methods=['POST'])
def mark_paid():
    try:
        data = request.get_json()
        member_id = data.get('member_id')
        amount = data.get('amount', 1000.0)
        
        if not member_id:
            return jsonify({'error': 'Member ID is required'}), 400
        
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Mark member as paid
        member.has_paid = True
        
        # Record payment
        payment = Payment(
            member_id=member_id,
            amount=amount,
            date=datetime.utcnow()
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment recorded successfully',
            'member': {
                'id': member.id,
                'name': member.name,
                'has_paid': member.has_paid
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    try:
        unpaid_members = Member.query.filter_by(has_paid=False).all()
        
        reminders = []
        for member in unpaid_members:
            reminders.append({
                'id': member.id,
                'name': member.name,
                'phone_number': member.phone_number,
                'days_since_created': (datetime.utcnow() - member.created_at).days
            })
        
        return jsonify({
            'count': len(reminders),
            'reminders': reminders
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/balance-report', methods=['GET'])
def balance_report():
    try:
        # Get all members
        total_members = Member.query.count()
        paid_members = Member.query.filter_by(has_paid=True).count()
        unpaid_members = total_members - paid_members
        
        # Get payment totals
        total_payments = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
        expected_total = total_members * 1000  # Assuming 1000 per member
        
        # Get recent payments
        recent_payments = db.session.query(
            Payment, Member.name
        ).join(Member).order_by(Payment.date.desc()).limit(10).all()
        
        recent_payments_list = []
        for payment, member_name in recent_payments:
            recent_payments_list.append({
                'member_name': member_name,
                'amount': payment.amount,
                'date': payment.date.isoformat()
            })
        
        return jsonify({
            'summary': {
                'total_members': total_members,
                'paid_members': paid_members,
                'unpaid_members': unpaid_members,
                'total_collected': total_payments,
                'expected_total': expected_total,
                'collection_percentage': (total_payments / expected_total * 100) if expected_total > 0 else 0
            },
            'recent_payments': recent_payments_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/members', methods=['GET'])
def get_members():
    try:
        members = Member.query.all()
        members_list = []
        
        for member in members:
            total_paid = db.session.query(db.func.sum(Payment.amount)).filter_by(member_id=member.id).scalar() or 0
            
            members_list.append({
                'id': member.id,
                'name': member.name,
                'phone_number': member.phone_number,
                'has_paid': member.has_paid,
                'total_paid': total_paid,
                'created_at': member.created_at.isoformat()
            })
        
        return jsonify({'members': members_list}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# WhatsApp Webhook
@app.route('/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    try:
        incoming_msg = request.values.get('Body', '').strip().lower()
        from_number = request.values.get('From', '')
        
        # Remove WhatsApp prefix
        phone_number = from_number.replace('whatsapp:', '')
        
        response = MessagingResponse()
        msg = response.message()
        
        # Find member by phone number
        member = Member.query.filter_by(phone_number=phone_number).first()
        
        if not member:
            msg.body("Sorry, your number is not registered in our Chama system. Please contact the admin.")
            return str(response)
        
        if incoming_msg in ['paid', 'done', 'complete', 'yes']:
            if member.has_paid:
                msg.body(f"Hi {member.name}! Our records show you've already paid. Thank you!")
            else:
                # Mark as paid with default amount
                member.has_paid = True
                payment = Payment(
                    member_id=member.id,
                    amount=1000.0,  # Default amount
                    date=datetime.utcnow()
                )
                db.session.add(payment)
                db.session.commit()
                
                msg.body(f"Thank you {member.name}! Your payment has been recorded. You're all set!")
                
        elif incoming_msg in ['status', 'check']:
            if member.has_paid:
                msg.body(f"Hi {member.name}! You're all paid up. Thank you!")
            else:
                msg.body(f"Hi {member.name}! You still have a pending payment. Reply 'PAID' when you've made your contribution.")
                
        else:
            msg.body(f"Hi {member.name}! Reply 'PAID' if you've made your payment, or 'STATUS' to check your payment status.")
        
        return str(response)
        
    except Exception as e:
        app.logger.error(f"WhatsApp webhook error: {str(e)}")
        response = MessagingResponse()
        msg = response.message()
        msg.body("Sorry, there was an error processing your message. Please try again later.")
        return str(response)

# Scheduled Functions
def send_whatsapp_reminder(member):
    try:
        message = f"Hi {member.name}! This is a friendly reminder that your Chama contribution is due. Please make your payment and reply 'PAID' to confirm. Thank you!"
        
        twilio_client.messages.create(
            from_=f'whatsapp:{TWILIO_WHATSAPP_NUMBER}',
            body=message,
            to=f'whatsapp:{member.phone_number}'
        )
        
        app.logger.info(f"Reminder sent to {member.name} ({member.phone_number})")
        
    except Exception as e:
        app.logger.error(f"Failed to send reminder to {member.name}: {str(e)}")

def send_daily_reminders():
    try:
        with app.app_context():
            unpaid_members = Member.query.filter_by(has_paid=False).all()
            
            for member in unpaid_members:
                send_whatsapp_reminder(member)
                time.sleep(1)  # Rate limiting
            
            app.logger.info(f"Daily reminders sent to {len(unpaid_members)} members")
            
    except Exception as e:
        app.logger.error(f"Error in daily reminders: {str(e)}")

# PDF Report Generation
@app.route('/api/generate-report', methods=['GET'])
def generate_pdf_report():
    try:
        # Get data for report
        members = Member.query.all()
        payments = db.session.query(Payment, Member.name).join(Member).order_by(Payment.date.desc()).all()
        
        total_collected = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
        total_members = len(members)
        paid_members = len([m for m in members if m.has_paid])
        
        # HTML template for PDF
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Chama Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .summary { background: #f0f0f0; padding: 20px; margin-bottom: 30px; }
                .summary div { display: inline-block; margin: 10px 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .paid { color: green; font-weight: bold; }
                .unpaid { color: red; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Chama Financial Report</h1>
                <p>Generated on {{ report_date }}</p>
            </div>
            
            <div class="summary">
                <h2>Summary</h2>
                <div><strong>Total Members:</strong> {{ total_members }}</div>
                <div><strong>Paid Members:</strong> {{ paid_members }}</div>
                <div><strong>Unpaid Members:</strong> {{ unpaid_members }}</div>
                <div><strong>Total Collected:</strong> KSh {{ total_collected }}</div>
                <div><strong>Collection Rate:</strong> {{ collection_rate }}%</div>
            </div>
            
            <h2>Members Status</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Total Paid</th>
                    </tr>
                </thead>
                <tbody>
                    {% for member in members %}
                    <tr>
                        <td>{{ member.name }}</td>
                        <td>{{ member.phone_number }}</td>
                        <td class="{{ 'paid' if member.has_paid else 'unpaid' }}">
                            {{ 'PAID' if member.has_paid else 'PENDING' }}
                        </td>
                        <td>KSh {{ member.total_paid }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            
            <h2>Recent Payments</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Member</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {% for payment in recent_payments %}
                    <tr>
                        <td>{{ payment.date }}</td>
                        <td>{{ payment.member_name }}</td>
                        <td>KSh {{ payment.amount }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </body>
        </html>
        """
        
        # Prepare data for template
        members_data = []
        for member in members:
            total_paid = db.session.query(db.func.sum(Payment.amount)).filter_by(member_id=member.id).scalar() or 0
            members_data.append({
                'name': member.name,
                'phone_number': member.phone_number,
                'has_paid': member.has_paid,
                'total_paid': total_paid
            })
        
        recent_payments_data = []
        for payment, member_name in payments[:20]:  # Last 20 payments
            recent_payments_data.append({
                'date': payment.date.strftime('%Y-%m-%d %H:%M'),
                'member_name': member_name,
                'amount': payment.amount
            })
        
        template = Template(html_template)
        html_content = template.render(
            report_date=datetime.now().strftime('%Y-%m-%d %H:%M'),
            total_members=total_members,
            paid_members=paid_members,
            unpaid_members=total_members - paid_members,
            total_collected=total_collected,
            collection_rate=round((paid_members / total_members * 100) if total_members > 0 else 0, 1),
            members=members_data,
            recent_payments=recent_payments_data
        )
        
        # Generate PDF
        pdf = HTML(string=html_content).write_pdf()
        
        return pdf, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename=chama_report_{datetime.now().strftime("%Y%m%d")}.pdf'
        }
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Scheduler setup
def run_scheduler():
    schedule.every().day.at("09:00").do(send_daily_reminders)
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

# Initialize database
@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    # Start scheduler in a separate thread
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)