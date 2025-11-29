# Recoil

A CRUD application demonstrating state management using Recoil.

## Overview

This app uses Recoil, Facebook's state management library for React. Recoil provides atomic state management with atoms and selectors, making it easy to share state across components.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses Recoil atoms for state management
- State organized in atoms (posts, loading, error)
- Optimistic updates handled in action functions
- Components wrapped in RecoilRoot

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Preview

```bash
pnpm preview
```

## Docker

```bash
docker build -t recoil .
docker run -p 80:80 recoil
```

