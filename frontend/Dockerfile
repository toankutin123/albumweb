FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify the Vite build produced output. If index.html is missing (e.g. the
# build failed silently), write a minimal fallback so nginx serves a readable
# page instead of a 502. The fallback makes the problem immediately visible
# in the browser rather than hiding it behind a generic gateway error.
RUN test -f /usr/share/nginx/html/index.html || \
    mkdir -p /usr/share/nginx/html && \
    echo '<html><body><h1>Build Failed</h1><p>Vite build did not produce output.</p></body></html>' > /usr/share/nginx/html/index.html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
