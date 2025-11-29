# Jotai

A CRUD application demonstrating state management using Jotai.

## Overview

This app uses Jotai, a primitive and flexible state management library for React. Jotai uses atomic state management, making it easy to build complex state from simple primitives.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses Jotai atoms for state management
- State organized in atoms (posts, loading, error)
- Optimistic updates handled in hook functions
- Minimal boilerplate with atomic approach

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
docker build -t jotai .
docker run -p 80:80 jotai
```

