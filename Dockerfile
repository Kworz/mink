#Build step
FROM node:20-alpine as base

#Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy files
WORKDIR /mink

# Copy project files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma/ /mink/prisma

# ——— install build project
FROM base as builder

# Install devDependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . . 

# Sync sveltekit and build project
RUN pnpm prisma generate
RUN pnpm sync
RUN pnpm build

#remove devDependencies
RUN pnpm prune --prod

# ——— Production final image
FROM base as production

# Copy files from builder
COPY --from=builder /mink/node_modules/ /mink/node_modules/
COPY --from=builder /mink/build /mink/build
COPY --from=builder /mink/prisma /mink/prisma

#Final params
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "pnpm", "run", "start" ]
