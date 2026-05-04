# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["yarn", "dev", "--host"]
