from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def daily_reminder_job():
    """Daily job to send reminders at 9:00 AM EAT"""
    try:
        # Call the send-reminders endpoint
        response = requests.post('http://localhost:5000/api/send-reminders')
        if response.status_code == 200:
            logger.info("Daily reminders sent successfully")
        else:
            logger.error(f"Failed to send reminders: {response.status_code}")
    except Exception as e:
        logger.error(f"Error in daily reminder job: {e}")

def start_scheduler():
    """Start the background scheduler"""
    scheduler = BackgroundScheduler()
    
    # Schedule daily reminders at 9:00 AM EAT (UTC+3)
    scheduler.add_job(
        daily_reminder_job,
        CronTrigger(hour=6, minute=0),  # 6 AM UTC = 9 AM EAT
        id='daily_reminders',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started - daily reminders at 9:00 AM EAT")
    return scheduler