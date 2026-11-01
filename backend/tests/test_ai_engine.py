"""
Automated Unit Tests for Workforce Scheduling Optimization System
Validates all 8 Phase 7 test cases specified in the PBL report:
1. Employee on leave must be rejected.
2. Skill mismatch must be rejected.
3. Maximum working hours must be respected.
4. Fuzzy example: skill 7, workload 24 -> approximately 66.7.
5. Certainty factor example -> approximately 0.81.
6. Bayes absence example -> approximately 0.182.
7. Workload must be fairly distributed.
8. Generated schedules must have no invalid assignments.
"""

import sys
import os
import unittest
import json

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from seed_data import seed_database
import ai.statistics as stats

class TestWorkforceAI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = app.test_client()

    def test_fuzzy_logic_example(self):
        """Fuzzy example: skill 7, workload 24 -> approximately 66.7"""
        score = stats.calculate_fuzzy_suitability(7, 24)
        self.assertAlmostEqual(score, 66.7, delta=0.2)
        print(f"\n[PASS] Fuzzy Logic: Skill=7, Workload=24 -> {score} (Expected: ~66.7)")

    def test_certainty_factor_example(self):
        """Certainty factor example -> approximately 0.81"""
        cf_comb = stats.combine_certainty_factors(0.75, 0.25)
        cf_rule = stats.evaluate_rule_cf(0.90, 0.90)
        self.assertTrue(abs(cf_comb - 0.81) <= 0.02 or abs(cf_rule - 0.81) <= 0.01)
        print(f"[PASS] Certainty Factor: CF_comb={cf_comb}, CF_rule={cf_rule} (Expected: ~0.81)")

    def test_bayes_absence_example(self):
        """Bayes absence example -> approximately 0.182"""
        bayes_prob = stats.calculate_bayes_absence_probability(0.10, 0.80, 0.40)
        self.assertAlmostEqual(bayes_prob, 0.182, delta=0.005)
        print(f"[PASS] Bayes Absence: P(A|E) = {bayes_prob} (Expected: ~0.182)")

    def test_automated_suite_endpoint(self):
        """Tests the full API test suite endpoint which runs all 8 cases"""
        response = self.client.get('/api/tests/run')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['all_passed'])
        self.assertEqual(data['passed_count'], 8)
        print(f"[PASS] Full Automated Suite: {data['passed_count']}/{data['total_tests']} tests passed successfully!")

if __name__ == '__main__':
    unittest.main()
