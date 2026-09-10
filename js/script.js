/* ==========================================================================
   Médecin Conscient — script.js
   JavaScript Vanilla — aucune dépendance externe.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURATION — à modifier facilement
   -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "221771151881"; // format international sans "+" ni espaces
const PHONE_NUMBER = "+221771151881";   // format d'affichage / lien tel:

/* --------------------------------------------------------------------------
   Initialisation au chargement du DOM
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initFloatingButtons();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initFooterYear();
  initHeaderShadowOnScroll();

  // Ces fonctions n'agissent que si les éléments concernés existent sur la page
  initPhotoUpload();
  initConsultationForm();
  initModal();
});

/* --------------------------------------------------------------------------
   1. Boutons flottants (WhatsApp + Appel)
   -------------------------------------------------------------------------- */
function initFloatingButtons() {
  const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");
  const callLinks = document.querySelectorAll("[data-call-link]");

  whatsappLinks.forEach((link) => {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  });

  callLinks.forEach((link) => {
    link.href = `tel:${PHONE_NUMBER}`;
  });
}

/* --------------------------------------------------------------------------
   2. Menu mobile
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("icon-menu-open");
  const iconClose = document.getElementById("icon-menu-close");

  if (!toggleBtn || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.add("max-h-0", "opacity-0");
    mobileMenu.classList.remove("max-h-96", "opacity-100");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (iconOpen && iconClose) {
      iconOpen.classList.remove("hidden");
      iconClose.classList.add("hidden");
    }
  };

  const openMenu = () => {
    mobileMenu.classList.remove("max-h-0", "opacity-0");
    mobileMenu.classList.add("max-h-96", "opacity-100");
    toggleBtn.setAttribute("aria-expanded", "true");
    if (iconOpen && iconClose) {
      iconOpen.classList.add("hidden");
      iconClose.classList.remove("hidden");
    }
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  // Ferme le menu mobile automatiquement au clic sur un lien
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

/* --------------------------------------------------------------------------
   3. Défilement fluide (smooth scroll) vers les ancres
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const targetId = href.substring(hashIndex + 1);
      if (!targetId) return;

      const isSamePage =
        href.startsWith("#") ||
        href.startsWith(window.location.pathname.split("/").pop() + "#") ||
        href.startsWith("./" + window.location.pathname.split("/").pop() + "#");

      const targetEl = document.getElementById(targetId);

      if (isSamePage && targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Apparition des sections au scroll
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. Année automatique dans le footer
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------------------------------
   6. Ombre du header au scroll
   -------------------------------------------------------------------------- */
function initHeaderShadowOnScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const updateHeader = () => {
    if (window.scrollY > 8) {
      header.classList.add("shadow-md");
    } else {
      header.classList.remove("shadow-md");
    }
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

/* --------------------------------------------------------------------------
   7. Aperçu et suppression de la photo (formulaire de consultation)
   -------------------------------------------------------------------------- */
function initPhotoUpload() {
  const fileInput = document.getElementById("photo-input");
  const previewWrapper = document.getElementById("photo-preview-wrapper");
  const previewImage = document.getElementById("photo-preview-image");
  const removeBtn = document.getElementById("photo-remove-btn");
  const dropZoneLabel = document.getElementById("photo-dropzone-label");
  const fileError = document.getElementById("photo-error");

  if (!fileInput || !previewWrapper || !previewImage || !removeBtn) return;

  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    fileError.classList.add("hidden");
    fileError.textContent = "";

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      fileError.textContent =
        "Format non pris en charge. Merci d'ajouter une image JPG, PNG, WEBP ou GIF.";
      fileError.classList.remove("hidden");
      fileInput.value = "";
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      fileError.textContent = `L'image dépasse ${MAX_SIZE_MB } Mo. Merci de choisir une image plus légère.`;
      fileError.classList.remove("hidden");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewWrapper.classList.remove("hidden");
      if (dropZoneLabel) dropZoneLabel.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", () => {
    fileInput.value = "";
    previewImage.src = "";
    previewWrapper.classList.add("hidden");
    fileError.classList.add("hidden");
    if (dropZoneLabel) dropZoneLabel.classList.remove("hidden");
  });
}

/* --------------------------------------------------------------------------
   8. Validation et état du formulaire de consultation en ligne
   -------------------------------------------------------------------------- */
function initConsultationForm() {
  const form = document.getElementById("consultation-form");
  if (!form) return;

  const nameInput = document.getElementById("field-name");
  const phoneInput = document.getElementById("field-phone");
  const addressInput = document.getElementById("field-address");
  const typeSelect = document.getElementById("field-type");
  const descriptionInput = document.getElementById("field-description");
  const consentCheckbox = document.getElementById("field-consent");
  const submitBtn = document.getElementById("consultation-submit");

  const phoneError = document.getElementById("phone-error");

  // Numéro sénégalais souple : accepte +221, 221 ou 9 chiffres locaux, espaces facultatifs
  const PHONE_REGEX = /^(\+?221)?[\s]?7[0-8][\s]?\d{3}[\s]?\d{2}[\s]?\d{2}$|^(\+?221)?[\s]?[3][3][\s]?\d{3}[\s]?\d{2}[\s]?\d{2}$/;

  function isPhoneValid(value) {
    const cleaned = value.replace(/[\s.-]/g, "");
    return PHONE_REGEX.test(cleaned) && cleaned.replace(/\D/g, "").length >= 9;
  }

  function validateField(input) {
    if (!input) return true;
    return input.value.trim().length > 0;
  }

  function updateSubmitState() {
    const requiredFilled =
      validateField(nameInput) &&
      validateField(addressInput) &&
      validateField(typeSelect) &&
      validateField(descriptionInput) &&
      phoneInput.value.trim().length > 0;

    const consentChecked = consentCheckbox && consentCheckbox.checked;

    const allValid = requiredFilled && consentChecked;

    submitBtn.disabled = !allValid;
    submitBtn.classList.toggle("opacity-50", !allValid);
    submitBtn.classList.toggle("cursor-not-allowed", !allValid);
  }

  [nameInput, phoneInput, addressInput, typeSelect, descriptionInput].forEach(
    (input) => {
      if (!input) return;
      input.addEventListener("input", updateSubmitState);
      input.addEventListener("change", updateSubmitState);
    }
  );

  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", updateSubmitState);
  }

  phoneInput.addEventListener("blur", () => {
    if (phoneInput.value.trim().length === 0) {
      phoneError.classList.add("hidden");
      return;
    }
    if (!isPhoneValid(phoneInput.value)) {
      phoneError.textContent =
        "Merci de vérifier votre numéro de téléphone (ex : +221 77 123 45 67).";
      phoneError.classList.remove("hidden");
      phoneInput.classList.add("border-red-400");
    } else {
      phoneError.classList.add("hidden");
      phoneInput.classList.remove("border-red-400");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!isPhoneValid(phoneInput.value)) {
      phoneError.textContent =
        "Merci de vérifier votre numéro de téléphone (ex : +221 77 123 45 67).";
      phoneError.classList.remove("hidden");
      phoneInput.classList.add("border-red-400");
      phoneInput.focus();
      return;
    }

    // Aucun backend : la demande n'est ni envoyée ni enregistrée réellement.
    // Cette étape simule uniquement la préparation de la demande côté client.
    const message = buildWhatsAppMessage({
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
      type: typeSelect.options[typeSelect.selectedIndex]
        ? typeSelect.options[typeSelect.selectedIndex].text
        : "",
      description: descriptionInput.value.trim(),
    });

    const whatsappBtn = document.getElementById("modal-whatsapp-btn");
    if (whatsappBtn) {
      whatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    }

    openConfirmationModal();

    form.reset();
    const previewWrapper = document.getElementById("photo-preview-wrapper");
    const dropZoneLabel = document.getElementById("photo-dropzone-label");
    if (previewWrapper) previewWrapper.classList.add("hidden");
    if (dropZoneLabel) dropZoneLabel.classList.remove("hidden");
    updateSubmitState();
  });

  // État initial
  updateSubmitState();
}

/* --------------------------------------------------------------------------
   Construit le message WhatsApp pré-rempli à partir des champs du formulaire
   -------------------------------------------------------------------------- */
function buildWhatsAppMessage({ name, phone, address, type, description }) {
  const lines = [
    "Bonjour, je souhaite faire une demande de consultation.",
    "",
    `Nom complet : ${name}`,
    `Téléphone : ${phone}`,
    `Adresse : ${address}`,
    `Type de demande : ${type}`,
    `Description : ${description}`,
  ];
  return encodeURIComponent(lines.join("\n"));
}

/* --------------------------------------------------------------------------
   9-10. Modal de confirmation
   -------------------------------------------------------------------------- */
function initModal() {
  const modal = document.getElementById("confirmation-modal");
  if (!modal) return;

  const closeBtn = document.getElementById("modal-close-btn");
  const overlay = document.getElementById("modal-overlay");

  closeBtn.addEventListener("click", closeConfirmationModal);
  overlay.addEventListener("click", closeConfirmationModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeConfirmationModal();
    }
  });
}

function openConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");

  const closeBtn = document.getElementById("modal-close-btn");
  if (closeBtn) closeBtn.focus();
}

function closeConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}
