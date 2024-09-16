// Variable para almacenar la instancias correspondientes al mapa de Google Maps.
let map;
let markers = [];

/**
 * Verifica las condiciones para habilitar o deshabilitar el botón de envío.
 * Las condiciones incluyen fechas válidas y al menos una casilla de verificación seleccionada.
 */
function checkAllConditions() {
  const submitButton = document.getElementById("submitAll");
  const startDate = document.getElementById("startDate").value.trim();
  const endDate = document.getElementById("endDate").value.trim();
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const todayDate = new Date();
  let isValidDate = false;

  isValidDate =
    startDate &&
    endDate &&
    new Date(startDate) <= new Date(endDate) &&
    new Date(startDate) <= todayDate &&
    new Date(endDate) <= todayDate;

  const isAnyCheckboxChecked = Array.from(checkboxes).some(
    (checkbox) => checkbox.checked
  );

  submitButton.disabled = !(isValidDate && isAnyCheckboxChecked);
  submitButton.style.opacity = submitButton.disabled ? "0.5" : "1";
}

document.addEventListener("DOMContentLoaded", function () {
  let startDate = document.getElementById("startDate");
  let endDate = document.getElementById("endDate");
  let checkboxes = document.querySelectorAll('input[name="options"]');

  startDate.addEventListener("input", checkAllConditions);
  endDate.addEventListener("input", checkAllConditions);
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", checkAllConditions)
  );
  checkAllConditions();

  document
    .getElementById("submitAll")
    .addEventListener("click", function (event) {
      event.preventDefault();
      let startDate = document.getElementById("startDate").value;
      let endDate = document.getElementById("endDate").value;
      let checkboxes = document.querySelectorAll(
        'input[name="options"]:checked'
      );

      let selectedValues = Array.from(checkboxes).map(
        (checkbox) => checkbox.value
      );

      let combinedData = {
        startDate: startDate,
        endDate: endDate,
        thefts: selectedValues,
      };

      fetch("/fetch-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            loadMarkers(data.data);
            console.log(data.data);
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
 * Inicializa el mapa de Google Maps con una posición inicial y restricciones de área.
 */
function initMap() {
  const initialPosition = { lat: 4.6533816, lng: -74.0836333 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
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
}

/**
 * Elimina todos los marcadores del mapa y limpia la lista de marcadores.
 */
function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

/**
 * Carga los marcadores en el mapa basados en los datos proporcionados.
 *
 * @param {Array} data - Lista de datos que contienen información para cada marcador (latitud, longitud, fecha, robos).
 */
function loadMarkers(data) {
  clearMarkers();
  let image = "/static/images/hotsbog-favicon.png";
  data.forEach((place) => {
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(place.lat), lng: parseFloat(place.lng) },
      map: map,
      icon: {
        url: image,
        scaledSize: new google.maps.Size(50, 50),
      },
      title: place.name,
      optimized: false,
      clickable: true,
      draggable: false,
    });
    markers.push(marker);

    const listThefts = place.thefts
      .map((theft) => `<li>${theft}</li>`)
      .join("");
    let content = `
    <div class="artificial-body">
      <div class="info-container">
        <div class="info-items">
          <span class="info-span"> ${place.date} </span>
        </div>
        <div class="info-items info-horizontal-line"></div>
        <div class="info-items">
          <ul>
            ${listThefts}
          </ul>
        </div>
      </div>
    </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: content,
    });

    marker.addListener("click", () => {
      console.log("click punto");
      infoWindow.open({
        anchor: marker,
        map,
      });
    });
  });
}
