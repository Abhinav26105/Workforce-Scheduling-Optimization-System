"""
Rule-Based Expert System for Workforce Scheduling
Workforce Scheduling Optimization System
Features:
- Forward-chaining inference engine
- Domain-specific production rules (Hospital, Retail, Call Centre, Factory)
- Explanation Generation facility for management decisions
"""

class ExpertRule:
    def __init__(self, rule_id, name, description, priority=1):
        self.rule_id = rule_id
        self.name = name
        self.description = description
        self.priority = priority

    def evaluate(self, context):
        """Returns (applies: bool, score_delta: float, explanation: str)"""
        raise NotImplementedError


class SeniorityRule(ExpertRule):
    def __init__(self):
        super().__init__('R1_SENIORITY', 'High Difficulty Seniority Match',
                         'Assign senior employees (>= 5 yrs) to difficult shifts (>= 7/10)', priority=2)

    def evaluate(self, context):
        exp = context.get('experience_years', 0)
        diff = context.get('difficulty_score', 5)
        if diff >= 7.0:
            if exp >= 5.0:
                return True, 15.0, f"Senior employee ({exp} yrs) strongly recommended for high-difficulty shift ({diff}/10)"
            elif exp < 2.0:
                return True, -12.0, f"Caution: Junior employee ({exp} yrs) assigned to challenging shift ({diff}/10)"
        return False, 0.0, ""


class ReliabilityRule(ExpertRule):
    def __init__(self):
        super().__init__('R2_RELIABILITY', 'High Reliability Preference',
                         'Favor candidates with high Dempster-Shafer reliability belief', priority=1)

    def evaluate(self, context):
        rel = context.get('reliability_pct', 80.0)
        if rel >= 90.0:
            return True, 10.0, f"High historical reliability ({rel}%) increases confidence"
        elif rel < 70.0:
            return True, -15.0, f"Lower reliability rating ({rel}%) warrants backup assignment"
        return False, 0.0, ""


class WorkloadBalanceRule(ExpertRule):
    def __init__(self):
        super().__init__('R3_WORKLOAD', 'Fatigue & Workload Fair Distribution',
                         'Penalize assigning heavily loaded workers to balance schedule', priority=3)

    def evaluate(self, context):
        workload = context.get('current_workload', 0)
        max_h = context.get('max_weekly_hours', 40)
        ratio = workload / max_h if max_h > 0 else 0
        if ratio >= 0.75:
            return True, -15.0, f"Approaching weekly hour limit ({workload}h / {max_h}h). Consider less loaded peers."
        elif ratio <= 0.35:
            return True, 10.0, f"Fairness bonus: employee has low current workload ({workload}h / {max_h}h)"
        return False, 0.0, ""


class SkillExpertiseRule(ExpertRule):
    def __init__(self):
        super().__init__('R4_EXPERT_SKILL', 'Skill Excellence Bonus',
                         'Reward skill proficiencies well above the minimum threshold', priority=2)

    def evaluate(self, context):
        prof = context.get('proficiency', 5)
        req = context.get('min_proficiency', 5)
        delta = prof - req
        if delta >= 3:
            return True, 12.0, f"Superior domain skill ({prof}/10 vs {req}/10 required)"
        elif delta == 0:
            return True, 0.0, f"Meets baseline skill threshold ({prof}/10)"
        return False, 0.0, ""


class SchedulingExpertSystem:
    def __init__(self):
        self.rules = [
            SeniorityRule(),
            ReliabilityRule(),
            WorkloadBalanceRule(),
            SkillExpertiseRule()
        ]
        # Sort by priority
        self.rules.sort(key=lambda r: r.priority, reverse=True)

    def evaluate_candidate(self, context):
        """
        Runs forward chaining on all rules.
        Returns:
          total_bonus: float
          fired_rules: list of dicts with explanation
          recommendation: 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'ACCEPTABLE' | 'NEEDS_BACKUP'
        """
        total_delta = 0.0
        fired_rules = []
        
        for rule in self.rules:
            applies, delta, explanation = rule.evaluate(context)
            if applies:
                total_delta += delta
                fired_rules.append({
                    'rule_id': rule.rule_id,
                    'rule_name': rule.name,
                    'delta': delta,
                    'explanation': explanation
                })

        base_score = context.get('fuzzy_score', 50.0)
        final_score = max(0.0, min(100.0, base_score + total_delta))

        if final_score >= 80.0:
            rec = "STRONGLY_RECOMMENDED"
        elif final_score >= 60.0:
            rec = "RECOMMENDED"
        elif final_score >= 40.0:
            rec = "ACCEPTABLE"
        else:
            rec = "NEEDS_BACKUP"

        return {
            'expert_score': round(final_score, 1),
            'rule_delta': round(total_delta, 1),
            'fired_rules': fired_rules,
            'recommendation': rec
        }
