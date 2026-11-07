# Carga del contenido guardado

La lentitud provenía de consultas por cada nodo y sección, comprobaciones secuenciales de sus antecesores en MongoDB, peticiones repetidas y la recarga completa del temario al navegar. El CMS también esperaba las evidencias de todos los estudiantes y el historial al entrar, aunque esas pestañas no se abrieran.

El temario en MongoDB ahora lee siete colecciones en paralelo, conservando la paginación. MongoDB consulta los antecesores de cada página por grupos antes de aplicar las mismas reglas de visibilidad. El caché de esos antecesores dura una sola petición. El transporte comparte únicamente lecturas simultáneas de la misma sesión; no conserva respuestas entre peticiones ni después de guardar cambios. Guardar avances ya no vuelve a consultar contenido ni permisos que no cambiaron. Firestore local conserva las consultas públicas limitadas a cada antecesor que requieren sus reglas.

La navegación entre lecciones reutiliza el temario confirmado. Se actualiza al regresar del CMS, recuperar el foco de la ventana, recuperar la conexión o pulsar Reintentar. Si falla una actualización, se conserva el último contenido confirmado y se muestra el error. Si todavía no hay contenido confirmado, se muestra la carga o el error sin sustituirlo por las lecciones originales. Perder acceso de administrador oculta inmediatamente los borradores.

En el CMS, las lecturas principales ocurren en paralelo. Las evidencias, el historial y la sincronización de referencias de categorías se ejecutan al abrir sus secciones. Las actualizaciones de referencias usan lotes. Los formularios esperan su configuración guardada; los estados de publicación tampoco sustituyen errores por datos locales ni reportan como exitoso un guardado rechazado. Los valores predeterminados siguen completando documentos inexistentes o campos nunca configurados después de una lectura correcta.

## Medición del servidor

Comparación de una página pública contra la base configurada localmente, usando el código anterior de `HEAD` y el optimizado, sobre la misma conexión de MongoDB. Solo se ejecutaron lecturas. Las cuentas incluyen `find` y `getMore`.

| Colección | Consultas antes → después | Tiempo antes → después | Documentos visibles |
| --- | --- | --- | --- |
| `cms_node_blocks` | 50 → 3 | 3745 ms → 236 ms | 170 |
| `cms_blocks` | 88 → 5 | 6218 ms → 383 ms | 100 |

Las respuestas anteriores y nuevas tuvieron el mismo SHA-256. Estos tiempos miden esas consultas desde esta computadora; no son tiempos de carga completos del navegador ni una medición del despliegue nuevo en Vercel.

## Validación después de desplegar

1. Publicar juntos `server/dataService.mjs` y los cambios de `src/`. La optimización mantiene el contrato de `/api/data` y no requiere migrar datos.
2. Abrir la portada y una lección con Network visible. Comprobar que abrir otra lección no vuelva a descargar el temario completo.
3. Entrar al CMS. Las lecturas de `users`, evidencias y `cms_revisions` deben aparecer al abrir sus secciones, sin bloquear la entrada inicial.
4. Bloquear `/api/data` antes de abrir una pestaña nueva. Debe aparecer un error con Reintentar, sin temario original ni formularios editables con configuración provisional.
5. Con contenido ya cargado, simular un fallo durante una actualización. Debe conservarse el último contenido confirmado con un aviso de error. Desbloquear la API y reintentar debe recuperar la lectura.
6. Comprobar como visitante que borradores, contenido oculto y metadatos privados siguen excluidos. Cerrar una sesión administradora mientras se previsualizan borradores debe ocultarlos.

Las pruebas en `dataPerformance.test.mjs`, `curriculumLoading.test.mjs`, `mongodb.test.mjs` y `cms.test.mjs` cubren número de consultas, igualdad de visibilidad, privacidad, navegación, recuperación de errores y guardados rechazados.

La cantidad de conexiones se controla por separado del número de consultas. Consulta [límites de pools, actividad de pestañas y comprobación en Atlas](mongodb-connections.md) para los ajustes adicionales ante saturación de conexiones.
