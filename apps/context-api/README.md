# Context API

A CRUD application demonstrating state management using React Context API.

## Overview

This app uses React's Context API to provide global state management. The `PostsProvider` wraps the app and makes posts data and CRUD operations available to all components via the `usePosts` hook.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses React Context API (`createContext`, `useContext`)
- State is managed in a `PostsProvider` component
- Components access state via `usePosts` hook
- Avoids prop drilling compared to basic React state

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
docker build -t context-api .
docker run -p 80:80 context-api
```

