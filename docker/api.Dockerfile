FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PORT=3000

RUN corepack enable && pnpm config set store-dir /pnpm/store

COPY apps/api /opt/api/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /opt/

WORKDIR /opt/api

#FROM base AS prod-deps
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
#    pnpm install --filter=api... --prod --frozen-lockfile

#FROM base AS build
#WORKDIR /opt/api

#RUN npm i --filter=api --frozen-lockfile
#RUN pnpm --filter=api run build:ts
RUN npm i
RUN npm run build:ts
# FROM base

#COPY --from=build /opt/api/dist /opt/api/dist
#COPY --from=build /opt/api/node_modules /opt/api/node_modules

RUN ls -AR /opt/api/node_modules
RUN ls /opt/api
RUN ls /opt

WORKDIR /opt/api
EXPOSE 3000

# CMD ["/bin/sleep", "3600"]
CMD ["pnpm", "run", "prod:start"]
