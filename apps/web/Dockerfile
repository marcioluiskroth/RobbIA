# Imagem do app web (Harness UI). Story 1.1: build simples a partir do monorepo.
FROM oven/bun:1.3 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run --filter @robbia/web build

FROM oven/bun:1.3 AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000
CMD ["bun", "run", "--filter", "@robbia/web", "start"]
