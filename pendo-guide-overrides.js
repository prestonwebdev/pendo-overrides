/**
 * ==========================================================================
 * PENDO GUIDE CUSTOMIZATIONS
 *
 * 1) Brand colors — Sets CSS custom properties from customer theme
 * 2) Primary button — Overrides Pendo's inline hover styles via JS
 * 3) Animation — Adds .pendo-animate-in class after a delay
 * 4) Close button — Wraps default close in a pill with SVG icon
 *    (Centered guides only)
 * 5) Scrollable content — Wraps ALL middle content (rows AND standalone
 *    text blocks) between header and footer for fixed header/footer,
 *    syncs height for centering
 * ==========================================================================
 */
(function () {

  /* -----------------------------------------------------------------------
     CONFIGURATION
     ----------------------------------------------------------------------- */
  var DELAY_MS = 100;
  var WRAP_CLASS = "pendo-close-circle-wrap";
  var TARGET_ALIGNMENT = "Centered";
  var MAX_HEIGHT = 624;

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
     2) PRIMARY BUTTON HOVER OVERRIDE
     ----------------------------------------------------------------------- */
  function processPrimaryButtons() {
    var theme = getBrandTheme();
    var base = theme[500];
    var dark = theme[900];

    var buttons = document.querySelectorAll("._pendo-button-primaryButton");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
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
  }

  /* -----------------------------------------------------------------------
     3) ANIMATION
     ----------------------------------------------------------------------- */
  function animateIn() {
    var containers = document.querySelectorAll("._pendo-step-container-styles");
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      if (container.dataset.pendoAnimated === "1") continue;
      container.dataset.pendoAnimated = "1";

      container.style.opacity = "0";
      container.style.transform = "translateY(16px)";

      (function (el) {
        setTimeout(function () {
          if (document.body.contains(el)) {
            el.style.removeProperty("opacity");
            el.style.removeProperty("transform");
            el.classList.add("pendo-animate-in");
          }
        }, DELAY_MS);
      })(container);
    }
  }

  /* -----------------------------------------------------------------------
     4) CLOSE BUTTON
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
     HELPERS — Walk up from a nested element to its top-level ancestor
     that is a direct child of the container.
     ----------------------------------------------------------------------- */
  function getTopLevelAncestor(el, container) {
    var current = el;
    while (current && current.parentNode !== container) {
      current = current.parentNode;
    }
    return current;
  }

  /* -----------------------------------------------------------------------
     5) SCROLLABLE CONTENT + HEIGHT SYNC

     Strategy: find the header row and footer row inside the container,
     walk up to their top-level wrapper elements, then wrap everything
     between them in a scroll div. This captures standalone text blocks
     (like poll questions) that are NOT _pendo-row elements.
     ----------------------------------------------------------------------- */
  function processScrollableContent() {
    var containers = document.querySelectorAll("._pendo-step-container-styles");

    for (var c = 0; c < containers.length; c++) {
      var container = containers[c];

      // Always re-apply these — Pendo may overwrite
      container.style.setProperty("max-height", MAX_HEIGHT + "px", "important");
      container.style.setProperty("display", "flex", "important");
      container.style.setProperty("flex-direction", "column", "important");
      container.style.setProperty("overflow", "hidden", "important");

      // Sync the sizing parent for centering
      var sizeParent = container.closest("._pendo-step-container-size");
      if (sizeParent) {
        var actualHeight = container.getBoundingClientRect().height;
        if (actualHeight > 0) {
          sizeParent.style.setProperty("height", actualHeight + "px", "important");
          sizeParent.style.setProperty("top", "50%", "important");
          sizeParent.style.setProperty("margin-top", "0", "important");
          sizeParent.style.setProperty("transform", "translateY(-50%)", "important");
        }
      }

      // Only create the scroll wrapper once
      if (container.dataset.pendoScrollProcessed === "1") continue;

      // Find header: first _pendo-row (the one with data-_pendo-row-1)
      var headerRow = container.querySelector("._pendo-row[data-_pendo-row-1]");
      if (!headerRow) continue;

      // Find footer: last _pendo-row that contains a .bb-button
      var footerCandidates = container.querySelectorAll("._pendo-row");
      var footerRow = null;
      for (var f = footerCandidates.length - 1; f >= 0; f--) {
        if (footerCandidates[f].querySelector(".bb-button")) {
          footerRow = footerCandidates[f];
          break;
        }
      }
      if (!footerRow) continue;

      // Walk up to the direct-child wrappers of the container
      var headerWrapper = getTopLevelAncestor(headerRow, container);
      var footerWrapper = getTopLevelAncestor(footerRow, container);
      if (!headerWrapper || !footerWrapper || headerWrapper === footerWrapper) continue;

      container.dataset.pendoScrollProcessed = "1";

      // Collect all direct children between header and footer wrappers
      var children = Array.prototype.slice.call(container.children);
      var headerIdx = children.indexOf(headerWrapper);
      var footerIdx = children.indexOf(footerWrapper);

      var middle = [];
      for (var i = headerIdx + 1; i < footerIdx; i++) {
        var child = children[i];
        if (child.tagName === "STYLE") continue;
        if (child.tagName === "SCRIPT") continue;
        middle.push(child);
      }

      if (middle.length === 0) continue;

      // Create scroll wrapper
      var scrollWrap = document.createElement("div");
      scrollWrap.className = "pendo-scroll-content";
      scrollWrap.style.setProperty("padding-left", "20px", "important");
      scrollWrap.style.setProperty("padding-right", "20px", "important");
      scrollWrap.style.setProperty("overflow-y", "auto", "important");
      scrollWrap.style.setProperty("min-height", "350px", "important");
      scrollWrap.style.setProperty("flex", "1 1 0%", "important");

      // Insert after the header wrapper
      headerWrapper.parentNode.insertBefore(scrollWrap, headerWrapper.nextSibling);

      // Move all middle children into the scroll wrapper
      for (var m = 0; m < middle.length; m++) {
        scrollWrap.appendChild(middle[m]);
      }
    }
  }

  /* -----------------------------------------------------------------------
     INIT
     ----------------------------------------------------------------------- */
  function init() {
    applyBrandColors();
    processPrimaryButtons();
    processScrollableContent();
    animateIn();
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
