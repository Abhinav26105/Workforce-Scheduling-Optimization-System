"""
Frame-based Knowledge Representation System
Workforce Scheduling Optimization System
Represents employees, skills, shifts and resources using Frames with:
- Slots & Facets (value, default, type, constraints)
- Frame Inheritance (BaseResourceFrame -> EmployeeFrame / ShiftFrame)
- Procedural Attachments / Daemons:
  * if-needed: dynamically calculates remaining hours and current fatigue
  * if-added: updates workload totals and logs assignment
"""

class Frame:
    def __init__(self, name, parent=None):
        self.name = name
        self.parent = parent
        self.slots = {}
        self.daemons = {'if-needed': {}, 'if-added': {}}

    def add_slot(self, slot_name, value=None, default=None, facet_constraint=None):
        self.slots[slot_name] = {
            'value': value if value is not None else default,
            'default': default,
            'constraint': facet_constraint
        }

    def attach_daemon(self, daemon_type, slot_name, func):
        if daemon_type in self.daemons:
            self.daemons[daemon_type][slot_name] = func

    def get_slot(self, slot_name):
        if slot_name in self.daemons['if-needed']:
            return self.daemons['if-needed'][slot_name](self)
            
        if slot_name in self.slots:
            val = self.slots[slot_name]['value']
            if val is not None:
                return val
            return self.slots[slot_name]['default']
            
        if self.parent:
            return self.parent.get_slot(slot_name)
        return None

    def set_slot(self, slot_name, value):
        if slot_name in self.slots:
            constraint = self.slots[slot_name].get('constraint')
            if constraint and not constraint(value):
                raise ValueError(f"Value '{value}' violates facet constraint for slot '{slot_name}'")
            self.slots[slot_name]['value'] = value
        else:
            self.add_slot(slot_name, value=value)
            
        if slot_name in self.daemons['if-added']:
            self.daemons['if-added'][slot_name](self, value)

    def to_dict(self):
        res = {'frame_name': self.name, 'parent': self.parent.name if self.parent else None, 'slots': {}}
        for slot in self.slots:
            res['slots'][slot] = self.get_slot(slot)
        return res


class EmployeeFrame(Frame):
    def __init__(self, emp_data):
        super().__init__(name=f"Employee_{emp_data['id']}", parent=None)
        
        self.add_slot('id', emp_data['id'])
        self.add_slot('code', emp_data.get('employee_code'))
        self.add_slot('name', emp_data.get('name'))
        self.add_slot('department', emp_data.get('department'))
        self.add_slot('experience_years', emp_data.get('experience_years', 1.0))
        self.add_slot('max_weekly_hours', emp_data.get('max_weekly_hours', 40.0), default=40.0,
                      facet_constraint=lambda h: 0 <= h <= 80)
        self.add_slot('current_workload', 0.0)
        self.add_slot('hourly_rate', emp_data.get('hourly_rate', 25.0))
        self.add_slot('attendance_rate', emp_data.get('attendance_rate', 0.95))
        self.add_slot('manager_rating', emp_data.get('manager_rating', 0.90))
        self.add_slot('skills', emp_data.get('skills', {}))
        self.add_slot('assigned_shifts', [])

        # Procedural Attachment (if-needed): remaining hours
        self.attach_daemon('if-needed', 'remaining_hours', lambda f: max(0.0, f.get_slot('max_weekly_hours') - f.get_slot('current_workload')))
        
        # Procedural Attachment (if-needed): dynamic fatigue index
        self.attach_daemon('if-needed', 'fatigue_index', lambda f: min(1.0, f.get_slot('current_workload') / max(1.0, f.get_slot('max_weekly_hours'))))

        # Procedural Attachment (if-added): when assigned_shifts updated, recompute workload
        def on_shift_added(f, shifts_list):
            total_hours = sum(s.get('duration_hours', 8.0) for s in shifts_list)
            f.slots['current_workload']['value'] = total_hours

        self.attach_daemon('if-added', 'assigned_shifts', on_shift_added)


class ShiftFrame(Frame):
    def __init__(self, shift_data):
        super().__init__(name=f"Shift_{shift_data['id']}", parent=None)
        
        self.add_slot('id', shift_data['id'])
        self.add_slot('code', shift_data.get('shift_code'))
        self.add_slot('name', shift_data.get('name'))
        self.add_slot('shift_type', shift_data.get('shift_type'))
        self.add_slot('department', shift_data.get('department'))
        self.add_slot('date', shift_data.get('date'))
        self.add_slot('duration_hours', shift_data.get('duration_hours', 8.0))
        self.add_slot('required_skill_id', shift_data.get('required_skill_id'))
        self.add_slot('min_proficiency', shift_data.get('min_proficiency', 5))
        self.add_slot('difficulty_score', shift_data.get('difficulty_score', 5.0))
        self.add_slot('required_headcount', shift_data.get('required_headcount', 1))
        self.add_slot('assigned_employees', [])
        self.add_slot('backup_employees', [])

        # Procedural Attachment: coverage status
        self.attach_daemon('if-needed', 'is_fully_covered',
                           lambda f: len(f.get_slot('assigned_employees')) >= f.get_slot('required_headcount'))
