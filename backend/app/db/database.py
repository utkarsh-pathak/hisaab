import os

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error
from sqlmodel import SQLModel, create_engine

# Load environment variables
load_dotenv()

# Database connection details
DATABASE_URL = os.getenv("DATABASE_URL")  # Full URL for SQLAlchemy
DB_HOST = os.getenv("DB_HOST")  # Host for MySQL connection
DB_USER = os.getenv("DB_USER")  # MySQL user
DB_PASSWORD = os.getenv("DB_PASSWORD")  # MySQL password

# SQLAlchemy engine
engine = create_engine(DATABASE_URL)


def extract_db_name(database_url: str) -> str:
    """Extract the database name from the DATABASE_URL."""
    return DATABASE_URL.split("/")[-1].split("?")[0]


def create_database_if_not_exists():
    """Ensure the database exists."""
    db_name = extract_db_name(DATABASE_URL)

    try:
        # Connect to the MySQL server without specifying a database
        conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD)
        if conn.is_connected():
            cursor = conn.cursor()
            cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
            if not cursor.fetchone():
                cursor.execute(f"CREATE DATABASE {db_name}")
                print(f"Database '{db_name}' created.")
            else:
                print(f"Database '{db_name}' already exists.")
            cursor.close()
        conn.close()
    except Error as e:
        print(f"Error creating database: {e}")
        raise


def create_db_and_tables():
    """Ensure the database exists and create tables."""
    # create_database_if_not_exists()
    SQLModel.metadata.create_all(engine)
    print("Database and tables created successfully.")
