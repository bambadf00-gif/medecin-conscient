/* ==========================================================================
   Médecin Conscient — script.js
   Menu mobile, scroll reveal, compteurs animés, marquee, lightbox,
   slider de témoignages, bouton retour en haut, formulaire de collaboration.
   ========================================================================== */

(function () {
  "use strict";

  /* ============ CONFIG — à remplacer par les vraies coordonnées ============ */
  var contactEmail = "contact@medecinconscient.com";

  /* ============ Liens email (topbar / contact direct / footer) ============ */
  ["topEmailLink", "directEmailLink", "footerEmailLink"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = "mailto:" + contactEmail;
  });

  /* ============ Navbar : fond au scroll ============ */
  var siteNav = document.getElementById("siteNav");
  function updateNavBackground() {
    if (!siteNav) return;
    if (window.scrollY > 40) siteNav.classList.add("scrolled");
    else siteNav.classList.remove("scrolled");
  }
  updateNavBackground();
  window.addEventListener("scroll", updateNavBackground, { passive: true });

  /* ============ Menu mobile plein écran ============ */
  var menuToggle = document.getElementById("menuToggle");
  var menuIcon = document.getElementById("menuIcon");
  var mobileMenu = document.getElementById("mobileMenu");

  function openMobileMenu() {
    mobileMenu.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    if (menuIcon) menuIcon.innerHTML = "&times;";
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (menuIcon) menuIcon.innerHTML = "&#9776;";
    document.body.style.overflow = "";
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("open")) closeMobileMenu();
      else openMobileMenu();
    });

    mobileMenu.querySelectorAll(".mobile-link").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) {
      closeMobileMenu();
    }
  });

  /* ============ Scroll reveal ============ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ============ Compteurs animés (statistiques audience) ============ */
  var counters = document.querySelectorAll(".num-counter");
  function animateCounter(el) {
    var target = parseFloat(el.dataset.count || "0");
    var suffix = el.dataset.suffix || "";
    var isDecimal = target % 1 !== 0;
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(animateCounter);
  }

  /* ============ Lightbox (contenus : images + vidéos) ============ */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxVideo = document.getElementById("lightboxVideo");
  var lightboxClose = document.getElementById("lightboxClose");
  var contentItems = document.querySelectorAll(".content-item");

  function openLightbox(type, src, poster) {
    if (!lightbox) return;
    lightboxImg.classList.add("hidden");
    lightboxVideo.classList.add("hidden");
    lightboxVideo.pause();

    if (type === "video") {
      lightboxVideo.src = src;
      if (poster) lightboxVideo.poster = poster;
      lightboxVideo.classList.remove("hidden");
      lightboxVideo.play().catch(function () {});
    } else {
      lightboxImg.src = src;
      lightboxImg.classList.remove("hidden");
    }

    lightbox.classList.remove("hidden");
    lightbox.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add("hidden");
    lightbox.classList.remove("flex");
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
    document.body.style.overflow = "";
  }

  contentItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var type = item.dataset.media;
      var src = item.dataset.src;
      var poster = item.dataset.poster;
      openLightbox(type, src, poster);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.classList.contains("hidden")) {
      closeLightbox();
    }
  });

  /* ============ Slider de témoignages ============ */
  var testimonialInner = document.getElementById("testimonialInner");
  var testiPrev = document.getElementById("testiPrev");
  var testiNext = document.getElementById("testiNext");
  var testiIndexEl = document.getElementById("testiIndex");

  if (testimonialInner) {
    var slides = testimonialInner.children;
    var total = slides.length;
    var current = 0;

    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }

    function updateSlider() {
      testimonialInner.style.transform = "translateX(-" + current * 100 + "%)";
      if (testiIndexEl) testiIndexEl.textContent = pad(current + 1);
    }

    if (testiPrev) {
      testiPrev.addEventListener("click", function () {
        current = (current - 1 + total) % total;
        updateSlider();
      });
    }
    if (testiNext) {
      testiNext.addEventListener("click", function () {
        current = (current + 1) % total;
        updateSlider();
      });
    }

    updateSlider();
  }

  /* ============ Bouton retour en haut ============ */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 600) backToTop.classList.add("is-visible");
        else backToTop.classList.remove("is-visible");
      },
      { passive: true }
    );
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============ Formulaire de collaboration ============ */
  var form = document.getElementById("collabForm");
  if (form) {
    var submitBtn = document.getElementById("submitBtn");
    var submitLabel = document.getElementById("submitLabel");
    var formSuccess = document.getElementById("formSuccess");
    var formError = document.getElementById("formError");

    function showFieldError(field, message) {
      var wrapper = field.closest(".field-line");
      if (!wrapper) return;
      wrapper.classList.add("field-invalid");
      var msg = wrapper.querySelector(".field-error-msg");
      if (msg) {
        msg.textContent = message;
        msg.classList.remove("hidden");
      }
    }

    function clearFieldError(field) {
      var wrapper = field.closest(".field-line");
      if (!wrapper) return;
      wrapper.classList.remove("field-invalid");
      var msg = wrapper.querySelector(".field-error-msg");
      if (msg) {
        msg.textContent = "";
        msg.classList.add("hidden");
      }
    }

    form.querySelectorAll("[required]").forEach(function (field) {
      field.addEventListener("input", function () {
        clearFieldError(field);
      });
      field.addEventListener("change", function () {
        clearFieldError(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (formSuccess) formSuccess.classList.add("hidden");
      if (formError) formError.classList.add("hidden");

      // Honeypot anti-spam : si rempli, on ignore silencieusement l'envoi.
      var honeypot = form.querySelector("#website");
      if (honeypot && honeypot.value.trim() !== "") {
        form.reset();
        return;
      }

      var isValid = true;
      var firstInvalid = null;

      form.querySelectorAll("[required]").forEach(function (field) {
        clearFieldError(field);
        var value = (field.value || "").trim();
        var fieldValid = true;

        if (!value) {
          fieldValid = false;
          showFieldError(field, "Ce champ est requis.");
        } else if (field.type === "email") {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            fieldValid = false;
            showFieldError(field, "Merci d'indiquer un email valide.");
          }
        }

        if (!fieldValid) {
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!isValid) {
        if (formError) formError.classList.remove("hidden");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Pas de backend branché ici : on confirme simplement la saisie côté client.
      // Pour envoyer réellement la demande, relier ce formulaire à un service
      // (Formspree, Netlify Forms, une API interne, etc.) et remplacer ce bloc.
      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = "Envoi en cours…";

      setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = "Envoyer ma demande";
        if (formSuccess) formSuccess.classList.remove("hidden");
        form.reset();
      }, 600);
    });
  }
})();