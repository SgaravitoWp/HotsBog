function initMap() {
  const initialPosition = { lat: 4.6533816, lng: -74.0836333 };

  const map = new google.maps.Map(document.getElementById("map"), {
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

  function cargarMarcadores() {
    fetch("/load-reports")
      .then((response) => response.json())
      .then((lugares) => {
        lugares.forEach((lugar) => {
          const marker = new google.maps.Marker({
            position: { lat: lugar.lat, lng: lugar.lng },
            map: map,
            title: lugar.name,
            optimized: false,
            clickable: false,
            draggable: false,
          });

          // const label = new google.maps.InfoWindow({
          //     content: `<div style="font-weight: bold;">${lugar.name}</div>`,
          //     position: {lat: lugar.lat, lng: lugar.lng},
          //     disableAutoPan: true
          // });
          // label.open(map);
        });
      })
      .catch((error) =>
        console.error("Error al cargar los marcadores:", error)
      );
  }

  cargarMarcadores();
}
