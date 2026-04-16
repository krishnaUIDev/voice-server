# Voice Server 🎤

A modern, cross-platform voice server monorepo.

## Workspace Structure

- `apps/api`: NestJS Backend (formerly Basmati).
- `apps/web`: Next.js Web App (formerly Saffron).
- `apps/mobile`: Expo Mobile App (formerly Cilantro).
- `apps/desktop`: Electron Desktop App (formerly Cardamom).
- `packages/shared`: Shared types and utilities (formerly Masala).

## Orchestration
This project uses **Turborepo** and **pnpm workspaces**.

To start everything in development mode:
```bash
pnpm dev
```

## Inspiration
Inspired by the architecture of **DogeHouse**.
