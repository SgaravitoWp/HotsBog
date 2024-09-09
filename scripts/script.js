function muestra_oculta(id) {
    var hidden = document.getElementById('about'); // Selecciona hidden elemento por ID

    if (hidden.classList.contains('about')) {
        if (id == 'more'){
            hidden.classList.remove('about');
            hidden.classList.add('show-about');
        }
    }
    if (hidden.classList.contains('show-about')){
        if (id == 'home'){
            hidden.classList.remove('show-about');
            hidden.classList.add('about');
        }
    }
}
