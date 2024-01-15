#Build step
FROM node:20-alpine as builder

#Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy files
WORKDIR /mink
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY . . 

RUN pnpm i
RUN pnpm build
RUN pnpm prune --production

# Runtime step
FROM node:20-alpine

#Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy files from builder
WORKDIR /mink
COPY --from=builder /mink/build build/
COPY --from=builder /mink/node_modules node_modules/
COPY --from=builder /app/prisma /prisma
COPY package.json .
COPY entrypoint.sh .

#Final params
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "pnpm", "run", "start" ]
