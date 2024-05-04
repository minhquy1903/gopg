package main

import (
	"bufio"
	"fmt"
	"net/http"

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
		fmt.Println(string(buf))

		return c.JSON(http.StatusOK, map[string]interface{}{})
	})

	e.Start(":8000")
}
