"""
Statistical and Probabilistic Reasoning Module
Workforce Scheduling Optimization System
Implements:
1. Bayes' Theorem for absence probability
2. Certainty Factors (MYCIN theory)
3. Fuzzy Logic for employee suitability score (0-100)
4. Bayesian Network for risk propagation (Leave -> Absence <- Fatigue -> Shift Uncovered)
5. Dempster-Shafer Theory for multi-source reliability estimation
"""

import math

# -------------------------------------------------------------
# 1. BAYES' THEOREM
# -------------------------------------------------------------
def calculate_bayes_absence_probability(
    prior_absence=0.10,
    prob_evidence_given_absence=0.80,
    prob_evidence_given_presence=0.40
):
    """
    Calculates P(Absence | Evidence) using Bayes' Theorem:
    P(A|E) = [P(E|A) * P(A)] / P(E)
    where P(E) = P(E|A)*P(A) + P(E|~A)*P(~A)

    PBL Test Case:
    prior_absence = 0.10
    prob_evidence_given_absence = 0.80
    prob_evidence_given_presence = 0.40
    P(E) = 0.80 * 0.10 + 0.40 * 0.90 = 0.08 + 0.36 = 0.44
    P(Absence | E) = 0.08 / 0.44 = 2/11 = 0.1818... ≈ 0.182
    """
    prior_not_absence = 1.0 - prior_absence
    
    # Total probability of evidence P(E)
    prob_evidence = (prob_evidence_given_absence * prior_absence) + (prob_evidence_given_presence * prior_not_absence)
    
    if prob_evidence == 0:
        return 0.0
        
    posterior = (prob_evidence_given_absence * prior_absence) / prob_evidence
    return round(posterior, 4)


def estimate_employee_absence_risk(employee_attendance_rate, fatigue_index, has_recent_absence=False, is_weekend_or_monday=False):
    """
    Dynamically estimates absence probability for an employee based on their metrics.
    """
    # Prior absence is based on historical absence rate (1 - attendance_rate)
    prior = max(0.02, min(0.35, 1.0 - employee_attendance_rate))
    
    # Likelihood based on fatigue and temporal evidence
    # High fatigue/Monday elevates P(E|A)
    p_e_given_a = 0.65
    p_e_given_not_a = 0.35
    
    if fatigue_index > 0.5:
        p_e_given_a += 0.15
        p_e_given_not_a += 0.05
    if has_recent_absence or is_weekend_or_monday:
        p_e_given_a += 0.10
        p_e_given_not_a += 0.05
        
    p_e_given_a = min(0.95, p_e_given_a)
    p_e_given_not_a = min(0.90, p_e_given_not_a)
    
    return calculate_bayes_absence_probability(prior, p_e_given_a, p_e_given_not_a)


# -------------------------------------------------------------
# 2. CERTAINTY FACTORS (MYCIN THEORY)
# -------------------------------------------------------------
def evaluate_rule_cf(premise_cf, rule_cf):
    """
    Evaluates rule certainty factor: CF(H, E) = CF(E) * CF_rule
    Example: Premise certainty = 0.90, Rule confidence = 0.90 -> 0.81
    """
    return round(premise_cf * rule_cf, 4)


def combine_certainty_factors(cf1, cf2):
    """
    Combines two independent Certainty Factors (MYCIN formula):
    If both positive:  CF = CF1 + CF2 * (1 - CF1)
    If both negative:  CF = CF1 + CF2 * (1 + CF1)
    If opposite signs: CF = (CF1 + CF2) / (1 - min(|CF1|, |CF2|))
    
    PBL Test Case:
    CF1 = 0.75, CF2 = 0.25 -> 0.75 + 0.25 * (1 - 0.75) = 0.75 + 0.0625 = 0.8125 ≈ 0.81
    Or Rule CF: premise 0.90 * rule 0.90 = 0.81
    """
    if cf1 >= 0 and cf2 >= 0:
        comb = cf1 + cf2 * (1.0 - cf1)
    elif cf1 < 0 and cf2 < 0:
        comb = cf1 + cf2 * (1.0 + cf1)
    else:
        denom = 1.0 - min(abs(cf1), abs(cf2))
        comb = (cf1 + cf2) / denom if denom != 0 else 0.0
        
    return round(comb, 4)


def compute_assignment_certainty_factor(skill_score, experience_years, reliability_score):
    """
    Combines multiple domain rules to obtain overall scheduling certainty factor:
    Rule 1 (Skill Match): IF skill match >= 7 THEN CF1
    Rule 2 (Experience): IF experience >= 3 yrs THEN CF2
    Rule 3 (Reliability): IF reliability >= 80% THEN CF3
    """
    # Rule 1 CF: Skill competence
    cf_skill = max(0.1, min(0.95, (skill_score / 10.0) * 0.85))
    
    # Rule 2 CF: Experience certainty
    cf_exp = 0.60 if experience_years >= 3.0 else 0.35
    
    # Combine skill and experience
    cf_inter = combine_certainty_factors(cf_skill, cf_exp)
    
    # Rule 3 CF: High reliability confirmation
    cf_rel = (reliability_score / 100.0) * 0.40
    final_cf = combine_certainty_factors(cf_inter, cf_rel)
    
    return min(0.99, max(0.01, round(final_cf, 3)))


# -------------------------------------------------------------
# 3. FUZZY LOGIC SUITABILITY ENGINE
# -------------------------------------------------------------
def triangular_membership(x, a, b, c):
    """
    Calculates triangular fuzzy membership degree for input x in [a, b, c].
    """
    if x <= a or x >= c:
        return 0.0
    if a < x <= b:
        return (x - a) / (b - a) if b > a else 1.0
    if b < x < c:
        return (c - x) / (c - b) if c > b else 1.0
    return 0.0


def trapezoidal_membership(x, a, b, c, d):
    """
    Calculates trapezoidal fuzzy membership degree.
    """
    if x <= a or x >= d:
        return 0.0
    if a < x < b:
        return (x - a) / (b - a) if b > a else 1.0
    if b <= x <= c:
        return 1.0
    if c < x < d:
        return (d - x) / (d - c) if d > c else 1.0
    return 0.0


def calculate_fuzzy_suitability(skill_level, weekly_workload):
    """
    Calculates fuzzy suitability score (0 - 100) using Skill Match (1-10) and Weekly Workload (0-40h).
    
    Membership Functions:
    Skill:
      - Low:    Trapezoid [0, 0, 2, 4]
      - Medium: Triangle  [2, 5, 8]
      - High:   Triangle  [5, 8, 10]
      
    Workload:
      - Light:    Trapezoid [0, 0, 10, 18]
      - Moderate: Triangle  [10, 25, 38]
      - Heavy:    Trapezoid [28, 36, 40, 50]
      
    At Skill = 7, Workload = 24:
      - Skill Medium: (8 - 7)/(8 - 5) = 1/3
      - Skill High:   (7 - 5)/(8 - 5) = 2/3
      - Workload Moderate: (24 - 10)/(25 - 10) = 14/15 ≈ 0.933
      
    Sugeno Output Rules:
      Rule 1: IF Skill is High AND Workload is Moderate THEN Suitability is 75
      Rule 2: IF Skill is Medium AND Workload is Moderate THEN Suitability is 50
      
    Firing Strengths:
      w1 = min(Skill High [2/3], Workload Moderate [14/15]) = 2/3
      w2 = min(Skill Medium [1/3], Workload Moderate [14/15]) = 1/3
      
    Defuzzification (Weighted Average):
      Score = (w1 * 75 + w2 * 50) / (w1 + w2)
            = ((2/3 * 75) + (1/3 * 50)) / 1.0
            = (50 + 16.6667) = 66.6667 ≈ 66.7!
      Exactly matches PBL Report test requirement!
    """
    # Bound inputs
    skill = max(0.0, min(10.0, float(skill_level)))
    workload = max(0.0, min(40.0, float(weekly_workload)))
    
    # Skill Memberships
    mu_skill_low = trapezoidal_membership(skill, -1.0, 0.0, 2.0, 4.0)
    mu_skill_med = triangular_membership(skill, 2.0, 5.0, 8.0)
    mu_skill_high = triangular_membership(skill, 5.0, 8.0, 10.0) if skill < 10.0 else 1.0
    
    # Workload Memberships
    mu_workload_light = trapezoidal_membership(workload, -1.0, 0.0, 10.0, 18.0)
    mu_workload_mod = triangular_membership(workload, 10.0, 25.0, 38.0)
    mu_workload_heavy = trapezoidal_membership(workload, 28.0, 36.0, 40.0, 50.0)
    
    # Rule Base & Consequent Singletons (Sugeno)
    # 1. High Skill + Light Workload -> 90
    # 2. High Skill + Moderate Workload -> 75
    # 3. High Skill + Heavy Workload -> 55
    # 4. Med Skill + Light Workload -> 70
    # 5. Med Skill + Moderate Workload -> 50
    # 6. Med Skill + Heavy Workload -> 35
    # 7. Low Skill + Light Workload -> 45
    # 8. Low Skill + Moderate Workload -> 30
    # 9. Low Skill + Heavy Workload -> 15
    
    rules = [
        (min(mu_skill_high, mu_workload_light), 90.0),
        (min(mu_skill_high, mu_workload_mod), 75.0),
        (min(mu_skill_high, mu_workload_heavy), 55.0),
        (min(mu_skill_med, mu_workload_light), 70.0),
        (min(mu_skill_med, mu_workload_mod), 50.0),
        (min(mu_skill_med, mu_workload_heavy), 35.0),
        (min(mu_skill_low, mu_workload_light), 45.0),
        (min(mu_skill_low, mu_workload_mod), 30.0),
        (min(mu_skill_low, mu_workload_heavy), 15.0),
    ]
    
    numerator = sum(w * z for w, z in rules)
    denominator = sum(w for w, z in rules)
    
    if denominator == 0:
        return 50.0
        
    score = numerator / denominator
    return round(score, 1)


# -------------------------------------------------------------
# 4. BAYESIAN NETWORK FOR SHIFT UNCOVERED RISK
# -------------------------------------------------------------
class SchedulingBayesianNetwork:
    """
    DAG Structure:
    [LeaveRequest (L)]  -> [Absence (A)] <- [Fatigue (F)]
                                  |
                                  v
                         [ShiftUncovered (U)] <- [BackupAssigned (B)]
    """
    def __init__(self):
        # Prior Probabilities
        self.p_leave_default = 0.05
        self.p_fatigue_low = 0.15
        self.p_fatigue_high = 0.70
        
        # CPT for P(Absence = True | LeaveRequest, Fatigue)
        self.cpt_absence = {
            (True, True): 0.95,
            (True, False): 0.90,
            (False, True): 0.40,
            (False, False): 0.05
        }
        
        # CPT for P(ShiftUncovered = True | Absence, BackupAssigned)
        self.cpt_uncovered = {
            (True, True): 0.15,   # Backup steps in, low uncovered chance
            (True, False): 0.96,  # Absent and no backup -> uncovered!
            (False, True): 0.01,
            (False, False): 0.02
        }

    def infer_shift_uncovered_probability(self, has_leave_request, workload_hours, has_backup_assigned):
        """
        Calculates exact posterior probability P(ShiftUncovered = True | evidence)
        using full marginalization over latent Absence and Fatigue states.
        """
        p_l = 1.0 if has_leave_request else self.p_leave_default
        p_f = self.p_fatigue_high if workload_hours >= 32.0 else self.p_fatigue_low
        b = bool(has_backup_assigned)
        
        prob_uncovered = 0.0
        
        # Sum over all configurations of L, F, A
        for l_val in [True, False]:
            p_l_state = p_l if l_val else (1.0 - p_l)
            for f_val in [True, False]:
                p_f_state = p_f if f_val else (1.0 - p_f)
                
                # Probability of this parent state
                p_parents = p_l_state * p_f_state
                
                for a_val in [True, False]:
                    p_a_given_parents = self.cpt_absence[(l_val, f_val)] if a_val else (1.0 - self.cpt_absence[(l_val, f_val)])
                    p_u_given_ab = self.cpt_uncovered[(a_val, b)]
                    
                    prob_uncovered += p_parents * p_a_given_parents * p_u_given_ab
                    
        return round(prob_uncovered, 4)


# -------------------------------------------------------------
# 5. DEMPSTER-SHAFER THEORY OF EVIDENCE
# -------------------------------------------------------------
def combine_dempster_shafer(
    attendance_rate=0.95,  # Source 1
    manager_rating=0.90,   # Source 2
    uncertainty_s1=0.15,
    uncertainty_s2=0.20
):
    """
    Combines evidence from Attendance and Manager Ratings using Dempster's Rule.
    Frame of Discernment: Theta = {R (Reliable), ~R (Unreliable)}
    
    Mass functions:
    Source 1 (Attendance):
      m1({R})  = (1 - uncertainty_s1) * attendance_rate
      m1({~R}) = (1 - uncertainty_s1) * (1 - attendance_rate)
      m1(Theta) = uncertainty_s1
      
    Source 2 (Manager Rating):
      m2({R})  = (1 - uncertainty_s2) * manager_rating
      m2({~R}) = (1 - uncertainty_s2) * (1 - manager_rating)
      m2(Theta) = uncertainty_s2
      
    Conflict K = m1({R})*m2({~R}) + m1({~R})*m2({R})
    Combined m12({R}) = [m1({R})m2({R}) + m1({R})m2(Theta) + m1(Theta)m2({R})] / (1 - K)
    
    Returns:
      belief_reliable, plausibility_reliable, overall_reliability_pct
    """
    att = max(0.0, min(1.0, attendance_rate))
    mgr = max(0.0, min(1.0, manager_rating))
    
    # Source 1 masses
    m1_r = (1.0 - uncertainty_s1) * att
    m1_nr = (1.0 - uncertainty_s1) * (1.0 - att)
    m1_theta = uncertainty_s1
    
    # Source 2 masses
    m2_r = (1.0 - uncertainty_s2) * mgr
    m2_nr = (1.0 - uncertainty_s2) * (1.0 - mgr)
    m2_theta = uncertainty_s2
    
    # Calculate conflict K (empty set intersections)
    # {R} & {~R} = empty, {~R} & {R} = empty
    conflict_k = (m1_r * m2_nr) + (m1_nr * m2_r)
    
    if conflict_k >= 1.0:
        return 0.5, 0.5, 50.0
        
    denom = 1.0 - conflict_k
    
    # Combined masses for {R}
    m12_r = ((m1_r * m2_r) + (m1_r * m2_theta) + (m1_theta * m2_r)) / denom
    
    # Combined mass for {~R}
    m12_nr = ((m1_nr * m2_nr) + (m1_nr * m2_theta) + (m1_theta * m2_nr)) / denom
    
    # Combined mass for Theta
    m12_theta = (m1_theta * m2_theta) / denom
    
    # Belief and Plausibility
    bel_r = m12_r
    pl_r = m12_r + m12_theta
    
    reliability_pct = round(bel_r * 100.0, 1)
    
    return round(bel_r, 4), round(pl_r, 4), reliability_pct
