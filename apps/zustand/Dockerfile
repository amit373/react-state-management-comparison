FROM node:24-alpine AS builder

ARG APP_NAME=zustand

WORKDIR /workspace

RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/${APP_NAME} ./apps/${APP_NAME}

RUN pnpm install --filter ${APP_NAME}... --prod=false

WORKDIR /workspace/apps/${APP_NAME}
RUN pnpm run build

FROM nginx:alpine

RUN apk add --no-cache wget

COPY --from=builder /workspace/apps/${APP_NAME}/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

