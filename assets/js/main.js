/* KVIAZ — main.js
   Progressive enhancement only: every feature here degrades gracefully
   if JavaScript fails to load. No frameworks, no build step. */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    var setNavOpen = function (open) {
      nav.setAttribute("data-open", String(open));
      navToggle.setAttribute("aria-expanded", String(open));
    };

    navToggle.addEventListener("click", function () {
      setNavOpen(nav.getAttribute("data-open") !== "true");
    });

    nav.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () { setNavOpen(false); });
    });

    /* Close on Escape and return focus to the toggle */
    nav.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    /* Close when a click lands outside the open menu */
    document.addEventListener("click", function (e) {
      if (nav.getAttribute("data-open") === "true" && !nav.contains(e.target)) {
        setNavOpen(false);
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Registry row expand (Companies detail rows) ---------- */
  document.querySelectorAll(".registry-row[data-expand]").forEach(function (row) {
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-expanded", "false");

    var detailId = row.getAttribute("aria-controls");
    var detail = detailId ? document.getElementById(detailId) : null;

    function toggle() {
      var isOpen = row.classList.toggle("is-open");
      row.setAttribute("aria-expanded", String(isOpen));
      if (detail) { detail.hidden = !isOpen; }
    }
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---------- Contact form validation ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var fields = form.querySelectorAll("[data-required]");

      fields.forEach(function (field) {
        var wrapper = field.closest(".form__field");
        var value = field.value.trim();
        var ok = value.length > 0;

        if (ok && field.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (wrapper) { wrapper.classList.toggle("has-error", !ok); }
        field.setAttribute("aria-invalid", String(!ok));
        if (!ok) { valid = false; }
      });

      if (!valid) {
        var firstError = form.querySelector(".has-error input, .has-error textarea, .has-error select");
        if (firstError) { firstError.focus(); }
        return;
      }

      form.classList.add("is-submitted");
      var success = document.querySelector("[data-form-success]");
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }
})();
