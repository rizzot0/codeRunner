FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN sh -c 'if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi'

COPY . ./
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
LABEL org.opencontainers.image.source="https://github.com/elfaldiajr/compiladorEnLineaCP"

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/Frontend /tmp/dist
RUN if [ -d /tmp/dist/browser ]; then \
			cp -a /tmp/dist/browser/. /usr/share/nginx/html/; \
		else \
			cp -a /tmp/dist/. /usr/share/nginx/html/; \
		fi \
		&& rm -rf /tmp/dist

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Ensure nginx can read the built files (fixes 403 caused by restrictive permissions)
RUN chmod -R a+rX /usr/share/nginx/html \
	&& chown -R nginx:nginx /usr/share/nginx/html || true

EXPOSE 80

CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'"]
