# MeritView — Project Checklist

**Status Legend:** `[ ]` Pending | `[~]` In Progress | `[x]` Complete | `[!]` Blocked

---

## Phase 0: Pre-Building Validation (Week 0 — Mandatory Gate)

- [ ] **Step 1.1:** Manual Thesis Validation
  - [ ] Select 5–10 real disputes from network
  - [ ] Write single-party evaluation prompt
  - [ ] Call Groq API and Gemini API manually for each dispute
  - [ ] Synthesize outputs
  - ] Decision gate: outputs useful and consistent?
  - **Cost:** ~$50–100 in LLM API costs

- [ ] **Step 1.2:** Legal Guidance
  - [ ] Engage tech lawyer ($500–1,500)
  - [ ] UPL positioning review: "decision support, not legal advice"
  - [ ] Disclaimers, ToS, privacy policy review
  - [ ] Output: written confirmation + disclaimers list + prohibited jurisdictions list

- [ ] **Step 1.3:** First 20 Users Identified
  - [ ] List 20 specific people with recent small contract disputes
  - [ ] For each: name, dispute type, estimated stakes, willingness to pay $49
  - [ ] Reach out to 5
  - [ ] Decision gate: 20 people named AND 5 say they'd pay

---

## Phase 1: Foundation (Weeks 1-2)

- [x] **1.** `feat(infra): initialize monorepo with pnpm workspaces`
  - [x] Root `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `tsconfig.base.json`, `.nvmrc`, `README.md`
  - [x] Workspace packages declared: `client`, `server`, `packages/*`
  - [x] `pnpm install` verified across all 4 workspace packages
  - [x] `pnpm typecheck` verified: `shared`, `llm-abstraction`, `server`, `client` all pass
  - [x] Shared packages built with TypeScript declarations
  - [x] Prisma schema validated and client generated
  - **Owner:** Backend Architect / DevOps Automator

- [x] **2.** `feat(infra): add Docker Compose for local dev (PostgreSQL, Redis, mock LLM)`
  - [x] `infra/docker-compose.yml` with postgres, redis, server, client, mock-llm services
  - [x] Health checks for postgres and redis
  - [x] Hot reload volume mounts for server and client
  - [x] `infra/mock-llm.Dockerfile` and `infra/mock-llm-db.json`
  - **Owner:** DevOps Automator

- [ ] **3.** `feat(db): add Prisma schema and migrations for all MVP tables`
  - [ ] `server/prisma/schema.prisma` with all MVP models
  - [ ] `pnpm db:migrate` creates tables successfully
  - [ ] `pgcrypto` extension enabled in PostgreSQL
  - **Owner:** Database Reliability Engineer

- [ ] **4.** `feat(auth): implement register, verify-email, login, logout endpoints`
  - [ ] POST `/v1/auth/register` with email, password, display_name, accept_terms
  - [ ] POST `/v1/auth/verify-email` with token
  - [ ] POST `/v1/auth/login` with email, password
  - [ ] POST `/v1/auth/logout` with valid JWT
  - **Owner:** Backend Architect

- [ ] **5.** `feat(auth): implement password reset and refresh token endpoints`
  - [ ] POST `/v1/auth/password-reset/request` with email
  - [ ] POST `/v1/auth/password-reset/complete` with token, new_password
  - [ ] POST `/v1/auth/refresh` with refresh_token
  - **Owner:** Backend Architect

- [ ] **6.** `feat(auth): add auth middleware and JWT validation`
  - [ ] `authenticate` middleware extracts and validates JWT
  - [ ] `requireAdmin` middleware enforces admin role
  - [ ] `requireSupport` middleware enforces support role
  - [ ] 401/403 responses use standard error envelope
  - **Owner:** Backend Architect

- [ ] **7.** `test(auth): add unit and integration tests for auth endpoints`
  - [ ] Unit tests for auth service functions
  - [ ] Integration tests for all auth routes
  - [ ] Edge cases: duplicate email, invalid password, expired token, wrong role
  - **Owner:** Backend Architect

---

## Phase 2: Core Dispute Flow (Weeks 3-4)

8. `feat(disputes): implement dispute creation endpoint`
9. `feat(disputes): implement dispute list and detail endpoints`
10. `feat(disputes): add state machine enforcement`
11. `test(disputes): add unit and integration tests for dispute flow`
12. `feat(briefs): implement brief draft save endpoint`
13. `feat(briefs): implement brief submit with validation`
14. `feat(briefs): add word count enforcement and immutability`
15. `test(briefs): add unit and integration tests for brief flow`

---

## Phase 3: Payments (Week 5)

16. `feat(payments): integrate Stripe payment intent creation`
17. `feat(payments): implement payment confirmation webhook handler`
18. `feat(payments): implement refund request endpoint`
19. `feat(payments): add payment state machine integration`
20. `test(payments): add unit and integration tests for payment flow`

---

## Phase 4: Evaluation Orchestration (Weeks 6-7)

21. `feat(providers): implement GroqProvider abstraction`
22. `feat(providers): implement GeminiProvider abstraction`
23. `feat(providers): add provider health checks and cost estimation`
24. `feat(evaluation): implement EvaluationJob creation and parallel dispatch`
25. `feat(evaluation): add retry logic with exponential backoff`
26. `feat(evaluation): implement minimum 3 evaluator rule and auto-refund`
27. `test(evaluation): add unit tests with mock providers`
28. `test(evaluation): add integration tests with real Groq and Gemini APIs`

---

## Phase 5: Manual Aggregation (Week 8)

29. `feat(admin): implement admin authentication`
30. `feat(admin): implement admin dispute list and detail endpoints`
31. `feat(admin): implement pending aggregations list endpoint`
32. `feat(admin): implement aggregation publish endpoint`
33. `feat(admin): add admin dashboard UI`
34. `test(admin): add unit and integration tests for admin endpoints`

---

## Phase 6: Opinion Delivery (Week 9)

35. `feat(opinions): implement opinion creation from aggregation`
36. `feat(opinions): implement opinion read endpoint`
37. `feat(opinions): implement PDF generation with Puppeteer`
38. `feat(opinions): implement S3 PDF storage with signed URLs`
39. `feat(opinions): implement opinion status endpoint`
40. `test(opinions): add unit and integration tests for opinion flow`

---

## Phase 7: Email Notifications (Week 10)

41. `feat(email): implement email service with SendGrid/SES`
42. `feat(email): add email templates for all transactional emails`
43. `feat(email): implement async email queue`
44. `test(email): add unit tests with mocked email provider`

---

## Phase 8: Frontend (Weeks 11-12)

45. `feat(web): implement landing page`
46. `feat(web): implement registration and login flows`
47. `feat(web): implement dispute creation form`
48. `feat(web): implement brief preparation form with draft save`
49. `feat(web): implement payment page with Stripe`
50. `feat(web): implement opinion view and PDF download`
51. `feat(web): implement user dashboard (dispute list, status)`
52. `test(web): add Playwright E2E tests for complete user flow`

---

## Phase 9: Hardening (Weeks 13-14)

53. `feat(security): implement application-level encryption for briefs`
54. `feat(security): add rate limiting middleware`
55. `feat(monitoring): integrate Sentry for error tracking`
56. `feat(monitoring): add cost monitoring dashboard`
57. `chore(infra): add GitHub Actions CI pipeline`
58. `chore(infra): add Terraform for production infrastructure`
59. `test(security): run penetration test and fix findings`

---

## Phase 10: Beta Preparation (Week 15+)

60. `feat(beta): add two-party invitation system`
61. `feat(beta): add counterparty brief preparation`
62. `feat(beta): implement both-submit gate`
63. `feat(beta): add AI-assisted brief preparation with WebSocket`
64. `feat(beta): implement 5-model evaluation (Claude, GPT-4, Gemini, OpenRouter, NVIDIA NIM)`
65. `feat(beta): implement automated aggregation engine`
66. `feat(beta): add document upload and OCR`
67. `feat(beta): make web app mobile-responsive`
68. `feat(beta): add all 3 dispute categories`
69. `feat(beta): implement pricing tiers ($99/$199/$299/$49)`
70. `test(beta): add E2E tests for two-party flow`
71. `chore(beta): update documentation and pricing`

---

## Project Completion Tracker

**Total Tasks:** 71  
**Completed:** 2  
**In Progress:** 0  
**Remaining:** 69  
**Overall Completion:** 2.8%

---

## Verification Log

| Task | Tests Passed | Edge Cases Covered | Security Check | Date Completed |
|------|-------------|-------------------|----------------|----------------|
| 1. `feat(infra): initialize monorepo with pnpm workspaces` | `pnpm install` and `pnpm typecheck` pass across all workspace packages | N/A | Dependency versions pinned; no hardcoded secrets | [today] |
| 2. `feat(infra): add Docker Compose for local dev` | `docker-compose.yml` validates; services defined with health checks | N/A | No secrets in compose files; ports bound locally only | [today] |

---

*This checklist is the live source of execution truth. Update after every completed task.*
