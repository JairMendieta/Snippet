# 📝 Gestor de Snippets - Tu Cofre de Código Personal

*Aplicación web para organizar, buscar y reutilizar fragmentos de código de manera eficiente*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jairmendieta555-2827s-projects/v0-snippet-manager-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/lNLlIz17Fqw)

## 🎯 ¿De qué se trata este proyecto?

Este proyecto es una **aplicación web moderna para la gestión de snippets de código** que permite a los desarrolladores:

- **Organizar** fragmentos de código de forma estructurada
- **Buscar** snippets rápidamente con filtros avanzados
- **Reutilizar** código probado y funcional
- **Categorizar** snippets por lenguaje, categoría y etiquetas
- **Estadísticas** de uso para optimizar tu flujo de trabajo

## ✨ Características principales

### 🔍 **Búsqueda y Filtrado Avanzado**
- Búsqueda por título, descripción o contenido
- Filtros por lenguaje de programación
- Filtros por categoría y etiquetas
- Soporte para expresiones regulares
- Filtrado por snippets favoritos

### 📊 **Dashboard de Estadísticas**
- Total de snippets por lenguaje
- Distribución por categorías
- Snippets más utilizados
- Snippets recientes

### 🎨 **Editor de Código Profesional**
- Editor Monaco (mismo que VS Code)
- Resaltado de sintaxis para 20+ lenguajes
- Numeración de líneas
- Autocompletado y validación

### 🏷️ **Sistema de Organización**
- Categorías predefinidas (Frontend, Backend, Utilidades, etc.)
- Sistema de etiquetas personalizable
- Marcado de favoritos
- Historial de cambios

### 📱 **Interfaz Moderna**
- Diseño responsive
- Vistas de grid y lista
- Tema claro/oscuro
- Interfaz en español

## 🚀 Tecnologías utilizadas

- **Framework**: Next.js 14 con React 18
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: Radix UI
- **Editor**: Monaco Editor
- **Estado**: Zustand
- **Almacenamiento**: Local Storage
- **Despliegue**: Vercel

## 📦 Lenguajes soportados

JavaScript, TypeScript, Python, HTML, CSS, Java, C++, C#, PHP, Ruby, Go, Rust, SQL, JSON, YAML, Markdown, Bash, PowerShell, Swift, Kotlin, Dart, Vue, React, Angular

## 🏗️ Estructura del proyecto

```
├── app/                    # Páginas de Next.js
│   ├── configuracion/     # Configuración de la app
│   ├── nuevo/             # Crear nuevo snippet
│   ├── plantillas/        # Plantillas predefinidas
│   └── snippet/           # Vista/edición de snippets
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y tipos
│   ├── types.ts          # Definiciones de tipos
│   ├── storage.ts        # Gestión de almacenamiento
│   └── utils.ts          # Funciones auxiliares
└── hooks/                # Hooks personalizados
```

## 🎯 Casos de uso

- **Desarrolladores individuales**: Organizar snippets personales
- **Equipos de desarrollo**: Compartir patrones de código comunes
- **Estudiantes**: Guardar ejemplos de código para estudiar
- **Educadores**: Crear bibliotecas de código para enseñanza

## 📈 Despliegue

Tu proyecto está disponible en:
**[https://vercel.com/jairmendieta555-2827s-projects/v0-snippet-manager-app](https://vercel.com/jairmendieta555-2827s-projects/v0-snippet-manager-app)**

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 🤝 Contribución

Este proyecto fue creado con [v0.dev](https://v0.dev/chat/projects/lNLlIz17Fqw) y se mantiene sincronizado automáticamente.

---

*Este proyecto representa una solución completa para la gestión de snippets de código, diseñada para mejorar la productividad de los desarrolladores mediante una interfaz intuitiva y funcionalidades avanzadas.*
