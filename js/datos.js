/* =========================================================
   ESCUADRÓN RESPETO · Datos editables del juego
   Puedes modificar frases, preguntas y textos institucionales
   sin tocar el código del juego (js/juego.js).
   ========================================================= */

const CONFIG = {
  titulo: 'Escuadrón Respeto',
  creditos: 'Departamento Psicopedagógico · Universidad Pedagógica Nacional, Unidad 112 Celaya',
  ayudaInstitucional: 'Si vives o presencias discriminación, no estás solo/a: acude al Servicio de Género y No Discriminación o al Departamento Psicopedagógico de tu unidad.'
};

/* Frases enemigas.
   t = frase que discrimina (lo que aparece en la nave enemiga)
   c = forma de discriminación (etiqueta pequeña)
   r = reencuadre respetuoso (aparece al eliminarla)            */
const FRASES = [
  { t: 'Eso es de niñas', c: 'Género', r: 'Los gustos no tienen género' },
  { t: 'Los hombres no lloran', c: 'Género', r: 'Llorar es humano' },
  { t: 'Calladita te ves más bonita', c: 'Género', r: 'Su voz también cuenta' },
  { t: 'Seguro está en sus días', c: 'Género', r: 'Sus ideas valen por sí mismas' },
  { t: 'Pegas como niña', c: 'Género', r: 'Nadie es menos por su género' },
  { t: 'Ingeniería no es para mujeres', c: 'Género', r: 'Las carreras no tienen género' },
  { t: 'No seas indio', c: 'Racismo', r: 'Los pueblos originarios merecen respeto' },
  { t: 'Hay que mejorar la raza', c: 'Racismo', r: 'Ningún color de piel es mejor' },
  { t: 'Trabajas como negro', c: 'Racismo', r: 'El esfuerzo no tiene color' },
  { t: 'Es morenito, pero bonito', c: 'Colorismo', r: 'La belleza no tiene un solo tono' },
  { t: 'Ya ni hables tu lengua', c: 'Origen étnico', r: 'Las lenguas indígenas son nacionales' },
  { t: 'Habla bien, no como de rancho', c: 'Origen', r: 'Todas las formas de hablar valen' },
  { t: 'Qué naco', c: 'Clasismo', r: 'Nadie vale menos por su origen' },
  { t: 'Son pobres porque quieren', c: 'Clasismo', r: 'La pobreza tiene causas estructurales' },
  { t: 'Se nota que es de colonia', c: 'Clasismo', r: 'El lugar donde vives no te define' },
  { t: '¿Estás cieguito o qué?', c: 'Capacitismo', r: 'Una discapacidad no es un insulto' },
  { t: 'No seas retrasado', c: 'Capacitismo', r: 'Las palabras pueden herir' },
  { t: 'Pobrecito, es discapacitado', c: 'Capacitismo', r: 'Persona con discapacidad, con derechos' },
  { t: 'Ni lo invites, no va a poder', c: 'Capacitismo', r: 'Con ajustes razonables, todos participan' },
  { t: 'Es una etapa, ya se le pasará', c: 'Diversidad sexual', r: 'Su identidad es válida' },
  { t: 'No pareces gay', c: 'Diversidad sexual', r: 'No hay una sola forma de ser' },
  { t: 'Eso no es de hombres', c: 'Expresión de género', r: 'Cada quien elige cómo expresarse' },
  { t: 'Mientras no se besen enfrente', c: 'Diversidad sexual', r: 'El afecto merece el mismo respeto' },
  { t: 'Ya estás grande para estudiar', c: 'Edadismo', r: 'Aprender no tiene edad' },
  { t: 'Los chavos no saben nada', c: 'Edadismo', r: 'Todas las edades aportan' },
  { t: 'Ok, boomer', c: 'Edadismo', r: 'La edad no descalifica una idea' },
  { t: 'Bonita, lástima tu peso', c: 'Apariencia', r: 'Ningún cuerpo es un defecto' },
  { t: 'Con esos tatuajes, ni lo contrates', c: 'Apariencia', r: 'La apariencia no mide capacidad' },
  { t: 'Regrésate a tu país', c: 'Xenofobia', r: 'Las personas migrantes tienen derechos' },
  { t: 'Los migrantes vienen a robar', c: 'Xenofobia', r: 'Migrar no es delito' },
  { t: 'Esa religión es de fanáticos', c: 'Religión', r: 'La libertad de creencias es un derecho' },
  { t: 'La depresión es pura flojera', c: 'Salud mental', r: 'La salud mental es salud' },
  { t: 'Estás loco', c: 'Salud mental', r: 'Hablemos con respeto de salud mental' },
  { t: 'Embarazada ya no rinde', c: 'Embarazo', r: 'El embarazo no quita capacidades' },
  { t: 'Madre soltera, algo hizo mal', c: 'Estado civil', r: 'Todas las familias son válidas' },
  { t: 'Tiene VIH, no te le acerques', c: 'Condición de salud', r: 'El VIH no se transmite por convivir' },
  { t: 'Solo es una broma', c: 'Normalización', r: 'El humor también puede lastimar' },
  { t: 'Todos los de ahí son iguales', c: 'Estereotipo', r: 'Cada persona es única' }
];

/* Preguntas sensibilizadoras.
   p = pregunta, o = opciones, c = índice de la opción correcta (empieza en 0),
   r = retroalimentación que se muestra después de responder.              */
const PREGUNTAS = [
  {
    p: '¿Qué establece el Artículo 1.º de la Constitución mexicana sobre la discriminación?',
    o: ['Prohíbe toda discriminación por origen étnico, género, edad, discapacidad, condición social, religión, preferencias sexuales, entre otras',
        'Solo prohíbe la discriminación racial',
        'Permite discriminar en espacios privados',
        'Solo protege a ciudadanos mayores de 18 años'],
    c: 0,
    r: 'El Artículo 1.º prohíbe toda discriminación que atente contra la dignidad humana y tenga por objeto anular o menoscabar derechos y libertades. Aplica a todas las personas en el país.'
  },
  {
    p: 'Pensar que "todas las personas de cierto grupo son flojas" es un ejemplo de…',
    o: ['Estereotipo', 'Ajuste razonable', 'Acción afirmativa', 'Libertad de expresión protegida'],
    c: 0,
    r: 'Un estereotipo es una creencia generalizada y simplificada sobre un grupo. Es el componente cognitivo; el prejuicio es la actitud y la discriminación es la conducta (Allport, 1954).'
  },
  {
    p: 'Según la Ley Federal para Prevenir y Eliminar la Discriminación, ¿puede haber discriminación aunque no exista intención?',
    o: ['Sí, cuenta el resultado: si restringe o anula derechos, es discriminación',
        'No, solo si la persona quiso dañar',
        'Solo si hay insultos directos',
        'Solo si ocurre más de tres veces'],
    c: 0,
    r: 'La ley define la discriminación como toda distinción, exclusión o restricción que, por acción u omisión, con intención o sin ella, tenga por objeto o resultado limitar derechos.'
  },
  {
    p: '¿Qué es una microagresión?',
    o: ['Un comentario o gesto cotidiano, a veces sin intención, que comunica desprecio hacia un grupo',
        'Una agresión física leve',
        'Una discusión entre dos amistades',
        'Una crítica académica a un trabajo'],
    c: 0,
    r: 'Las microagresiones parecen pequeñas ("hablas muy bien para ser de allá"), pero su repetición desgasta y afecta el bienestar de quien las recibe (Sue et al., 2007).'
  },
  {
    p: 'En el chat del grupo alguien comparte un meme que se burla de una persona trans. ¿Qué acción es más útil?',
    o: ['Decir con calma que ese contenido lastima y ofrecer apoyo a quien pudo sentirse afectado',
        'Reaccionar con risa para no quedar mal',
        'Exhibir a quien lo compartió con insultos en otras redes',
        'Salirte del grupo sin decir nada'],
    c: 0,
    r: 'Como testigo tienes poder: nombrar el daño sin agredir y acompañar a la persona afectada rompe la normalización. Responder con violencia suele escalar el conflicto.'
  },
  {
    p: 'Presencias que acosan a alguien por su forma de vestir y no te sientes seguro/a para confrontar. ¿Qué estrategia puedes usar?',
    o: ['Distraer: interrumpir la situación de forma indirecta (preguntar algo, acercarte a la persona afectada)',
        'Grabar y subir el video sin permiso de la persona afectada',
        'Esperar a que termine y no hacer nada',
        'Culpar a la persona por cómo se viste'],
    c: 0,
    r: 'Las estrategias de intervención de testigos incluyen distraer, delegar (pedir ayuda a una autoridad), documentar con consentimiento, acompañar después y, si es seguro, intervenir directamente.'
  },
  {
    p: '¿Cuál es la forma más respetuosa de referirse a este grupo?',
    o: ['Personas con discapacidad', 'Minusválidos', 'Personas con capacidades diferentes', 'Discapacitados'],
    c: 0,
    r: '"Personas con discapacidad" es el término de la Convención de la ONU (2006): pone primero a la persona. "Capacidades diferentes" es un eufemismo que invisibiliza las barreras del entorno.'
  },
  {
    p: 'Una estudiante con baja visión pide los materiales en letra grande. Proporcionárselos es…',
    o: ['Un ajuste razonable al que tiene derecho', 'Un privilegio injusto para el resto', 'Favoritismo', 'Algo opcional según el ánimo del docente'],
    c: 0,
    r: 'Los ajustes razonables garantizan igualdad de condiciones. Negarlos sin justificación puede constituir discriminación por motivo de discapacidad (Convención sobre los Derechos de las Personas con Discapacidad).'
  },
  {
    p: '¿Qué describe el concepto de interseccionalidad?',
    o: ['Cómo se combinan varias condiciones (género, origen étnico, clase, etc.) y producen formas específicas de discriminación',
        'Un cruce de avenidas peligroso',
        'Que todas las discriminaciones son idénticas',
        'Una técnica para resolver conflictos grupales'],
    c: 0,
    r: 'Kimberlé Crenshaw (1989) mostró que, por ejemplo, una mujer indígena puede enfrentar desventajas que no se explican solo por ser mujer ni solo por ser indígena.'
  },
  {
    p: 'Tu universidad ofrece becas exclusivas para estudiantes indígenas. ¿Es discriminación hacia los demás?',
    o: ['No: es una acción afirmativa para corregir desigualdades históricas',
        'Sí, porque trata distinto a las personas',
        'Sí, porque todos deberían competir igual sin importar su punto de partida',
        'Depende de la carrera'],
    c: 0,
    r: 'La ley mexicana reconoce las acciones afirmativas: medidas temporales que buscan igualdad real para grupos en situación de desventaja. No se consideran discriminatorias.'
  },
  {
    p: '"Era solo una broma". ¿Qué efecto pueden tener los chistes discriminatorios?',
    o: ['Normalizan prejuicios y pueden dañar aunque no haya intención',
        'Ninguno, el humor siempre es inofensivo',
        'Solo afectan a quien no tiene sentido del humor',
        'Ayudan a eliminar los estereotipos'],
    c: 0,
    r: 'El humor que ridiculiza a un grupo refuerza estereotipos y hace ver la discriminación como algo aceptable. Reírse también comunica aprobación.'
  },
  {
    p: '¿Cuál es el organismo nacional encargado de prevenir y eliminar la discriminación en México?',
    o: ['CONAPRED', 'INE', 'SAT', 'CONAGUA'],
    c: 0,
    r: 'El Consejo Nacional para Prevenir la Discriminación (CONAPRED) se creó con la ley federal de 2003. Recibe quejas y promueve políticas de igualdad.'
  },
  {
    p: 'Según la Ley General de Derechos Lingüísticos de los Pueblos Indígenas, las lenguas indígenas son…',
    o: ['Lenguas nacionales con la misma validez que el español', 'Dialectos sin valor oficial', 'Lenguas que deben dejar de usarse en la escuela', 'Idiomas extranjeros'],
    c: 0,
    r: 'Llamarlas "dialectos" es un prejuicio. Son lenguas completas y nacionales. Burlarse de quien las habla es discriminación por origen étnico.'
  },
  {
    p: 'Una empresa pide un certificado de no embarazo para contratar. Esto es…',
    o: ['Una práctica prohibida por la Ley Federal del Trabajo', 'Un requisito legal normal', 'Válido si la empresa es privada', 'Recomendable para planear la plantilla'],
    c: 0,
    r: 'La Ley Federal del Trabajo prohíbe exigir certificados de no embarazo y despedir por embarazo. Es discriminación por género.'
  },
  {
    p: '¿Qué es la discriminación estructural?',
    o: ['Cuando reglas, prácticas y costumbres ponen en desventaja sistemática a ciertos grupos, aunque nadie lo haga con intención',
        'Una pelea física en un edificio',
        'Discriminar solo a través de leyes escritas',
        'Un insulto dicho por una sola persona'],
    c: 0,
    r: 'Ejemplos: edificios sin rampas, trámites solo en español o horarios que excluyen a quienes trabajan. Cambiarla requiere acciones institucionales, no solo buena voluntad.'
  },
  {
    p: 'Preferir tonos de piel claros y asociarlos con belleza o éxito se conoce como…',
    o: ['Colorismo', 'Edadismo', 'Capacitismo', 'Meritocracia'],
    c: 0,
    r: 'El colorismo está muy presente en México: frases como "mejorar la raza" o "es morenito, pero bonito" lo reproducen en la vida cotidiana.'
  },
  {
    p: '¿Cuál de estas actividades NO transmite el VIH?',
    o: ['Abrazar, compartir cubiertos o usar el mismo baño', 'Compartir jeringas', 'Relaciones sexuales sin protección', 'Transfusión de sangre no analizada'],
    c: 0,
    r: 'La convivencia cotidiana no transmite el VIH. Excluir o negar servicios a alguien por vivir con VIH es discriminación por condición de salud.'
  },
  {
    p: 'Un compañero te cuenta que está en tratamiento por ansiedad. ¿Qué respuesta es más respetuosa?',
    o: ['Escuchar sin juzgar y respetar su privacidad', 'Decirle que solo le eche ganas', 'Contárselo al grupo para que lo apoyen', 'Sugerirle que deje el tratamiento'],
    c: 0,
    r: 'La salud mental es salud. Minimizarla ("es flojera") o exponerla sin permiso estigmatiza y aleja a las personas de pedir ayuda.'
  },
  {
    p: 'Una compañera pide que la llames por un nombre distinto al de la lista oficial. ¿Qué es lo respetuoso?',
    o: ['Usar el nombre y los pronombres que ella indica', 'Usar el de la lista porque es el oficial', 'Preguntarle frente al grupo por qué', 'Evitar llamarla por su nombre'],
    c: 0,
    r: 'Nombrar a las personas como se identifican reconoce su dignidad. Es un gesto sencillo con gran impacto en su bienestar y sentido de pertenencia.'
  },
  {
    p: '¿Por qué el 17 de mayo es el Día Internacional contra la Homofobia, la Transfobia y la Bifobia?',
    o: ['Porque en 1990 la OMS eliminó la homosexualidad de su clasificación de enfermedades', 'Porque es el día del amor', 'Porque se fundó la ONU', 'Es una fecha elegida al azar'],
    c: 0,
    r: 'Desde 1990 la ciencia reconoce que la orientación sexual no es una enfermedad. Tratarla como algo que "se cura" o "es una etapa" es discriminación.'
  },
  {
    p: '"Ya estás grande para estudiar". ¿Cómo se llama la discriminación por edad?',
    o: ['Edadismo', 'Clasismo', 'Xenofobia', 'Capacitismo'],
    c: 0,
    r: 'El edadismo afecta tanto a personas mayores como a jóvenes ("los chavos no saben nada"). Aprender y aportar no tiene edad.'
  },
  {
    p: '¿Qué es el capacitismo?',
    o: ['Discriminar a personas con discapacidad asumiendo que ciertos cuerpos y mentes son "normales" o superiores',
        'Capacitar a docentes',
        'Evaluar competencias laborales',
        'Tener muchas capacidades'],
    c: 0,
    r: 'Usar "ciego", "retrasado" o "autista" como insulto es capacitismo cotidiano. El modelo social de la discapacidad señala que las barreras están en el entorno.'
  },
  {
    p: 'El rechazo o desconfianza hacia personas de otro país se llama…',
    o: ['Xenofobia', 'Homofobia', 'Aporofobia', 'Misoginia'],
    c: 0,
    r: 'En México, frases como "regrésate a tu país" o "los migrantes vienen a robar" afectan a personas que ya viven en situación de vulnerabilidad. Migrar no es un delito.'
  },
  {
    p: '"Qué naco". ¿Qué tipo de discriminación suele expresar esta palabra?',
    o: ['Clasismo, y a menudo también racismo', 'Ninguna, es solo una palabra', 'Edadismo', 'Discriminación religiosa'],
    c: 0,
    r: 'La palabra desprecia a personas por su clase social, forma de vestir o rasgos indígenas. Muchas palabras cotidianas cargan historia de exclusión.'
  },
  {
    p: 'Si vives discriminación en tu universidad, ¿qué es lo más recomendable?',
    o: ['Acudir a las instancias institucionales (Género y No Discriminación, tutoría o Psicopedagógico) y registrar lo ocurrido',
        'Guardar silencio para no causar problemas',
        'Responder con violencia',
        'Esperar a que se olvide'],
    c: 0,
    r: 'Documentar (fechas, lugares, testigos, capturas) y acudir a las instancias facilita la atención. Hablarlo con alguien de confianza también ayuda.'
  },
  {
    p: 'Todas las personas tenemos sesgos. ¿Qué ayuda más a reducirlos?',
    o: ['Reconocerlos, convivir con personas diversas en igualdad y cuestionar nuestras primeras impresiones',
        'Negar que los tenemos',
        'Evitar a quienes son diferentes',
        'Nada, no se pueden cambiar'],
    c: 0,
    r: 'La investigación sobre la hipótesis del contacto muestra que la convivencia en igualdad, con metas comunes y apoyo institucional, reduce el prejuicio (Pettigrew y Tropp, 2006).'
  },
  {
    p: 'Decir "pobrecito" a una persona con discapacidad…',
    o: ['Refuerza una mirada de lástima; lo respetuoso es tratarla como persona con autonomía y derechos',
        'Es la forma más empática de hablarle',
        'No tiene ningún efecto',
        'Es obligatorio por cortesía'],
    c: 0,
    r: 'La lástima coloca a la persona en un lugar inferior. La empatía reconoce su autonomía y pregunta qué necesita, en lugar de suponerlo.'
  },
  {
    p: 'El 21 de marzo se conmemora el Día Internacional de la Eliminación de…',
    o: ['La Discriminación Racial', 'El Trabajo Infantil', 'La Pobreza', 'Las Armas Nucleares'],
    c: 0,
    r: 'La ONU lo estableció en memoria de la masacre de Sharpeville (Sudáfrica, 1960), donde la policía disparó contra una manifestación pacífica contra el apartheid.'
  },
  {
    p: 'Frente a un comentario discriminatorio de un docente en clase, ¿qué puede hacer el grupo?',
    o: ['Expresarlo con respeto y, si continúa, reportarlo a las instancias de la universidad',
        'Nada, los docentes siempre tienen la razón',
        'Burlarse del docente en redes',
        'Faltar a clase como protesta sin avisar'],
    c: 0,
    r: 'Las relaciones de poder dificultan hablar, por eso actuar en grupo y usar los canales institucionales protege a quienes denuncian.'
  }
];

/* Explicación que aparece al superar cada nivel (modelo de Allport, 1954). */
const NIVELES = [
  {
    nombre: 'Nivel 1 · Sector Estereotipo', jefe: 'EL ESTEREOTIPO', color: '#ff4d8d', meta: 14, hpJefe: 60,
    concepto: 'Estereotipo',
    texto: 'Es una creencia generalizada y simplificada sobre un grupo ("las mujeres son…", "los jóvenes son…"). Es el componente cognitivo: lo que pensamos. Borra la individualidad y prepara el terreno para el prejuicio.',
    reflexion: '¿Qué estereotipo escuchaste esta semana? ¿Lo cuestionaste?'
  },
  {
    nombre: 'Nivel 2 · Sector Prejuicio', jefe: 'EL PREJUICIO', color: '#ff9f1c', meta: 18, hpJefe: 90,
    concepto: 'Prejuicio',
    texto: 'Es una actitud o juicio negativo hacia alguien por pertenecer a un grupo, formado antes de conocerle. Es el componente afectivo: lo que sentimos (desconfianza, rechazo, desprecio).',
    reflexion: '¿Alguna vez te juzgaron antes de conocerte? ¿Cómo te sentiste?'
  },
  {
    nombre: 'Nivel 3 · Sector Discriminación', jefe: 'LA DISCRIMINACIÓN', color: '#b388ff', meta: 22, hpJefe: 130,
    concepto: 'Discriminación',
    texto: 'Es la conducta: tratar de forma desigual, excluir o limitar derechos por origen, género, edad, discapacidad, condición social, religión, orientación sexual u otra condición. En México la prohíben el Artículo 1.º constitucional y la LFPED.',
    reflexion: '¿Qué puedes hacer tú, desde tu lugar, cuando la presencias?'
  }
];
