# Sistema Web de Gestión y Reservas — Royal Technology

Proyecto de **Ingeniería de Software I** (ESPOL, Facultad de Ingeniería en Electricidad y Computación), Grupo 3.

Prototipo web para gestionar reservas de oficinas privadas, espacios de coworking, salas de reuniones y estudios de podcast de Royal Technology: tarifario, disponibilidad, reservas con facturación, comprobantes de pago, saldos a favor, incidencias y métricas.

## Integrantes

- Flores Martinez Christopher Mesias
- Villarroel Benitez Victor Adrian
- Fierro Carrion Juan Diego
- Poveda Guerra Jeremias Davide
- Rojas San Andres Eloy Ransesx

Profesor: Ing. Vanessa Alexandra Jurado Vite
Cliente: Royal Technology

## Cómo ejecutar el prototipo

No requiere instalación. Abra `prototipo/index.html` en un navegador moderno (se necesita conexión a internet solo para las imágenes del catálogo).

Inicio de sesión (el prototipo no valida contraseñas):

| Rol | Correo de ejemplo | Pantalla |
|---|---|---|
| Cliente | `cliente@gmail.com` (cualquier correo con `@`) | Portal del cliente |
| Administrador | `usuario@admin` (cualquier correo que termine en `@admin`) | Panel gerencial |

Los datos se guardan en el `localStorage` del navegador. Para reiniciar la demo, borre los datos del sitio.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `prototipo/` | Prototipo en HTML, CSS y JavaScript (`index.html`, `pages/`, `css/`, `js/`) |
| `evidencias/reuniones/` | Actas y capturas de las reuniones con el Product Owner |
| `evidencias/scrum/` | Evidencias de Scrum: tablero de Trello, Planning Poker y sprint planning |
| `evidencias/levantamiento/` | Técnicas de levantamiento de requerimientos (entrevistas, notas, correos) |
| `documentos/` | Documento de Especificación de Requerimientos (PDF) y su fuente LaTeX |
| `diagramas/` | Diagrama PERT y flujo de ventanas |

## Metodología y técnicas usadas

- **Scrum** con el cliente como Product Owner, tres sprints y tablero en Trello.
- **Levantamiento de requerimientos:** reuniones por Microsoft Teams con representantes de Royal Technology (16 y 23 de octubre de 2026).
- **Historias de usuario** con criterios de aceptación.
- **Estimación** con Planning Poker (escala de Fibonacci modificada).
- **Planificación** con diagrama PERT y cálculo de holguras.
- **Prototipado** navegable en HTML, CSS y JavaScript.

## Enlaces

- Tablero de Trello: https://trello.com/b/iU1pm31B/sprint-planning
- Repositorio: https://github.com/juandaxz/isw1-grupo3-royal-technology
- Documento de requerimientos: `documentos/`
