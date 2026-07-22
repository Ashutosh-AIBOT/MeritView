# MeritView — Project Operating Procedures

**Version:** 1.0.0  
**Status:** Active  
**Authority:** This document governs every task, milestone, and deliverable for the MeritView project. All contributors must follow these protocols without exception.

---

## 1. Pre-Implementation Protocol: The "Educational First" Mandate

**Rule:** You are prohibited from executing implementation until the Educational Briefing has been delivered, reviewed, and acknowledged.

### Comprehensive Technical Briefing Requirements

Every briefing must contain:

#### 1.1 Core Concept & Rationale
- What the feature/component is
- Strategic reasoning behind its implementation
- How it connects to the locked decisions in `plan.md`
- Consequences of skipping or delaying this feature

#### 1.2 Technical Stack
- Specific technologies, libraries, and frameworks to be used
- Exact versions pinned in `plan.md` ("Tech Stack" section)
- Rationale for each technology choice
- Integration points with existing systems

#### 1.3 Architectural Workflow
- Step-by-step breakdown of how the feature integrates into the existing system
- Data flow diagrams (described in text/mermaid)
- API boundaries and contracts
- State transitions and side effects
- Failure modes and recovery paths

#### 1.4 Requirement Gathering
- Mandatory list of all specific requirements needed from the project owner before work begins
- Missing information that blocks implementation
- Dependencies on prior completed work
- External approvals needed (legal, security, compliance)

### Teaching Standard
Explanations must be structured to deepen technical understanding. Assume the audience is a technical founder who must defend every decision to stakeholders, engineers, and investors. Avoid jargon without explanation. Use analogies where helpful. Always connect implementation details back to business outcomes and risk profiles.

---

## 2. Execution & Tracking Protocol

### Dynamic Project Checklist
- Maintained in `PROJECT_CHECKLIST.md`
- Markdown checkboxes: `[ ]` pending, `[~]` in-progress, `[x]` completed
- Every task from `plan.md` Part 18 is enumerated
- Each task includes: commit message, agent owner, acceptance criteria, tests

### Verification Standards
For every completed task:
1. **Unit Tests:** Specific tests written and passing, with coverage percentage
2. **Integration Tests:** Database/API/contract tests passing
3. **Manual Verification Steps:** Exact commands run, outputs observed, screenshots if applicable
4. **Lint/Typecheck:** Zero errors
5. **Edge Case Validation:** Explicit documentation of how edge cases from the plan were tested
6. **Security Check:** Secrets scan, dependency audit, OWASP Top 10 check

### Status Reporting
At the start of every interaction, provide:
- Project completion percentage (code-wise, not plan-wise)
- Current sprint/week number
- Active task and its status
- Blockers (if any)
- Next 3 tasks in queue

---

## 3. Quality Assurance & Edge Case Rigor

### Mandatory Checks for Every Feature

#### 3.1 Edge Case Analysis
- Unusual inputs: empty strings, nulls, max-length boundaries, special characters
- Race conditions: concurrent requests, duplicate submissions, timing windows
- Unexpected user behaviors: rapid clicking, navigation away during async ops, browser back button
- Infrastructure failures: DB down, Redis down, LLM provider timeout, Stripe webhook duplication

#### 3.2 Error Handling
- All errors must use the standard error envelope from `plan.md`
- No stack traces or internal paths leaked to clients
- Graceful degradation: if one LLM provider fails, others continue
- Informative error messages for users, detailed logs for operators
- Retry logic with exponential backoff and circuit breakers

#### 3.3 Security-by-Design
- Input validation at every trust boundary (client, API gateway, service, DB)
- Parameterized queries everywhere — no string interpolation
- Authentication checks on every protected endpoint
- Authorization checks on every resource access
- Secrets never in code, logs, or client-side bundles
- Rate limiting on all public endpoints
- CORS whitelist only, no wildcards in production

---

## 4. Milestone & Project Conclusion Protocol

### Comprehensive End-to-End Audit Report
Generated at these mandatory checkpoints:
- After v1.0 MVP launch (Phase 1 complete)
- After v2.0 Beta launch (Phase 2 complete)
- Quarterly thereafter
- After any SEV1/Severity-1 incident

### Audit Report Structure

#### 4.1 Security Analysis
- Threat model review for all implemented features
- Results of last penetration test / security scan
- Unpatched CVEs in dependencies
- Secrets management audit (rotation status, access logs)
- Access control matrix verification
- Encryption at rest and in transit validation
- Findings from last SAST/DAST run

#### 4.2 Scalability Assessment
- Current user capacity vs. projected growth
- Database query performance: slow queries identified, index usage statistics
- Connection pool utilization under load
- LLM provider cost per dispute trajectory
- Bottleneck analysis: DB, Redis, API gateway, external APIs
- Vertical vs. horizontal scaling readiness

#### 4.3 Technical Constraints
- Every trade-off made during implementation
- Architectural shortcuts taken with rationale
- Features deferred with business justification
- Technology limitations encountered
- Operational constraints (budget, team size, timeline)

#### 4.4 Data Integrity
- Validation coverage: which fields have validation, which don't
- Data consistency checks: orphaned records, referential integrity violations
- Backup/restore test results
- Migration safety: backward compatibility verification
- PII handling: encryption, retention, deletion compliance
- Audit log completeness

#### 4.5 Technical Debt Registry
- Unresolved issues and their severity
- Shortcuts taken with recommended remediation
- Missing tests and their risk level
- Deprecated patterns still in use
- Future migration plans (e.g., monolith to microservices path)
- Estimated effort to resolve each item

---

## 5. Continuous Learning Requirement

### Teaching Philosophy
Every explanation must:
- Use concrete examples from the MeritView codebase
- Connect abstract concepts to real architectural decisions
- Anticipate follow-up questions and answer them preemptively
- Provide analogies to familiar systems
- Include "what if" scenarios to deepen understanding

### Stakeholder-Ready Explanations
The project owner must be able to explain:
- Why each technology was chosen
- How the system handles failure
- What the security model is and why it's sufficient
- How the system scales
- What the cost structure is and how it's optimized
- What regulatory risks exist and how they're mitigated

### Knowledge Transfer Log
Maintain a `KNOWLEDGE_TRANSFER.md` that captures:
- Concepts explained during this session
- Resources provided
- Follow-up topics for future sessions
- Owner's self-identified knowledge gaps

---

## Document Control

| Field | Value |
|-------|-------|
| Document Name | PROJECT_OPERATING_PROCEDURES.md |
| Owner | Project Lead |
| Approvers | [To be filled at first team meeting] |
| Review Cadence | After each milestone |
| Change Process | All changes require project lead approval and update to this section |

---

*End of Project Operating Procedures. This document is binding for the entire MeritView project lifecycle.*
