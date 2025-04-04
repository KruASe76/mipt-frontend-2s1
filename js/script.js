document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    let previousValue = "";

    phoneInput.addEventListener("input", (e) => {
      formatPhoneNumber(e, phoneInput, previousValue);
      previousValue = phoneInput.value;
    });

    phoneInput.addEventListener("keydown", restrictPhoneInput);
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmission);
  }
});

function formatPhoneNumber(event, inputElement, prevValue) {
  let digitsOnly = inputElement.value.replace(/\D/g, "");
  let formattedValue = "";

  if (event.inputType === "deleteContentBackward") return;

  if (digitsOnly.length > 0) {
    formattedValue = `+${digitsOnly.charAt(0)}`;
    digitsOnly = digitsOnly.substring(1);
  }
  if (digitsOnly.length > 0) {
    formattedValue += ` (${digitsOnly.substring(0, 3)}`;
    digitsOnly = digitsOnly.substring(3);
  }
  if (digitsOnly.length > 0) {
    formattedValue += `) ${digitsOnly.substring(0, 3)}`;
    digitsOnly = digitsOnly.substring(3);
  }
  if (digitsOnly.length > 0) {
    formattedValue += `-${digitsOnly.substring(0, 4)}`;
  }

  if (digitsOnly.length > 10) {
    inputElement.value = prevValue;
  } else {
    inputElement.value = formattedValue;
  }
}

function restrictPhoneInput(event) {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (!/\d/.test(event.key) && !allowedKeys.includes(event.key)) {
    event.preventDefault();
  }
}

function handleFormSubmission(event) {
  event.preventDefault();
  const form = event.target;
  let isValid = true;

  const validations = [
    {
      id: "name",
      regex: /^[a-zA-Zа-яА-ЯёЁ\s']{2,50}$/,
      error: "Please enter a valid name (2-50 characters)",
    },
    {
      id: "phone",
      regex: /^\+\d \(\d{3}\) \d{3}-\d{4}$/,
      error: "Please enter a valid phone number",
    },
    {
      id: "email",
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      error: "Please enter a valid email address",
    },
  ];

  validations.forEach(({id, regex, error}) => {
    const input = document.getElementById(id);
    if (!validateField(input, regex, error)) isValid = false;
  });

  const messageInput = document.getElementById("message");
  if (messageInput.value.trim().length < 3) {
    showError(messageInput, "Message must be at least 3 characters");
    isValid = false;
  } else {
    clearError(messageInput);
  }

  if (isValid) {
    form.reset();
    showFormSuccess("Message sent successfully!");
  }
}

function validateField(input, regex, errorMessage) {
  if (!regex.test(input.value.trim())) {
    showError(input, errorMessage);
    return false;
  }
  clearError(input);
  return true;
}

function showError(input, message) {
  const errorElement = getOrCreateErrorElement(input);
  input.classList.add("error");
  errorElement.textContent = message;
  errorElement.classList.add("active");
}

function clearError(input) {
  const errorElement = input.parentElement.querySelector(".error-message");
  if (errorElement) {
    input.classList.remove("error");
    errorElement.textContent = "";
    errorElement.classList.remove("active");
  }
}

function getOrCreateErrorElement(input) {
  let errorElement = input.parentElement.querySelector(".error-message");
  if (!errorElement) {
    errorElement = document.createElement("span");
    errorElement.className = "error-message";
    input.parentElement.appendChild(errorElement);
  }
  return errorElement;
}

function showFormSuccess(message) {
  const successMessage = document.createElement("div");
  successMessage.className = "form-success active";
  successMessage.textContent = message;

  const form = document.getElementById("contactForm");
  const existingMessage = form.querySelector(".form-success");
  if (existingMessage) existingMessage.remove();

  form.appendChild(successMessage);
  setTimeout(() => successMessage.remove(), 5000);
}
