import * as monaco from 'monaco-editor';

(function () {
  console.log("Init Monaco Editor");

  const initValue =
    `package main
  
  import (
    "fmt"
  )
  
  func main() {
    fmt.Println("Hello World")
  }
  `

  const themeSelect = document.getElementById('theme-select');

  themeSelect.addEventListener('change', (e) => {
    console.log("change theme: ", e.target.value);
    monaco.editor.setTheme(e.target.value);
  })


  monaco.editor.create(document.getElementById('container'), {
    value: initValue,
    language: 'go',
    theme: 'vs-dark'
  });
})();