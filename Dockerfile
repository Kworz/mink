#Build step
FROM node:22-alpine AS base

#Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy files
WORKDIR /mink

RUN apk add --no-cache openssl

# Copy project files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma/ /mink/prisma

# ——— install build project
FROM base AS builder

# Install devDependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY ./src ./src
COPY ./static ./static
COPY ./svelte.config.js ./svelte.config.js
COPY ./tsconfig.json ./tsconfig.json
COPY ./postcss.config.cjs ./postcss.config.cjs
COPY ./tailwind.config.cjs ./tailwind.config.cjs
COPY ./vite.config.ts ./vite.config.ts

# Sync sveltekit and build project
RUN pnpm prisma generate
RUN pnpm sync
RUN pnpm build

#remove devDependencies
RUN pnpm prune --prod

# ——— Production final image
FROM base AS production

# Copy files from builder
COPY --from=builder /mink/node_modules/ /mink/node_modules/
COPY --from=builder /mink/build /mink/build
COPY --from=builder /mink/prisma /mink/prisma

#Final params
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "pnpm", "run", "start" ]
