FROM golang:1.24 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/api ./cmd/api

FROM docker:26-dind

COPY --from=builder /app/api /usr/local/bin/api
RUN chmod +x /usr/local/bin/api

EXPOSE 8080

CMD dockerd-entrypoint.sh & sleep 4 && /usr/local/bin/api