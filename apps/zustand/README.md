# Zustand

A CRUD application demonstrating state management using Zustand.

## Overview

This app uses Zustand, a lightweight state management library. Zustand provides a simple API with minimal boilerplate, making it easy to manage global state.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses Zustand `create` function to create stores
- State managed in a single store with actions
- Optimistic updates handled in store actions
- Minimal boilerplate compared to Redux

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
docker build -t zustand .
docker run -p 80:80 zustand
```

