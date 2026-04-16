(function () {
var core = window.BlogCoverCore;

var previewCanvas = document.getElementById("preview");
var ctx = previewCanvas.getContext("2d");
var STATE_KEY = "debuginn_blog_cover_state";

var imageInput = document.getElementById("imageInput");
var imageFileName = document.getElementById("imageFileName");
var titleInput = document.getElementById("titleInput");
var accentInput = document.getElementById("accentInput");
var accentButtons = document.querySelectorAll(".accent-btn[data-accent]");
var pickAccentBtn = document.getElementById("pickAccentBtn");
var customAccentSwatch = document.getElementById("customAccentSwatch");
var glowInput = document.getElementById("glowInput");
var trackingInput = document.getElementById("trackingInput");
var downloadBtn = document.getElementById("downloadBtn");

var centerImage = null;
var persistedImageName = "";
var emptyFileName = imageFileName ? imageFileName.textContent.trim() : "";

function syncAccentButtons() {
  var currentAccent = core.normalizeHex(accentInput.value);
  var matchedPreset = false;

  accentButtons.forEach(function (button) {
    var isActive = button.dataset.accent === currentAccent;
    button.classList.toggle("is-active", isActive);
    if (isActive) matchedPreset = true;
  });

  if (!pickAccentBtn || !customAccentSwatch) return;
  pickAccentBtn.classList.toggle("is-active", !matchedPreset);
  customAccentSwatch.style.background = matchedPreset ? "" : currentAccent;
  customAccentSwatch.classList.toggle("is-custom-color", !matchedPreset);
}

function loadPersistedState() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function savePersistedState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      title: titleInput.value,
      accent: accentInput.value,
      glow: glowInput.value,
      tracking: trackingInput.value,
      imageData: centerImage ? (centerImage.src || "") : "",
      imageName: persistedImageName || ""
    }));
  } catch (_) {
    // Ignore storage errors.
  }
}

function updateCanvasSize() {
  previewCanvas.width = core.COVER_SIZE.width;
  previewCanvas.height = core.COVER_SIZE.height;

  var maxWidth = 760;
  var displayWidth = Math.min(maxWidth, core.COVER_SIZE.width);
  previewCanvas.style.width = displayWidth + "px";
  previewCanvas.style.height = "auto";
}

function render() {
  var accentColor = core.normalizeHex(accentInput.value);
  var glowStrength = parseInt(glowInput.value, 10) || 68;
  var tracking = parseInt(trackingInput.value, 10) || 0;
  var title = (titleInput.value || "BLOG").trim();

  updateCanvasSize();
  syncAccentButtons();
  core.drawCover(ctx, 1, {
    title: title,
    accentColor: accentColor,
    glowStrength: glowStrength,
    tracking: tracking,
    centerImage: centerImage
  });
  savePersistedState();
}

function setImageFileName(name) {
  persistedImageName = name || "";
  if (persistedImageName) imageFileName.textContent = persistedImageName;
  else imageFileName.textContent = emptyFileName;
}

function setCenterImage(dataUrl, fileName) {
  var img = new Image();
  img.onload = function () {
    centerImage = img;
    setImageFileName(fileName || "");
    render();
  };
  img.src = dataUrl;
}

imageInput.addEventListener("change", function (event) {
  var file = (event.target.files || [])[0];
  if (!file) {
    centerImage = null;
    setImageFileName("");
    render();
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    setCenterImage(reader.result, file.name);
  };
  reader.readAsDataURL(file);
});

[].forEach.call(accentButtons, function (button) {
  button.addEventListener("click", function () {
    accentInput.value = button.dataset.accent;
    render();
  });
});

if (pickAccentBtn) {
  pickAccentBtn.addEventListener("click", function () {
    if (typeof accentInput.showPicker === "function") accentInput.showPicker();
    else accentInput.click();
  });
}

[titleInput, accentInput, glowInput, trackingInput].forEach(function (el) {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

downloadBtn.addEventListener("click", function () {
  var EXPORT_SCALE = 2;
  var exportCanvas = document.createElement("canvas");
  exportCanvas.width = core.COVER_SIZE.width * EXPORT_SCALE;
  exportCanvas.height = core.COVER_SIZE.height * EXPORT_SCALE;

  var exportCtx = exportCanvas.getContext("2d");
  exportCtx.imageSmoothingEnabled = true;
  exportCtx.imageSmoothingQuality = "high";
  core.drawCover(exportCtx, EXPORT_SCALE, {
    title: (titleInput.value || "BLOG").trim(),
    accentColor: core.normalizeHex(accentInput.value),
    glowStrength: parseInt(glowInput.value, 10) || 68,
    tracking: parseInt(trackingInput.value, 10) || 0,
    centerImage: centerImage
  });

  var link = document.createElement("a");
  link.download = "debuginn-blog-cover-" + Date.now() + ".png";

  if (exportCanvas.toBlob) {
    exportCanvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    }, "image/png");
    return;
  }

  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

var savedState = loadPersistedState();

if (savedState) {
  titleInput.value = savedState.title || titleInput.value;
  accentInput.value = core.normalizeHex(savedState.accent || accentInput.value);
  glowInput.value = savedState.glow || glowInput.value;
  trackingInput.value = savedState.tracking || trackingInput.value;
  persistedImageName = savedState.imageName || "";
}

render();

if (savedState && savedState.imageData) {
  setCenterImage(savedState.imageData, savedState.imageName || "");
}
})();
