.PHONY: help install install-app dev dev-app kill stop build build-app preview preview-app lint lint-app format format-app clean clean-app docker-build docker-up docker-down docker-logs docker-stop docker-restart docker-dev docker-dev-down docker-dev-logs docker-dev-restart bootstrap

# Variables
APPS := react-state-props context-api redux-toolkit rtk-query zustand recoil jotai
APP_DIRS := $(APPS:%=apps/%)
PACKAGES := api config hooks types ui utils
PACKAGE_DIRS := $(PACKAGES:%=packages/%)
DOCKER_COMPOSE := docker-compose.yml
PNPM := pnpm

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# Installation
install: ## Install all dependencies and ensure each app has node_modules
	@echo "$(GREEN)Installing root workspace dependencies...$(NC)"
	$(PNPM) -w install
	@echo ""
	@echo "$(GREEN)Ensuring per-app node_modules (required for local scripts)$(NC)"
	@for dir in $(APP_DIRS); do \
		echo "  -> $$dir"; \
		( cd $$dir && $(PNPM) install --prefer-offline --ignore-scripts ); \
	done
	@echo ""
	@echo "$(GREEN)Ensuring shared package node_modules$(NC)"
	@for dir in $(PACKAGE_DIRS); do \
		echo "  -> $$dir"; \
		( cd $$dir && $(PNPM) install --prefer-offline --ignore-scripts ); \
	done
	@echo ""
	@echo "$(GREEN)Install complete. All apps and packages now have node_modules folders.$(NC)"

install-app: ## Install dependencies for a specific app (usage: make install-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make install-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Installing dependencies for $(APP)...$(NC)"
	cd apps/$(APP) && $(PNPM) install

# Development
dev: ## Run all apps in development mode
	@echo "$(GREEN)Starting all apps in development mode...$(NC)"
	$(PNPM) -w run dev:all

dev-app: ## Run a specific app in development mode (usage: make dev-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make dev-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Starting $(APP) in development mode...$(NC)"
	cd apps/$(APP) && $(PNPM) dev

kill: ## Kill all running dev servers
	@echo "$(YELLOW)Killing all running dev servers...$(NC)"
	@pkill -f "vite.*517[3-9]" || true
	@pkill -f "vite --port 517[3-9]" || true
	@for port in 5173 5174 5175 5176 5177 5178 5179; do \
		pid=$$(lsof -ti:$$port 2>/dev/null); \
		if [ -n "$$pid" ]; then \
			echo "  Killing process on port $$port (PID: $$pid)"; \
			kill -9 $$pid 2>/dev/null || true; \
		fi; \
	done
	@echo "$(GREEN)All dev servers stopped.$(NC)"

stop: kill ## Alias for kill command

# Build
build: ## Build all apps
	@echo "$(GREEN)Building all apps...$(NC)"
	$(PNPM) -w run build:all

build-app: ## Build a specific app (usage: make build-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make build-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Building $(APP)...$(NC)"
	cd apps/$(APP) && $(PNPM) build

# Preview
preview: ## Preview all apps (for production builds)
	@echo "$(GREEN)Starting all apps in preview mode...$(NC)"
	$(PNPM) -w run preview:all

preview-app: ## Preview a specific app (usage: make preview-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make preview-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Starting $(APP) in preview mode...$(NC)"
	cd apps/$(APP) && $(PNPM) preview

# Linting and Formatting
lint: ## Lint all apps
	@echo "$(GREEN)Linting all apps...$(NC)"
	$(PNPM) -w run lint:all

lint-app: ## Lint a specific app (usage: make lint-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make lint-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Linting $(APP)...$(NC)"
	cd apps/$(APP) && $(PNPM) lint

format: ## Format all apps
	@echo "$(GREEN)Formatting all apps...$(NC)"
	$(PNPM) -w run format:all

format-app: ## Format a specific app (usage: make format-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make format-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Formatting $(APP)...$(NC)"
	cd apps/$(APP) && $(PNPM) format

# Clean
clean: ## Clean all build artifacts and node_modules
	@echo "$(YELLOW)Cleaning all apps...$(NC)"
	@for app in $(APPS); do \
		echo "Cleaning $$app..."; \
		rm -rf apps/$$app/dist apps/$$app/node_modules apps/$$app/.vite; \
	done
	@echo ""
	@echo "$(YELLOW)Cleaning shared packages...$(NC)"
	@for dir in $(PACKAGE_DIRS); do \
		echo "Cleaning $$dir..."; \
		rm -rf $$dir/node_modules; \
	done
	rm -rf node_modules .pnpm-store

clean-app: ## Clean a specific app (usage: make clean-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make clean-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Cleaning $(APP)...$(NC)"
	rm -rf apps/$(APP)/dist apps/$(APP)/node_modules apps/$(APP)/.vite

# Docker Commands
docker-build: ## Build all Docker images
	@echo "$(GREEN)Building all Docker images...$(NC)"
	docker-compose build

docker-dev: ## Start all apps in development mode with hot-reload
	@echo "$(GREEN)Starting all apps in development mode with hot-reload...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d

docker-dev-down: ## Stop all development containers
	@echo "$(YELLOW)Stopping all development containers...$(NC)"
	docker-compose -f docker-compose.dev.yml down

docker-dev-logs: ## Show logs from all development containers
	docker-compose -f docker-compose.dev.yml logs -f

docker-dev-restart: ## Restart all development containers
	@echo "$(GREEN)Restarting all development containers...$(NC)"
	docker-compose -f docker-compose.dev.yml restart

docker-build-app: ## Build Docker image for a specific app (usage: make docker-build-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make docker-build-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Building Docker image for $(APP)...$(NC)"
	docker-compose build $(APP)

docker-up: ## Start all Docker containers
	@echo "$(GREEN)Starting all Docker containers...$(NC)"
	docker-compose up -d

docker-up-app: ## Start a specific Docker container (usage: make docker-up-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make docker-up-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Starting Docker container for $(APP)...$(NC)"
	docker-compose up -d $(APP)

docker-down: ## Stop all Docker containers
	@echo "$(YELLOW)Stopping all Docker containers...$(NC)"
	docker-compose down

docker-stop: ## Stop all Docker containers (alias for docker-down)
	@$(MAKE) docker-down

docker-logs: ## Show logs from all Docker containers
	docker-compose logs -f

docker-logs-app: ## Show logs from a specific container (usage: make docker-logs-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make docker-logs-app APP=react-state-props"; \
		exit 1; \
	fi
	docker-compose logs -f $(APP)

docker-restart: ## Restart all Docker containers
	@echo "$(GREEN)Restarting all Docker containers...$(NC)"
	docker-compose restart

docker-restart-app: ## Restart a specific container (usage: make docker-restart-app APP=react-state-props)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)Error: APP variable is required$(NC)"; \
		echo "Usage: make docker-restart-app APP=react-state-props"; \
		exit 1; \
	fi
	@echo "$(GREEN)Restarting Docker container for $(APP)...$(NC)"
	docker-compose restart $(APP)

docker-ps: ## Show status of all Docker containers
	docker-compose ps

# Bootstrap
bootstrap: install build ## Install dependencies and build all apps
	@echo "$(GREEN)Bootstrap complete!$(NC)"

# List all apps
list-apps: ## List all available apps
	@echo "$(GREEN)Available apps:$(NC)"
	@for app in $(APPS); do \
		echo "  - $$app"; \
	done

