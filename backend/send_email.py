from flask_mail import Mail, Message
from flask import request
from datetime import datetime, timedelta
import uuid
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Mail and SQLAlchemy objects
mail = Mail()
db = SQLAlchemy()

# Link storage model for SQLite
class LinkStorage(db.Model):
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)

def configure_mail(app):
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
    mail.init_app(app)
    print("Mail configuration successfully initialized.")

def configure_link_storage_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///link_storage.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    print("Link storage database configuration initialized.")
    with app.app_context():
        db.create_all()

def create_reset_link(recipient_email):
    unique_key = str(uuid.uuid4())
    expiry_time = datetime.now() + timedelta(minutes=15)

    # Store the reset link in the SQLite database
    link_data = LinkStorage(id=unique_key, email=recipient_email, expiry_time=expiry_time)
    db.session.add(link_data)
    db.session.commit()

    reset_link = f"http://localhost:5173/reset/{recipient_email}/{unique_key}"
    return reset_link

def is_link_valid(recipient_email, unique_key):
    link_data = LinkStorage.query.filter_by(id=unique_key, email=recipient_email).first()
    if link_data and datetime.now() < link_data.expiry_time:
        return True
    return False

def send_reset_email(app, recipient_email):
    with app.app_context():
        try:
            reset_link = create_reset_link(recipient_email)
            msg = Message(
                subject='Password Reset Request',
                sender=os.getenv('MAIL_USERNAME'),
                recipients=[recipient_email]
            )
            msg.html = (
                f"Hello,<br><br>"
                f"Click <a href='{reset_link}'>here</a> to reset your password.<br><br>"
                f"If you didn't request this, please ignore this email."
            )
            mail.send(msg)
            print(f"Password reset email sent to {recipient_email}.")
        except Exception as e:
            print(f"Error sending email: {e}")
            raise e
