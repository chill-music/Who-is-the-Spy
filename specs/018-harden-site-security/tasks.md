# Tasks: Harden Site Security & SEO

**Input**: Design documents from `/specs/018-harden-site-security/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Manual verification tasks are included as no automated test framework is requested for these static configurations.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create `.well-known` directory in repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No foundational tasks required for this meta-configuration feature. Proceed to User Stories.

---

## Phase 3: User Story 1 - Security Hardening (Priority: P1) 🎯 MVP

**Goal**: Protect the application from XSS and Clickjacking using CSP and Frame-busters.

**Independent Test**: Verify CSP is present in `index.html` and site cannot be iframed.

### Implementation for User Story 1

- [x] T002 [P] [US1] Implement Content Security Policy (CSP) meta tag in `index.html`
- [x] T003 [P] [US1] Implement JavaScript frame-buster protection in `index.html`

**Checkpoint**: Security hardening is implemented. Verify in browser before proceeding.

---

## Phase 4: User Story 2 - Search Engine Optimization (Priority: P2)

**Goal**: Improve search engine discoverability and crawl control.

**Independent Test**: Access `robots.txt` and `sitemap.xml` directly in browser.

### Implementation for User Story 2

- [x] T004 [P] [US2] Create robots.txt with crawling rules and sitemap reference in root
- [x] T005 [P] [US2] Create sitemap.xml mapping prospy.mooo.com in root

**Checkpoint**: SEO files are present. Crawler visibility is now enabled.

---

## Phase 5: User Story 3 - Security Disclosure Standard (Priority: P3)

**Goal**: Provide a standardized security contact point.

**Independent Test**: Access `/.well-known/security.txt` in browser.

### Implementation for User Story 3

- [x] T006 [P] [US3] Create RFC 9116 compliant security disclosure policy in `.well-known/security.txt`

**Checkpoint**: Security maturity standard is met.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [x] T007 [P] Verify CSP whitelisting by checking for console errors in `index.html`
- [x] T008 [P] Verify clickjacking protection via local iframe testing of `index.html`
- [x] T009 Run quickstart.md validation for all security and SEO files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately. Blocks US3.
- **User Stories (Phase 3+)**: US1 and US2 can start immediately as they target different parts of the root or unique files. US3 depends on Phase 1.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent.
- **User Story 2 (P2)**: Independent.
- **User Story 3 (P3)**: Depends on T001 (directory creation).

### Parallel Opportunities

- T001, T002, T003, T004, T005 can all be executed in parallel as they target different files or non-conflicting sections of `index.html`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T002 and T003 in `index.html`.
2. **STOP and VALIDATE**: Verify security headers and frame behavior.

### Incremental Delivery

1. Deploy Security Hardening (US1).
2. Deploy SEO Improvements (US2).
3. Deploy Security Disclosure (US3).
