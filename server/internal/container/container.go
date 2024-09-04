package container

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/minhquy1903/gopg/pkg/nanoid"
)

const (
	templDir = "./image"
	baseRoot = "/tmp/container"
)

type Container struct {
	ID       string
	Status   string
	Root     string
	ExecFile string
}

func NewContainer(rootfs, execFile string) *Container {
	return &Container{
		ID:       nanoid.NewNanoId(),
		ExecFile: execFile,
		Root:     filepath.Join(baseRoot, rootfs),
	}
}

// Run executes the container lifecycle
func (c *Container) Run() ([]byte, error) {
	if err := c.initFS(); err != nil {
		return nil, fmt.Errorf("init filesystem failed: %w", err)
	}

	if err := c.copyExecFile(); err != nil {
		return nil, fmt.Errorf("copy exec file into container failed: %w", err)
	}

	return c.execFile()
}

// Destroy removes the container's root directory
func (c *Container) Destroy() error {
	return os.RemoveAll(c.Root)
}

func (c *Container) initFS() error {
	return exec.Command("cp", "-r", templDir, c.Root).Run()
}

func (c *Container) copyExecFile() error {
	return exec.Command("cp", c.ExecFile, c.Root).Run()
}

func (c *Container) execFile() ([]byte, error) {
	cmd := exec.Command("./bin/container", "run", c.Root, c.ExecFile)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	output := stdout.Bytes()

	if err != nil {
		// Append stderr to output if there's an error
		output = append(output, '\n')
		output = append(output, stderr.Bytes()...)
		return output, fmt.Errorf("failed to exec file: %w", err)
	}

	return output, nil
}
