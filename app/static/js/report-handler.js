// Variables para almacenar la latitud y longitud seleccionadas.
var lat = "";
var lng = "";
var isPositionFilled = false;

/**
 * Verifica las condiciones para habilitar o deshabilitar el botón de envío.
 * Las condiciones incluyen la fecha ingresada, casillas de verificación seleccionadas y una posición en el mapa.
 */
function checkAllConditions() {
  const submitButton = document.getElementById("submitAll");
  const dateInput = document.getElementById("date-input").value.trim();
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const todayDate = new Date();

  // Verifica si la fecha ingresada es válida y no está en el futuro.
  const isDateFilled = dateInput && new Date(dateInput) <= todayDate;
  // Verifica si al menos una casilla de verificación está marcada.
  const isAnyCheckboxChecked = Array.from(checkboxes).some(
    (checkbox) => checkbox.checked
  );

  // Habilita o deshabilita el botón de envío según las condiciones verificadas.
  submitButton.disabled = !(
    isDateFilled &&
    isAnyCheckboxChecked &&
    isPositionFilled
  );

  submitButton.style.opacity = submitButton.disabled ? "0.5" : "1";
}

document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("date-input");
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // Agrega eventos para verificar condiciones cuando la entrada de fecha o las casillas cambian.
  dateInput.addEventListener("input", checkAllConditions);
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", checkAllConditions)
  );

  checkAllConditions();

  // Maneja el evento de clic en el botón de envío.
  document
    .getElementById("submitAll")
    .addEventListener("click", function (event) {
      event.preventDefault();

      let dateInput = document.getElementById("date-input").value;

      let checkboxes = document.querySelectorAll(
        'input[name="options"]:checked'
      );

      let selectedValues = Array.from(checkboxes).map(
        (checkbox) => checkbox.value
      );

      let combinedData = {
        dateInput: dateInput,
        selectedValues: selectedValues,
        latitude: lat,
        longitude: lng,
      };

      // Envia los datos al servidor.
      fetch("/report-theft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            window.location.href = "/home";
            alert("Su reporte fue realizado con éxito.");
          } else {
            console.error("Error:", data.message);
          }
        })
        .catch((error) => {
          alert("Intente de nuevo. Ocurrió un error.");
          console.error("Error en el envío:", error);
        });
    });
});

/**
 * Actualiza las coordenadas de la posición seleccionada en el mapa.
 *
 * @param {google.maps.LatLng} position - La posición seleccionada en el mapa.
 */
function updateCoordinates(position) {
  lat = position.lat();
  lng = position.lng();
  isPositionFilled = true;
  checkAllConditions();
}

/**
 * Inicializa el mapa de Google Maps y maneja la selección de posición en el mapa.
 */
function initMap() {
  const initialPosition = { lat: 4.6533816, lng: -74.0836333 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: initialPosition,
    restriction: {
      latLngBounds: {
        north: 4.8058844996972425,
        south: 4.466733218364823,
        west: -74.25434937395299,
        east: -73.95910942266366,
      },
      strictBounds: true,
    },
  });

  let marker = null;

  // Maneja el evento de clic en el mapa para seleccionar una posición.
  map.addListener("click", function (event) {
    const clickedLocation = event.latLng;

    // Actualiza la posición del marcador existente o crea uno nuevo.
    if (marker) {
      marker.setPosition(clickedLocation);
    } else {
      marker = new google.maps.Marker({
        position: clickedLocation,
        map: map,
      });
      lat = clickedLocation.lat();
      lng = clickedLocation.lng();
    }

    marker.addListener("drag", function () {
      updateCoordinates(this.getPosition());
    });

    updateCoordinates(clickedLocation);
  });
}
