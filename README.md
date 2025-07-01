# WhatsApp Chama Reminder System

A Flask-based WhatsApp Chama (savings group) management system with automated reminders, payment tracking, and member management.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MySQL Server
- Twilio Account with WhatsApp API access

### Installation & Setup

1. **Clone and setup environment**
   ```bash
   git clone <repository-url>
   cd chama-reminder-system
   pip install -r requirements.txt
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Setup MySQL Database**
   - Ensure MySQL server is running
   - The application will automatically create the database and tables on first run

4. **Run the application**
   ```bash
   export FLASK_APP=app.py
   flask run
   ```
   
   Or simply:
   ```bash
   python app.py
   ```

5. **Access the dashboard**
   Navigate to `http://localhost:5000/dashboard`

## 🎯 Features

### Database Schema
- **members**: id, name, phone_number, has_paid, last_payment
- **settings**: id, due_date

### Backend API Endpoints
- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `PATCH /api/members/<id>/pay` - Mark member as paid
- `POST /api/send-reminders` - Send WhatsApp reminders
- `GET /api/stats` - Get dashboard statistics

### WhatsApp Integration
- **Webhook**: `/whatsapp` - Handles incoming WhatsApp messages
- **Commands**: 
  - "PAID" - Mark payment as complete
  - "STATUS" - Check payment status
- **Scheduled Reminders**: Daily at 9:00 AM EAT

### Dashboard Features
- Responsive web interface at `/dashboard`
- Real-time statistics cards
- Member management with HTMX
- One-click payment marking
- Send reminders to all unpaid members

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chama_db

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Flask
FLASK_ENV=development
SECRET_KEY=your_secret_key
PORT=5000
```

### Twilio WhatsApp Setup

1. **Create Twilio Account**
   - Sign up at [Twilio Console](https://console.twilio.com/)
   - Get Account SID and Auth Token

2. **Enable WhatsApp Sandbox**
   - Go to Messaging > Try it out > Send a WhatsApp message
   - Follow sandbox activation instructions
   - Note the sandbox number (usually +14155238886)

3. **Configure Webhook**
   - Set webhook URL: `https://your-domain.com/whatsapp`
   - For local development, use ngrok: `ngrok http 5000`
   - Update webhook URL to: `https://your-ngrok-url.ngrok.io/whatsapp`

## 📱 WhatsApp Commands

Members can interact via WhatsApp:
- **"PAID"** / "DONE" / "COMPLETE" - Mark payment as received
- **"STATUS"** / "CHECK" - Check current payment status

## 🏗️ Project Structure

```
├── app.py                 # Main Flask application
├── db.py                  # Database connection and utilities
├── scheduler.py           # APScheduler for daily reminders
├── schema.sql             # Database schema (auto-run)
├── routes/
│   ├── api.py            # API endpoints blueprint
│   └── dashboard.py      # Dashboard routes blueprint
├── templates/
│   └── dashboard.html    # Dashboard HTML template
├── static/
│   └── js/
│       └── dashboard.js  # Dashboard JavaScript
├── requirements.txt      # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add MySQL Database**
   ```bash
   railway add mysql
   ```

3. **Set Environment Variables**
   - Add all variables from `.env.example`
   - Railway will provide `DATABASE_URL` automatically

4. **Deploy**
   ```bash
   railway deploy
   ```

### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   heroku addons:create cleardb:ignite
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   # ... other variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## 🔄 Scheduled Jobs

The system automatically runs daily reminders at 9:00 AM EAT using APScheduler:
- Fetches all unpaid members
- Sends WhatsApp reminders via Twilio
- Logs success/failure for monitoring

## 🛠️ Development

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Setup database
mysql -u root -p < schema.sql

# Run development server
FLASK_ENV=development python app.py
```

### Testing WhatsApp Integration
1. Use ngrok to expose local server: `ngrok http 5000`
2. Update Twilio webhook URL to ngrok URL
3. Send test messages to your Twilio WhatsApp number

## 📊 Dashboard Features

- **Statistics Cards**: Total, Paid, Unpaid members + Due date
- **Member Table**: ID, Name, Phone, Status, Last Payment, Actions
- **Add Member Modal**: HTMX-powered form with validation
- **Send Reminders**: One-click reminder sending
- **Responsive Design**: Works on mobile and desktop

## 🔐 Security

- Environment variables for sensitive data
- Input validation on all endpoints
- CORS enabled for frontend integration
- MySQL prepared statements prevent SQL injection

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure MySQL server is running
4. Test Twilio credentials in Twilio Console

## 🔄 Changelog

### v1.0.0
- Initial release with Flask backend
- WhatsApp integration via Twilio
- Responsive dashboard with HTMX
- Automated daily reminders
- MySQL database with auto-initialization
- Production-ready deployment configuration