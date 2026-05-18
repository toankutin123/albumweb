FROM node:20-alpine as build

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
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
      echo "WARNING: Vite build output not found — writing fallback index.html"; \
      mkdir -p /usr/share/nginx/html && \
      cat > /usr/share/nginx/html/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Build Error</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0;
           background: #0f172a; color: #f1f5f9; }
    .card { text-align: center; padding: 2rem; border: 1px solid #334155;
            border-radius: 0.75rem; max-width: 480px; }
    h1 { color: #f97316; margin-bottom: 0.5rem; }
    p  { color: #94a3b8; line-height: 1.6; }
    code { background: #1e293b; padding: 0.2em 0.4em; border-radius: 0.25rem;
           font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="card">
    <h1>&#9888; Build Incomplete</h1>
    <p>The Vite build did not produce output files.<br/>
       Check the Docker build logs for errors in the <code>npm run build</code> step.</p>
  </div>
</body>
</html>
EOF
    else \
      echo "Vite build output verified — index.html present"; \
    fi

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
