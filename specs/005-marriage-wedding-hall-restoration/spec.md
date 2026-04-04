# Feature Specification: Marriage & Wedding Hall Restoration

Restore the "Add Partner" and "Wedding Hall" features to their former functionality and premium design.

## 1. Goal Description
The objective is to repair regressions in the marriage system and the Wedding Hall interface. Key features like proposal management and divorce management are currently non-functional or missing from the UI. The design should match the "Cyber-Luxury" theme.

## 2. User Stories
- **As a single user**, I want to browse recently married couples in the Wedding Hall.
- **As a single user**, I want to propose to a partner by selecting a ring and sending a romantic message.
- **As a user receiving a proposal**, I want to see the proposal in my "Proposals" tab and be able to Accept or Reject it.
- **As a married user**, I want to manage my relationship in the "Divorce" tab (e.g., view partner profile or end the relationship).

## 3. Functional Requirements
- **Wedding Hall Feed**: Fetch and display a list of the 30 most recent 'accepted' couples with high-quality cards.
- **Proposals Tab**: 
  - Show incoming `pending` proposals for the current user.
  - Show outgoing `pending` proposals sent by the current user.
  - Implement **Accept** (trigger `acceptProposal`) and **Decline** (trigger `declineProposal` with refund).
- **Divorce Tab**: 
  - If married, display current partner info.
  - Implement **Divorce** button (trigger `divorceCouple`).
- **Proposal Flow**: 
  - Seamlessly transition from Wedding Hall -> Shop (Rings) -> Proposal Selection -> Send.

## 4. Acceptance Criteria
- [ ] Users can successfully accept a proposal, updating both profiles to `isMarried: true`.
- [ ] Users can successfully decline a proposal, receiving a refund for the ring cost.
- [ ] Married users can browse their partner's profile from the Marriage tab.
- [ ] The Wedding Hall UI matches the Cyber-Luxury theme with glassmorphism and glowing accents.
