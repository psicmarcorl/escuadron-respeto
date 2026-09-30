# Escuadrón Respeto

Juego educativo estilo *shoot 'em up* (inspirado en Gradius) para sensibilizar sobre la discriminación.
La nave elimina **frases que discriminan**, que al ser destruidas se transforman en un **mensaje respetuoso**.
Las cápsulas de poder solo se activan si se responde correctamente una **pregunta sensibilizadora**.

**Jugar:** https://psicmarcorl.github.io/escuadron-respeto/

Funciona en celular, tableta y computadora desde el navegador. En el celular se puede usar "Agregar a pantalla de inicio" para abrirlo como app.

## Archivos

- index.html: página del juego
- css/estilos.css: estilos
- js/datos.js: frases, preguntas y textos (EDITABLE)
- js/juego.js: motor del juego
- manifest.webmanifest y sw.js: instalación como app y uso sin conexión
- icons/: íconos

## Cómo editar el contenido

Abre js/datos.js (en GitHub: clic en el archivo y luego en el ícono del lápiz):

- **FRASES**: t (frase enemiga), c (tipo de discriminación) y r (reencuadre respetuoso). Procura que t tenga menos de ~35 caracteres.
- **PREGUNTAS**: p (pregunta), o (opciones), c (número de la opción correcta, empezando en 0) y r (retroalimentación). Las opciones se barajan solas.
- **NIVELES**: nombre del nivel, jefe, frases necesarias para que aparezca el jefe (meta), resistencia del jefe (hpJefe) y reflexión.
- **CONFIG**: créditos y mensaje institucional del final.

Guarda con "Commit changes". Si el cambio no aparece en el celular, en sw.js cambia escuadron-respeto-v1 por v2, v3, etc.

## Controles

- **Celular:** desliza el dedo en cualquier parte de la pantalla; la nave dispara sola.
- **Computadora:** flechas o W A S D; P o Esc para pausar.

## Fuentes

- Allport, G. W. (1954). *The nature of prejudice*. Addison-Wesley.
- Cámara de Diputados del H. Congreso de la Unión. (2003). *Ley Federal para Prevenir y Eliminar la Discriminación*. Diario Oficial de la Federación.
- Cámara de Diputados del H. Congreso de la Unión. (2003). *Ley General de Derechos Lingüísticos de los Pueblos Indígenas*. Diario Oficial de la Federación.
- Crenshaw, K. (1989). Demarginalizing the intersection of race and sex. *University of Chicago Legal Forum, 1989*(1), 139–167.
- Organización de las Naciones Unidas. (2006). *Convención sobre los Derechos de las Personas con Discapacidad*.
- Pettigrew, T. F., & Tropp, L. R. (2006). A meta-analytic test of intergroup contact theory. *Journal of Personality and Social Psychology, 90*(5), 751–783. https://doi.org/10.1037/0022-3514.90.5.751
- Sue, D. W., Capodilupo, C. M., Torino, G. C., Bucceri, J. M., Holder, A. M. B., Nadal, K. L., & Esquilin, M. (2007). Racial microaggressions in everyday life. *American Psychologist, 62*(4), 271–286. https://doi.org/10.1037/0003-066X.62.4.271

---
Departamento Psicopedagógico · Universidad Pedagógica Nacional, Unidad 112 Celaya
