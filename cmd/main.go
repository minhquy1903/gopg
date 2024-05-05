package main

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/minhquy1903/gopg/internal/goplay"
)

// Middleware function to add CORS headers to responses
func addCORSHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Serve next handler in the chain
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Start HTTP server
	startServer()
}

func startServer() {
	ctx := context.Background()
	wg := &sync.WaitGroup{}

	// Initialize routes
	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api").Subrouter()
	// Add CORS middleware
	addCORSHeaders(r)

	goplay.NewGoPlayHandler().Routes(apiRouter)

	// Initialize server
	server := &http.Server{
		Addr:         ":8000",
		Handler:      addCORSHeaders(r),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  15 * time.Second,
	}

	go func() {
		<-ctx.Done()
		// logger.Info("Shutting down server...")
		shutdownCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()
		defer wg.Done()

		server.SetKeepAlivesEnabled(false)
		if err := server.Shutdown(shutdownCtx); err != nil {
			if err == context.Canceled {
				return
			}
			// logger.Errorf("Could not gracefully shutdown the server: %v\n", err)
		}
	}()

	wg.Add(1)
	// logger.Infof("Listening on %q", server.Addr)
	log.Default().Printf("Listening on %q", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		// return fmt.Errorf("cannot start server on %q: %s", server.Addr, err)
	}

	return
}
