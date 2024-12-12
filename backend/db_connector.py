import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get DB connection information from .env
db_host = os.getenv('DB_SERVER')
db_database = os.getenv('DB_DATABASE')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')

# Function to get a database connection using psycopg2
def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=db_host,
            database=db_database,
            user=db_user,
            password=db_password
        )
        return connection
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

# This is being fixed
def register_user(username, password, email):
    # Check if the username already exists
    check_query = "SELECT 1 FROM users WHERE username = %s"
    existing_user = fetch_one(check_query, (username,))
    
    if existing_user:
        raise ValueError("Username already exists. Please choose a different one.")

    print("Adding new user with the following details:")
    print(f"Username: {username}")
    print(f"Password: {password}")  
    print(f"Email: {email}")

    # Proceed with registration if username doesn't exist
    query = "INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)"
    execute_query(query, (username, password, email))



# Check login credentials
def login_user(username, password):
    query = "SELECT * FROM users WHERE username = %s AND password_hash = %s"
    result = fetch_one(query, (username, password))  
    return result


# Fetch user by email
def get_user_by_email(email):
    query = "SELECT * FROM users WHERE email = %s"
    return fetch_one(query, (email,))

# Reset user password
def reset_user_password(email, new_password):
    query = "UPDATE users SET password_hash = %s WHERE email = %s"
    execute_query(query, (new_password, email))

# Helper function to execute a query
def execute_query(query, params=None):
    conn = get_db_connection()
    if conn is None:
        return
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    cursor.close()
    conn.close()

# Helper function to fetch a single record
def fetch_one(query, params=None):
    conn = get_db_connection()
    if conn is None:
        return None
    cursor = conn.cursor()
    cursor.execute(query, params)
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result

# Function to test database connection
def test_db_connection():
    try:
        conn = get_db_connection()
        if conn:
            print("Database connection successful!")
            conn.close()
        else:
            print("Failed to connect to the database.")
    except Exception as e:
        print(f"Error: {e}")
