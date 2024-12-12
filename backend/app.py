from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
from db_connector import test_db_connection
import db_connector 
from send_email import configure_mail, configure_link_storage_db, send_reset_email, is_link_valid

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure Flask session
app.secret_key = "1234"  # Replace with a strong secret key
app.config["SESSION_TYPE"] = "filesystem"  # Store session data in the file system
app.config["SESSION_PERMANENT"] = False    # Session resets after the browser is closed
Session(app)

# Configure email service and link storage database
configure_mail(app)
configure_link_storage_db(app)

def log_current_session():
    user_id = session.get('user_id')
    if user_id:
        print(f"DEBUG: Current user logged in with ID: {user_id}")
    else:
        print("DEBUG: No user currently logged in.")


# User registration
@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    username = data['username']
    email = data['email']
    password = data['password']
    confirm_password = data['confirm_password']

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    db_connector.register_user(username, password, email)
    return jsonify({'message': 'User registered successfully'}), 201

# User login
@app.route('/login', methods=['POST'])
def login_user():
    data = request.json
    username = data['username']
    password = data['password']
    print(f"DEBUG: Received login request for username: {username}")
    print(f"DEBUG: Received login request for password: {password}")


    # Authenticate user
    user = db_connector.login_user(username, password)
    if user:
        session['user_id'] = user[0]  # Store user ID in session
        print(f"DEBUG: User '{username}' logged in with ID: {user[0]}")
        return jsonify({'message': 'Login successful'}), 200
    else:
        print("DEBUG: Login failed for username:", username)
        return jsonify({'message': 'Invalid credentials'}), 401

# Logout
@app.route('/logout', methods=['POST'])
def logout_user():
    user_id = session.get('user_id')
    if user_id:
        print(f"DEBUG: User with ID {user_id} is logging out.")
    else:
        print("DEBUG: No user is logged in but logout was called.")
    session.clear()  # Clear the session
    return jsonify({"message": "Logout successful"}), 200

@app.route('/request-reset', methods=['POST'])
def request_reset():
    
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    # Check if the email exists in the system
    user = db_connector.get_user_by_email(email)
    if not user:
        return jsonify({'message': 'No user found with this email address'}), 404

    try:
        send_reset_email(app, email)
        return jsonify({'message': 'Password reset link sent to your email'}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to send reset email: {str(e)}'}), 500

@app.route('/reset/<email>/<unique_key>', methods=['GET'])
def check_reset_link(email, unique_key):
    """
    Check if the reset password link is valid.
    """
    if is_link_valid(email, unique_key):
        return jsonify({'message': 'Reset link is valid'}), 200
    else:
        return jsonify({'message': 'Reset link is invalid or expired'}), 400

# Password reset
@app.route('/reset/<email>/<unique_key>', methods=['POST'])
def reset_password(email, unique_key):
    """
    Reset the password using a valid link.
    """
    data = request.json
    new_password = data.get('new_password')

    if not new_password:
        return jsonify({'message': 'New password is required'}), 400

    # Validate the reset link directly in the POST handler
    if not is_link_valid(email, unique_key):
        return jsonify({'message': 'Reset link is invalid or expired'}), 400

    # Reset the user's password
    user = db_connector.get_user_by_email(email)
    if user:
        db_connector.reset_user_password(email, new_password)  # Ensure password hashing is applied
        return jsonify({'message': 'Password has been updated successfully'}), 200

    return jsonify({'message': 'Failed to update password. User not found.'}), 404

# Fetch all expenses for a user
@app.route('/api/expenses/<int:user_id>', methods=['GET'])
def get_expenses(user_id):
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expenses WHERE user_id = %s", (user_id,))
    expenses = cursor.fetchall()
    conn.close()
    
    if not expenses:
        return jsonify({'message': 'No expenses found for this user'}), 404

    return jsonify([
        {
            "id": row[0],
            "user_id": row[1],
            # "category_id": row[2],
            "amount": row[2],
            "description": row[3],
            "date": row[4]
        } for row in expenses
    ])


# Get current user
@app.route('/api/user', methods=['GET'])
def get_current_user():

    log_current_session()  # Log current session details

    user_id = session.get('user_id')  # Retrieve user_id from session
    if not user_id:
        print("DEBUG: Attempt to fetch user but no user is logged in.")
        return jsonify({"message": "User not logged in"}), 401

    # Query the database for the user
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        print(f"DEBUG: Retrieved user from database: {user}")
        return jsonify({
            "id": user[0],
            "username": user[1],
            "email": user[2]
        }), 200
    else:
        return jsonify({"message": "User not found"}), 404
    
# Get summary data
@app.route('/api/summary', methods=['GET'])
def get_summary():
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM summary ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"message": "No summary data found"}), 404

    summary_data = [
        {
            "id": row[0],
            "title": row[1],
            "tag": row[2],
            "amount": row[3],
            "date": row[4].strftime('%Y-%m-%d'),
            "type": row[5]
        } for row in rows
    ]
    return jsonify(summary_data), 200





# Fetch all savings for a user
@app.route('/api/savings/<int:user_id>', methods=['GET'])
def get_savings(user_id):
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM savings WHERE user_id = %s", (user_id,))
    savings = cursor.fetchall()
    conn.close()

    if not savings:
        return jsonify({'message': 'No savings found for this user'}), 404

    return jsonify([
        {
            "id": row[0],
            "user_id": row[1],
            "goal_id": row[2],
            "amount": row[3],
            "date": row[4]
        } for row in savings
    ])

# Add new expense
@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    user_id = data['user_id']
    amount = data['amount']
    description = data.get('description', '')

    # Check if user exists
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    # Insert the expense
    cursor.execute(
        "INSERT INTO expenses (user_id, amount, description) VALUES (%s, %s, %s) RETURNING id",
        (user_id, amount, description)
    )
    expense_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()

    return jsonify({"message": "Expense added successfully", "expense_id": expense_id}), 201

# Add new savings
@app.route('/api/savings', methods=['POST'])
def add_savings():

    user_id = session.get('user_id')  
    if not user_id:
        return jsonify({"message": "User not logged in"}), 401

    data = request.json
    amount = data.get('amount')
    goal_id = data.get('goal_id') # Optional goal_id

    if not amount:
        return jsonify({"message": "Savings amount is required"}), 400

    try:
        conn = db_connector.get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO savings (user_id, goal_id, amount) VALUES (%s, %s, %s) RETURNING id",
            (user_id, goal_id, amount)
        )
        savings_id = cursor.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Savings added successfully", "savings_id": savings_id}), 201
    except Exception as e:
        print(f"DEBUG: Error while saving savings: {e}")
        return jsonify({"message": "Failed to add savings"}), 500
    finally:
        conn.close()



@app.route('/api/summary/receipt', methods=['POST'])
def add_receipt():
    data = request.json
    print("DEBUG: Received data for receipt:", data)  # Debug log

    try:
        # Extract data from the request
        user_id = data.get('user_id')
        title = data.get('title', 'Unknown Merchant')
        date = data.get('date')
        amount = data.get('amount')
        type = data.get('type', 'Expense')  # Default type is "Expense"
        tag = data.get('tag', 'Other')  # Default tag is "Other"

        # Validate required fields
        if not all([user_id, title, date, amount]):
            return jsonify({"error": "Missing required fields"}), 400

        # Insert the receipt data into the summary table
        conn = db_connector.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO summary (user_id, title, amount, date, type, tag)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, title, amount, date, type, tag))

        # If the type is Expense, also insert into the expenses table
        if type == 'Expense':
            cursor.execute("""
                INSERT INTO expenses (user_id, description, amount, date)
                VALUES (%s, %s, %s, %s)
            """, (user_id, title, amount, date))

        conn.commit()
        conn.close()

        print("DEBUG: Receipt and Expense added successfully")
        return jsonify({"message": "Receipt entry added successfully"}), 201

    except Exception as e:
        print("DEBUG: Error in adding receipt:", str(e))
        return jsonify({"error": str(e)}), 500





# Add new summary entry
@app.route('/api/summary', methods=['POST'])
def add_summary():
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    tag = data.get('tag')
    amount = data.get('amount')
    date = data.get('date')
    type = data['type']

    if not title or not tag or not amount or not date:
        return jsonify({"message": "All fields are required"}), 400

    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO summary (user_id, title, tag, amount, date, type) VALUES (%s,%s, %s, %s, %s, %s) RETURNING id",
        (user_id, title, tag, amount, date, type)
    )
    summary_id = cursor.fetchone()[0]

    if type == "Expense":
        cursor.execute(
            """
            INSERT INTO expenses (user_id, amount, description, date)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, amount, title, date)
        )
    if type == "Earnings":
        cursor.execute(
            """
            INSERT INTO savings (user_id, amount, date)
            VALUES (%s, %s, %s)
            """,
            (user_id, amount, date)
        )

    conn.commit()
    conn.close()

    return jsonify({"message": "Summary entry added successfully", "id": summary_id}), 201


@app.route('/api/summary/<int:summary_id>', methods=['PUT'])
def update_summary(summary_id):
    data = request.json
    title = data.get('title')
    tag = data.get('tag')
    amount = data.get('amount')
    date = data.get('date')

    if not title or not tag or not amount or not date:
        return jsonify({"message": "All fields are required"}), 400

    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE summary SET title = %s, tag = %s, amount = %s, date = %s WHERE id = %s",
        (title, tag, amount, date, summary_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Summary entry updated successfully"}), 200

# Delete summary entry
@app.route('/api/summary/<int:summary_id>', methods=['DELETE'])
def delete_summary(summary_id):
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()

    # Check if the item exists in the summary table
    cursor.execute("SELECT id, title, tag, amount, date, type, user_id FROM summary WHERE id = %s", (summary_id,))
    summary_item = cursor.fetchone()

    if not summary_item:
        conn.close()
        return jsonify({"message": "Item not found"}), 404

    # Delete from `expenses` or `savings` if applicable
    if summary_item[5] == "Expense":  # Assuming `type` is "Expense"
        cursor.execute(
            """
            DELETE FROM expenses 
            WHERE ctid = (
                SELECT ctid 
                FROM expenses 
                WHERE description = %s AND user_id = %s
                ORDER BY ctid
                LIMIT 1
            )
            """,
            (summary_item[1], summary_item[6])
        )
    elif summary_item[5] == "Earnings":  # Assuming `type` is "Earning"
        cursor.execute(
            """
            DELETE FROM savings 
            WHERE ctid = (
                SELECT ctid 
                FROM savings 
                WHERE user_id = %s AND amount = %s
                ORDER BY ctid
                LIMIT 1
            )
            """,
            (summary_item[6], summary_item[3])
        )

    # Delete from `summary` table
    cursor.execute("DELETE FROM summary WHERE id = %s", (summary_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Item deleted successfully"}), 200







# Update an expense
@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    data = request.json
    amount = data.get('amount')
    description = data.get('description')

    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE expenses SET amount = %s, description = %s WHERE id = %s",
        (amount, description, expense_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Expense updated successfully"}), 200

# Delete an expense
@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    conn = db_connector.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = %s", (expense_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Expense deleted successfully"}), 200

# Update profile
@app.route('/api/edit', methods=['POST'])
def edit_profile():
    log_current_session()  # Log session details for debugging

    # Retrieve user_id from session
    user_id = session.get('user_id')
    if not user_id:
        print("DEBUG: Attempt to edit profile but no user is logged in.")
        return jsonify({"message": "User not logged in"}), 401

    # Get JSON data from the request
    data = request.json
    username = data.get('username')
    email = data.get('email')

    # Validate input
    if not username or not email:
        print("DEBUG: Missing fields in edit profile request.")
        return jsonify({"message": "Both username and email are required"}), 400

    try:
        # Update user details in the database
        conn = db_connector.get_db_connection()
        cursor = conn.cursor()
        query = """
        UPDATE users
        SET username = %s, email = %s
        WHERE id = %s
        """
        cursor.execute(query, (username, email, user_id))
        conn.commit()

        # Ensure the update was successful
        if cursor.rowcount == 0:
            print(f"DEBUG: No changes made for user ID {user_id}.")
            return jsonify({"message": "No changes were made."}), 404

        print(f"DEBUG: User ID {user_id} profile updated successfully.")
        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print(f"ERROR: Failed to update profile for user ID {user_id}: {str(e)}")
        return jsonify({"message": "An error occurred while updating the profile"}), 500

    finally:
        conn.close()



if __name__ == '__main__':
    test_db_connection()
    app.run(debug=True)
