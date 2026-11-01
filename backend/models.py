import sqlite3
import os
from datetime import datetime

# Vercel serverless functions have a read-only filesystem except /tmp
if os.environ.get('VERCEL'):
    DB_PATH = '/tmp/workforce.db'
else:
    DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'workforce.db'))

def _make_connection():
    """Low-level connection factory — does NOT call init_db to avoid recursion."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def _needs_init():
    """Return True if the DB file is missing or empty (no tables yet)."""
    if not os.path.exists(DB_PATH) or os.path.getsize(DB_PATH) == 0:
        return True
    # Quick check: if the industries table exists we consider DB initialised
    try:
        conn = _make_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM industries")
        count = cur.fetchone()[0]
        conn.close()
        return count == 0
    except Exception:
        return True

def get_db():
    """Return a database connection, initializing and seeding if necessary."""
    if _needs_init():
        init_db()
        try:
            from seed_data import seed_database
            seed_database()
        except Exception as e:
            import traceback
            print("Seed error:", traceback.format_exc())
    return _make_connection()

def init_db():
    """Create all tables using a direct low-level connection (no get_db recursion)."""
    conn = _make_connection()
    cursor = conn.cursor()

    # Industries table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS industries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT
    )
    """)

    # Skills table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        industry_id TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (industry_id) REFERENCES industries(id)
    )
    """)

    # Employees table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        industry_id TEXT NOT NULL,
        experience_years REAL DEFAULT 1.0,
        max_weekly_hours REAL DEFAULT 40.0,
        hourly_rate REAL DEFAULT 25.0,
        attendance_rate REAL DEFAULT 0.95,
        manager_rating REAL DEFAULT 0.90,
        fatigue_index REAL DEFAULT 0.20,
        FOREIGN KEY (industry_id) REFERENCES industries(id)
    )
    """)

    # Employee Skills Junction table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employee_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        skill_id INTEGER NOT NULL,
        proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 10),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE (employee_id, skill_id)
    )
    """)

    # Shifts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shift_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        department TEXT NOT NULL,
        industry_id TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration_hours REAL NOT NULL,
        required_skill_id INTEGER NOT NULL,
        min_proficiency INTEGER NOT NULL DEFAULT 5,
        required_headcount INTEGER NOT NULL DEFAULT 1,
        difficulty_score REAL NOT NULL DEFAULT 5.0,
        FOREIGN KEY (required_skill_id) REFERENCES skills(id),
        FOREIGN KEY (industry_id) REFERENCES industries(id)
    )
    """)

    # Availability table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS availabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        preferred_shift_type TEXT NOT NULL DEFAULT 'ANY',
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE (employee_id, day_of_week)
    )
    """)

    # Leave Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'APPROVED',
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
    """)

    # Schedules / Assignments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shift_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        is_backup INTEGER NOT NULL DEFAULT 0,
        suitability_score REAL NOT NULL,
        certainty_factor REAL NOT NULL,
        absence_risk REAL NOT NULL,
        reliability_score REAL NOT NULL,
        algorithm_used TEXT NOT NULL,
        explanation TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
    """)

    # Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        details TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_PATH)
