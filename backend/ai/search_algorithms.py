"""
Search Algorithms for Workforce Scheduling
Workforce Scheduling Optimization System
Implements:
1. Breadth-First Search (BFS) - Level-by-level assignment exploration
2. Depth-First Search (DFS) with Backtracking - Complete path search
3. Greedy Best-First Search - Prioritizes difficult shifts with fewest eligible employees
"""

from collections import deque
import copy

class SearchScheduler:
    def __init__(self, csp_engine, statistical_engine, expert_system):
        self.csp = csp_engine
        self.stats = statistical_engine
        self.expert = expert_system

    def score_candidate(self, employee, shift):
        """
        Calculates heuristic score combining:
        - Fuzzy suitability score (skill + workload)
        - Certainty factor (MYCIN)
        - Absence risk (Bayes)
        - Reliability (Dempster-Shafer)
        - Expert system recommendations
        """
        e_id = employee['id']
        req_skill_id = shift['required_skill_id']
        prof = employee.get('skills', {}).get(req_skill_id, 5)
        workload = self.csp.employee_workloads.get(e_id, 0.0)
        
        # 1. Fuzzy Suitability (0 - 100)
        fuzzy_suitability = self.stats.calculate_fuzzy_suitability(prof, workload)
        
        # 2. Dempster-Shafer Reliability
        att_rate = employee.get('attendance_rate', 0.95)
        mgr_rate = employee.get('manager_rating', 0.90)
        bel, pl, rel_pct = self.stats.combine_dempster_shafer(att_rate, mgr_rate)
        
        # 3. Bayes Absence Risk
        fatigue = min(1.0, workload / max(1.0, employee.get('max_weekly_hours', 40.0)))
        absence_risk = self.stats.estimate_employee_absence_risk(
            att_rate, fatigue,
            has_recent_absence=False,
            is_weekend_or_monday=(shift['shift_type'] == 'NIGHT')
        )
        
        # 4. Certainty Factor
        cf = self.stats.compute_assignment_certainty_factor(prof, employee.get('experience_years', 1.0), rel_pct)
        
        # 5. Expert System Forward Chaining
        expert_context = {
            'fuzzy_score': fuzzy_suitability,
            'experience_years': employee.get('experience_years', 1.0),
            'difficulty_score': shift.get('difficulty_score', 5.0),
            'reliability_pct': rel_pct,
            'current_workload': workload,
            'max_weekly_hours': employee.get('max_weekly_hours', 40.0),
            'proficiency': prof,
            'min_proficiency': shift.get('min_proficiency', 5)
        }
        expert_eval = self.expert.evaluate_candidate(expert_context)
        
        # Combined Heuristic Score for Best-First Search
        # Higher fuzzy suitability, higher CF, higher reliability, lower absence risk
        heuristic_score = (expert_eval['expert_score'] * cf * (rel_pct / 100.0)) / (1.0 + absence_risk)
        
        return {
            'heuristic_score': round(heuristic_score, 2),
            'fuzzy_suitability': fuzzy_suitability,
            'certainty_factor': cf,
            'absence_risk': absence_risk,
            'reliability_pct': rel_pct,
            'dempster_belief': bel,
            'dempster_plausibility': pl,
            'expert_eval': expert_eval
        }

    # -------------------------------------------------------------
    # 1. GREEDY BEST-FIRST SEARCH (PRIMARY ALGORITHM)
    # -------------------------------------------------------------
    def solve_greedy_best_first(self, target_shifts, assign_backups=True):
        """
        Greedy Best-First Search:
        1. Prioritize shifts by domain constrainedness (MRV - Minimum Remaining Values)
           and shift difficulty score (hardest shifts first).
        2. For each shift, select candidates with highest heuristic score.
        3. Assign primary workers, and if high risk, select best backup.
        """
        results = {
            'assigned': [],       # list of assignments
            'unassigned_shifts': [],
            'audit_log': [],
            'stats': {'total_shifts': len(target_shifts), 'covered_shifts': 0}
        }
        
        # Evaluate eligible domain size for each shift
        shift_domains = []
        for s in target_shifts:
            eligible, ineligible = self.csp.get_eligible_candidates(s)
            diff = s.get('difficulty_score', 5.0)
            # Constrainedness metric: lower domain size = more constrained (harder)
            constrainedness = len(eligible) - (diff * 0.5)
            shift_domains.append((constrainedness, s, eligible, ineligible))
            
        # Sort shifts: most constrained & highest difficulty first
        shift_domains.sort(key=lambda item: item[0])

        for _, shift, eligible, ineligible in shift_domains:
            headcount_needed = shift.get('required_headcount', 1)
            
            # Re-evaluate eligibility with current dynamic workload
            curr_eligible, curr_ineligible = self.csp.get_eligible_candidates(shift)
            
            scored_candidates = []
            for e_id, satisfactions in curr_eligible:
                emp = self.csp.employees[e_id]
                score_data = self.score_candidate(emp, shift)
                scored_candidates.append((e_id, emp, satisfactions, score_data))

            # Sort candidate employees: best heuristic score first
            scored_candidates.sort(key=lambda c: c[3]['heuristic_score'], reverse=True)

            assigned_for_shift = []
            assigned_count = 0

            for e_id, emp, satisfactions, score_data in scored_candidates:
                if assigned_count < headcount_needed:
                    # Assign Primary
                    self.csp.assign_shift(shift['id'], e_id)
                    assigned_count += 1
                    
                    explanation_text = (
                        f"Assigned via Greedy Best-First Search. "
                        f"Fuzzy Suitability: {score_data['fuzzy_suitability']}, "
                        f"Certainty Factor: {score_data['certainty_factor']}, "
                        f"Reliability: {score_data['reliability_pct']}%, "
                        f"Absence Risk: {score_data['absence_risk']}. "
                        f"Recommendation: {score_data['expert_eval']['recommendation']}."
                    )
                    
                    assignment_record = {
                        'shift_id': shift['id'],
                        'shift_code': shift['shift_code'],
                        'shift_name': shift['name'],
                        'department': shift['department'],
                        'shift_type': shift['shift_type'],
                        'date': shift['date'],
                        'employee_id': e_id,
                        'employee_code': emp['employee_code'],
                        'employee_name': emp['name'],
                        'is_backup': 0,
                        'suitability_score': score_data['fuzzy_suitability'],
                        'certainty_factor': score_data['certainty_factor'],
                        'absence_risk': score_data['absence_risk'],
                        'reliability_score': score_data['reliability_pct'],
                        'algorithm_used': 'Greedy Best-First Search',
                        'explanation': explanation_text,
                        'satisfaction_details': satisfactions,
                        'expert_details': score_data['expert_eval']
                    }
                    results['assigned'].append(assignment_record)
                    assigned_for_shift.append(assignment_record)

            # Check if high risk shift needs a backup worker
            # High risk: absence_risk > 0.15 or shift difficulty >= 7.5
            needs_backup = assign_backups and any(a['absence_risk'] > 0.15 for a in assigned_for_shift)
            if needs_backup and len(scored_candidates) > assigned_count:
                # Select the next best candidate as backup
                backup_candidate = scored_candidates[assigned_count]
                b_eid, b_emp, b_sats, b_score = backup_candidate
                
                b_record = {
                    'shift_id': shift['id'],
                    'shift_code': shift['shift_code'],
                    'shift_name': shift['name'],
                    'department': shift['department'],
                    'shift_type': shift['shift_type'],
                    'date': shift['date'],
                    'employee_id': b_eid,
                    'employee_code': b_emp['employee_code'],
                    'employee_name': b_emp['name'],
                    'is_backup': 1,
                    'suitability_score': b_score['fuzzy_suitability'],
                    'certainty_factor': b_score['certainty_factor'],
                    'absence_risk': b_score['absence_risk'],
                    'reliability_score': b_score['reliability_pct'],
                    'algorithm_used': 'Greedy Best-First (Backup Selection)',
                    'explanation': f"Designated as Backup for high-risk shift. Ready on standby if primary worker is absent.",
                    'satisfaction_details': b_sats,
                    'expert_details': b_score['expert_eval']
                }
                results['assigned'].append(b_record)

            if assigned_count >= headcount_needed:
                results['stats']['covered_shifts'] += 1
            else:
                results['unassigned_shifts'].append({
                    'shift': shift,
                    'needed': headcount_needed,
                    'assigned': assigned_count,
                    'rejection_reasons': [f"Emp {e[0]}: {', '.join(e[1])}" for e in curr_ineligible]
                })

        return results

    # -------------------------------------------------------------
    # 2. BREADTH-FIRST SEARCH (BFS)
    # -------------------------------------------------------------
    def solve_bfs(self, target_shifts, max_solutions=1):
        """
        Breadth-First Search: Explores level by level across shifts.
        State: (shift_index, current_assignments_list)
        """
        if not target_shifts:
            return {'assigned': [], 'stats': {'total_shifts': 0, 'covered_shifts': 0}}
            
        queue = deque([ (0, []) ])
        best_assignment = []
        
        while queue:
            idx, current_asgns = queue.popleft()
            
            if idx == len(target_shifts):
                best_assignment = current_asgns
                break # Found complete coverage assignment path
                
            shift = target_shifts[idx]
            
            # Temporarily simulate state
            temp_csp = copy.deepcopy(self.csp)
            for asgn in current_asgns:
                temp_csp.assign_shift(asgn['shift_id'], asgn['employee_id'])
                
            eligible, _ = temp_csp.get_eligible_candidates(shift)
            
            # Rank candidates
            scored = []
            for e_id, sats in eligible:
                emp = self.csp.employees[e_id]
                score = self.score_candidate(emp, shift)
                scored.append((e_id, emp, sats, score))
            scored.sort(key=lambda x: x[3]['heuristic_score'], reverse=True)
            
            for e_id, emp, sats, score in scored[:3]: # Branch top 3 to keep queue bounded
                new_asgn = {
                    'shift_id': shift['id'],
                    'shift_code': shift['shift_code'],
                    'shift_name': shift['name'],
                    'department': shift['department'],
                    'shift_type': shift['shift_type'],
                    'date': shift['date'],
                    'employee_id': e_id,
                    'employee_code': emp['employee_code'],
                    'employee_name': emp['name'],
                    'is_backup': 0,
                    'suitability_score': score['fuzzy_suitability'],
                    'certainty_factor': score['certainty_factor'],
                    'absence_risk': score['absence_risk'],
                    'reliability_score': score['reliability_pct'],
                    'algorithm_used': 'Breadth-First Search (BFS)',
                    'explanation': f"Level {idx+1} explored via BFS queue.",
                    'satisfaction_details': sats,
                    'expert_details': score['expert_eval']
                }
                queue.append((idx + 1, current_asgns + [new_asgn]))
                
        # Apply best found
        for a in best_assignment:
            self.csp.assign_shift(a['shift_id'], a['employee_id'])
            
        return {
            'assigned': best_assignment,
            'stats': {'total_shifts': len(target_shifts), 'covered_shifts': len(best_assignment)}
        }

    # -------------------------------------------------------------
    # 3. DEPTH-FIRST SEARCH WITH BACKTRACKING (DFS)
    # -------------------------------------------------------------
    def solve_dfs(self, target_shifts):
        """
        DFS with Backtracking:
        Explores assignment path deeply, backtracking when CSP constraints are violated.
        """
        assigned = []
        
        def backtrack(shift_idx):
            if shift_idx == len(target_shifts):
                return True
                
            shift = target_shifts[shift_idx]
            eligible, _ = self.csp.get_eligible_candidates(shift)
            
            scored = []
            for e_id, sats in eligible:
                emp = self.csp.employees[e_id]
                score = self.score_candidate(emp, shift)
                scored.append((e_id, emp, sats, score))
            scored.sort(key=lambda x: x[3]['heuristic_score'], reverse=True)
            
            for e_id, emp, sats, score in scored:
                # Forward step
                self.csp.assign_shift(shift['id'], e_id)
                record = {
                    'shift_id': shift['id'],
                    'shift_code': shift['shift_code'],
                    'shift_name': shift['name'],
                    'department': shift['department'],
                    'shift_type': shift['shift_type'],
                    'date': shift['date'],
                    'employee_id': e_id,
                    'employee_code': emp['employee_code'],
                    'employee_name': emp['name'],
                    'is_backup': 0,
                    'suitability_score': score['fuzzy_suitability'],
                    'certainty_factor': score['certainty_factor'],
                    'absence_risk': score['absence_risk'],
                    'reliability_score': score['reliability_pct'],
                    'algorithm_used': 'Depth-First Search (DFS with Backtracking)',
                    'explanation': f"Assigned via DFS at depth {shift_idx+1}.",
                    'satisfaction_details': sats,
                    'expert_details': score['expert_eval']
                }
                assigned.append(record)
                
                if backtrack(shift_idx + 1):
                    return True
                    
                # Backtrack step
                assigned.pop()
                self.csp.unassign_shift(shift['id'], e_id)
                
            return False

        backtrack(0)
        return {
            'assigned': assigned,
            'stats': {'total_shifts': len(target_shifts), 'covered_shifts': len(assigned)}
        }
