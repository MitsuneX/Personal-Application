# Development Workflow Rules

## 1. Dual-Theme Consistency
- Every new feature, modal, component, and page **MUST** perfectly support and look polished in both application themes (`Cyberpunk` mode and `Neo-Brutalism` mode).
- Always verify that styling, borders, colors, and drop-shadows fit seamlessly across all themes without breaking layout integrity.
- Use `useTheme()` hook and dynamic styles (`isCyber ? ... : ...`) for crisp contrast and theme alignment.

## 2. Changelog Generation Policy (No Premature Updates)
- **DO NOT** generate or update entries in `lib/data/changelog.ts` prematurely while actively iterating on a feature, bug fix, or UI section.
- **ONLY** update the changelog when a feature/page is completely finalized and verified, or **strictly when explicitly commanded by the user**.

## 3. Focused Task Execution
- Keep code edits strictly scoped to the specific problem, component, or feature requested by the user.
- Avoid unnecessary side-effects or premature documentation churn until the user gives the green light.
