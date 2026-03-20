/**
 * ==========================================================================
 * PENDO TOOLTIP GUIDE OVERRIDES
 *
 * 1) Brand colors — Sets CSS custom properties from customer theme
 * 2) Primary + secondary button — Overrides Pendo's inline hover styles
 * 3) Close button — Wraps default close in a pill with SVG icon
 *    (Centered guides only)
 * ==========================================================================
 */
(function () {

  var WRAP_CLASS = "pendo-close-circle-wrap";

  var FALLBACK_THEME = {
    100: "#F1FCED",
    300: "#97ED7E",
    500: "#287411",
    900: "#18470A"
  };

  /* -----------------------------------------------------------------------
     1) BRAND COLORS
     ----------------------------------------------------------------------- */
  function getBrandTheme() {
    var themeAttr = document.body.getAttribute("ba-theme");
    if (themeAttr) {
      try { return JSON.parse(themeAttr); } catch (e) {}
    }
    return FALLBACK_THEME;
  }

  function applyBrandColors() {
    var theme = getBrandTheme();
    var root = document.documentElement;
    root.style.setProperty("--pendo-brand-lightest", theme[100]);
    root.style.setProperty("--pendo-brand-light", theme[300]);
    root.style.setProperty("--pendo-brand-base", theme[500]);
    root.style.setProperty("--pendo-brand-dark", theme[900]);
  }

  /* -----------------------------------------------------------------------
     2) PRIMARY + SECONDARY BUTTON HOVER OVERRIDE
     ----------------------------------------------------------------------- */
  function processButtons() {
    var theme = getBrandTheme();
    var lightest = theme[100];
    var base = theme[500];
    var dark = theme[900];

    // Primary buttons
    var primaryBtns = document.querySelectorAll("._pendo-button-primaryButton");
    for (var i = 0; i < primaryBtns.length; i++) {
      var btn = primaryBtns[i];
      if (btn.dataset.pendoBrandBound === "1") continue;
      btn.dataset.pendoBrandBound = "1";

      btn.style.setProperty("background-color", base, "important");
      btn.style.setProperty("border-color", base, "important");

      (function (b, baseColor, darkColor) {
        b.addEventListener("mouseenter", function () {
          b.style.setProperty("background-color", darkColor, "important");
          b.style.setProperty("border-color", darkColor, "important");
        });
        b.addEventListener("mouseleave", function () {
          b.style.setProperty("background-color", baseColor, "important");
          b.style.setProperty("border-color", baseColor, "important");
        });
      })(btn, base, dark);
    }

    // Secondary buttons
    var secondaryBtns = document.querySelectorAll("._pendo-button-secondaryButton");
    for (var j = 0; j < secondaryBtns.length; j++) {
      var sbtn = secondaryBtns[j];
      if (sbtn.dataset.pendoBrandBound === "1") continue;
      sbtn.dataset.pendoBrandBound = "1";

      sbtn.style.setProperty("background-color", "transparent", "important");
      sbtn.style.setProperty("border-color", base, "important");
      sbtn.style.setProperty("color", base, "important");

      (function (b, lightestColor, baseColor, darkColor) {
        b.addEventListener("mouseenter", function () {
          b.style.setProperty("background-color", lightestColor, "important");
          b.style.setProperty("border-color", darkColor, "important");
          b.style.setProperty("color", darkColor, "important");
        });
        b.addEventListener("mouseleave", function () {
          b.style.setProperty("background-color", "transparent", "important");
          b.style.setProperty("border-color", baseColor, "important");
          b.style.setProperty("color", baseColor, "important");
        });
      })(sbtn, lightest, base, dark);
    }
  }

  /* -----------------------------------------------------------------------
     3) CLOSE BUTTON
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

  function processCloseButton() {
    var stepContainers = document.querySelectorAll("._pendo-step-container-size");
    for (var i = 0; i < stepContainers.length; i++) {
      var container = stepContainers[i];
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
     INIT
     ----------------------------------------------------------------------- */
  function init() {
    applyBrandColors();
    processButtons();
    processCloseButton();
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
