package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
)

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

func runHandler(w http.ResponseWriter, r *http.Request) {
	// Read the body of the request

	buf := make([]byte, 1024)
	_, err := r.Body.Read(buf)

	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// // Print the body string
	file, err := os.CreateTemp("", "temp*.go")

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer func() {
		os.Remove(file.Name())
		file.Close()
	}()

	fmt.Println("buf", string(buf))

	_, err = file.Write(bytes.Trim(buf, "\x00"))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// Compile and execute the Go code
	cmd := exec.Command("go", "run", file.Name())

	output, err := cmd.CombinedOutput()

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the output back to the frontend
	w.Write(output)
}

func main() {
	// Define routes
	http.HandleFunc("/run", runHandler)

	// Start HTTP server
	http.ListenAndServe(":8000", addCORSHeaders(http.DefaultServeMux))
}
