# SismoListo

Preparación situacional ante sismos para estudiantes universitarios y trabajadores de oficina.
Proyecto académico · UPC · IHC y Tecnologías Móviles 2026-2.

## Cómo ejecutarlo

```bash
npm install     # solo la primera vez
npm start       # http://localhost:4200 (o: npx ng serve --port 4300)
```

## Cuentas de demostración

| Portal | Correo | Contraseña |
|---|---|---|
| 🎓 Estudiante | `estudiante@sismolisto.pe` | `Sismo2026` |
| 💼 Oficina | `oficina@sismolisto.pe` | `Sismo2026` |

Cada portal valida el tipo de cuenta y tiene su propia identidad visual (verde = estudiante, índigo = oficina).

## Capa interactiva

- **Campo sísmico** (canvas): malla que reacciona al mouse; clic en el fondo = epicentro con ondas P/S.
- **Simulacro de alerta sísmica**: sirena y retumbo sintetizados con WebAudio, vibración en móvil,
  cuenta regresiva y las tres acciones (agáchate con ↓, cúbrete con 1-4, sujétate manteniendo presionado) con puntaje y récord.
- **Laboratorio de magnitud**: deslizador M2–9.5, escena de aula u oficina que tiembla, objetos que caen,
  intensidad aproximada, energía relativa, sismógrafo en vivo y fichas de riesgo al tocar cada objeto.
- **Portal 3D por rol**: tarjetas con inclinación y reflejo según el mouse; login con selector de rol y autocompletado demo.
- **Sismo global**: botón "Sacudir la página"; respeta `prefers-reduced-motion`.


**Landing (`/`)**: hero con sismógrafo animado y mockup de celular interactivo ("Simular sacudida"),
problema con datos de contexto, 4 pasos con autoplay, funciones (bento), público objetivo,
micro-simulacros, beneficios por perfil, comparativa, testimonios ilustrativos (carrusel),
recursos con filtro, descarga simulada con QR, FAQ, formulario de contacto con validación,
modales de compartir / descarga / privacidad, modo claro/oscuro y diseño mobile-first.

**App (`/app`, requiere cuenta de demostración o modo invitado)**
- **Inicio**: índice de preparación (0-100), KPIs, plan del día, riesgos prioritarios, consejo diario.
- **Evaluar espacio**: asistente guiado por ambiente (aula, laboratorio, biblioteca, oficina…),
  atajos de teclado 1/2/3, borrador automático y aviso "¿Deseas guardar antes de salir?".
  Cada respuesta "No" se convierte en un riesgo registrado.
- **Mis riesgos**: filtros, búsqueda, registro manual, resolver/reabrir, eliminar con confirmación.
- **Zonas y rutas**: plano SVG interactivo (aula y oficina), capas, detalle de cada elemento,
  bloqueo de la salida principal con ruta alterna animada.
- **Micro-simulacros**: 6 escenarios con cuenta regresiva, temporizador por escena, sacudida
  (y vibración en móvil), opciones aleatorias, retroalimentación y récord personal.
- **Checklist**: mochila de emergencia, espacio y comunicación + números de emergencia de Perú.
- **Progreso**: composición del índice, gráfico de resultados, logros, racha e historial.
- **Perfil**: editar datos, modo oscuro, exportar datos (JSON) y reiniciar progreso.

## Arquitectura

Angular 21 (standalone, signals, zoneless). Misma convención que ReclamaYA:
`components/<nombre>component`, `services/<nombre>service.ts`, `models/<Nombre>DTO.ts`.

```
src/app/
  components/   landing, navbar, footer, auth (ingresar/registro), panel, inicio, evaluar,
                riesgos, mapa, simulacros (+ jugar), checklist, progreso, perfil, icon, logo, toast
  services/     authservice, datosservice, temaservice, toastservice
  models/       UsuarioDTO, EvaluacionDTO, RiesgoDTO, SimulacroDTO, ContenidoDTO
  data/         contenido.ts (espacios, preguntas, recursos, checklist…), simulacros.ts
  shared/       guards (sesión, invitado, cambios sin guardar), reveal (animación), storage
```

Los datos se guardan **solo en localStorage** (no hay backend). Las cuentas son de demostración:
no usar contraseñas reales. Los planos, rutas y testimonios son ficticios y didácticos;
ante un sismo real deben seguirse los protocolos oficiales de INDECI y de cada institución.
