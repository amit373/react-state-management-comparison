# React State Management Complete

A comprehensive monorepo comparing 7 different React state management solutions, each implementing a complete CRUD application against the JSONPlaceholder API.

## 📦 Projects

This monorepo contains 7 independent React + TypeScript applications:

1. **react-state-props** - React State + Props (baseline)
2. **context-api** - React Context API
3. **redux-toolkit** - Redux Toolkit
4. **rtk-query** - RTK Query
5. **zustand** - Zustand
6. **recoil** - Recoil
7. **jotai** - Jotai

Each app is a fully independent Vite project with its own dependencies, implementing the same CRUD functionality to demonstrate different state management approaches.

## 🚀 Quick Start

### Prerequisites

- Node.js 24 LTS
- pnpm 8+
- React 18
- Make (optional, for Makefile commands)
- Docker & Docker Compose (for containerized deployment)

### Installation

**Using Makefile (Recommended):**

```bash
# Install all dependencies
make install

# Or bootstrap (install + build)
make bootstrap
```

**Using pnpm directly:**

```bash
# Install all dependencies
pnpm -w install

# Or use the bootstrap script
pnpm -w run bootstrap
```

### Running Apps

**Run a single app:**

```bash
cd apps/react-state-props
pnpm install
pnpm dev
```

**Run all apps concurrently:**

```bash
pnpm -w run dev:all
```

**Build all apps:**

```bash
pnpm -w run build:all
```

**Preview all apps:**

```bash
pnpm -w run preview:all
```

## 🐳 Docker

### Production Mode (Static Build)

Using Makefile (Recommended):

```bash
# Build all Docker images
make docker-build

# Build a specific app
make docker-build-app APP=react-state-props

# Start all containers
make docker-up

# Start a specific container
make docker-up-app APP=react-state-props

# Stop all containers
make docker-down

# View logs
make docker-logs

# View logs for a specific app
make docker-logs-app APP=react-state-props

# Restart all containers
make docker-restart

# Check container status
make docker-ps
```

### Development Mode (Hot-Reload)

For development with automatic refresh on file changes:

```bash
# Start all apps in development mode with hot-reload
make docker-dev

# Stop all development containers
make docker-dev-down

# View development logs
make docker-dev-logs

# Restart all development containers
make docker-dev-restart
```

**Note:** Development mode uses Vite's dev server with hot module replacement (HMR). Any changes to source files will automatically trigger a browser refresh. Containers will automatically restart if they crash.

### Using docker-compose directly

```bash
# Build and run a specific app
docker-compose up react-state-props

# Build and run all apps
docker-compose up -d

# Stop all apps
docker-compose down

# View logs
docker-compose logs -f
```

### Build and run a single app manually

```bash
cd apps/react-state-props
docker build -t react-state-props .
docker run -p 80:80 react-state-props
```

Each app is exposed on a different port:

- react-state-props: <http://localhost:3001>
- context-api: <http://localhost:3002>
- redux-toolkit: <http://localhost:3003>
- rtk-query: <http://localhost:3004>
- zustand: <http://localhost:3005>
- recoil: <http://localhost:3006>
- jotai: <http://localhost:3007>

## 📊 Comparison

See [comparison.json](./comparison.json) for a detailed comparison of all 7 state management solutions.

### Quick Comparison Table

| Solution | Boilerplate | Learning Curve | API Handling | Scalability | Performance |
|----------|------------|----------------|--------------|-------------|-------------|
| React State + Props | Low | Easy | Manual | Low | Good |
| Context API | Low | Easy | Manual | Medium | Good |
| Redux Toolkit | Medium | Moderate | Manual | High | Excellent |
| RTK Query | Medium | Moderate | Built-in | High | Excellent |
| Zustand | Low | Easy | Manual | Medium-High | Excellent |
| Recoil | Low-Medium | Moderate | Manual | High | Excellent |
| Jotai | Low | Easy | Manual | Medium-High | Excellent |

## 🎨 Features

All apps include:

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Optimistic UI updates with rollback on error
- ✅ Dark mode support with localStorage persistence
- ✅ Responsive design (mobile-first)
- ✅ TypeScript strict mode (no `any`)
- ✅ Search/filter functionality
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Centralized error handling utilities
- ✅ API configuration constants
- ✅ Docker health checks
- ✅ Makefile for easy project management

## 🛠️ Tech Stack

- **Node.js 24 LTS** - Runtime environment
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling with dark mode
- **Axios** - HTTP client (except RTK Query which uses fetchBaseQuery)
- **ESLint + Prettier** - Code quality
- **Docker & Docker Compose** - Containerization
- **Make** - Build automation
- **pnpm** - Package manager with workspace support

## 📝 Project Structure

```text
.
├── apps/
│   ├── react-state-props/
│   ├── context-api/
│   ├── redux-toolkit/
│   ├── rtk-query/
│   ├── zustand/
│   ├── recoil/
│   └── jotai/
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── comparison.json
└── README.md
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
