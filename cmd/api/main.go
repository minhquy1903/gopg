package main

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/minhquy1903/gopg/internal"
	"github.com/minhquy1903/gopg/internal/goplay"
)

// Middleware function to add CORS headers to responses

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

	goplay.NewGoPlayHandler().Routes(apiRouter)

	// Initialize server
	server := &http.Server{
		Addr:         ":8000",
		Handler:      internal.AddCORSHeaders(r),
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
