FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Fail the build immediately if Vite did not produce dist/index.html.
# This surfaces the real error in the build logs rather than letting a
# broken image reach the nginx stage and serve a fallback error page.
RUN ls -la /app/dist && test -f /app/dist/index.html

FROM nginx:alpine

# gettext provides envsubst, used by docker-entrypoint.sh to inject BACKEND_HOST
# into the nginx config template at container start.
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
# Install as a template; docker-entrypoint.sh renders it to default.conf at runtime.
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Confirm the copy from the build stage succeeded.
RUN ls -la /usr/share/nginx/html && test -f /usr/share/nginx/html/index.html

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]
