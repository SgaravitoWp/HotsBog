/**
 * Cambia entre las pestañas de la interfaz de usuario, mostrando u ocultando elementos según el id proporcionado.
 *
 * @param {string} id - Identificador de la pestaña a la que se debe cambiar ('more' o 'home').
 */
function switchTabs(id) {
  var hidden = document.getElementById("about");
  var icons = document.getElementById("social-media");

  if (hidden.classList.contains("about")) {
    if (id == "more") {
      hidden.classList.remove("about");
      hidden.classList.add("show-about");
      icons.classList.remove("icon-container");
      icons.classList.add("icon-container-hidden");
    }
  }
  if (hidden.classList.contains("show-about")) {
    if (id == "home") {
      hidden.classList.remove("show-about");
      hidden.classList.add("about");
      icons.classList.remove("icon-container-hidden");
      icons.classList.add("icon-container");
    }
  }
}

/**
 * Escribe texto en un elemento HTML de forma animada, simulando una máquina de escribir.
 *
 * @param {string} text - El texto que se debe escribir.
 * @param {number} speed - La velocidad de escritura en milisegundos entre cada carácter.
 * @param {string} tagId - El id del elemento HTML donde se debe mostrar el texto.
 */
function writeTagText(text, speed, tagId) {
  var i = 0;
  var txt = text;
  var speed = speed;

  function typeWriter() {
    if (i < txt.length) {
      document.getElementById(tagId).innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }

  typeWriter();
}
