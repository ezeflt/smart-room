# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

ENV VITE_ENVIRONMENT=prod

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 