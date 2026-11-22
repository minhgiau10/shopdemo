# Stage 1: Build từng microservice riêng biệt
FROM node:22-alpine AS builder
ARG SERVICE_NAME
WORKDIR /app

COPY ${SERVICE_NAME}/package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY ${SERVICE_NAME}/ ./

RUN if [ -f "./prisma/schema.prisma" ]; then \
      export DATABASE_URL="mongodb+srv://placeholder:placeholder@cluster0.mongodb.net/shopdemo?retryWrites=true&w=majority"; \
      if [ -x "./node_modules/.bin/prisma" ]; then \
        ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma; \
      else \
        npx --yes prisma@6 generate --schema=./prisma/schema.prisma; \
      fi; \
    fi

RUN npm run build

# Đảm bảo thư mục prisma và generated luôn tồn tại để stage runner COPY không lỗi
RUN mkdir -p /app/prisma /app/generated

# Stage 2: Chạy production nhẹ gọn
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

CMD ["node", "dist/main.js"]