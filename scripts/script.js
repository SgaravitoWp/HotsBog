function muestra_oculta(id) {
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

function writeDescription() {
  var i = 0;
  var txt = "Una alternativa para combatir la inseguridad en Bogotá";
  var speed = 50;

  function typeWriter() {
    if (i < txt.length) {
      document.getElementById("subtitle").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }

  typeWriter();
}
function writeName() {
  var i = 0;
  var txt = "by: Samuel Garavito";
  var speed = 120;

  function typeWriter() {
    if (i < txt.length) {
      document.getElementById("author").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
    
  }

  typeWriter();
}
function writeCode(code) {
  var i = 0;
  var txt = code;
  var speed = 1500;

  function typeWriter() {
    if (i < txt.length) {
      document.getElementById("code").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
    
  }
  typeWriter();
}
