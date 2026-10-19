# Plataforma Educativa Código Creativo | centro: Rediseño de Navegación, Página de Inicio y Modo Enfocado

Propuesta arquitectónica y de diseño para reestructurar la plataforma educativa de la asignatura **Código Creativo | centro**. Se sustituye la cabecera sobrecargada por un flujo intuitivo y ligero de dos niveles: una página de **Inicio (Home)** que presenta el curso, el progreso y los módulos temáticos, y un **Modo Enfocado** con retorno directo para el taller interactivo de Clases y POO.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> A continuación se resumen las decisiones acordadas a partir de las respuestas y retroalimentación del usuario, listas para su aprobación final antes de la codificación.

- **Identidad del Header (Actualizada por el usuario)**: En el encabezado principal, en lugar de "Processing", la marca será **`Código Creativo | centro`**, con tipografía limpia y minimalista.
- **Navegación principal simplificada (Confirmada)**: Se desacopla la navegación del taller de la barra global. El encabezado superior ahora es mínimo y espacioso: Marca/Logo (**`Código Creativo | centro`**), enlaces limpios a *Inicio* y *Temario*, y acceso a la cuenta del estudiante (*Perfil / Sincronización*).
- **Nueva página de Inicio / Home (Confirmada)**: Presenta una bienvenida clara sin saturación visual, tarjeta de progreso general del alumno, acceso destacado al taller interactivo de *Estructura de una Clase (POO)* y la cuadrícula completa de módulos curriculares de Processing.
- **Transición y Modo Enfocado de Taller (Confirmada)**: Al ingresar al Taller de Clases o a un tema específico, la interfaz entra en un entorno de aprendizaje enfocado con un botón superior `← Volver al Inicio`, eliminando distracciones visuales y manteniendo las 4 etapas del taller (Estructura, Ubicar, Sintaxis, Construir) en un sub-encabezado contextual específico del ejercicio.

---

### 1. Overview & Core Concept

- **Qué resuelve**: Elimina la confusión provocada por una barra superior saturada con controles heterogéneos (temas, etapas, contadores de progreso, botones de reinicio y login compitiendo en el mismo espacio).
- **Audiencia objetivo**: Estudiantes y profesores de diseño, animación y artes digitales de CENTRO que cursan la materia de Código Creativo.
- **Valor clave**: La plataforma cuenta con una "puerta de entrada" natural (Home) que contextualiza el curso entero, mientras que los talleres prácticos se experimentan como sesiones de trabajo claras, legibles y tranquilas.

---

### 2. User Experience & Visual Design

#### A. Flujo de Navegación
1. **Vista de Inicio (Home)**:
   - **Hero editorial sobrio**: Título institucional **Código Creativo | centro**, subtítulo sintético y estado del alumno (ej. "Bienvenido, Juan · jmartineza@centro.edu.mx · Progreso general: 25%").
   - **Taller Interactivo Destacado**: Tarjeta de gran legibilidad que invita a continuar o iniciar el taller *Tema 06: Anatomía de una Clase (POO)* con un resumen claro de las 4 etapas.
   - **Módulos del Curso**: Cuadrícula de 7 temas fundamentales (Sintaxis básica, Variables, Estructuras de control, Funciones, Arreglos, Clases y POO, Gráficos y Librerías) con indicador de estado (Completado / Disponible) y clic directo a su contenido.
2. **Vista de Taller Práctico (Modo Enfocado)**:
   - Barra superior contextual con navegación de retorno: `← Volver al Temario / Inicio` y título del taller activo.
   - Barra de etapas (1. Estructura, 2. Ubicar, 3. Sintaxis, 4. Construir) limpia y espaciada con retroalimentación sutil de completado.
   - Espacio de trabajo amplio sin desbordamientos ni elementos redundantes.

#### B. Identidad Visual y Estilo (Anti-Slop & B&W Elegante)
- **Paleta de color (60-30-10)**:
  - Fondo blanco puro (`#FFFFFF`) y fondos de paneles sutiles (`#FAFAFA` / `#F4F4F5`).
  - Tipografía en negro profundo (`#09090B`) y grises neutros de apoyo (`#71717A`).
  - Cero cápsulas o "pills" decorativas innecesarias: metadatos con separadores tipográficos limpios (`Tema 06 · POO · 4 Etapas`).
  - Colores sintácticos de Processing Java restringidos exclusivamente a los bloques de código (naranja `#E2661A` para tipos y palabras reservadas, cian `#006699` para funciones, verde oliva `#339933` para variables del sistema).
- **Métricas táctiles y espaciales**:
  - Botones y controles con altura mínima de 44px para accesibilidad táctil.
  - Márgenes consistentes basados en múltiplos de 8px (16px, 24px, 32px).
  - Jerarquía clara de títulos (`h1`, `h2`, `h3`) con interlineado relajado.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Separar la Vista de Inicio de la Vista de Taller Práctico**
  - *Enfoque*: El estado raíz de la aplicación pasa a ser `view: 'home' | 'workshop' | 'topic-viewer'`.
  - *Por qué*: Evita que la pantalla inicial sea inmediatamente el formulario de la etapa 1 del taller sin contexto de qué curso es ni qué otros temas existen.
  - *Alternativa descartada*: Mantener un modal desplegable para el temario sobre el taller; resultaba claustrofóbico y confuso.
- **Decisión 2: Header Global Mínimo de 3 Bloques con la Marca Solicitada**
  - *Enfoque*: `[Código Creativo | centro]` a la izquierda, `[Inicio | Temario]` al centro, y `[Perfil de Estudiante / Entrar]` a la derecha.
  - *Por qué*: Descongestiona la vista y sigue el modelo mental intuitivo de cualquier plataforma educativa universitaria.
- **Decisión 3: Persistencia Híbrida Transparente**
  - *Enfoque*: Mantener sincronización automática en Firebase Firestore para usuarios autenticados con Google (`@centro.edu.mx`), con respaldo inmediato en `localStorage` si no hay sesión abierta.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Header                                   │
│  [Código Creativo | centro]          [Inicio] [Temario]       [Perfil] │
└────────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│           Home View             │         │      Focused Workshop View      │
│ ┌─────────────────────────────┐ │         │ ┌─────────────────────────────┐ │
│ │ Student Progress Banner     │ │         │ │ ← Volver al Inicio          │ │
│ └─────────────────────────────┘ │         │ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │         │ ┌─────────────────────────────┐ │
│ │ Featured Workshop (POO)     │ │         │ │ Workshop Stage Bar (1-4)    │ │
│ └─────────────────────────────┘ │         │ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │         │ ┌─────────────────────────────┐ │
│ │ Curriculum Topics Grid (1-7)│ │         │ │ Stage Content / Exercises   │ │
│ └─────────────────────────────┘ │         │ └─────────────────────────────┘ │
└─────────────────────────────────┘         └─────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       ┌────────────────────────┐    ┌────────────────────────┐
       │ Firebase Auth & Cloud  │    │ Local Storage Fallback │
       │ Firestore Persistence  │    │  (Instant Zero-Lag)    │
       └────────────────────────┘    └────────────────────────┘
```

#### Mapeo de Componentes y Vistas
- **`src/components/HomeView.tsx`**: Componente de página principal con el banner de progreso, la tarjeta del taller interactivo de clases y la cuadrícula de temas curriculares.
- **`src/components/Header.tsx`**: Encabezado refinado con la marca **Código Creativo | centro**, navegación Inicio/Temario y botón de sesión/perfil.
- **`src/components/WorkshopView.tsx`**: Envoltura enfocada del taller de 4 etapas que incorpora la barra de etapas, el botón de retorno y el espacio de trabajo.
- **`src/App.tsx`**: Orquestador del estado de navegación (`activeView: 'home' | 'workshop' | 'topic'`), autenticación de Firebase y sincronización de progreso.

---

### Plan de Verificación Post-Aprobación
1. Compilar el proyecto con `compile_applet` y validar TypeScript con `lint_applet`.
2. Verificar en la interfaz la navegación fluida: Home $\to$ Iniciar Taller $\to$ Etapas $\to$ Volver a Home.
3. Comprobar la sincronización en la nube al iniciar sesión con Google y la persistencia local de los avances.
