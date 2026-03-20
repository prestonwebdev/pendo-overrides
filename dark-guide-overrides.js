/**
 * ==========================================================================
 * PENDO DARK GUIDE OVERRIDES
 *
 * 1) Close button — Wraps default close in a white pill with SVG icon
 * 2) Progress bar — Reads guide steps from Pendo API, injects a
 *    progress bar inline with the CTA button row
 * ==========================================================================
 */
(function () {

  var WRAP_CLASS = "pendo-close-circle-wrap";

  /* -----------------------------------------------------------------------
     UTILITY: Create SVG X icon (white)
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
     1) CLOSE BUTTON
     ----------------------------------------------------------------------- */
  function processCloseButton() {
    var containers = document.querySelectorAll("._pendo-step-container-styles");

    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
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
     2) PROGRESS BAR
     Reads the active guide's step count from the Pendo API and injects
     a progress bar into the button row, to the left of the CTA.
     ----------------------------------------------------------------------- */
  function getGuideInfo() {
    if (!window.pendo || !window.pendo.guides) return null;

    var guides = window.pendo.guides;
    for (var i = 0; i < guides.length; i++) {
      var guide = guides[i];
      if (guide.isShown && guide.isShown()) {
        var totalSteps = guide.steps ? guide.steps.length : 0;
        var currentStep = 0;

        // Find the current step index
        if (guide.steps) {
          for (var s = 0; s < guide.steps.length; s++) {
            if (guide.steps[s].isShown && guide.steps[s].isShown()) {
              currentStep = s;
              break;
            }
          }
        }

        return {
          totalSteps: totalSteps,
          currentStep: currentStep + 1 // 1-indexed for display
        };
      }
    }
    return null;
  }

  function processProgressBar() {
    var info = getGuideInfo();
    if (!info || info.totalSteps <= 1) return;

    var containers = document.querySelectorAll("._pendo-step-container-styles");

    for (var c = 0; c < containers.length; c++) {
      var container = containers[c];

      // Find the button row (if it exists)
      var buttonRow = null;
      var rows = container.querySelectorAll("._pendo-row");
      for (var r = rows.length - 1; r >= 0; r--) {
        if (rows[r].querySelector(".bb-button")) {
          buttonRow = rows[r];
          break;
        }
      }

      // Determine where to insert: button row's flex row, or bottom of container
      var insertTarget = null;
      var insertMode = "prepend"; // prepend into flex row, or append to container
      if (buttonRow) {
        var flexRow = buttonRow.querySelector(".pendo-mock-flexbox-row");
        if (flexRow) insertTarget = flexRow;
      }
      if (!insertTarget) {
        insertTarget = container;
        insertMode = "append";
      }

      // Check if progress bar already exists — update it
      var existing = insertTarget.querySelector(".pendo-progress-wrap");
      if (!existing) existing = container.querySelector(".pendo-progress-wrap");
      if (existing) {
        var fill = existing.querySelector(".pendo-progress-fill");
        var label = existing.querySelector(".pendo-progress-label");
        var pct = (info.currentStep / info.totalSteps) * 100;
        if (fill) fill.style.width = pct + "%";
        if (label) label.textContent = info.currentStep + " of " + info.totalSteps;
        continue;
      }

      // Create progress bar
      var wrap = document.createElement("div");
      wrap.className = "pendo-progress-wrap";
      if (insertMode === "append") {
        wrap.style.padding = "12px 20px 16px";
      }

      var bar = document.createElement("div");
      bar.className = "pendo-progress-bar";

      var fill = document.createElement("div");
      fill.className = "pendo-progress-fill";
      var pct = (info.currentStep / info.totalSteps) * 100;
      fill.style.width = pct + "%";

      bar.appendChild(fill);

      var label = document.createElement("span");
      label.className = "pendo-progress-label";
      label.textContent = info.currentStep + " of " + info.totalSteps;

      wrap.appendChild(bar);
      wrap.appendChild(label);

      // Insert into button row or append to container bottom
      if (insertMode === "prepend") {
        insertTarget.insertBefore(wrap, insertTarget.firstChild);
      } else {
        insertTarget.appendChild(wrap);
      }
    }
  }

  /* -----------------------------------------------------------------------
     INIT
     ----------------------------------------------------------------------- */
  function init() {
    processCloseButton();
    processProgressBar();
  }

  init();

  // Retry until pendo.guides is available and progress bar is created.
  // pendo.guides may not be populated when the code block first runs.
  var retryCount = 0;
  var retryTimer = setInterval(function () {
    retryCount++;
    if (document.querySelector(".pendo-progress-wrap") || retryCount > 40) {
      clearInterval(retryTimer);
      return;
    }
    processProgressBar();
  }, 250);

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
