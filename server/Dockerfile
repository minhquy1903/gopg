# Stage 1: Build stage
FROM golang:alpine3.20

# Switch to root user
USER root

# Set the working directory
WORKDIR /app

# Copy and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the Go application
RUN mkdir -p /tmp/container
RUN CGO_ENABLED=0 GOOS=linux go build -o ./bin/gopg ./cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o ./bin/container ./cmd/container/main.go
RUN chmod +x ./cmd/container/main.go

CMD ["/app/bin/gopg"]
