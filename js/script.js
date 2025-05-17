const OFFSET_X = 40;
const OFFSET_Y = 40;
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const TARGET_DATE = new Date("2025-06-25T11:00:00").getTime();
const POPUP_SHOWN_KEY = "popupShown";
const GALLERIES = {
  "works-gallery": ["img/dashboard.png", "img/portraits.png", "img/malayalam.png"],
};


document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("interactive-svg");
  const circle = svg.querySelector("circle");

  window.addEventListener("scroll", () => handleScrollAnimation(svg, circle));

  if (!IS_MOBILE) {
    document.addEventListener("mousemove", (e) => followMouse(svg, e));
  } else {
    svg.style.position = "fixed";
    svg.style.transform = "translate(-50%, -50%) rotate(0deg)";
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const navbar = document.getElementById("navbar");
  const heroSection = document.querySelector(".hero");
  window.addEventListener("scroll", () => updateFixedNavbar(navbar, heroSection));
  updateFixedNavbar(navbar, heroSection);

  const delayedPopup = document.getElementById("delayed-popup");
  if (!localStorage.getItem(POPUP_SHOWN_KEY)) {
    setTimeout(() => delayedPopup.classList.add("active"), 42 * 1000);
  }

  delayedPopup.querySelector(".close-popup").addEventListener("click", () => {
    localStorage.setItem(POPUP_SHOWN_KEY, "true");
  });

  document.querySelectorAll(".close-popup").forEach((btn) => btn.addEventListener("click", function () {
    this.closest(".gallery-popup, .feedback-popup, .delayed-popup")?.classList.remove("active");
  }));

  const feedbackPopup = document.getElementById("feedback-popup");

  document.querySelector(".feedback-popup-btn").addEventListener("click", () => {
    feedbackPopup.classList.add("active");
  });

  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    let prevValue = "";
    phoneInput.addEventListener("input", (e) => {
      formatPhoneNumber(e, phoneInput, prevValue);
      prevValue = phoneInput.value;
    });
    phoneInput.addEventListener("keydown", restrictPhoneInput);
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmission);
  }

  const galleryImages = document.querySelectorAll(".gallery-image");
  const galleryPopup = document.getElementById("gallery-popup");
  const popupImage = document.getElementById("popup-image");
  const prevArrow = document.querySelector(".prev-arrow");
  const nextArrow = document.querySelector(".next-arrow");
  let currentImageIndex = 0;
  let currentGallery = "";

  galleryImages.forEach((img) => {
    img.addEventListener("click", function () {
      currentImageIndex = parseInt(this.getAttribute("data-index"));
      currentGallery = this.getAttribute("data-gallery");
      updateGalleryPopup(popupImage, currentGallery, currentImageIndex);
      updateArrows(prevArrow, nextArrow, currentImageIndex, GALLERIES[currentGallery].length);
      galleryPopup.classList.add("active");
    });
  });

  prevArrow.addEventListener("click", () => {
    if (currentImageIndex <= 0) return;

    currentImageIndex--;
    updateGalleryPopup(popupImage, currentGallery, currentImageIndex);
    updateArrows(prevArrow, nextArrow, currentImageIndex, GALLERIES[currentGallery].length);
  });

  nextArrow.addEventListener("click", () => {
    if (currentImageIndex >= GALLERIES[currentGallery].length - 1) return;

    currentImageIndex++;
    updateGalleryPopup(popupImage, currentGallery, currentImageIndex);
    updateArrows(prevArrow, nextArrow, currentImageIndex, GALLERIES[currentGallery].length);
  });

  document.addEventListener("keydown", (e) => {
    if (galleryPopup.classList.contains("active")) {
      switch (e.key) {
        case "ArrowLeft":
          prevArrow.click();
          break;
        case "ArrowRight":
          nextArrow.click();
          break;
        case "Escape":
          galleryPopup.classList.remove("active");
          break;
      }
    } else if (feedbackPopup.classList.contains("active")) {
      switch (e.key) {
        case "Escape":
          feedbackPopup.classList.remove("active");
          break;
      }
    } else if (delayedPopup.classList.contains("active")) {
      switch (e.key) {
        case "Escape":
          delayedPopup.classList.remove("active");
          localStorage.setItem(POPUP_SHOWN_KEY, "true");
          break;
      }
    }
  });
});


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

function clearAllErrors() {
  document.querySelectorAll(".error-message").forEach((e) => {
    e.textContent = "";
    e.classList.remove("active");
  });
  document.querySelectorAll(".error").forEach((e) => {
    e.classList.remove("error");
  });
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

function restrictPhoneInput(event) {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (!(/\d/.test(event.key) || allowedKeys.includes(event.key))) {
    event.preventDefault();
  }
}

function formatPhoneNumber(event, input, prevValue) {
  let digitsOnly = input.value.replace(/\D/g, "");
  let formatted = "";

  if (event.inputType === "deleteContentBackward") {
    const prevDigitsOnly = input.value.replace(/\D/g, "");
    input.value = input.value.slice(null, input.value.lastIndexOf(prevDigitsOnly.at(-1)) + 1);
    return;
  }

  if (digitsOnly.length > 0) {
    formatted = `+${digitsOnly.charAt(0)}`;
    digitsOnly = digitsOnly.slice(1);
  }
  if (digitsOnly.length > 0) {
    formatted += ` (${digitsOnly.slice(0, 3)}`;
    digitsOnly = digitsOnly.slice(3);
  }
  if (digitsOnly.length > 0) {
    formatted += `) ${digitsOnly.slice(0, 3)}`;
    digitsOnly = digitsOnly.slice(3);
  }
  if (digitsOnly.length > 0) {
    formatted += `-${digitsOnly.slice(0, 4)}`;
  }

  if (digitsOnly.length > 10) {
    input.value = prevValue;
  } else {
    input.value = formatted;
  }
}

function updateCountdown() {
  const now = Date.now();
  const delta = TARGET_DATE - now;

  const format = (value) => value.toString().padStart(2, "0");

  if (delta < 0) {
    ["days", "hours", "minutes", "seconds"].forEach((id) => {
      document.getElementById(id).textContent = "00";
    });
    return;
  }

  const days = Math.floor((delta % (365 * 24 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60));
  const minutes = Math.floor((delta % (60 * 60 * 1000)) / (1000 * 60));
  const seconds = Math.floor((delta % (60 * 1000)) / 1000);

  document.getElementById("days").textContent = format(days);
  document.getElementById("hours").textContent = format(hours);
  document.getElementById("minutes").textContent = format(minutes);
  document.getElementById("seconds").textContent = format(seconds);
}

async function handleFormSubmission(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  let isValid = true;

  clearAllErrors();

  const validations = [{
    id: "name", regex: /^[a-zA-Zа-яА-ЯёЁ\s']{2,50}$/, error: "Please enter a valid name (2-50 characters)",
  }, {
    id: "phone", regex: /^\+\d \(\d{3}\) \d{3}-\d{4}$/, error: "Please enter a valid phone number",
  }, {
    id: "email", regex: /^[^\s@]+@[^\s@]+\.[^\s@\.]{2,}$/, error: "Please enter a valid email address",
  },];

  validations.forEach(({id, regex, error}) => {
    const input = document.getElementById(id);
    if (!validateField(input, regex, error)) isValid = false;
  });

  const message = document.getElementById("message");
  if (!/^[a-zA-Zа-яА-ЯёЁ\s.,!?\-]+$/i.test(message.value.trim())) {
    showError(message, "Only English/Russian characters and basic punctuation");
    isValid = false;
  }
  if (message.value.trim().length < 10) {
    showError(message, "Message must be at least 10 characters");
    isValid = false;
  }

  if (!isValid) return;

  submitBtn.disabled = true;
  submitBtn.classList.add("sending");
  submitBtn.innerHTML = "Sending";

  try {
    const formData = new FormData(form);
    await fetch("https://httpbin.org/post", {
      method: "POST", body: formData,
    });

    submitBtn.classList.replace("sending", "success");
    submitBtn.innerHTML = "Successfully send!";

    setTimeout(() => {
      document
        .querySelector(".feedback-popup.active")
        ?.classList.remove("active");
      form.reset();
      clearAllErrors();
      submitBtn.classList.remove("success");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Send";
    }, 3000);
  } catch {
    showError(submitBtn, "Sending failed. Please try again.");
    submitBtn.disabled = false;
    submitBtn.classList.remove("sending");
    submitBtn.innerHTML = "Send";
  }
}

function handleScrollAnimation(svg, circle) {
  const scrollY = window.scrollY;
  circle.setAttribute("fill", `hsl(${scrollY % 360}, 100%, 60%)`);
  svg.style.transform = `rotate(${scrollY}deg)`;
}

function followMouse(svg, e) {
  svg.style.left = `${e.clientX - OFFSET_X}px`;
  svg.style.top = `${e.clientY - OFFSET_Y}px`;
}

function updateFixedNavbar(navbar, heroSection) {
  const heroBottomHeight = heroSection.offsetTop + heroSection.offsetHeight;
  window.scrollY > heroBottomHeight * 1.2 ? navbar.classList.add("fixed") : navbar.classList.remove("fixed");
}

function updateGalleryPopup(popupImage, currentGallery, currentImageIndex) {
  popupImage.src = GALLERIES[currentGallery][currentImageIndex];
}

function updateArrows(prevArrow, nextArrow, currentIndex, galleryLength) {
  prevArrow.disabled = currentIndex === 0;
  nextArrow.disabled = currentIndex === galleryLength - 1;
}
