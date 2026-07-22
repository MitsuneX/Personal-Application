# Development Workflow Rules

## 1. Dual-Theme Consistency
- Every new feature, modal, component, and page **MUST** perfectly support and look polished in both application themes (`Cyberpunk` mode and `Neo-Brutalism` mode).
- Always verify that styling, borders, colors, and drop-shadows fit seamlessly across all themes without breaking layout integrity.
- Use `useTheme()` hook and dynamic styles (`isCyber ? ... : ...`) for crisp contrast and theme alignment.

## 2. Continuous Log Updates Maintenance
- Always update the changelog data structure ([`lib/data/changelog.ts`](file:///c:/Coding/scripts/Full%20Stack%20Personal%20Applications/dashboard/lib/data/changelog.ts)) with detailed, neat, and easy-to-understand bullet points whenever any new changes, features, or bug fixes are introduced.
- Maintain accurate version numbers, release dates, and categorized change items (New Features, Bug Fixes & Engine, UI & Aesthetics, PWA & Mobile).
