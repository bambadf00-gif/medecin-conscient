/* ==========================================================================
   Médecin Conscient — script.js
   Menu mobile, scroll reveal, compteurs animés, lecture vidéo automatique au scroll,
   marquee, lightbox, slider de témoignages, bouton retour en haut.
   ========================================================================== */
(function () {
  "use strict";
  var contactEmail = "contact@medecinconscient.com";
  ["topEmailLink", "directEmailLink", "footerEmailLink"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = "mailto:" + contactEmail;
  });
  var siteNav = document.getElementById("siteNav");
  function updateNavBackground() {
    if (!siteNav) return;
    if (window.scrollY > 40) siteNav.classList.add("scrolled");
    else siteNav.classList.remove("scrolled");
  }
  updateNavBackground();
  window.addEventListener("scroll", updateNavBackground, { passive: true });
  var menuToggle = document.getElementById("menuToggle");
  var menuIcon = document.getElementById("menuIcon");
  var mobileMenu = document.getElementById("mobileMenu");
  function openMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    if (menuIcon) menuIcon.innerHTML = "&times;";
    document.body.style.overflow = "hidden";
  }
  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (menuIcon) menuIcon.innerHTML = "☰";
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
  var autoVideos = document.querySelectorAll(".auto-video");
  if ("IntersectionObserver" in window && autoVideos.length > 0) {
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(function (error) {
              console.log("Lecture automatique bloquée ou en attente d'interaction :", error);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    autoVideos.forEach(function (video) {
      videoObserver.observe(video);
    });
  }
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxVideo = document.getElementById("lightboxVideo");
  var lightboxClose = document.getElementById("lightboxClose");
  var contentItems = document.querySelectorAll(".content-item");
  function openLightbox(type, src, poster) {
    if (!lightbox) return;
    if (lightboxImg) lightboxImg.classList.add("hidden");
    if (lightboxVideo) {
      lightboxVideo.classList.add("hidden");
      lightboxVideo.pause();
    }
    if (type === "video" && lightboxVideo) {
      lightboxVideo.src = src;
      if (poster) lightboxVideo.poster = poster;
      lightboxVideo.classList.remove("hidden");
      lightboxVideo.play().catch(function () {});
    } else if (lightboxImg) {
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
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute("src");
      lightboxVideo.load();
    }
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
})();
