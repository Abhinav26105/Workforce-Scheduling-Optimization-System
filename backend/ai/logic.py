"""
Propositional Logic Engine for Workforce Scheduling
Formal verification of scheduling rules using propositional propositions.

Propositions:
P1: HasSkill(E, S)           - Employee possesses the required skill at sufficient proficiency
P2: ~OnLeave(E, Date(S))     - Employee is NOT on leave on the shift date
P3: Available(E, S)          - Employee is marked available for shift day & type
P4: WithinHoursLimit(E, S)   - Total assigned hours + shift duration <= MaxWeeklyHours
P5: ~Overlaps(E, S)          - Employee has no other shift assigned on the same day
P6: ~RestViolation(E, S)     - Employee is not scheduled morning after a night shift

Assignment Rule:
Valid(E, S) <==> P1 ^ P2 ^ P3 ^ P4 ^ P5 ^ P6
"""

class PropositionalRuleVerifier:
    def __init__(self):
        self.propositions = {
            'P1': 'HasRequiredSkill',
            'P2': 'NotOnLeave',
            'P3': 'AvailableForShift',
            'P4': 'WithinHoursLimit',
            'P5': 'NoSameDayOverlap',
            'P6': 'NoRestPeriodViolation'
        }

    def verify_assignment(self, csp_instance, employee_id, shift):
        """
        Evaluates the truth value of each proposition for (employee, shift).
        Returns:
            is_valid: bool
            truth_assignment: dict of { 'P1': bool, ... }
            logic_string: formatted boolean proposition string
            explanation: detailed breakdown
        """
        employee = csp_instance.employees.get(employee_id)
        if not employee:
            return False, {}, "False", "Employee does not exist"

        # P1: HasSkill
        p1, _ = csp_instance.has_required_skill(
            employee, shift['required_skill_id'], shift.get('min_proficiency', 5)
        )

        # P2: NotOnLeave (~OnLeave)
        on_leave, _ = csp_instance.is_on_leave(employee_id, shift['date'])
        p2 = not on_leave

        # P3: Available
        p3, _ = csp_instance.is_available(employee_id, shift['date'], shift['shift_type'])

        # P4: WithinHoursLimit
        exceeds, _ = csp_instance.exceeds_max_hours(employee, shift.get('duration_hours', 8.0))
        p4 = not exceeds

        # P5 & P6: NoOverlap and NoRestViolation
        conflict, conflict_reason = csp_instance.has_shift_conflict(employee_id, shift)
        if conflict:
            if "Rest period" in conflict_reason:
                p5 = True
                p6 = False
            else:
                p5 = False
                p6 = True
        else:
            p5 = True
            p6 = True

        truth_assignment = {
            'P1_Skill': p1,
            'P2_NotOnLeave': p2,
            'P3_Available': p3,
            'P4_WithinHours': p4,
            'P5_NoOverlap': p5,
            'P6_RestOk': p6
        }

        is_valid = p1 and p2 and p3 and p4 and p5 and p6

        # Build readable boolean logic representation
        clauses = [f"{k}={v}" for k, v in truth_assignment.items()]
        logic_str = f"P1 ∧ P2 ∧ P3 ∧ P4 ∧ P5 ∧ P6 = {is_valid}"

        failed_clauses = [k for k, v in truth_assignment.items() if not v]
        if is_valid:
            explanation = "All propositional clauses evaluated to TRUE. Valid logical assignment."
        else:
            explanation = f"Propositional clauses FAILED: {', '.join(failed_clauses)}"

        return is_valid, truth_assignment, logic_str, explanation
