import * as monaco from 'monaco-editor';



monaco.editor.create(document.getElementById('container'), {
  value: [`
package main

import (
	"fmt"
)

func main() {
	fmt.Println("Hello World")
}
`].join('\n'),
  language: 'go'
});