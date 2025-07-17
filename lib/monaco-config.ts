"use client"

// Configuración simplificada para Monaco Editor
export const configurarMonaco = async () => {
  if (typeof window === "undefined") return null

  try {
    const monaco = await import("monaco-editor")

    // Configuración básica de workers
    self.MonacoEnvironment = {
      getWorkerUrl: () => {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
          self.MonacoEnvironment = {
            baseUrl: 'https://unpkg.com/monaco-editor@0.52.2/min/'
          };
          importScripts('https://unpkg.com/monaco-editor@0.52.2/min/vs/base/worker/workerMain.js');
        `)}`
      },
    }

    // Configurar tema oscuro personalizado
    monaco.editor.defineTheme("dark-custom", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "regexp", foreground: "D16969" },
        { token: "operator", foreground: "D4D4D4" },
        { token: "namespace", foreground: "4EC9B0" },
        { token: "type", foreground: "4EC9B0" },
        { token: "class", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264F78",
        "editorCursor.foreground": "#AEAFAD",
      },
    })

    // Configurar tema claro personalizado
    monaco.editor.defineTheme("light-custom", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "keyword", foreground: "0000FF", fontStyle: "bold" },
        { token: "string", foreground: "A31515" },
        { token: "number", foreground: "098658" },
        { token: "regexp", foreground: "811F3F" },
        { token: "operator", foreground: "000000" },
        { token: "namespace", foreground: "267F99" },
        { token: "type", foreground: "267F99" },
        { token: "class", foreground: "267F99" },
        { token: "function", foreground: "795E26" },
        { token: "variable", foreground: "001080" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#000000",
        "editorLineNumber.foreground": "#237893",
        "editor.selectionBackground": "#ADD6FF",
        "editorCursor.foreground": "#000000",
      },
    })

    return monaco
  } catch (error) {
    console.error("Error configurando Monaco:", error)
    return null
  }
}

// Mapeo de lenguajes para Monaco
export const mapearLenguajeMonaco = (lenguaje: string): string => {
  const mapeo: { [key: string]: string } = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    html: "html",
    css: "css",
    java: "java",
    cpp: "cpp",
    csharp: "csharp",
    php: "php",
    ruby: "ruby",
    go: "go",
    rust: "rust",
    sql: "sql",
    json: "json",
    yaml: "yaml",
    markdown: "markdown",
    bash: "shell",
    powershell: "powershell",
    swift: "swift",
    kotlin: "kotlin",
    dart: "dart",
    vue: "html",
    react: "typescript",
    angular: "typescript",
  }
  return mapeo[lenguaje] || "plaintext"
}
