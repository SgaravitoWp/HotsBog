var lat = "";
var lng = "";
var isPositionFilled = false;

function checkAllConditions() {
  const submitButton = document.getElementById("submitAll");
  const dateInput = document.getElementById("date-input");
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  const isDateFilled = dateInput.value.trim() !== "";
  const isAnyCheckboxChecked = Array.from(checkboxes).some(
    (checkbox) => checkbox.checked
  );

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

  dateInput.addEventListener("input", checkAllConditions);
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", checkAllConditions)
  );

  checkAllConditions();
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
            alert("Su reporte fue realizado con exito. ");
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

function updateCoordinates(position) {
  lat = position.lat();
  lng = position.lng();
  isPositionFilled = true;
  checkAllConditions();
}

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

  map.addListener("click", function (event) {
    const clickedLocation = event.latLng;

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
