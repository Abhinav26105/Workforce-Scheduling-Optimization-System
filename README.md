# Workforce Scheduling Optimization System

## Project Overview

The **Workforce Scheduling Optimization System** is an AI-oriented project focused on solving the problems of manual employee roster preparation in shift-based organizations such as hospitals, retail stores, call centres, and factories. Preparing shift schedules by hand is slow, error-prone, and rarely satisfies every operational rule at the same time — employee availability, maximum working hours, rest periods, leave requests, and minimum shift coverage all have to be balanced together.

The project models workforce scheduling as a **search and constraint-satisfaction problem**, where shifts, employees, and rules are represented as variables, domains, and constraints. AI concepts from problem-solving methodologies and adversarial search are proposed to generate valid, fair, and efficient schedules, with a future path toward multi-department conflict resolution.

---

## Problem Statement

The project addresses the following problems in manual workforce scheduling:

* Manual rostering is slow and does not scale with employee count.
* Existing schedules rarely satisfy every constraint simultaneously.
* Employee availability, skill match, and leave requests are hard to track manually.
* Maximum working-hour and rest-period rules are frequently violated.
* Shift coverage requirements are inconsistently met.
* Multiple departments may compete for the same qualified staff.
* Fairness in shift distribution is difficult to guarantee by hand.

AI search and constraint-handling concepts are proposed for **schedule generation, constraint satisfaction, and conflict resolution between competing demands**.

---

## Problem Context

A shift-based organization typically involves:

* A pool of employees, each with distinct skills, availability windows, and working-hour limits.
* A set of shifts that must be staffed across days and weeks.
* Rules governing rest periods, leave requests, and maximum consecutive working hours.
* Departments or units that may draw on overlapping sets of qualified staff.

Schedules built without considering these constraints together can lead to understaffed shifts, employee burnout, non-compliance with labour rules, and repeated manual rework. The project therefore models workforce scheduling as a **search and constraint-satisfaction environment**, where:

* A **state** represents a partial or complete assignment of employees to shifts.
* An **action** represents assigning (or reassigning) an employee to a shift.
* A **goal state** is a complete roster in which every shift is filled and every hard constraint is respected.
* A **path cost** reflects how far a schedule is from being optimal — for example, overtime incurred, preference violations, or unfilled shifts.

---

## Problem Understanding

The problem has been divided into four major AI tasks:

1. State-space representation of employees, shifts, and assignments.
2. Search-based generation of feasible or near-feasible schedules.
3. Constraint handling for availability, hours, skills, and leave rules.
4. Conflict resolution when multiple departments compete for the same staff.

This follows the standard problem-formulation approach using:

* **Initial state** — an empty or partially filled roster.
* **Successor function** — rules for assigning an available, qualified employee to an open shift.
* **Goal test** — every shift is staffed and no hard constraint is violated.
* **Path cost** — a measure combining overtime, preference mismatches, and unfilled-shift penalties.

Literature has also been reviewed to support future extensions such as real-time availability updates and fairness-aware scheduling.

---

## Objectives

* Represent employees, shifts, and rules as a searchable state space.
* Generate valid rosters using uninformed and informed search techniques.
* Use heuristics to prioritize schedules that are closer to fully staffed and low-cost.
* Model availability, hour limits, and leave as constraints in a CSP formulation.
* Compare schedule quality using path cost and search effort across techniques.
* Explore adversarial-search framing for resolving competing demands between departments.
* Provide a foundation for later extensions such as live availability feeds and preference learning.

---

## Target Users / Stakeholders

### Employees

Submit availability and leave requests; view assigned shifts.

### Shift Managers

Generate and adjust rosters; ensure every shift meets coverage requirements.

### HR Administrators

Monitor organization-wide scheduling, fairness, and labour-rule compliance.

### Future Integration

A later stage may connect the scheduling engine to live HR systems and time-and-attendance data for real-time roster updates.

---

## Literature Review

Several research papers were reviewed during the initial research phase to ground the project in existing approaches to AI-assisted workforce scheduling.

### 1. AI-Powered Workforce Scheduling and Resource Optimization Across Distributed Cloud Infrastructures (IEEE Xplore, 2025)

This work looks at coordinating workforce scheduling decisions alongside distributed computing resources, which is relevant to understanding how scheduling engines can operate at scale across multiple sites or departments.

### 2. Federated Learning-Enhanced Workforce Scheduling Framework for Distributed Enterprises (IEEE Xplore, 2025)

This paper explores combining learning-based demand prediction with scheduling logic across distributed enterprise units, which supports the project's interest in eventually forecasting shift demand rather than treating it as fixed input.

### 3. OptiTime: AI-Powered Faculty Scheduler for Peak Productivity (IEEE Xplore, 2024)

This paper presents a scheduling system for academic staff that balances multiple constraints (availability, workload, preferences), offering a directly comparable smaller-scale case study for constraint-driven roster generation.

### 4. CP-WSP: A Declarative CP-SAT Framework for Configurable Multi-Constraint Workforce Scheduling (2026)

This paper frames workforce scheduling as a constraint-programming problem solved with a modern CP-SAT solver, enforcing a large set of hard rules (such as rest periods and cross-midnight shifts) as non-negotiable while optimizing soft objectives like workload fairness. Its variable/constraint framing closely matches this project's own CSP formulation of employees, shifts, and rules.

### 5. Constraint Satisfaction Problems for Workforce Management (industry analysis, 2024)

This source explains, at a practical level, how CSP techniques represent employees, shifts, and positions as variables with domains, and how labour rules and skill requirements become constraints — reinforcing the variable–domain–constraint structure adopted for this project.

### 6. Machine Learning and Constraint Programming for Efficient Healthcare Scheduling (2024)

This paper explores learning constraints directly from historical scheduling data rather than hand-coding every rule, which is noted here as a possible future direction once the base CSP model is working.

### 7. Exploring Nurse Perspectives on AI-Based Shift Scheduling for Fairness, Transparency and Work-Life Balance (2024)

This qualitative study reports that staff affected by automated scheduling care strongly about fairness and transparency in how shifts are assigned, not just technical feasibility — a consideration folded into this project's objective of fairness-aware scheduling rather than pure cost minimization.

These findings collectively support the project's core framing: workforce scheduling is a constraint-satisfaction problem at heart, but real deployments must also account for fairness, staff trust, and eventual integration with live organizational data.

---

## AI Concepts Identified for Application

### Unit 1 — Problem Solving Methodologies

The following concepts have been identified:

* State-space / graph representation of employees, shifts, and assignments
* BFS
* DFS
* Iterative Deepening Search
* Bi-directional Search
* Greedy Best-First Search
* A* Search
* Constraint Satisfaction Problem (CSP)

### AI Concept Application

| AI Concept | Application / Purpose |
|---|---|
| BFS | Explore shift-assignment states level by level to build a valid schedule |
| DFS | Explore one shift-assignment path deeply before backtracking to try alternatives |
| Iterative Deepening | Control search depth/effort while still reaching a full schedule |
| Bi-directional Search | Search from an empty roster and a target roster to meet in the middle |
| Greedy Best-First Search | Prioritize filling shifts with the least current coverage first |
| A* Search | Balance cost-so-far and estimated cost-to-go to reach a low-cost schedule |
| AO* Search | Handle shifts needing multiple sub-requirements (AND) vs. alternative staff (OR) |
| CSP | Model shifts as variables, staff as domains, rules as constraints |

### A* Search

A* has been selected as a candidate for cost-aware schedule generation, using:

```text
f(n) = g(n) + h(n)
### CSP

Constraint Satisfaction Problem framing is identified as the core technique for:

* Shift-slot scheduling
* Employee-to-shift assignment
* Availability and skill-matching constraints
* Working-hour and rest-period constraint handling

### AO*

AO* was reviewed for cases where a shift requires multiple simultaneously satisfied sub-requirements (AND) versus a choice between alternative qualified staff (OR), but it was not prioritized for the current stage.

## Unit 2 — Adversarial Search

The following concepts have also been studied:

* Game-tree / state-transition thinking
* Minimax
* Alpha-Beta pruning

These are considered for a **controlled scenario in which departments compete for the same limited staff pool**, modelled as opposing sides seeking the most favourable allocation. They are conceptual at this stage and are not treated as the primary scheduling algorithm, since ordinary day-to-day rostering is cooperative rather than adversarial — Minimax/Alpha-Beta apply specifically to the cross-department conflict scenario, not to routine schedule generation.

---

## Work Completed During Month 1

During Month 1, the team:

* Finalized the project theme as an AI-oriented **Workforce Scheduling Optimization System**.
* Identified key problems including availability tracking, working-hour compliance, leave handling, and cross-department staff conflicts.
* Converted the scheduling problem into a state-space / CSP model, with shifts as variables and eligible employees as domains.
* Studied Module 1 (Problem Solving Methodologies) and Module 2 (Adversarial Search) from the course material.
* Compared uninformed search methods (BFS, DFS, Iterative Deepening, Bi-directional Search) against informed methods (Greedy Best-First, A*).
* Selected A* as the primary cost-aware scheduling candidate using `g(n)` and `h(n)`.
* Identified CSP for shift allocation and scheduling under variables, domains, and constraints.
* Reviewed literature connecting AI scheduling to CSP formulations, distributed/federated approaches, learned constraints, and staff-fairness perspectives.
* Studied Minimax and Alpha-Beta pruning for a future controlled, cross-department conflict scenario.
* Prepared the initial project plan and Month 1 report.
## Challenges Faced

The main challenge was translating a real workforce-scheduling environment — with overlapping human, legal, and operational constraints — into a clean AI search and CSP model without losing important real-world rules.

Another challenge was separating core scheduling algorithms from comparison and future concepts:

* BFS / DFS provide uninformed baselines for exploring the assignment space.
* A* is considered more suitable for cost-aware, constraint-respecting schedule generation.
* CSP is the primary technique for encoding hard rules such as availability and hour limits.
* Minimax / Alpha-Beta are limited to a defined, adversarial cross-department conflict scenario rather than ordinary day-to-day rostering.

A further challenge was deciding how to represent fairness — an important factor identified in the literature review — within a cost function that is otherwise focused on coverage and overtime minimization.

---

## Team Contribution

The team jointly contributed to:

* Problem identification
* Requirements discussion
* AI concept mapping
* Literature review
* Project planning
* Problem understanding
* Algorithm study

---

## Current Progress

### Overall Progress: 25%

The following work has been completed:

* Problem understanding
* Scope definition
* Stakeholder identification
* Literature review
* AI concept mapping
* Initial state-space / CSP architecture planning

Implementation and testing remain for later reviews.

---

## Plan for Next Review

The next stage of the project will focus on:

* Finalizing the search/CSP techniques used for schedule generation.
* Designing how employees, shifts, and constraints map to a formal CSP (variables, domains, constraints).
* Implementing baseline search (BFS/DFS) and A* routing with a suitable heuristic for shift assignment.
* Defining schedule-cost metrics (overtime, unfilled shifts, preference mismatches) and comparing search strategies against them.
* Building the first CSP allocation/scheduling model for a small sample roster.
* Building a small Minimax/Alpha-Beta simulation for the cross-department staff-conflict scenario.
* Reporting outcomes and comparisons in Review 2.

---

## Project Information

| Field | Details |
|---|---|
| Program | B.Tech CSE-A |
| Course | Artificial Intelligence |
| Course Code | CCSAI0301 |
| Faculty | Dr. Mohd. Nazim |
| Assignment Type | Group Assignment / PBL Project |
| Group | 8 |
| Reporting Period | Month 1 |
| Overall Progress | Approximately 25% |
| SDG | SDG 8 – Decent Work and Economic Growth |
| Submission Date | 12/09/2026 |

---

## Team

**Group 8**

* Abhinav Kumar Jha
* Aditya Maurya
* Aditya Kumar Katiyar
* Akhilesh Verma
* Abhishek Goswami
