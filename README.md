# Voice Server 🎤

A modern, cross-platform voice server monorepo.

## Workspace Structure

| Package | Type | Tech Stack | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| [`apps/api`](file:///Users/krishnakondoju/projects/Pulao/apps/api) | Server | NestJS | 4000 | Backend API (formerly Basmati) |
| [`apps/web`](file:///Users/krishnakondoju/projects/Pulao/apps/web) | Web | Next.js | 3000 | Web Frontend (formerly Saffron) |
| [`apps/mobile`](file:///Users/krishnakondoju/projects/Pulao/apps/mobile) | Mobile | Expo | 8081 | Mobile App (formerly Cilantro) |
| [`apps/desktop`](file:///Users/krishnakondoju/projects/Pulao/apps/desktop) | Desktop | Electron | 5173 | Desktop App (formerly Cardamom) |
| [`packages/shared`](file:///Users/krishnakondoju/projects/Pulao/packages/shared) | Library | TS | N/A | Shared packages (formerly Masala) |

### Apps Detail

#### 🚀 [API](file:///Users/krishnakondoju/projects/Pulao/apps/api)
- **Framework**: NestJS
- **Port**: `4000`
- **Commands**: `pnpm dev` (runs `nest start --watch`)

#### 🌐 [Web](file:///Users/krishnakondoju/projects/Pulao/apps/web)
- **Framework**: Next.js
- **Port**: `3000`
- **Commands**: `pnpm dev` (runs `next dev`)

#### 📱 [Mobile](file:///Users/krishnakondoju/projects/Pulao/apps/mobile)
- **Framework**: Expo / React Native
- **Port**: `8081`
- **Commands**: `pnpm dev` (runs `expo start`)

#### 💻 [Desktop](file:///Users/krishnakondoju/projects/Pulao/apps/desktop)
- **Framework**: Electron / Vite
- **Port**: `5173`
- **Commands**: `pnpm dev` (runs `vite`)

## Orchestration
This project uses **Turborepo** and **pnpm workspaces**.

To start everything in development mode:
```bash
pnpm dev
```

## Inspiration
Inspired by the architecture of **DogeHouse**.
