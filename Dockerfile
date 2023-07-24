# build stage
FROM node:14.18.1 as build-stage
WORKDIR /app
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# local only
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]