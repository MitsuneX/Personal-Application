# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

## [3.2.0] - 2026-07-31

### 🚀 Multi-User SaaS Architecture & Data Isolation
- **Strict User Data Isolation**: Added `userId` scoping across all 21 database models in `prisma/schema.prisma` with indexed columns (`@index([userId])`).
- **Zero Cross-Account Data Leakage**: Enforced server-side ownership filtering in `app/api/dashboard/route.ts` and `app/api/action/route.ts`. Newly registered accounts receive their own clean, isolated datasets.
- **Database Ownership Migration**: Successfully migrated all pre-existing records to the primary owner account (`8f151ec2-d923-44f4-88d2-ef7a5e166232`), guaranteeing zero data loss.

### 🎮 Guest Sandbox Mode & UX Enhancements
- **One-Click Guest Access**: Added a prominent `🚀 CONTINUE AS GUEST` option on both Cyberpunk and Neo-Brutalist login screens.
- **Zero Database Pollution**: Guest session mutations operate strictly in-memory / client state. No guest data ever enters PostgreSQL.
- **Persistent Guest Banner**: Added `GuestBanner` component displaying active guest status and an `EXIT GUEST →` button.
- **Email Enter Focus Progression**: Pressing `Enter` in the email input field on the login screen automatically advances focus to the password field.

### 🤖 AI Library & Games Expansion
- **Expanded AI Library**: Added 35 frontier AI platforms across General AI, Coding AI, Research AI, and Search AI.
- **Expanded Games Library**: Registered 6 new gaming titles with custom SVG vector icons, dossier configurations, combat role breakdowns, and elemental attributes:
  - *Girls' Frontline 2: Exilium*
  - *Outerplane*
  - *Tower of Fantasy*
  - *Goddess of Victory: NIKKE*
  - *Arknights: Endfield*
  - *Honkai Impact 3rd*
