package container

type Container struct {
	ID     string
	Status string
	Root   string
}

func NewContainer(root string) *Container {
	return &Container{
		Root: root,
	}
}

func (c *Container) Down() {

}

func (c *Container) Up() {

}

func (c *Container) Destroy() {

}
