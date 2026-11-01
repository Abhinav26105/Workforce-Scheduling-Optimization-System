"""
Constraint Satisfaction Problem (CSP) Engine
Workforce Scheduling Optimization System
Enforces:
1. Hard Constraints:
   - Skill requirements & minimum proficiency
   - Leave requests (Approved leave on date -> Ineligible)
   - Unavailability (Day of week / Shift type preferences)
   - Maximum weekly hours limit (e.g. 40 hours max)
   - No double booking (No overlapping shifts on same date)
   - Rest period rule (Night shift -> No morning shift next day)
2. Soft Constraints:
   - Workload balance across team
   - Preferred shift types
3. Provides detailed rejection reasons and forward-checking filtering.
"""

from datetime import datetime, timedelta

class SchedulingCSP:
    def __init__(self, employees, shifts, leaves, availabilities, existing_assignments=None):
        """
        employees: list of dicts (id, employee_code, name, department, max_weekly_hours, skills: {skill_id: prof})
        shifts: list of dicts (id, shift_code, name, shift_type, department, date, start_time, end_time, duration_hours, required_skill_id, min_proficiency, required_headcount)
        leaves: list of dicts (employee_id, start_date, end_date, status)
        availabilities: list of dicts (employee_id, day_of_week, preferred_shift_type)
        existing_assignments: list of dicts (shift_id, employee_id, date, duration_hours, shift_type)
        """
        self.employees = {e['id']: e for e in employees}
        self.shifts = {s['id']: s for s in shifts}
        self.leaves = leaves
        self.availabilities = availabilities
        
        # Track weekly workload per employee
        self.employee_workloads = {e_id: 0.0 for e_id in self.employees}
        
        # Track assignments per employee: employee_id -> list of assigned shift objects
        self.employee_shifts = {e_id: [] for e_id in self.employees}
        
        if existing_assignments:
            for asgn in existing_assignments:
                e_id = asgn['employee_id']
                if e_id in self.employee_workloads:
                    self.employee_workloads[e_id] += asgn.get('duration_hours', 8.0)
                    self.employee_shifts[e_id].append(asgn)

    def is_on_leave(self, employee_id, shift_date_str):
        """Checks if employee has an approved leave on the given date (YYYY-MM-DD)."""
        shift_date = datetime.strptime(shift_date_str, '%Y-%m-%d').date()
        for leave in self.leaves:
            if leave['employee_id'] == employee_id and leave.get('status', 'APPROVED') == 'APPROVED':
                s_date = datetime.strptime(leave['start_date'], '%Y-%m-%d').date()
                e_date = datetime.strptime(leave['end_date'], '%Y-%m-%d').date()
                if s_date <= shift_date <= e_date:
                    return True, f"Employee is on approved leave from {leave['start_date']} to {leave['end_date']}"
        return False, None

    def is_available(self, employee_id, shift_date_str, shift_type):
        """Checks employee availability preferences for day of week."""
        shift_date = datetime.strptime(shift_date_str, '%Y-%m-%d').date()
        dow = shift_date.weekday() # 0 = Monday, 6 = Sunday
        
        for avail in self.availabilities:
            if avail['employee_id'] == employee_id and avail['day_of_week'] == dow:
                pref = avail.get('preferred_shift_type', 'ANY')
                if pref == 'UNAVAILABLE':
                    return False, f"Employee marked unavailable on {shift_date.strftime('%A')}"
                if pref != 'ANY' and pref != shift_type:
                    return False, f"Employee prefers {pref} shift on {shift_date.strftime('%A')}, but shift is {shift_type}"
        return True, None

    def has_required_skill(self, employee, required_skill_id, min_proficiency):
        """Checks if employee has the required skill at or above minimum proficiency."""
        skills = employee.get('skills', {}) # dict of skill_id -> proficiency
        if required_skill_id not in skills:
            return False, f"Missing required skill (ID: {required_skill_id})"
        prof = skills[required_skill_id]
        if prof < min_proficiency:
            return False, f"Skill proficiency ({prof}/10) is below required minimum ({min_proficiency}/10)"
        return True, None

    def exceeds_max_hours(self, employee, additional_hours):
        """Checks if adding shift duration would exceed weekly hour limit."""
        e_id = employee['id']
        current_hrs = self.employee_workloads.get(e_id, 0.0)
        max_hrs = employee.get('max_weekly_hours', 40.0)
        if current_hrs + additional_hours > max_hrs:
            return True, f"Workload limit exceeded: current {current_hrs}h + {additional_hours}h > max {max_hrs}h"
        return False, None

    def has_shift_conflict(self, employee_id, shift):
        """Checks for overlapping shifts on the same day or rest-period violation."""
        assigned = self.employee_shifts.get(employee_id, [])
        shift_date = datetime.strptime(shift['date'], '%Y-%m-%d').date()
        
        for prev in assigned:
            prev_date = datetime.strptime(prev['date'], '%Y-%m-%d').date()
            
            # Same day assignment conflict (1 shift per employee per day standard constraint)
            if prev_date == shift_date:
                return True, f"Already assigned to shift '{prev.get('name', 'Shift')}' on {shift['date']}"
                
            # Night to Morning next-day rest constraint
            if prev.get('shift_type') == 'NIGHT' and shift['shift_type'] == 'MORNING':
                if (shift_date - prev_date).days == 1:
                    return True, "Rest period violation: cannot work MORNING shift immediately following a NIGHT shift"
                    
        return False, None

    def evaluate_candidate(self, employee_id, shift):
        """
        Evaluates a candidate employee against all CSP constraints.
        Returns: (is_eligible: bool, violations: list of str, satisfaction_details: dict)
        """
        employee = self.employees.get(employee_id)
        if not employee:
            return False, ["Employee not found"], {}
            
        violations = []
        satisfactions = {}
        
        # 1. Skill Constraint
        skill_ok, reason = self.has_required_skill(
            employee, shift['required_skill_id'], shift.get('min_proficiency', 5)
        )
        if not skill_ok:
            violations.append(reason)
        else:
            prof = employee.get('skills', {}).get(shift['required_skill_id'], 5)
            satisfactions['skill'] = f"Proficiency {prof}/10 meets minimum {shift.get('min_proficiency', 5)}"

        # 2. Leave Constraint
        on_leave, reason = self.is_on_leave(employee_id, shift['date'])
        if on_leave:
            violations.append(reason)
        else:
            satisfactions['leave'] = "Not on leave"

        # 3. Availability Constraint
        avail_ok, reason = self.is_available(employee_id, shift['date'], shift['shift_type'])
        if not avail_ok:
            violations.append(reason)
        else:
            satisfactions['availability'] = "Available for this shift type and day"

        # 4. Maximum Working Hours Constraint
        hrs_exceeded, reason = self.exceeds_max_hours(employee, shift.get('duration_hours', 8.0))
        if hrs_exceeded:
            violations.append(reason)
        else:
            rem = employee.get('max_weekly_hours', 40.0) - self.employee_workloads.get(employee_id, 0.0)
            satisfactions['hours'] = f"{rem}h remaining under {employee.get('max_weekly_hours', 40.0)}h cap"

        # 5. Overlap & Rest Constraint
        conflict, reason = self.has_shift_conflict(employee_id, shift)
        if conflict:
            violations.append(reason)
        else:
            satisfactions['conflict'] = "No conflicting assignments or rest period violations"

        is_eligible = len(violations) == 0
        return is_eligible, violations, satisfactions

    def get_eligible_candidates(self, shift):
        """
        Applies Forward Checking to filter candidate domain for a shift.
        Returns:
          eligible: list of (employee_id, satisfactions)
          ineligible: list of (employee_id, violations)
        """
        eligible = []
        ineligible = []
        for e_id in self.employees:
            is_ok, violations, satisfactions = self.evaluate_candidate(e_id, shift)
            if is_ok:
                eligible.append((e_id, satisfactions))
            else:
                ineligible.append((e_id, violations))
        return eligible, ineligible

    def assign_shift(self, shift_id, employee_id):
        """Updates internal CSP state with a new assignment."""
        shift = self.shifts[shift_id]
        self.employee_workloads[employee_id] += shift.get('duration_hours', 8.0)
        self.employee_shifts[employee_id].append({
            'shift_id': shift_id,
            'name': shift.get('name', 'Shift'),
            'date': shift['date'],
            'shift_type': shift['shift_type'],
            'duration_hours': shift.get('duration_hours', 8.0)
        })

    def unassign_shift(self, shift_id, employee_id):
        """Backtracking helper: removes an assignment from CSP state."""
        shift = self.shifts[shift_id]
        self.employee_workloads[employee_id] -= shift.get('duration_hours', 8.0)
        self.employee_shifts[employee_id] = [
            s for s in self.employee_shifts[employee_id] if s['shift_id'] != shift_id
        ]
