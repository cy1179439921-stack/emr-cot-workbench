FROM harbor.ebondhm.com/library/node:16.15.0-alpine-package as build
COPY . .
RUN pnpm run build

FROM harbor.ebondhm.com/library/nginx:1.28.0 as deploy
COPY --from=build /usr/src/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
