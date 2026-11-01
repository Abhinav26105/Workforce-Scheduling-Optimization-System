"""
Seed Data Generator for Workforce Scheduling Optimization System
Populates realistic sample data across 4 industries:
1. Hospital
2. Retail Store
3. Call Centre
4. Factory
"""

from datetime import datetime, timedelta
from models import init_db, _make_connection

def seed_database():
    init_db()
    conn = _make_connection()
    cursor = conn.cursor()

    # Clear previous seed
    cursor.execute("DELETE FROM schedules")
    cursor.execute("DELETE FROM leaves")
    cursor.execute("DELETE FROM availabilities")
    cursor.execute("DELETE FROM employee_skills")
    cursor.execute("DELETE FROM shifts")
    cursor.execute("DELETE FROM employees")
    cursor.execute("DELETE FROM skills")
    cursor.execute("DELETE FROM industries")

    # 1. Industries
    industries = [
        ('hospital', 'Healthcare & Hospital', 'Emergency, ICU, Surgery and Inpatient Care', 'Activity'),
        ('retail', 'Retail & Supermarket', 'Customer checkouts, merchandising, inventory and floor support', 'ShoppingBag'),
        ('callcenter', 'Contact & Call Centre', 'Inbound customer care, tech escalation, outbound sales and dispatch', 'Headphones'),
        ('factory', 'Manufacturing & Factory', 'Assembly line, precision machining, quality assurance and safety', 'Factory')
    ]
    cursor.executemany("INSERT INTO industries (id, name, description, icon) VALUES (?, ?, ?, ?)", industries)

    # 2. Skills
    skills_data = [
        # Hospital Skills
        ('Critical Care Nursing', 'Medical', 'hospital', 'ICU monitoring and advanced patient stabilization'),
        ('Triage & Emergency Assessment', 'Medical', 'hospital', 'Rapid patient categorization and emergency life support'),
        ('Pharmacology & IV Delivery', 'Clinical', 'hospital', 'Medication dispensation and infusion management'),
        ('Pediatric Care', 'Medical', 'hospital', 'Specialized care for infants and adolescents'),
        
        # Retail Skills
        ('POS & Cash Handling', 'Operations', 'retail', 'Fast barcode scanning, refunds and cashier balancing'),
        ('Visual Merchandising', 'Floor', 'retail', 'Stock layout, promotional displays and shelf presentation'),
        ('Inventory & Stock Audit', 'Warehouse', 'retail', 'Barcode auditing, stock reconciliation and FIFO compliance'),
        ('Customer Service & Escalation', 'Service', 'retail', 'Handling customer queries and return resolution'),

        # Call Centre Skills
        ('Tier-2 Technical Troubleshooting', 'Technical', 'callcenter', 'Complex network and software diagnosis'),
        ('Billing & Account Recovery', 'Operations', 'callcenter', 'Invoicing dispute resolution and payment processing'),
        ('Omnichannel Communication', 'Support', 'callcenter', 'Handling simultaneous chat, voice and ticketing'),
        ('VIP & Enterprise Support', 'Executive', 'callcenter', 'High-priority SLA client communications'),

        # Factory Skills
        ('CNC Machine Operation', 'Machinery', 'factory', 'Operating automated computer numerical control lathes'),
        ('Quality Inspection & Metrology', 'Quality', 'factory', 'Using calipers and micrometers for zero-defect tolerance'),
        ('Industrial Safety & OSHA Protocol', 'Safety', 'factory', 'Hazardous materials handling and emergency protocols'),
        ('High-Speed Assembly Line', 'Assembly', 'factory', 'Rapid mechanical assembly and robotic pacing')
    ]
    cursor.executemany("INSERT INTO skills (name, category, industry_id, description) VALUES (?, ?, ?, ?)", skills_data)

    # Map skill name -> id
    cursor.execute("SELECT id, name, industry_id FROM skills")
    skill_rows = cursor.fetchall()
    skill_map = {row['name']: row['id'] for row in skill_rows}

    # 3. Employees
    employees_data = [
        # Hospital Employees
        ('EMP-H101', 'Dr. Sarah Jenkins', 'sarah.jenkins@hospital.org', 'ICU', 'Senior Staff Nurse', 'hospital', 8.5, 40.0, 48.0, 0.98, 0.96, 0.15),
        ('EMP-H102', 'Marcus Vance', 'marcus.vance@hospital.org', 'Emergency', 'Triage Nurse', 'hospital', 5.0, 40.0, 42.0, 0.95, 0.92, 0.20),
        ('EMP-H103', 'Elena Rostova', 'elena.rostova@hospital.org', 'ICU', 'Critical Care Specialist', 'hospital', 6.2, 36.0, 45.0, 0.92, 0.88, 0.25),
        ('EMP-H104', 'David Kim', 'david.kim@hospital.org', 'General Ward', 'Staff Nurse', 'hospital', 2.5, 40.0, 35.0, 0.96, 0.85, 0.18),
        ('EMP-H105', 'Chloe Bennett', 'chloe.bennett@hospital.org', 'Emergency', 'Junior Nurse', 'hospital', 1.2, 40.0, 30.0, 0.90, 0.82, 0.30),
        ('EMP-H106', 'Rachel Adams', 'rachel.adams@hospital.org', 'Pediatrics', 'Nurse Practitioner', 'hospital', 7.0, 40.0, 46.0, 0.97, 0.95, 0.12),
        
        # Retail Employees
        ('EMP-R201', 'Alex Mercer', 'alex.mercer@retail.com', 'Checkout', 'Lead Cashier', 'retail', 4.0, 40.0, 22.0, 0.96, 0.94, 0.10),
        ('EMP-R202', 'Priya Patel', 'priya.patel@retail.com', 'Sales Floor', 'Visual Merchandiser', 'retail', 3.5, 35.0, 24.0, 0.94, 0.90, 0.15),
        ('EMP-R203', 'Liam O\'Connor', 'liam.oconnor@retail.com', 'Inventory', 'Stock Supervisor', 'retail', 5.5, 40.0, 26.0, 0.98, 0.95, 0.20),
        ('EMP-R204', 'Sofia Gomez', 'sofia.gomez@retail.com', 'Customer Service', 'Service Representative', 'retail', 2.0, 30.0, 20.0, 0.91, 0.86, 0.22),
        ('EMP-R205', 'Jordan Reed', 'jordan.reed@retail.com', 'Checkout', 'Junior Cashier', 'retail', 0.8, 30.0, 18.0, 0.89, 0.80, 0.35),

        # Call Centre Employees
        ('EMP-C301', 'Nathan Brooks', 'nathan.brooks@callcenter.com', 'Technical Support', 'Senior Tech Lead', 'callcenter', 6.0, 40.0, 28.0, 0.97, 0.95, 0.15),
        ('EMP-C302', 'Amina Diallo', 'amina.diallo@callcenter.com', 'Billing Ops', 'Billing Specialist', 'callcenter', 4.2, 40.0, 25.0, 0.95, 0.91, 0.20),
        ('EMP-C303', 'Carlos Ruiz', 'carlos.ruiz@callcenter.com', 'Support Desk', 'Customer Support Agent', 'callcenter', 2.8, 40.0, 22.0, 0.92, 0.87, 0.28),
        ('EMP-C304', 'Emily Watson', 'emily.watson@callcenter.com', 'VIP Escalation', 'VIP Client Manager', 'callcenter', 7.5, 40.0, 32.0, 0.99, 0.98, 0.10),
        ('EMP-C305', 'Kevin Chen', 'kevin.chen@callcenter.com', 'Support Desk', 'Junior Support Agent', 'callcenter', 1.0, 35.0, 19.0, 0.88, 0.82, 0.30),

        # Factory Employees
        ('EMP-F401', 'Victor Kowalski', 'victor.kowalski@factory.com', 'Machining', 'Master Machinist', 'factory', 10.0, 40.0, 36.0, 0.99, 0.97, 0.12),
        ('EMP-F402', 'Devon Miller', 'devon.miller@factory.com', 'Quality Assurance', 'QA Metrology Lead', 'factory', 5.8, 40.0, 32.0, 0.96, 0.94, 0.18),
        ('EMP-F403', 'Hannah Schmidt', 'hannah.schmidt@factory.com', 'Safety & EHS', 'Safety Officer', 'factory', 6.5, 40.0, 34.0, 0.98, 0.96, 0.14),
        ('EMP-F404', 'Tomas Garcia', 'tomas.garcia@factory.com', 'Assembly', 'Assembly Line Specialist', 'factory', 3.2, 40.0, 26.0, 0.93, 0.89, 0.25),
        ('EMP-F405', 'Zack Taylor', 'zack.taylor@factory.com', 'Assembly', 'Assembly Operator', 'factory', 1.5, 40.0, 23.0, 0.90, 0.84, 0.32)
    ]
    cursor.executemany("""
    INSERT INTO employees (
        employee_code, name, email, department, role, industry_id,
        experience_years, max_weekly_hours, hourly_rate, attendance_rate, manager_rating, fatigue_index
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, employees_data)

    cursor.execute("SELECT id, employee_code FROM employees")
    emp_map = {row['employee_code']: row['id'] for row in cursor.fetchall()}

    # 4. Employee Skills (Proficiency 1-10)
    emp_skills = [
        # Hospital
        (emp_map['EMP-H101'], skill_map['Critical Care Nursing'], 9),
        (emp_map['EMP-H101'], skill_map['Pharmacology & IV Delivery'], 9),
        (emp_map['EMP-H102'], skill_map['Triage & Emergency Assessment'], 9),
        (emp_map['EMP-H102'], skill_map['Critical Care Nursing'], 7),
        (emp_map['EMP-H103'], skill_map['Critical Care Nursing'], 8),
        (emp_map['EMP-H103'], skill_map['Pharmacology & IV Delivery'], 8),
        (emp_map['EMP-H104'], skill_map['Pharmacology & IV Delivery'], 7),
        (emp_map['EMP-H104'], skill_map['Triage & Emergency Assessment'], 5),
        (emp_map['EMP-H105'], skill_map['Triage & Emergency Assessment'], 5),
        (emp_map['EMP-H105'], skill_map['Critical Care Nursing'], 4),
        (emp_map['EMP-H106'], skill_map['Pediatric Care'], 10),
        (emp_map['EMP-H106'], skill_map['Pharmacology & IV Delivery'], 8),

        # Retail
        (emp_map['EMP-R201'], skill_map['POS & Cash Handling'], 9),
        (emp_map['EMP-R201'], skill_map['Customer Service & Escalation'], 8),
        (emp_map['EMP-R202'], skill_map['Visual Merchandising'], 9),
        (emp_map['EMP-R202'], skill_map['Customer Service & Escalation'], 7),
        (emp_map['EMP-R203'], skill_map['Inventory & Stock Audit'], 9),
        (emp_map['EMP-R203'], skill_map['POS & Cash Handling'], 7),
        (emp_map['EMP-R204'], skill_map['Customer Service & Escalation'], 8),
        (emp_map['EMP-R204'], skill_map['POS & Cash Handling'], 6),
        (emp_map['EMP-R205'], skill_map['POS & Cash Handling'], 6),

        # Call Centre
        (emp_map['EMP-C301'], skill_map['Tier-2 Technical Troubleshooting'], 9),
        (emp_map['EMP-C301'], skill_map['Omnichannel Communication'], 8),
        (emp_map['EMP-C302'], skill_map['Billing & Account Recovery'], 9),
        (emp_map['EMP-C302'], skill_map['Customer Service & Escalation'] if 'Customer Service & Escalation' in skill_map else skill_map['Omnichannel Communication'], 8),
        (emp_map['EMP-C303'], skill_map['Omnichannel Communication'], 7),
        (emp_map['EMP-C303'], skill_map['Tier-2 Technical Troubleshooting'], 6),
        (emp_map['EMP-C304'], skill_map['VIP & Enterprise Support'], 10),
        (emp_map['EMP-C304'], skill_map['Tier-2 Technical Troubleshooting'], 8),
        (emp_map['EMP-C305'], skill_map['Omnichannel Communication'], 6),

        # Factory
        (emp_map['EMP-F401'], skill_map['CNC Machine Operation'], 10),
        (emp_map['EMP-F401'], skill_map['Industrial Safety & OSHA Protocol'], 9),
        (emp_map['EMP-F402'], skill_map['Quality Inspection & Metrology'], 9),
        (emp_map['EMP-F402'], skill_map['High-Speed Assembly Line'], 7),
        (emp_map['EMP-F403'], skill_map['Industrial Safety & OSHA Protocol'], 10),
        (emp_map['EMP-F403'], skill_map['CNC Machine Operation'], 7),
        (emp_map['EMP-F404'], skill_map['High-Speed Assembly Line'], 8),
        (emp_map['EMP-F404'], skill_map['Quality Inspection & Metrology'], 6),
        (emp_map['EMP-F405'], skill_map['High-Speed Assembly Line'], 6),
    ]
    cursor.executemany("INSERT INTO employee_skills (employee_id, skill_id, proficiency_level) VALUES (?, ?, ?)", emp_skills)

    # 5. Dynamic Shifts for Current Week
    today = datetime.now().date()
    # Find Monday of current week
    monday = today - timedelta(days=today.weekday())

    shifts_data = [
        # Hospital Shifts
        ('SH-H01', 'ICU Critical Care Day', 'MORNING', 'ICU', 'hospital', (monday).strftime('%Y-%m-%d'), '07:00', '15:30', 8.0, skill_map['Critical Care Nursing'], 7, 1, 8.5),
        ('SH-H02', 'Emergency Trauma Response', 'AFTERNOON', 'Emergency', 'hospital', (monday).strftime('%Y-%m-%d'), '15:00', '23:30', 8.0, skill_map['Triage & Emergency Assessment'], 7, 1, 8.0),
        ('SH-H03', 'ICU Overnight Intensive', 'NIGHT', 'ICU', 'hospital', (monday).strftime('%Y-%m-%d'), '23:00', '07:30', 8.0, skill_map['Critical Care Nursing'], 8, 1, 9.0),
        ('SH-H04', 'Pediatric Clinical Ward', 'MORNING', 'Pediatrics', 'hospital', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '07:00', '15:30', 8.0, skill_map['Pediatric Care'], 7, 1, 6.5),
        ('SH-H05', 'Emergency Fast Track', 'MORNING', 'Emergency', 'hospital', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '07:00', '15:30', 8.0, skill_map['Triage & Emergency Assessment'], 6, 1, 7.0),
        ('SH-H06', 'General Pharmacology Dispense', 'AFTERNOON', 'General Ward', 'hospital', (monday + timedelta(days=2)).strftime('%Y-%m-%d'), '15:00', '23:30', 8.0, skill_map['Pharmacology & IV Delivery'], 6, 1, 5.5),
        ('SH-H07', 'Weekend Emergency Coverage', 'MORNING', 'Emergency', 'hospital', (monday + timedelta(days=5)).strftime('%Y-%m-%d'), '07:00', '15:30', 8.0, skill_map['Triage & Emergency Assessment'], 8, 1, 8.5),

        # Retail Shifts
        ('SH-R01', 'Morning Register Rush', 'MORNING', 'Checkout', 'retail', (monday).strftime('%Y-%m-%d'), '08:00', '16:30', 8.0, skill_map['POS & Cash Handling'], 6, 1, 5.0),
        ('SH-R02', 'Weekly Stock Delivery & Audit', 'AFTERNOON', 'Inventory', 'retail', (monday).strftime('%Y-%m-%d'), '14:00', '22:30', 8.0, skill_map['Inventory & Stock Audit'], 7, 1, 7.5),
        ('SH-R03', 'Promotional Merchandising', 'MORNING', 'Sales Floor', 'retail', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '08:00', '16:30', 8.0, skill_map['Visual Merchandising'], 7, 1, 6.0),
        ('SH-R04', 'Evening Support & Returns', 'AFTERNOON', 'Customer Service', 'retail', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '14:00', '22:30', 8.0, skill_map['Customer Service & Escalation'], 6, 1, 6.5),

        # Call Centre Shifts
        ('SH-C01', 'Tier-2 Tech Queue Morning', 'MORNING', 'Technical Support', 'callcenter', (monday).strftime('%Y-%m-%d'), '08:00', '16:30', 8.0, skill_map['Tier-2 Technical Troubleshooting'], 7, 1, 7.0),
        ('SH-C02', 'Enterprise Escalation SLA', 'AFTERNOON', 'VIP Escalation', 'callcenter', (monday).strftime('%Y-%m-%d'), '14:00', '22:30', 8.0, skill_map['VIP & Enterprise Support'], 8, 1, 8.5),
        ('SH-C03', 'Billing Disputes Resolution', 'MORNING', 'Billing Ops', 'callcenter', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '08:00', '16:30', 8.0, skill_map['Billing & Account Recovery'], 7, 1, 6.0),

        # Factory Shifts
        ('SH-F01', 'Precision CNC Lathe Run', 'MORNING', 'Machining', 'factory', (monday).strftime('%Y-%m-%d'), '06:00', '14:30', 8.0, skill_map['CNC Machine Operation'], 8, 1, 8.0),
        ('SH-F02', 'Automated QA Line Inspection', 'AFTERNOON', 'Quality Assurance', 'factory', (monday).strftime('%Y-%m-%d'), '14:00', '22:30', 8.0, skill_map['Quality Inspection & Metrology'], 7, 1, 7.5),
        ('SH-F03', 'Facility Safety Audit', 'MORNING', 'Safety & EHS', 'factory', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '06:00', '14:30', 8.0, skill_map['Industrial Safety & OSHA Protocol'], 8, 1, 7.0),
        ('SH-F04', 'High-Volume Mechanical Assembly', 'AFTERNOON', 'Assembly', 'factory', (monday + timedelta(days=1)).strftime('%Y-%m-%d'), '14:00', '22:30', 8.0, skill_map['High-Speed Assembly Line'], 6, 1, 6.0),
    ]
    cursor.executemany("""
    INSERT INTO shifts (
        shift_code, name, shift_type, department, industry_id, date,
        start_time, end_time, duration_hours, required_skill_id, min_proficiency,
        required_headcount, difficulty_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, shifts_data)

    # 6. Sample Approved Leave (Elena Rostova is on leave on Monday!)
    # Test case: Elena Rostova must be rejected for Monday shifts
    leaves_data = [
        (emp_map['EMP-H103'], (monday).strftime('%Y-%m-%d'), (monday).strftime('%Y-%m-%d'), 'Medical Appointment', 'APPROVED'),
        (emp_map['EMP-R204'], (monday + timedelta(days=2)).strftime('%Y-%m-%d'), (monday + timedelta(days=3)).strftime('%Y-%m-%d'), 'Family Leave', 'APPROVED')
    ]
    cursor.executemany("INSERT INTO leaves (employee_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)", leaves_data)

    # 7. Sample Availabilities
    # Chloe Bennett is UNAVAILABLE on Monday
    # Alex Mercer prefers MORNING
    availabilities_data = [
        (emp_map['EMP-H105'], 0, 'UNAVAILABLE'), # Monday = 0
        (emp_map['EMP-R201'], 0, 'MORNING'),
        (emp_map['EMP-C301'], 0, 'MORNING'),
        (emp_map['EMP-F401'], 0, 'MORNING')
    ]
    cursor.executemany("INSERT INTO availabilities (employee_id, day_of_week, preferred_shift_type) VALUES (?, ?, ?)", availabilities_data)

    conn.commit()
    conn.close()
    print("Seed data successfully populated for all 4 industries.")

if __name__ == '__main__':
    seed_database()
