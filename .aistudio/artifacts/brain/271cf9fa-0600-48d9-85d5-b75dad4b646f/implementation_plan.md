# Rediseño Integral de Identidad Visual y Experiencia Gráfica
## Código Creativo | Processing Java — Dirección Artística: Generative Design / Editorial Computing

Este documento registra la transformación visual y de interacción completada en la plataforma educativa **Código Creativo | centro**, elevando la experiencia a una **publicación editorial programable** inspirada en la obra seminal *Generative Design: Visualize, Program, and Create with Processing* (Bohnacker, Groß, Laub, Lazzeroni) y [generative-gestaltung.de](http://www.generative-gestaltung.de/).

---

### 1. Sistema Visual y Paleta de Tokens (Sección 5.1)

Se implementó con rigor la paleta de color neutral y precisa definida en las especificaciones del proyecto:

| Rol Semántico | Token Hexadecimal | Aplicación en la Interfaz |
| :--- | :--- | :--- |
| **Fondo Principal** | `#F7F6F1` | Lienzo global de lectura, fondo de la aplicación y páginas |
| **Superficie de Trabajo** | `#FFFFFF` | Contenedores editoriales, tarjetas de módulos, editores de código |
| **Texto Principal** | `#141414` | Títulos, bloques de prosa técnica, identificadores de sintaxis |
| **Texto Secundario** | `#626262` | Subtítulos, metadatos, glosas de paso, comentarios de código |
| **Líneas y Divisiones** | `#DEDDD7` | Retícula editorial, bordes ortogonales de 1px, divisores estructurales |
| **Gris Desactivado** | `#A4A4A0` | Números de línea inactivos, estados disabled, marcas secundarias |
| **Azul de Interacción** | `#2868D9` | Botones de ejecución, subrayado de navegación activa, palabras reservadas |
| **Amarillo Cálido (Variación)** | `#D9AA3D` | Foco de selección, badges de modo experimental, highlights |
| **Rojo de Advertencia** | `#D34E43` | Diagnóstico de errores, límites de parámetros en ejecución |

---

### 2. Tipografía y Composición Editorial

- **Sans-serif Contemporánea (`Inter`)**: Utilizada en títulos, explicaciones pedagógicas, botones y encabezados con tracking equilibrado y lectura óptima.
- **Monoespaciada de Precisión (`IBM Plex Mono` / `JetBrains Mono`)**: Aplicada en todos los fragmentos de Processing Java, valores de coordenadas cartesianas, inspección de memoria en el Heap y llamadas a métodos.
- **Disciplina "Zero-Pill"**: Eliminación total de cápsulas, píldoras y esquinas redondeadas decorativas. Todas las tarjetas, botones y contenedores utilizan cortes ortogonales nítidos (border rectilíneo con `border-[#DEDDD7]`), otorgando una personalidad de publicación editorial contemporánea.

---

### 3. Familias Gráficas Generativas Creadas

Se integró una biblioteca de componentes visuales autónomos en HTML5 2D Canvas que funcionan a 60 FPS sin dependencias pesadas:

1. **`GenerativeArtwork.tsx`**:
   - Renderizador algorítmico multiparámetro que asocia a cada tema curricular un algoritmo generativo vivo:
     - **Tema 01 (Coordenadas & Lienzo)**: Retícula con ticks de medición y crosshairs interactivos.
     - **Tema 02 (Variables & Dinámica)**: Radios oscilatorios armónicos con modulación sinusoidal.
     - **Tema 03 (Condicionales & Límites)**: Paredes detectoras y vectores reflejados.
     - **Tema 04 (Ciclos For & Matrices)**: Cuadrículas de rotación angular dependientes del mouse.
     - **Tema 05 (Funciones Modulares)**: Polígonos paramétricos con vértices trigonométricos.
     - **Tema 06 (Clases & POO)**: Agentes esféricos con halos de fuerza y propiedades mutables.
     - **Tema 07 (Arreglos & Enjambres)**: Red nodal con conectividad por distancia euclidiana.
2. **`VariationSeries.tsx` (Sección 3.3)**:
   - Cuarteto de miniaturas en paralelo que muestra la misma fórmula generativa bajo 4 semillas de parámetros distintos, evidenciando el principio de **Código → Regla → Variación**.
3. **`GenerativeHeroCanvas.tsx` (Sección 9)**:
   - Lienzo de cabecera interactivo con 4 algoritmos seleccionables (*Módulos*, *Ondas*, *Partículas*, *Polar*), controles de velocidad y densidad, aleatorización de semilla reproducible y pausa automática al salir del viewport (`IntersectionObserver`).

---

### 4. Componentes y Módulos Sincronizados

- **`src/components/Header.tsx`**: Barra de navegación de una línea con la marca institucional `CC / Código Creativo / centro`, enlaces con subrayado de 2px en `#2868D9` y tag de sincronización en la nube con Firebase.
- **`src/components/HomeView.tsx`**: Página principal con división editorial: zona izquierda explicativa con principios generativos y zona derecha interactiva con el canvas generativo y el catálogo de los 7 módulos del curso.
- **`src/components/oopLab/InteractiveStageCanvas.tsx`**: Lienzo interactivo de simulación con retícula cartesiana, ticks numéricos, inspección de variables vivas y selector de instancias.
- **`src/components/oopLab/LearningPanel.tsx`**: Panel analítico con los 5 momentos de aprendizaje, preguntas conceptuales de opción múltiple, pistas de ingeniería en 3 niveles y gating pedagógico.
- **`src/components/oopLab/ProgressiveCodeEditor.tsx`**: Editor progresivo con pestañas separadas `Sketch.pde` y `Clase.pde`, resaltado de sintaxis Processing Java, descarga independiente o combinada y numeración de líneas.
- **`src/components/oopLab/MethodExplorerPanel.tsx`**: Panel de ejecución de métodos (incluyendo `flotar()` con ruido Perlin desacoplado en $t_X$ y $t_Y$), terminal de comandos y telemetría de memoria Heap.
- **`src/components/oopLab/CustomClassArrayBuilder.tsx`**: Constructor visual de clases con parámetros, eventos de mouse y teclado y exportación de archivos `.pde`.
- **`src/components/ObjectArraysSessionView.tsx`**: Vista de laboratorio de arreglos de objetos y enjambres sincronizada con los tokens editoriales.

---

### 5. Verificación y Calidad

- `compile_applet`: **0 errores de compilación**.
- `lint_applet`: **TypeScript `tsc --noEmit` completado exitosamente con 0 errores**.
- Accesibilidad: Contraste WCAG AAA en textos `#141414` sobre fondo `#F7F6F1` y `#FFFFFF`.
- Reducción de movimiento: Soporte para `prefers-reduced-motion` en todos los bucles de animación `requestAnimationFrame`.
