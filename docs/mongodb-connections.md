# Límite de conexiones de Atlas

La captura de Atlas muestra 503 conexiones frente al límite mostrado de 500, en una ventana de tres horas. Es una métrica de conexiones, no un recuento de usuarios ni de consultas. La imagen no permite atribuir todas las conexiones a esta aplicación ni saber cuántas corresponden a cada despliegue.

La API ya reutilizaba un cliente dentro de cada módulo, pero permitía diez conexiones de trabajo por pool y no fijaba caducidad por inactividad. Las funciones e instancias de Vercel mantienen pools independientes. Además, cada pestaña consultaba sus suscripciones cada quince segundos, incluso oculta. Reducir el número de consultas por carga mejora la latencia, pero también hay que controlar la cantidad de pools, su tamaño y la actividad periódica.

## Configuración de la API

| Opción | Valor | Efecto |
| --- | --- | --- |
| `maxPoolSize` | 3 | Limita las conexiones de trabajo por servidor y proceso. |
| `minPoolSize` | 0 | No mantiene un mínimo de conexiones de trabajo. |
| `maxConnecting` | 1 | Abre como máximo una conexión nueva simultáneamente por pool. |
| `maxIdleTimeMS` | 30000 | Permite cerrar conexiones de trabajo tras treinta segundos sin uso. |
| `waitQueueTimeoutMS` | 5000 | Una operación no espera indefinidamente un socket libre. |
| `serverSelectionTimeoutMS` | 10000 | Acota la búsqueda de un servidor disponible. |
| `appName` | `clase-asistida-api` | Identifica este cliente en las herramientas de MongoDB que muestran nombres de aplicaciones. |

El cliente se comparte en `globalThis` dentro del mismo proceso, incluso ante cargas duplicadas del módulo. Las llamadas concurrentes comparten la misma promesa de conexión. Un fallo cierra el cliente y activa una espera de cinco segundos antes de intentar crear otro pool. Las respuestas de saturación usan HTTP 503, `database-busy` y `Retry-After: 5`.

En Vercel, el cliente se registra con `attachDatabasePool` de `@vercel/functions/db-connections`. Esta integración permite que las conexiones inactivas se liberen antes de suspender una función. Fuera de Vercel no se registra ese ciclo de vida. No se cierra el cliente al terminar cada petición: se reutiliza.

**Tres no es un límite global del clúster.** El driver mantiene sockets de monitoreo adicionales, y cada instancia tiene su propio pool. Los clientes locales, Compass, otros sitios y otros despliegues también pueden consumir conexiones. `maxIdleTimeMS` se aplica a conexiones de trabajo y no garantiza que desaparezcan todos los sockets de monitoreo.

Referencias: [pools del driver de MongoDB](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools/), [gestión de conexiones en funciones](https://www.mongodb.com/docs/atlas/manage-connections-aws-lambda/), [ciclo de vida de pools en Vercel](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#attachdatabasepool).

## Actividad del navegador

- Cada transporte admite hasta cuatro peticiones simultáneas. La espera en la cola cuenta dentro del plazo de cada petición; cancelar una petición en espera no bloquea las siguientes.
- El contenido se consulta cada sesenta segundos en una pestaña visible y con conexión. El directorio de administradores conserva su intervalo de quince segundos mientras la pestaña está activa.
- Al ocultar la pestaña o perder conexión se cancelan los próximos ciclos. Las peticiones ya iniciadas pueden terminar.
- Al volver a la pestaña o recuperar la conexión se actualizan las suscripciones. Los eventos de foco y visibilidad simultáneos no provocan una segunda actualización idéntica pendiente.
- Los errores esperan al menos cinco segundos y aumentan la espera hasta sesenta segundos, con variación aleatoria para distribuir los reintentos entre pestañas. Se respeta un `Retry-After` numérico, acotado a dos minutos, incluso al recuperar el foco. Un guardado durante una lectura fallida no fuerza un reintento inmediato.
- Las escrituras que afectan una suscripción siguen actualizándola inmediatamente cuando la pestaña está activa. El servidor verifica los permisos de cada operación.

## Validación y publicación

Las pruebas simulan cuarenta llamadas simultáneas a la conexión y dos cargas del módulo: deben crear un solo cliente y registrar una sola integración de Vercel. También simulan recuperación tras fallos, ráfagas de doce peticiones, pestañas ocultas, pérdida de red, plazos de espera y respuestas de saturación. No se necesita abrir cuarenta conexiones reales ni generar carga sobre Atlas.

Publicar juntos `package.json`, `package-lock.json`, `server/` y los cambios de `src/`. Recargar las pestañas abiertas para que usen el navegador actualizado. Comparar en Atlas las conexiones, rechazos y actividad antes y después con tráfico semejante; no confundir el máximo histórico de la ventana con la cifra actual. Las conexiones de instancias anteriores pueden permanecer hasta que esos procesos liberen recursos o terminen.

Si continúa cerca del límite, revisar las instancias activas y despliegues de Vercel, procesos de desarrollo, clientes administrativos y otras aplicaciones del clúster. Un pool pequeño por instancia ayuda a reducir el consumo, pero no sustituye un presupuesto de conexiones para todos los procesos ni permite prometer un total global a partir del código solamente.
