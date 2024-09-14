let map;
let markers = [];

function checkAllConditions() {
  const submitButton = document.getElementById("submitAll");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  let isValidDate = false;

  if (startDate.value.trim() !== "" && endDate.value.trim() !== "") {
    const startDateValue = new Date(startDate.value.trim());
    const endDateValue = new Date(endDate.value.trim());
    isValidDate = startDateValue <= endDateValue;
  }

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

      fetch("/load-reports", {
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
          } else {
            console.error("Error:", data.message);
          }
        })
        .catch((error) => {
          alert("Intente de nuevo. Ocurrio un error. ");
          console.error("Error en el envío:", error);
        });
    });
});

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

function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function loadMarkers(data) {
  clearMarkers();
  data.forEach((place) => {
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(place.lat), lng: parseFloat(place.lng) },
      map: map,
      title: place.name,
      optimized: false,
      clickable: false,
      draggable: false,
    });
    markers.push(marker);
    // const label = new google.maps.InfoWindow({
    //     content: `<div style="font-weight: bold;">${place.name}</div>`,
    //     position: {lat: place.lat, lng: place.lng},
    //     disableAutoPan: true
    // });
    // label.open(map);
  });
}
