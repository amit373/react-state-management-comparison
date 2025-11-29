# Redux Toolkit

A CRUD application demonstrating state management using Redux Toolkit.

## Overview

This app uses Redux Toolkit (RTK) for state management. It leverages `createSlice` for reducers, `createAsyncThunk` for async operations, and implements optimistic updates with rollback capabilities.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses Redux Toolkit with `createSlice` and `createAsyncThunk`
- State managed in Redux store with typed actions and reducers
- Optimistic updates handled via Redux actions
- Type-safe with TypeScript

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
docker build -t redux-toolkit .
docker run -p 80:80 redux-toolkit
```

