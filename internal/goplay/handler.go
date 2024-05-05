package goplay

import (
	"bytes"
	"net/http"
	"os"
	"os/exec"

	"github.com/gorilla/mux"
)

const (
	BUFFER_SIZE = 1024 * 1024
)

type GoPlayHandler struct {
	// config ServiceConfig
	// log    *zap.SugaredLogger
}

func NewGoPlayHandler() *GoPlayHandler {
	return &GoPlayHandler{}
}

func (h *GoPlayHandler) Routes(r *mux.Router) {
	r.Path("/run").Methods(http.MethodPost).HandlerFunc(h.handleRun)
}

func (h *GoPlayHandler) handleRun(w http.ResponseWriter, r *http.Request) {
	// Read the body of the request
	var buf bytes.Buffer

	buf.Grow(BUFFER_SIZE)
	defer r.Body.Close()

	_, err := buf.ReadFrom(r.Body) //io.Copy(&buf, io.LimitReader(r.Body, BUFFER_SIZE+1))

	if err != nil {
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

	_, err = file.Write(buf.Bytes())

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
