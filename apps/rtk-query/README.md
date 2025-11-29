# RTK Query

A CRUD application demonstrating state management using RTK Query.

## Overview

This app uses RTK Query for data fetching and caching. RTK Query automatically handles caching, invalidation, and refetching, making it ideal for API-heavy applications.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Automatic caching and cache invalidation
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design
- ✅ TypeScript strict mode
- ✅ Search/filter functionality

## State Management Approach

- Uses RTK Query with `createApi` and `fetchBaseQuery`
- Automatic cache management and invalidation
- No manual optimistic updates needed (handled by cache invalidation)
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
docker build -t rtk-query .
docker run -p 80:80 rtk-query
```
