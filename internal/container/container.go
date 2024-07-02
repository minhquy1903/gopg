package container

import (
	"fmt"
	"os/exec"

	"github.com/google/uuid"
)

type Container struct {
	ID       string
	Status   string
	Root     string
	ExecFile string
}

func NewContainer(execFile string) *Container {
	cid := uuid.NewString()

	return &Container{
		ID:       cid,
		ExecFile: execFile,
	}
}

func (c *Container) Start() []byte {
	execFile := fmt.Sprintf("exec_file_%v", c.ID)

	cmd := exec.Command("./bin/run", execFile)
	output, err := cmd.CombinedOutput()

	if err != nil {
		fmt.Printf("error %v", err)
	}

	fmt.Printf("Output %v", output)
	return output
}

func (c *Container) Destroy() {
	cmd := exec.Command("rm", "-rf", c.Root)
	cmd.Run()
}
