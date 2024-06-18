package container

import (
	"fmt"
	"os/exec"

	"github.com/google/uuid"
)

type Container struct {
	ID     string
	Status string
	Root   string
}

func NewContainer() *Container {
	cid := uuid.NewString()

	oldDir := "./rootfs"
	newDir := fmt.Sprintf("/tmp/container/%v", cid)

	cmd := exec.Command("cp", "--recursive", oldDir, newDir)
	cmd.Run()

	return &Container{
		Root: newDir,
		ID:   cid,
	}
}

func (c *Container) Start() {
	cmd := exec.Command("./bin/run execution_file")
	output, err := cmd.CombinedOutput()

	if err != nil {
		fmt.Printf("error %v", err)
	}

	fmt.Printf("Output %v", output)
}

func (c *Container) Destroy() {
	cmd := exec.Command("rm", "-rf", c.Root)
	cmd.Run()
}
