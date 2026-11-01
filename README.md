# Workforce Scheduling Optimization System

A modern, responsive, full-stack AI-based workforce scheduling web application designed for hospitals, retail stores, call centres, and manufacturing factories. Built strictly according to the AI Problem-Based Learning (PBL) specifications.

---

## 🌟 Tech Stack
- **Frontend**: React 18 + Tailwind CSS + Lucide Icons
- **Visualizations & Charts**: Recharts (Workload bar charts, Shift type pie charts)
- **Backend**: Python 3.14 Flask REST API + Flask-CORS
- **Database**: SQLite3 (Local persistence with relational foreign keys)
- **Architecture**: Clean modular architecture separating Search, Logic, Constraints, Statistical Reasoning, and Knowledge Representation

---

## 🧠 AI & Statistical Reasoning Engines

### 1. Search Algorithms (`backend/ai/search_algorithms.py`)
- **Greedy Best-First Search**: Prioritizes difficult shifts with smaller eligible candidate domains using the Minimum Remaining Values (MRV) heuristic. For each shift, sorts candidates by composite heuristic score combining fuzzy suitability, certainty factors, reliability, and absence risk.
- **Breadth-First Search (BFS)**: Systematically explores employee-shift assignment possibilities level-by-level across shifts.
- **Depth-First Search (DFS) with Backtracking**: Explores complete assignment paths deeply, backtracking upon constraint violations.

### 2. Constraint Satisfaction Problem (CSP) (`backend/ai/csp.py`)
Enforces hard and soft operational constraints with forward-checking:
- **Skill Constraint**: Employee must possess the mandatory skill at or above minimum proficiency ($Proficiency \ge MinProficiency$).
- **Leave Constraint**: Rejects employees with approved leaves on the shift date ($Date \in [StartDate, EndDate]$).
- **Availability Constraint**: Enforces day-of-week and shift-type preferences (Morning, Afternoon, Night, Unavailable).
- **Maximum Working Hours**: Rejects assignments if total assigned hours would exceed weekly cap (e.g., 40.0 hours).
- **No Overlapping Shifts**: Prohibits assigning an employee to multiple shifts on the same day.
- **Rest Period Rule**: Prohibits assigning a Morning shift immediately following an overnight Night shift.

### 3. Propositional Logic (`backend/ai/logic.py`)
Formal boolean verification for each assignment $(E, S)$:
$$\text{ValidAssignment}(E, S) \iff P_1 \land P_2 \land P_3 \land P_4 \land P_5 \land P_6$$
- $P_1$: $\text{HasRequiredSkill}(E, S)$
- $P_2$: $\neg\text{IsOnLeave}(E, \text{Date}(S))$
- $P_3$: $\text{IsAvailable}(E, \text{Time}(S))$
- $P_4$: $\text{Hours}(E) + \text{Duration}(S) \le \text{MaxHours}(E)$
- $P_5$: $\neg\text{HasSameDayShift}(E, S)$
- $P_6$: $\neg\text{RestPeriodViolation}(E, S)$

### 4. Frame-Based Knowledge Representation (`backend/ai/frames.py`)
- Object-oriented frames for `EmployeeFrame` and `ShiftFrame` with slot constraints, facet validation, and inheritance.
- **`if-needed` Daemons**: Dynamically compute remaining available hours and fatigue index.
- **`if-added` Daemons**: Automatically recalculate assigned workload when a shift is allocated.

### 5. Rule-Based Expert System (`backend/ai/expert_system.py`)
Forward-chaining inference engine applying production rules:
- `SeniorityBonus`: High-difficulty shifts ($Diff \ge 7$) matched with senior staff ($\ge 5$ yrs).
- `WorkloadBalanceRule`: Penalties for employees exceeding 75% weekly capacity to prevent burnout.
- `ReliabilityRule`: Bonus recommendation for high Dempster-Shafer reliability ratings.
- Explains decisions with transparent natural-language audit reasoning.

### 6. Statistical & Probabilistic Reasoning (`backend/ai/statistics.py`)
- **Bayes' Theorem**: Calculates posterior absence probability $P(\text{Absence}|E)$ given historical evidence:
  $$P(A|E) = \frac{P(E|A) \cdot P(A)}{P(E|A) \cdot P(A) + P(E|\neg A) \cdot P(\neg A)}$$
  *PBL Test Case: Prior $P(A)=0.10$, $P(E|A)=0.80$, $P(E|\neg A)=0.40 \implies \mathbf{0.182}$*

- **Certainty Factors (MYCIN Theory)**: Combines independent rule confidence scores:
  $$CF_{\text{comb}}(CF_1, CF_2) = CF_1 + CF_2 \cdot (1 - CF_1)$$
  *PBL Test Case: $CF_1 = 0.75, CF_2 = 0.25 \implies \mathbf{0.81}$ (or Rule CF: $0.90 \times 0.90 = \mathbf{0.81}$)*

- **Fuzzy Logic Suitability Engine**: Sugeno weighted average evaluating Skill Match (1-10) and Weekly Workload (0-40h):
  $$\text{Suitability} = \frac{\sum w_i \cdot z_i}{\sum w_i}$$
  *PBL Test Case: Skill 7, Workload 24h $\implies \mathbf{66.7}$*

- **Bayesian Network**: Models causal risk:
  $$\text{LeaveRequest} \to \text{Absence} \leftarrow \text{Fatigue} \to \text{ShiftUncovered} \leftarrow \text{BackupAssigned}$$
  Evaluates exact marginal shift-uncovered probabilities with and without standby backup workers.

- **Dempster-Shafer Theory of Evidence**: Combines multiple independent sources (Attendance history + Manager evaluations) over frame of discernment $\Theta = \{R, \neg R\}$ using Dempster's rule of combination to compute belief and plausibility intervals.

---

## 🚀 Quick Start & How to Run

### Option 1: One-Click Launch (Recommended)
Double-click `run_all.bat` in the project root. This starts:
1. Backend Flask API server on `http://127.0.0.1:5000`
2. Frontend Vite React app on `http://localhost:3000`

### Option 2: Individual Launch Scripts
- **Start Backend**: Double-click `run_backend.bat`
- **Start Frontend**: Double-click `run_frontend.bat`

### Option 3: VS Code
- Open the folder `AbhinavAI` in Visual Studio Code.
- Press `Ctrl + Shift + B` or open **Terminal -> Run Task** and choose **Start Flask Backend** and **Start React Frontend**.
- To execute the AI unit tests, choose **Run AI Test Suite** or run `python backend/tests/test_ai_engine.py`.

---

## 🧪 Phase 7 Automated Test Suite Verification

All 8 specification test cases pass with 100% compliance:

| # | Test Case Description | Expected Result | Actual Result | Status |
|---|-----------------------|-----------------|---------------|--------|
| 1 | Employee on approved leave rejection | Ineligible ($P_2 = \text{False}$) | Correctly rejected with reason | **PASS** |
| 2 | Skill mismatch / low proficiency rejection | Ineligible ($P_1 = \text{False}$) | Correctly rejected with reason | **PASS** |
| 3 | Maximum working hours (40h) limit | Ineligible ($P_4 = \text{False}$) | Workload ceiling respected | **PASS** |
| 4 | Fuzzy Logic Suitability calculation | Skill 7, Workload 24h $\to \approx 66.7$ | **66.7** | **PASS** |
| 5 | Certainty Factor combination (MYCIN) | Combination $\to \approx 0.81$ | **0.81** | **PASS** |
| 6 | Bayes' Theorem absence probability | $P(A \mid E) \to \approx 0.182$ | **0.1818** ($\approx \mathbf{0.182}$) | **PASS** |
| 7 | Workload fair distribution & limits | Standard deviation balanced & $\le 40$h | Fairly balanced | **PASS** |
| 8 | Zero invalid assignments verification | All assignments satisfy CSP + Logic | 0 violations found | **PASS** |

Run tests from command line:
```bash
.\.tools\python\python.exe backend/tests/test_ai_engine.py
```
Or interactively inside the web application by clicking **AI Test Suite (Phase 7)** in the sidebar!

---

## 📁 Project Directory Structure
```
AbhinavAI/
├── backend/
│   ├── app.py                     # Main Flask REST API & endpoints
│   ├── models.py                  # SQLite database schema & connection
│   ├── seed_data.py               # Pre-populated data for 4 industries
│   ├── requirements.txt           # Python dependencies
│   ├── ai/
│   │   ├── csp.py                 # Constraint Satisfaction Problem engine
│   │   ├── search_algorithms.py   # Greedy Best-First, BFS, DFS
│   │   ├── logic.py               # Propositional Logic rule verification
│   │   ├── frames.py              # Frame-based Knowledge Representation
│   │   ├── expert_system.py       # Rule-based Expert System
│   │   └── statistics.py          # Bayes, Certainty Factors, Fuzzy, D-S, Bayes Net
│   └── tests/
│       └── test_ai_engine.py      # Automated unit test suite
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/            # Navbar, Sidebar, Modal, StatCard, CandidateInspector
│   │   ├── pages/                 # Dashboard, Generate, Roster, Analytics, Employees, Skills, Shifts, Leaves, Testing
│   │   └── services/api.js        # REST API client
├── run_backend.bat
├── run_frontend.bat
├── run_all.bat
└── README.md
```

---

## 🏢 Included Industry Presets
1. **Hospital & Healthcare**: ICU, Emergency, Pediatrics, General Ward (Critical Care, Triage, Pharmacology).
2. **Retail & Supermarket**: Checkout, Sales Floor, Warehouse (Cashier, Merchandising, Stock Audit).
3. **Contact & Call Centre**: Tech Escalations, Billing Operations, VIP Enterprise Support.
4. **Manufacturing & Factory**: CNC Precision Machining, Assembly Line, OSHA Safety Compliance.
