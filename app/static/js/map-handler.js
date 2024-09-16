// Variable para almacenar la instancias correspondientes al mapa de Google Maps.
let map;
let markers = [];
let markerCluster;

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
            if (data.data.length === 0) {
              alert("No hay reportes de hurto para este rango de fechas.");
            }
            loadMarkers(data.data);
          } else {
          }
        })
        .catch((error) => {
          alert("Intente de nuevo. Ocurrió un error.");
        });
    });
});

/**
 * Inicializa el mapa de Google Maps con una posición inicial y restricciones de área.
 */
function initMap() {
  const initialPosition = { lat: 4.6533816, lng: -74.0836333 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: initialPosition,
    restriction: {
      latLngBounds: {
        north: 4.9058844996972425,
        south: 4.266733218364823,
        west: -74.65434937395299,
        east: -73.85910942266366,
      },
      strictBounds: true,
    },
  });
  markerCluster = new MarkerClusterer(map, markers);
}

/**
 * Elimina todos los marcadores del mapa y limpia la lista de marcadores.
 */
function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

/**
 * Carga los marcadores y sus clusteres dinámicos en el mapa basados en los datos proporcionados.
 *
 * @param {Array} data - Lista de datos que contienen información para cada marcador (latitud, longitud, fecha, robos).
 */
function loadMarkers(data) {
  clearMarkers();
  markerCluster.clearMarkers();
  let image = "/static/images/hotsbog-marker-icon.png";
  data.forEach((place) => {
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(place.lat), lng: parseFloat(place.lng) },
      map: map,
      icon: {
        url: image,
        scaledSize: new google.maps.Size(60, 60),
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
        <div class="info-items info-horizontal-line"></div>
        <div class="info-items">
          <span class="info-span"> ${place.name} </span>
        </div>
      </div>
    </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: content,
    });

    marker.addListener("click", () => {
      infoWindow.open({
        anchor: marker,
        map,
      });
    });
  });
  markerCluster = new MarkerClusterer(map, markers, {
    imagePath:
      "https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/images/m",
    algorithmOptions: { radius: 80 },
    gridSize: 80,
  });
}
