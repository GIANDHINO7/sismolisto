import { SimulacroDTO } from '../models/SimulacroDTO';

/**
 * Escenarios hipotéticos de entrenamiento (máx. 60 s en total).
 * El contenido es didáctico y no sustituye los protocolos oficiales.
 */
export const SIMULACROS: SimulacroDTO[] = [
  {
    id: 'salida-bloqueada',
    titulo: 'Salida principal bloqueada',
    resumen: 'Elige cómo reaccionar cuando la salida habitual del aula no está disponible.',
    espacio: 'Aula', dificultad: 'Básico', color: '#0E9F6E',
    escenas: [
      {
        evento: 'SISMO EN CURSO', sacudida: true, segundos: 20,
        titulo: 'Empieza a temblar fuerte durante la clase.',
        texto: 'Estás sentado al fondo del aula. Hay una columna a dos metros y una ventana a tu derecha.',
        opciones: [
          { texto: 'Me ubico junto a la columna, me agacho y protejo cabeza y cuello.', calidad: 'good', feedback: 'Correcto. Si no puedes salir de forma segura mientras tiembla, un elemento estructural lejos de ventanas es la mejor opción.' },
          { texto: 'Corro hacia la puerta mientras sigue temblando.', calidad: 'bad', feedback: 'Correr durante la sacudida aumenta el riesgo de caídas y golpes. Espera a que pase el movimiento fuerte.' },
          { texto: 'Me quedo sentado junto a la ventana para ver qué pasa.', calidad: 'bad', feedback: 'Los vidrios pueden romperse. Aléjate de ventanas y objetos que puedan caer.' },
        ],
      },
      {
        evento: 'EVENTO INESPERADO', segundos: 20,
        titulo: 'El sismo termina, pero un estante cayó frente a la puerta principal.',
        texto: 'Tus compañeros empiezan a amontonarse frente a la salida bloqueada.',
        opciones: [
          { texto: 'Indico la puerta secundaria señalizada y avanzo sin correr.', calidad: 'good', feedback: 'Bien. Conocer una ruta alternativa evita embudos. Por eso conviene ubicar todas las salidas al entrar a un ambiente.' },
          { texto: 'Intento mover el estante con dos compañeros.', calidad: 'mid', feedback: 'Puede funcionar, pero pierdes tiempo y te expones a lesiones. Si hay otra salida, úsala primero.' },
          { texto: 'Espero a que alguien más decida qué hacer.', calidad: 'bad', feedback: 'Quedarse quieto tras el sismo te expone a réplicas. Busca la ruta alternativa y sigue a la brigada.' },
        ],
      },
      {
        evento: 'EVACUACIÓN', segundos: 20,
        titulo: 'Llegas al pasillo. Hay escaleras y un ascensor.',
        texto: 'Estás en el tercer piso y el punto de reunión está en el patio.',
        opciones: [
          { texto: 'Bajo por las escaleras por la derecha, sin correr ni empujar.', calidad: 'good', feedback: 'Correcto. Nunca uses ascensores tras un sismo: pueden quedarse detenidos por cortes de energía.' },
          { texto: 'Uso el ascensor para bajar más rápido.', calidad: 'bad', feedback: 'Los ascensores pueden fallar o quedar atrapados entre pisos. Usa siempre las escaleras.' },
          { texto: 'Regreso al aula por mi mochila.', calidad: 'bad', feedback: 'Volver por pertenencias retrasa la evacuación y te expone a réplicas.' },
        ],
      },
    ],
  },
  {
    id: 'corte-luz',
    titulo: 'Corte de luz durante la clase',
    resumen: 'Evalúa alternativas ante una interrupción eléctrica inesperada en pleno sismo.',
    espacio: 'Aula', dificultad: 'Intermedio', color: '#3B82F6',
    escenas: [
      {
        evento: 'SISMO + APAGÓN', sacudida: true, segundos: 18,
        titulo: 'Tiembla y se va la luz. El aula queda casi a oscuras.',
        texto: 'Escuchas gritos y ruido de carpetas moviéndose.',
        opciones: [
          { texto: 'Me agacho, me cubro la cabeza y espero a que pase la sacudida.', calidad: 'good', feedback: 'Correcto. Primero protégete; la oscuridad hace aún más peligroso desplazarse mientras tiembla.' },
          { texto: 'Enciendo la linterna del celular y busco la salida de inmediato.', calidad: 'mid', feedback: 'La linterna es útil, pero úsala cuando termine la sacudida fuerte. Primero protégete.' },
          { texto: 'Grito para que todos salgan rápido.', calidad: 'bad', feedback: 'Gritar genera pánico. Mantén la calma y da instrucciones claras cuando sea seguro moverse.' },
        ],
      },
      {
        evento: 'TRAS EL SISMO', segundos: 22,
        titulo: 'Terminó el movimiento. Sigue sin haber luz.',
        texto: 'Las luces de emergencia del pasillo están encendidas, pero el aula está oscura.',
        opciones: [
          { texto: 'Uso la linterna, sigo la señalización luminosa y salgo en fila.', calidad: 'good', feedback: 'Bien. Las luces de emergencia y la señalización fotoluminiscente existen justamente para esto.' },
          { texto: 'Enciendo un encendedor para ver mejor.', calidad: 'bad', feedback: 'Nunca uses fuego tras un sismo: puede haber fugas de gas.' },
          { texto: 'Me quedo en el aula hasta que vuelva la luz.', calidad: 'mid', feedback: 'Quedarte puede exponerte a réplicas. Si la ruta es segura, evacúa con apoyo de la brigada.' },
        ],
      },
      {
        evento: 'PUNTO DE REUNIÓN', segundos: 20,
        titulo: 'Llegas al patio. Un compañero no aparece.',
        texto: 'La brigada está pasando lista.',
        opciones: [
          { texto: 'Aviso a la brigada quién falta y dónde lo vi por última vez.', calidad: 'good', feedback: 'Excelente. Informar permite que personal capacitado lo busque de forma segura.' },
          { texto: 'Vuelvo solo al edificio a buscarlo.', calidad: 'bad', feedback: 'Reingresar sin autorización es muy riesgoso por posibles réplicas o daños estructurales.' },
          { texto: 'Le escribo por WhatsApp y espero.', calidad: 'mid', feedback: 'Puede ayudar, pero lo primero es informar a la brigada para que actúe.' },
        ],
      },
    ],
  },
  {
    id: 'objetos-oficina',
    titulo: 'Objetos cayendo en la oficina',
    resumen: 'Identifica una acción prudente ante objetos potencialmente peligrosos.',
    espacio: 'Oficina', dificultad: 'Básico', color: '#F5A524',
    escenas: [
      {
        evento: 'SISMO EN CURSO', sacudida: true, segundos: 20,
        titulo: 'Estás en tu escritorio y empiezan a caer archivadores.',
        texto: 'A tu espalda hay un estante con carpetas y un monitor grande al frente.',
        opciones: [
          { texto: 'Me alejo del estante hacia la columna más cercana y me protejo.', calidad: 'good', feedback: 'Correcto. Aléjate de lo que pueda caer y protégete junto a un elemento estructural.' },
          { texto: 'Sujeto el monitor para que no se caiga.', calidad: 'bad', feedback: 'Los equipos se reemplazan; tu integridad no. No te quedes sujetando objetos.' },
          { texto: 'Me meto debajo del escritorio y sujeto una pata.', calidad: 'mid', feedback: 'Puede protegerte de objetos que caen si el escritorio es resistente, pero lejos del estante. Prioriza zonas sin objetos en altura.' },
        ],
      },
      {
        evento: 'TRAS EL SISMO', segundos: 20,
        titulo: 'El pasillo tiene carpetas y vidrios en el suelo.',
        texto: 'Tus colegas empiezan a salir hacia la escalera.',
        opciones: [
          { texto: 'Avanzo con calzado puesto, mirando el piso y sin correr.', calidad: 'good', feedback: 'Bien. Los vidrios y objetos sueltos causan muchas lesiones tras un sismo.' },
          { texto: 'Me detengo a recoger documentos importantes.', calidad: 'bad', feedback: 'Recoger cosas retrasa la evacuación. Los documentos importantes deben estar respaldados antes.' },
          { texto: 'Salgo corriendo para llegar primero.', calidad: 'bad', feedback: 'Correr sobre escombros aumenta el riesgo de caídas y empujones.' },
        ],
      },
      {
        evento: 'PUNTO DE REUNIÓN', segundos: 20,
        titulo: 'Ya en la calle, el punto de reunión está junto a un muro alto.',
        texto: 'Hay postes y cables eléctricos cerca.',
        opciones: [
          { texto: 'Me ubico en el área abierta señalizada, lejos de muros y cables.', calidad: 'good', feedback: 'Correcto. Una zona segura externa debe estar lejos de fachadas, postes y cables.' },
          { texto: 'Me apoyo en el muro para descansar.', calidad: 'bad', feedback: 'Los muros pueden colapsar con una réplica. Aléjate de estructuras.' },
          { texto: 'Me voy a casa directamente.', calidad: 'mid', feedback: 'Retirarte sin avisar complica el conteo de la brigada. Repórtate primero.' },
        ],
      },
    ],
  },
  {
    id: 'laboratorio',
    titulo: 'Derrame en el laboratorio',
    resumen: 'Decide qué hacer cuando un sismo provoca la caída de reactivos durante una práctica.',
    espacio: 'Laboratorio', dificultad: 'Avanzado', color: '#E5484D',
    escenas: [
      {
        evento: 'SISMO EN CURSO', sacudida: true, segundos: 18,
        titulo: 'Tiembla mientras calientas una muestra en el mechero.',
        texto: 'Hay frascos de reactivos en la repisa superior.',
        opciones: [
          { texto: 'Cierro la llave de gas si está a mi alcance y me alejo de las repisas.', calidad: 'good', feedback: 'Correcto. Cortar la fuente de calor en un segundo y alejarte de los reactivos reduce el riesgo de incendio.' },
          { texto: 'Sostengo los frascos para que no caigan.', calidad: 'bad', feedback: 'Exponerte a sustancias peligrosas es más riesgoso que perder los reactivos.' },
          { texto: 'Salgo corriendo del laboratorio.', calidad: 'bad', feedback: 'Correr durante la sacudida en un ambiente con vidrio y químicos es muy peligroso.' },
        ],
      },
      {
        evento: 'DERRAME', segundos: 22,
        titulo: 'Se rompieron dos frascos y hay olor fuerte.',
        texto: 'El sismo terminó. El docente indica evacuar.',
        opciones: [
          { texto: 'Salgo cubriéndome nariz y boca, sin pisar el derrame.', calidad: 'good', feedback: 'Bien. Evita el contacto e inhalación y deja la limpieza a personal capacitado.' },
          { texto: 'Intento limpiar el derrame con papel.', calidad: 'bad', feedback: 'No manipules sustancias desconocidas sin equipo de protección.' },
          { texto: 'Abro las ventanas y me quedo a ayudar.', calidad: 'mid', feedback: 'Ventilar ayuda, pero tu prioridad es salir y avisar.' },
        ],
      },
      {
        evento: 'REPORTE', segundos: 20,
        titulo: 'Ya fuera, te preguntan qué ocurrió.',
        texto: 'La brigada necesita información para actuar.',
        opciones: [
          { texto: 'Informo qué reactivos se derramaron y si el gas quedó cerrado.', calidad: 'good', feedback: 'Excelente. Información precisa permite una respuesta segura.' },
          { texto: 'Digo que no vi nada para no meterme en problemas.', calidad: 'bad', feedback: 'Ocultar información pone en riesgo a quienes reingresen.' },
          { texto: 'Publico una foto en redes primero.', calidad: 'mid', feedback: 'Prioriza informar a la brigada; las redes pueden esperar.' },
        ],
      },
    ],
  },
  {
    id: 'biblioteca',
    titulo: 'Pasillos de la biblioteca',
    resumen: 'Practica cómo protegerte entre estanterías altas y pasillos estrechos.',
    espacio: 'Biblioteca', dificultad: 'Intermedio', color: '#8B5CF6',
    escenas: [
      {
        evento: 'SISMO EN CURSO', sacudida: true, segundos: 20,
        titulo: 'Estás entre dos estanterías altas buscando un libro.',
        texto: 'Los libros empiezan a caer a tu alrededor.',
        opciones: [
          { texto: 'Salgo del pasillo hacia un espacio abierto, me agacho y cubro mi cabeza.', calidad: 'good', feedback: 'Correcto. Entre estanterías altas el riesgo de golpes es alto; busca un lugar sin objetos en altura.' },
          { texto: 'Me quedo inmóvil entre los estantes.', calidad: 'bad', feedback: 'Los estantes pueden volcarse o descargar muchos libros sobre ti.' },
          { texto: 'Trepo a una mesa para alejarme del piso.', calidad: 'bad', feedback: 'Subirte a muebles aumenta el riesgo de caída.' },
        ],
      },
      {
        evento: 'TRAS EL SISMO', segundos: 20,
        titulo: 'Una estantería quedó inclinada sobre el pasillo principal.',
        texto: 'Hay un pasillo lateral libre que lleva a otra salida.',
        opciones: [
          { texto: 'Tomo el pasillo lateral y aviso que el principal está bloqueado.', calidad: 'good', feedback: 'Bien. Elegir la ruta segura y avisar a otros evita accidentes.' },
          { texto: 'Paso agachado por debajo de la estantería inclinada.', calidad: 'bad', feedback: 'Una réplica podría terminar de volcarla.' },
          { texto: 'Espero a que alguien la levante.', calidad: 'mid', feedback: 'No hace falta esperar si hay una alternativa segura.' },
        ],
      },
      {
        evento: 'RÉPLICA', sacudida: true, segundos: 20,
        titulo: 'Bajando las escaleras, se siente una réplica.',
        texto: 'Estás a mitad de la escalera.',
        opciones: [
          { texto: 'Me sujeto del pasamanos, me agacho y espero a que pase.', calidad: 'good', feedback: 'Correcto. En escaleras, sujétate y protégete hasta que termine el movimiento.' },
          { texto: 'Bajo corriendo los escalones restantes.', calidad: 'bad', feedback: 'Correr en escaleras durante una réplica provoca caídas graves.' },
          { texto: 'Vuelvo a subir a la biblioteca.', calidad: 'bad', feedback: 'Regresar te aleja de la salida y te expone de nuevo.' },
        ],
      },
    ],
  },
  {
    id: 'reunion',
    titulo: 'Sismo en sala de reuniones',
    resumen: 'Toma decisiones rodeado de ventanales y con una presentación en curso.',
    espacio: 'Oficina', dificultad: 'Intermedio', color: '#0EA5E9',
    escenas: [
      {
        evento: 'SISMO EN CURSO', sacudida: true, segundos: 20,
        titulo: 'Tiembla en plena reunión. La sala tiene una pared de vidrio.',
        texto: 'Hay una columna al otro lado de la mesa y una pantalla colgada.',
        opciones: [
          { texto: 'Me alejo del vidrio y la pantalla hacia la columna y me protejo.', calidad: 'good', feedback: 'Correcto. Vidrios y objetos colgados son los mayores riesgos de esta sala.' },
          { texto: 'Me quedo sentado en mi silla junto al ventanal.', calidad: 'bad', feedback: 'El vidrio puede romperse y proyectar fragmentos.' },
          { texto: 'Salgo al pasillo de inmediato.', calidad: 'mid', feedback: 'Si el pasillo está a un paso puede ser válido, pero desplazarte mientras tiembla es riesgoso.' },
        ],
      },
      {
        evento: 'LIDERAZGO', segundos: 20,
        titulo: 'Eres quien dirigía la reunión. Hay un visitante que no conoce el edificio.',
        texto: 'El sismo terminó y suena la alarma.',
        opciones: [
          { texto: 'Le indico la ruta y lo acompaño al punto de reunión.', calidad: 'good', feedback: 'Excelente. Los visitantes no conocen las rutas; guiarlos es parte de una cultura preventiva.' },
          { texto: 'Le digo que siga a los demás.', calidad: 'mid', feedback: 'Puede funcionar, pero es mejor asegurarte de que llegue.' },
          { texto: 'Me quedo guardando la laptop con la presentación.', calidad: 'bad', feedback: 'Los equipos no son prioridad. Evacúa de inmediato.' },
        ],
      },
      {
        evento: 'COMUNICACIÓN', segundos: 20,
        titulo: 'Ya en el punto de reunión, quieres avisar a tu familia.',
        texto: 'Las líneas telefónicas están saturadas.',
        opciones: [
          { texto: 'Envío un SMS o uso el 119 para dejar un mensaje de voz.', calidad: 'good', feedback: 'Correcto. Los mensajes consumen menos red y dejan las líneas libres para emergencias.' },
          { texto: 'Llamo una y otra vez hasta que conteste.', calidad: 'bad', feedback: 'Las llamadas repetidas saturan la red que necesitan los servicios de emergencia.' },
          { texto: 'Hago una videollamada.', calidad: 'mid', feedback: 'Consume mucho ancho de banda en un momento crítico. Prefiere mensajes cortos.' },
        ],
      },
    ],
  },
]

export const puntosCalidad = { good: 100, mid: 50, bad: 0 } as const
