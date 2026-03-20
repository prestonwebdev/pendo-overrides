/**
 * ==========================================================================
 * PENDO BOTTOM-RIGHT GUIDE OVERRIDES
 *
 * 1) Animation — Adds .pendo-animate-in after a 2s delay
 *    (slides in from the right)
 * 2) Close button — Wraps default close in a pill with SVG icon
 *    (Bottom Right Aligned guides only)
 * 3) Content padding — Applies inline padding to rows;
 *    image rows get zero padding for full-bleed
 * ==========================================================================
 */
(function () {

  /* -----------------------------------------------------------------------
     CONFIGURATION
     ----------------------------------------------------------------------- */
  var DELAY_MS = 2000;
  var WRAP_CLASS = "pendo-close-circle-wrap";
  var TARGET_ALIGNMENT = "Bottom Right Aligned";

  /* -----------------------------------------------------------------------
     UTILITY: Create SVG X icon
     ----------------------------------------------------------------------- */
  function createSvgX() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M6 6 L18 18 M6 18 L18 6");
    svg.appendChild(path);
    return svg;
  }

  /* -----------------------------------------------------------------------
     1) ANIMATION
     ----------------------------------------------------------------------- */
  function animateIn() {
    var containers = document.querySelectorAll("._pendo-step-container-styles");
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      if (container.dataset.pendoAnimated === "1") continue;
      container.dataset.pendoAnimated = "1";

      (function (el) {
        setTimeout(function () {
          if (document.body.contains(el)) {
            el.classList.add("pendo-animate-in");
          }
        }, DELAY_MS);
      })(container);
    }
  }

  /* -----------------------------------------------------------------------
     2) CLOSE BUTTON
     ----------------------------------------------------------------------- */
  function processCloseButton() {
    var stepContainers = document.querySelectorAll("._pendo-step-container-size");

    for (var i = 0; i < stepContainers.length; i++) {
      var container = stepContainers[i];
      var alignment = container.getAttribute("data-vertical-alignment");

      if (alignment !== TARGET_ALIGNMENT) continue;
      if (container.dataset.pendoCloseScoped === "1") continue;

      var btn = container.querySelector("button._pendo-close-guide")
             || container.querySelector("button[id^=pendo-close]")
             || container.querySelector("button[aria-label=Close]");
      if (!btn) continue;

      container.dataset.pendoCloseScoped = "1";

      var wrap = (btn.parentElement && btn.parentElement.classList.contains(WRAP_CLASS))
        ? btn.parentElement : null;

      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = WRAP_CLASS;
        btn.parentNode.insertBefore(wrap, btn);
        wrap.appendChild(btn);
      }

      if (wrap.dataset.pendoCloseBound !== "1") {
        wrap.dataset.pendoCloseBound = "1";
        wrap.style.cursor = "pointer";
        wrap.setAttribute("role", "button");
        wrap.setAttribute("tabindex", "0");
        wrap.setAttribute("aria-label", "Close");

        (function (b) {
          wrap.addEventListener("click", function (e) {
            if (!b.contains(e.target)) b.click();
          });
          wrap.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              b.click();
            }
          });
        })(btn);
      }

      btn.style.setProperty("position", "static", "important");
      btn.style.setProperty("inset", "auto", "important");
      btn.style.setProperty("padding", "0", "important");
      btn.style.setProperty("margin", "0", "important");
      btn.style.setProperty("background", "transparent", "important");
      btn.style.setProperty("border", "0", "important");
      btn.style.setProperty("min-width", "0", "important");
      btn.style.setProperty("line-height", "1", "important");
      btn.style.setProperty("font-size", "0", "important");
      btn.style.setProperty("display", "flex", "important");
      btn.style.setProperty("align-items", "center", "important");
      btn.style.setProperty("justify-content", "center", "important");
      btn.style.removeProperty("width");
      btn.style.removeProperty("height");

      if (!btn.querySelector("svg")) {
        btn.innerHTML = "";
        btn.appendChild(createSvgX());
      }
    }
  }

  /* -----------------------------------------------------------------------
     3) CONTENT PADDING
     Applies inline padding directly to each row element.
     Rows with a ._pendo-image (actual content image) get 0 padding.
     All other rows get 20px horizontal padding.
     Uses ._pendo-image class to distinguish content images from
     Pendo editor UI icons (which use .pendo-inline-ui).
     ----------------------------------------------------------------------- */
  function processContentPadding() {
    var containers = document.querySelectorAll("._pendo-step-container-styles");

    for (var c = 0; c < containers.length; c++) {
      var container = containers[c];

      // Pad rows (image rows get zero for full-bleed)
      var rows = container.querySelectorAll("._pendo-row");
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var hasContentImage = row.querySelector("._pendo-image");

        if (hasContentImage) {
          row.style.setProperty("padding-left", "0", "important");
          row.style.setProperty("padding-right", "0", "important");
        } else {
          row.style.setProperty("padding-left", "20px", "important");
          row.style.setProperty("padding-right", "20px", "important");
        }
      }

      // Pad poll question text (sits outside a _pendo-row).
      // Uses [data-pendo-poll-id] to match all poll types (yes/no, number scale, etc.)
      var pollQuestions = container.querySelectorAll("._pendo-text-paragraph[data-pendo-poll-id]");
      for (var t = 0; t < pollQuestions.length; t++) {
        var pq = pollQuestions[t];
        pq.style.setProperty("padding-left", "20px", "important");
        pq.style.setProperty("padding-right", "20px", "important");
      }
    }
  }

  /* -----------------------------------------------------------------------
     INIT
     ----------------------------------------------------------------------- */
  function init() {
    animateIn();
    processCloseButton();
    processContentPadding();
  }

  init();

  var observer;
  var debounceTimer;

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (document.querySelector("._pendo-step-container-styles")) {
          init();
        } else {
          observer.disconnect();
          observer = null;
        }
      }, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  startObserver();

})();
