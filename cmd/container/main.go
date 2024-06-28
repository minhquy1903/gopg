package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"syscall"
)

type Setting struct {
	RootFS string
}

func loadSetting() *Setting {
	rootfs := os.Args[2]

	return &Setting{
		RootFS: rootfs,
	}
}

func initFS(root string) {
	baseDir := "./rootfs"
	newDir := fmt.Sprintf("/tmp/container/%v", root)

	cmd := exec.Command("cp", "--recursive", baseDir, newDir)
	err := cmd.Run()

	if err != nil {
		log.Fatal("init file system error: %w", err)
	}
}

func main() {
	setting := loadSetting()

	initFS(setting.RootFS)

	switch os.Args[1] {
	case "child":
		child()
	default:
		run()
	}
}

func run() {
	fmt.Printf("Running %v as PID %d\n", os.Args[3:], os.Getpid())

	args := append([]string{"child"}, os.Args[3:]...)

	cmd := exec.Command("/proc/self/exe", args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error running the /proc/self/exe command:", err)
		os.Exit(1)
	}
}

func child() {
	// Set hostname of the new UTS namespace
	if err := syscall.Chroot(os.Args[2]); err != nil {
		fmt.Println("Error changing root:", err)
		os.Exit(1)
	}

	// Change working directory after changing the root.
	if err := os.Chdir("/"); err != nil {
		fmt.Println("Error changing working directory:", err)
		os.Exit(1)
	}

	// Mount proc. This needs to be done after chroot and chdir.
	if err := syscall.Mount("proc", "proc", "proc", 0, ""); err != nil {
		fmt.Println("Error mounting proc:", err)
		os.Exit(1)
	}

	cmd := exec.Command(os.Args[3], os.Args[4:]...)

	output, err := cmd.CombinedOutput()

	if err != nil {
		fmt.Println("Execute code error", err)
		os.Exit(0)
	}

	fmt.Println(string(output))
}
