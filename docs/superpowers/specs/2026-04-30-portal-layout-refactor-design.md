# Portal Layout Refactor Design (High-Density, Hierarchy-First)

Date: 2026-04-30  
Project: `news` (Next.js App Router)  
Scope: Homepage layout refactor

## 1. Goal

Refactor the current homepage to improve:

- **Information hierarchy** (what matters is immediately obvious)
- **Scanning efficiency** (more useful items per viewport, faster navigation)

Confirmed direction:

- Layout style: **Portal-style columns**
- Density: **High density**
- Priority: **Hierarchy + efficiency first**

## 2. Constraints and Non-Goals

### Constraints

- Keep existing data source and loading flow unchanged in this phase.
- Preserve current route/navigation behavior.
- Maintain responsive behavior and avoid hiding core information.

### Non-Goals

- No backend/data schema changes.
- No RSS pipeline refactor.
- No feature expansion (e.g., advanced search logic) in this iteration.

## 3. Chosen Layout Strategy

Adopt **three-column portal layout** as primary desktop structure.

### Desktop (lg)

- **Left (22%)**: Hot quick list (short titles, compact, high frequency)
- **Center (56%)**: Main content stream (lead item + compact list)
- **Right (22%)**: Utility & topic modules (trends, shortcuts, subscribe entry)

### Tablet (md)

- Collapse to two-column with center-priority arrangement.

### Mobile (sm)

- Single column in strict order: **Center → Left → Right**
- Do not drop key information; only degrade presentation density.

## 4. Visual Hierarchy and Density Rules

### Typography hierarchy

- Single H1 at page level.
- Section titles: `text-sm` + semibold.
- Primary item titles: around `text-[15px]`.
- Secondary metadata: `text-xs`.

### Density rules

- Compact paddings: target `px-3~4`, `py-2~3` for list units.
- Tight but readable line-height: around `1.35~1.45`.
- Increase visible item count per viewport by ~25–35% versus current page.

### Color and emphasis

- Keep indigo as primary accent.
- Accent only for active/current/critical states.
- Reduce non-essential gradients/shadows in dense areas.

### Interaction behavior

- Hover feedback: subtle background highlight only.
- Remove vertical translation motion in dense lists.
- Unify expand/collapse transitions to lightweight 150–200ms.

## 5. File-Level Implementation Plan (Design Scope)

1. `src/app/page.jsx`
   - Replace single-view container with three-column portal shell.
   - Keep data input path stable; prioritize structural rearrangement.

2. `src/app/components/NewsList.jsx`
   - Split rendering modes:
     - Main stream mode (center column)
     - Hot quick-list mode (left column)
   - Tighten row styling and metadata alignment for scanning.

3. `src/app/components/Header.tsx`
   - Compress nav visual density.
   - Keep route-active logic unchanged.

4. `src/app/globals.css`
   - Add/adjust density tokens and utility patterns.
   - Normalize light interaction rules for stable scanning.

## 6. Data Flow and Component Boundaries

- Data ownership remains unchanged at page-level entry.
- Layout container controls region placement only.
- Presentation components should stay single-purpose:
  - shell/layout
  - list rendering variants
  - utility widgets

This keeps internal changes reversible while preserving integration contracts.

## 7. Error Handling and Edge Cases

- If data is empty: keep existing empty-state behavior, but align spacing with dense layout.
- If section payload is sparse: preserve section shell and show concise fallback text.
- On small screens, ensure module ordering remains deterministic and keyboard-friendly.

## 8. Testing Strategy (Design-Level)

- Visual checks across breakpoints: `sm`, `md`, `lg`, `xl`.
- Interaction checks:
  - nav active states
  - expand/collapse behavior
  - hover/focus consistency
- Regression checks:
  - route transitions still work
  - list rendering does not lose metadata

## 9. Success Criteria

- Portal layout is clearly perceived at desktop width.
- First-screen scan path is obvious within 3 seconds.
- Increased information density without readability collapse.
- No breakage in existing navigation and content rendering flow.

## 10. Risks and Mitigations

- Risk: Over-densification hurts readability.  
  Mitigation: enforce typography + spacing thresholds, retain metadata clarity.

- Risk: Visual inconsistency across old/new components.  
  Mitigation: centralize density and interaction tokens in `globals.css`.

- Risk: Mobile compression causes cognitive overload.  
  Mitigation: strict module ordering and progressive disclosure for secondary blocks.
