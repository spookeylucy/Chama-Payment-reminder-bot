import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'chama_db'),
            autocommit=True
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def init_database():
    """Initialize database with schema"""
    try:
        # First connect without database to create it
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            autocommit=True
        )
        
        cursor = connection.cursor()
        
        # Read and execute schema
        with open('schema.sql', 'r') as file:
            schema_sql = file.read()
            
        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        for statement in statements:
            if statement:
                cursor.execute(statement)
        
        cursor.close()
        connection.close()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")

def execute_query(query, params=None, fetch=False):
    """Execute database query"""
    connection = get_db_connection()
    if not connection:
        return None
        
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch:
            result = cursor.fetchall()
        else:
            result = cursor.rowcount
            
        cursor.close()
        connection.close()
        return result
        
    except Exception as e:
        print(f"Query execution error: {e}")
        return None