"use client"

// Detector automático de lenguaje basado en patrones de código
export function detectarLenguaje(codigo: string): string {
  const codigoLimpio = codigo.trim().toLowerCase()

  // Patrones específicos para cada lenguaje
  const patrones = [
    // JavaScript/TypeScript
    {
      lenguaje: "javascript",
      patrones: [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/,
        /=>\s*{/,
        /console\.log/,
        /document\./,
        /window\./,
        /require\(/,
        /import\s+.*from/,
        /export\s+(default\s+)?/,
      ],
    },
    {
      lenguaje: "typescript",
      patrones: [
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
        /:\s*(string|number|boolean|any|void)/,
        /public\s+\w+/,
        /private\s+\w+/,
        /protected\s+\w+/,
        /<.*>/,
        /as\s+\w+/,
      ],
    },
    // Python
    {
      lenguaje: "python",
      patrones: [
        /def\s+\w+\s*\(/,
        /class\s+\w+/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /if\s+__name__\s*==\s*['"']__main__['"']/,
        /print\s*\(/,
        /self\./,
        /elif\s+/,
        /:\s*$/m,
      ],
    },
    // HTML
    {
      lenguaje: "html",
      patrones: [/<html/, /<head>/, /<body>/, /<div/, /<p>/, /<h[1-6]>/, /<script/, /<style/, /<!doctype/, /<\/\w+>/],
    },
    // CSS
    {
      lenguaje: "css",
      patrones: [
        /\.\w+\s*{/,
        /#\w+\s*{/,
        /\w+\s*:\s*[^;]+;/,
        /@media/,
        /@import/,
        /background-color/,
        /font-family/,
        /margin/,
        /padding/,
        /display\s*:/,
      ],
    },
    // Java
    {
      lenguaje: "java",
      patrones: [
        /public\s+class\s+\w+/,
        /public\s+static\s+void\s+main/,
        /System\.out\.println/,
        /private\s+\w+\s+\w+/,
        /public\s+\w+\s+\w+\s*\(/,
        /import\s+java\./,
        /package\s+\w+/,
        /extends\s+\w+/,
        /implements\s+\w+/,
      ],
    },
    // C++
    {
      lenguaje: "cpp",
      patrones: [
        /#include\s*<.*>/,
        /using\s+namespace\s+std/,
        /int\s+main\s*\(/,
        /cout\s*<</,
        /cin\s*>>/,
        /std::/,
        /class\s+\w+\s*{/,
        /public:/,
        /private:/,
        /protected:/,
      ],
    },
    // PHP
    {
      lenguaje: "php",
      patrones: [
        /<\?php/,
        /\$\w+/,
        /echo\s+/,
        /function\s+\w+\s*\(/,
        /class\s+\w+/,
        /public\s+function/,
        /private\s+function/,
        /protected\s+function/,
        /->/,
      ],
    },
    // SQL
    {
      lenguaje: "sql",
      patrones: [
        /select\s+.*\s+from/,
        /insert\s+into/,
        /update\s+\w+\s+set/,
        /delete\s+from/,
        /create\s+table/,
        /alter\s+table/,
        /drop\s+table/,
        /where\s+/,
        /order\s+by/,
        /group\s+by/,
      ],
    },
    // JSON
    {
      lenguaje: "json",
      patrones: [/^\s*{/, /^\s*\[/, /"\w+"\s*:/, /:\s*"[^"]*"/, /:\s*\d+/, /:\s*(true|false|null)/],
    },
    // React JSX
    {
      lenguaje: "react",
      patrones: [
        /import\s+.*\s+from\s+['"]react['"]/,
        /useState/,
        /useEffect/,
        /useContext/,
        /jsx/,
        /tsx/,
        /<\w+.*>/,
        /className=/,
        /onClick=/,
        /onChange=/,
      ],
    },
    // Bash
    {
      lenguaje: "bash",
      patrones: [/^#!/, /echo\s+/, /\$\w+/, /if\s+\[/, /then/, /fi$/m, /for\s+\w+\s+in/, /while\s+\[/, /chmod/, /sudo/],
    },
  ]

  // Contar coincidencias para cada lenguaje
  const puntuaciones: { [key: string]: number } = {}

  patrones.forEach(({ lenguaje, patrones: patronesLenguaje }) => {
    puntuaciones[lenguaje] = 0
    patronesLenguaje.forEach((patron) => {
      if (patron.test(codigo)) {
        puntuaciones[lenguaje]++
      }
    })
  })

  // Encontrar el lenguaje con más coincidencias
  const lenguajeDetectado = Object.keys(puntuaciones).reduce((a, b) => (puntuaciones[a] > puntuaciones[b] ? a : b))

  // Si no hay coincidencias suficientes, devolver javascript por defecto
  return puntuaciones[lenguajeDetectado] > 0 ? lenguajeDetectado : "javascript"
}

// Formatear código automáticamente
export function formatearCodigo(codigo: string, lenguaje: string): string {
  // Formateo básico por lenguaje
  switch (lenguaje) {
    case "javascript":
    case "typescript":
    case "react":
      return formatearJS(codigo)
    case "python":
      return formatearPython(codigo)
    case "html":
      return formatearHTML(codigo)
    case "css":
      return formatearCSS(codigo)
    case "json":
      return formatearJSON(codigo)
    default:
      return codigo
  }
}

function formatearJS(codigo: string): string {
  try {
    // Formateo básico para JavaScript
    return codigo
      .replace(/;/g, ";\n")
      .replace(/{/g, " {\n  ")
      .replace(/}/g, "\n}")
      .replace(/,/g, ",\n  ")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n")
  } catch {
    return codigo
  }
}

function formatearPython(codigo: string): string {
  // Formateo básico para Python
  return codigo
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
}

function formatearHTML(codigo: string): string {
  try {
    // Formateo básico para HTML
    const formatted = codigo
    let indent = 0
    const lines = formatted.split("\n")

    return lines
      .map((line) => {
        const trimmed = line.trim()
        if (trimmed.startsWith("</")) {
          indent = Math.max(0, indent - 2)
        }
        const result = " ".repeat(indent) + trimmed
        if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>")) {
          indent += 2
        }
        return result
      })
      .join("\n")
  } catch {
    return codigo
  }
}

function formatearCSS(codigo: string): string {
  try {
    return codigo
      .replace(/{/g, " {\n  ")
      .replace(/}/g, "\n}\n")
      .replace(/;/g, ";\n  ")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n")
  } catch {
    return codigo
  }
}

function formatearJSON(codigo: string): string {
  try {
    return JSON.stringify(JSON.parse(codigo), null, 2)
  } catch {
    return codigo
  }
}
