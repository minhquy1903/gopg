package goplay

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/gorilla/mux"
	"github.com/minhquy1903/gopg/internal/container"
	"github.com/minhquy1903/gopg/pkg/nanoid"
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
	// Read the request body
	code, err := readRequestBody(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Create a temporary file
	file, err := createTempFile(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cleanupTempFile(file)

	// Compile the code
	execPath, err := compileCode(file.Name())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.Remove(execPath)

	// Run the code in a container
	output, err := runInContainer(execPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the output back to the frontend
	w.Write(output)
}

func readRequestBody(r *http.Request) ([]byte, error) {
	var buf bytes.Buffer
	buf.Grow(BUFFER_SIZE)
	_, err := buf.ReadFrom(r.Body)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func createTempFile(code []byte) (*os.File, error) {
	file, err := os.CreateTemp("", "temp*.go")
	if err != nil {
		return nil, err
	}
	_, err = file.Write(code)
	if err != nil {
		file.Close()
		os.Remove(file.Name())
		return nil, err
	}
	return file, nil
}

func cleanupTempFile(file *os.File) {
	file.Close()
	os.Remove(file.Name())
}

func compileCode(filename string) (string, error) {
	execPath := fmt.Sprintf("./exec_%v", nanoid.NewNanoId())
	cmd := exec.Command("go", "build", "-o", execPath, filename)
	if output, err := cmd.CombinedOutput(); err != nil {
		return "", fmt.Errorf("compilation error: %v\n%s", err, output)
	}
	return execPath, nil
}

func runInContainer(execPath string) ([]byte, error) {
	rootfs := nanoid.NewNanoId()
	container := container.NewContainer(rootfs, execPath)
	output, err := container.Run()

	if err != nil {
		return nil, fmt.Errorf("failed to run in container: %w", err)
	}

	fmt.Println(string(output))

	container.Destroy()
	return output, nil
}
