package container

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"

	"github.com/minhquy1903/gopg/pkg/nanoid"
)

type Container struct {
	ID       string
	Status   string
	Root     string
	ExecFile string
}

const (
	TEMPL_DIR = "./image"
	BASE_ROOT = "/tmp/container"
)

func NewContainer(rootfs, execFile string) *Container {
	cid := nanoid.NewNanoId()
	root := fmt.Sprintf("%v/%v", BASE_ROOT, rootfs)

	return &Container{
		ID:       cid,
		ExecFile: execFile,
		Root:     root,
	}
}

// Copy filesystem into new root directory
func (c Container) initFS() error {
	cmd := exec.Command("cp", "--recursive", TEMPL_DIR, c.Root)

	return cmd.Run()
}

// Copy exec file into new root directory
func (c Container) copyExecFile() error {
	cmd := exec.Command("cp", c.ExecFile, c.Root)
	return cmd.Run()
}

// Execute file
func (c Container) execFile() ([]byte, error) {
	cmd := exec.Command("./bin/container", "run", c.Root, c.ExecFile)

	var stdout bytes.Buffer
	cmd.Stdin = os.Stdin
	cmd.Stdout = &stdout
	cmd.Stderr = os.Stderr
	err := cmd.Run()

	if err != nil {
		return nil, err
	}

	return stdout.Bytes(), nil
}

// Run the container
func (c *Container) Run() []byte {
	err := c.initFS()

	if err != nil {
		fmt.Printf("init filesystem fail: %v", err)
		return nil
	}

	err = c.copyExecFile()

	if err != nil {
		fmt.Printf("copy exec file into container fail: %v", err)
		return nil
	}

	output, err := c.execFile()

	if err != nil {
		fmt.Printf("fail to exec file: %v", err)
		return nil
	}

	return output
}

func (c *Container) Destroy() {
	cmd := exec.Command("rm", "-rf", c.Root)
	cmd.Run()
}
