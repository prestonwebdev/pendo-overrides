/**
 * ==========================================================================
 * PENDO BANNER GUIDE OVERRIDES
 *
 * 1) Close button — Wraps default close in a pill with SVG icon
 *    (All guide alignments)
 * ==========================================================================
 */
(function () {

  var WRAP_CLASS = "pendo-close-circle-wrap";

  /* -----------------------------------------------------------------------
     CLOSE BUTTON
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
    var styleContainers = document.querySelectorAll("._pendo-step-container-styles");

    for (var i = 0; i < styleContainers.length; i++) {
      var container = styleContainers[i];
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

  processCloseButton();

  var debounceTimer;
  new MutationObserver(function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processCloseButton, 50);
  }).observe(document.body, { childList: true, subtree: true });

})();
