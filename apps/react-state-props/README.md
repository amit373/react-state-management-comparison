# React State + Props

A CRUD application demonstrating state management using React's built-in state and props.

## Overview

This app uses React's `useState` hook for local state management and passes data down through component props. It's the simplest approach to state management, suitable for small applications.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses `useState` hook in a custom `usePosts` hook
- State is managed locally and passed down via props
- No external state management library required

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
docker build -t react-state-props .
docker run -p 80:80 react-state-props
```

