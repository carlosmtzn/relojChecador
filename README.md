# Control de Jornada Laboral (Reloj Checador)

Aplicación web progresiva (PWA) para el registro, seguimiento en tiempo real e historial semanal del cumplimiento de la jornada laboral reglamentaria (9 horas y 15 minutos base mas minutos adicionales de comida).

## Características principales

- Calculo automático de hora de salida estimada con base en 9 horas y 15 minutos más minutos adicionales de comida.
- Selectores de hora interactivos tipo rueda de desplazamiento con ciclo infinito para horas y minutos.
- Opción de ingreso de hora y minutos mediante texto plano directo sincronizado bidireccionalmente con los selectores de scroll.
- Barra de progreso visual y contador regresivo en tiempo real con actualización en el título de la pestaña.
- Alerta visual en modal superpuesto al cumplirse la jornada con opción de posponer 5 minutos.
- Botón para capturar y confirmar formalmente la hora de entrada de cada día.
- Historial semanal persistente en almacenamiento local (localStorage), agrupado de lunes a domingo con sumatoria total de horas.
- Posibilidad de confirmar la salida diaria y editar la hora de salida de días anteriores o en curso.
- Modo oscuro sobrio con paleta corporativa (azul marino, pizarra, blanco y gris) totalmente responsivo para computadoras y dispositivos móviles.
- Compatible con PWA para instalación como aplicación independiente sin conexión mediante Service Worker.

## Estructura del proyecto

- `index.html`: Estructura semántica, panel de control, modal y sección de historial.
- `estilos.css`: Hoja de estilos con variables CSS, paleta oscura y diseño responsivo.
- `aplicacion.js`: Lógica de cálculo, selectores de desplazamiento, persistencia y gestión de historial.
- `manifest.json`: Manifiesto para instalación como Progressive Web App (PWA).
- `sw.js`: Service Worker para funcionamiento sin conexión y gestión de caché.
- `icono.svg`: Icono corporativo en formato vectorial SVG.

## Uso

1. Abrir `index.html` en cualquier navegador web moderno o servir la carpeta mediante un servidor local estático.
2. Seleccionar o escribir la hora de entrada y los minutos adicionales tomados en la comida.
3. Presionar "Capturar hora de entrada" para fijar la entrada del día en el historial.
4. Al concluir la jornada, confirmar la salida para completar el registro y totalizar las horas semanales.
