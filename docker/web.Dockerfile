FROM node:20-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /opt

RUN corepack enable && pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./web/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm i --filter=web --frozen-lockfile

COPY apps/web ./web/

RUN pnpm --filter=web run build

FROM nginx:1.27-alpine
COPY --from=build /opt/web/dist /usr/share/nginx/html
EXPOSE 80

#FROM node:20-alpine AS build
#ENV PNPM_HOME="/pnpm"
#ENV PATH="$PNPM_HOME:$PATH"
#WORKDIR /opt
#COPY apps/web ./web/
#
#RUN corepack enable && pnpm config set store-dir /pnpm/store
#
#COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
#COPY apps/web/package.json ./web/
#
#FROM base AS prod-deps
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
#    pnpm i --filter=web --prod --frozen-lockfile
#
#FROM base AS build
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
#    pnpm i --filter=web --frozen-lockfile
#
#RUN pnpm --filter ./web run build
#
#FROM nginx:1.27-alpine
#COPY --from=build /opt/web/dist /usr/share/nginx/html
#EXPOSE 80
