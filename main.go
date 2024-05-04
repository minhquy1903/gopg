package main

import (
	"bufio"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	e.Use(middleware.CORS())

	e.POST("/run", func(c echo.Context) error {
		buf := make([]byte, 1024)
		// Read the body into a buffer
		r := bufio.NewReader(c.Request().Body)

		_, err := r.Read(buf)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}
		// Print the body string
		file, err := os.CreateTemp("", "temp*.go")

		if err != nil {
			return err
		}

		defer file.Close()

		n, err := file.WriteString(string(`package main

		import (
			"fmt"
		)
		
		func main() {
			fmt.Println("Hello World")
		}`))

		r2 := bufio.NewReader(file)

		r2.Read(buf)

		fmt.Println("buf", string(buf))

		if err != nil {
			return err
		}

		fmt.Println("n", n)
		fmt.Println("filename", file.Name())

		// Compile and execute the Go code
		cmd := exec.Command("go", "run", file.Name())

		output, err := cmd.CombinedOutput()

		if err != nil {
			fmt.Printf("Error: %s\n", err)

			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}

		// Print the output
		fmt.Printf("Output: %s\n", output)

		// Send the output back to the frontend
		return c.String(200, string(output))
	})

	e.Start(":8000")
}
