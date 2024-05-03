package main

import (
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"

	"github.com/labstack/echo/v4"
)

type Templates struct {
	templates *template.Template
}

func (t *Templates) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	if err := t.templates.ExecuteTemplate(w, name, data); err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}

func NewTemplate() *Templates {
	tmpl := template.New("")

	err := filepath.Walk("views", func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && filepath.Ext(path) == ".html" {
			fmt.Println(path)
			tmpl.ParseFiles(path)
		}

		return nil
	})

	if err != nil {
		panic(err)
	}

	return &Templates{
		templates: tmpl,
	}
}

func main() {
	e := echo.New()

	e.Renderer = NewTemplate()

	e.Static("/", "public")

	e.GET("/", func(c echo.Context) error {
		return c.Render(http.StatusOK, "index", map[string]interface{}{})
	})

	e.POST("/run", func(c echo.Context) error {
		code := c.FormValue("code")
		fmt.Println(code)
		return c.Render(http.StatusOK, "index", map[string]interface{}{
			"code": code,
		})
	})

	e.Start(":3000")
}
