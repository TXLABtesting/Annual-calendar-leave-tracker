# Two stages: build the frontend with npm, then run a Node image that carries
# only the built assets and the dependency-free server.
FROM node:22-alpine AS build
WORKDIR /build
COPY app/package.json app/package-lock.json ./app/
RUN cd app && npm ci
COPY shared ./shared
COPY app ./app
RUN cd app && npm run build

FROM node:22-alpine
WORKDIR /srv
COPY --from=build /build/app/dist ./app/dist
COPY shared ./shared
COPY server ./server

# SQLite lives here. Mount a volume at /srv/server/data or the calendar is lost
# when the container is replaced.
ENV DB_PATH=/srv/server/data/leave.db
ENV PORT=8787
EXPOSE 8787

# node:sqlite is still flagged experimental, so silence the startup warning.
CMD ["node", "--no-warnings", "server/index.mjs"]
