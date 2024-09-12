document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("submitAll");
  const dateInput = document.getElementById("date-input");
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  function validateForm() {
    const isDateFilled = dateInput.value.trim() !== "";
    const isAnyCheckboxChecked = Array.from(checkboxes).some(
      (checkbox) => checkbox.checked
    );

    submitButton.disabled = !(isDateFilled && isAnyCheckboxChecked);

    submitButton.style.opacity = submitButton.disabled ? '0.5' : '1';
  }

  // Añadir event listeners
  dateInput.addEventListener("input", validateForm);
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", validateForm)
  );

  // Validar formulario inicialmente
  validateForm();
  document
    .getElementById("submitAll")
    .addEventListener("click", function (event) {
      console.log("Botón clickeado");
      event.preventDefault(); // Prevenir el comportamiento por defecto del botón

      let date_input = document.getElementById("date-input").value;

      let checkboxes = document.querySelectorAll(
        'input[name="options"]:checked'
      );

      let selectedValues = Array.from(checkboxes).map(
        (checkbox) => checkbox.value
      );

      // let electronic_input = document.getElementById("electronic-input").value;
      // let money_input = document.getElementById("money-input").value;
      // let vehicle_input = document.getElementById("vehicle-input").value;
      // let others_input = document.getElementById("others-input").value;

      // Convertir los datos de FormData a un objeto JSON
      let combinedData = {
        date_input: date_input,
        selected_values: selectedValues,
      };

      // Enviar los datos combinados como JSON
      fetch("/report-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            window.location.href = "/home";
        } else {
            console.error('Error:', data.message);
        }
        })
        .catch((error) => {
          console.error("Error en el envío:", error);
        });
    });
});
