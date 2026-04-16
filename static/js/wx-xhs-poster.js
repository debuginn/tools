(function () {
var core = window.WxXhsPoster;

var previewCanvas = document.getElementById("preview");
var ctx = previewCanvas.getContext("2d");
var EXPORT_SCALE = 2;
var PREVIEW_MAX_SIDE = 720;
var STATE_KEY = "debuginn_wx_xhs_poster_state";

var imageInput = document.getElementById("imageInput");
var imageFileName = document.getElementById("imageFileName");
var sizeSelect = document.getElementById("sizeSelect");
var sizeButtons = document.querySelectorAll(".size-btn[data-size]");
var titleInput = document.getElementById("titleInput");
var subtitleInput = document.getElementById("subtitleInput");
var bgInput = document.getElementById("bgInput");
var bgHexInput = document.getElementById("bgHexInput");
var colorModal = document.getElementById("colorModal");
var modalHexInput = document.getElementById("modalHexInput");
var modalColorPreview = document.getElementById("modalColorPreview");
var modalColorValue = document.getElementById("modalColorValue");
var modalBgButtons = document.querySelectorAll(".modal-bg-btn");
var closeColorModalBtn = document.getElementById("closeColorModalBtn");
var modalEyedropperBtn = document.getElementById("modalEyedropperBtn");
var applyColorBtn = document.getElementById("applyColorBtn");
var customBgSwatch = document.getElementById("customBgSwatch");
var backgroundButtons = document.querySelectorAll(".bg-btn");
var gradientSelect = document.getElementById("gradientSelect");
var schemeButtons = document.querySelectorAll(".scheme-btn[data-scheme]");
var pickColorBtn = document.getElementById("pickColorBtn");
var downloadBtn = document.getElementById("downloadBtn");

var screenshotImage = null;
var modalBackgroundColor = "#ffffff";
var persistedImageName = "";
var emptyFileName = imageFileName ? imageFileName.textContent.trim() : "";

function loadPersistedState() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function savePersistedState() {
  try {
    var state = {
      title: titleInput.value,
      subtitle: subtitleInput.value,
      gradient: gradientSelect.value,
      size: sizeSelect.value,
      background: bgHexInput.value,
      imageData: screenshotImage ? (screenshotImage.src || "") : "",
      imageName: persistedImageName || ""
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage quota issues.
  }
}

function syncSchemeButtons() {
  schemeButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.scheme === gradientSelect.value);
  });
}

function syncSizeButtons() {
  sizeButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.size === sizeSelect.value);
  });
}

function syncBackgroundButtons() {
  var currentColor = core.normalizeHex(bgHexInput.value) || "#ffffff";
  var matchedPreset = false;

  backgroundButtons.forEach(function (button) {
    var preset = button.dataset.bg;
    var isMatch = preset === currentColor;
    button.classList.toggle("is-active", isMatch);
    if (isMatch) matchedPreset = true;
  });

  if (customBgSwatch) {
    customBgSwatch.style.background = matchedPreset ? "" : currentColor;
    customBgSwatch.classList.toggle("is-custom-color", !matchedPreset);
  }
}

function syncModalButtons() {
  modalBgButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.modalBg === modalBackgroundColor);
  });
}

function updateModalPreview(color) {
  modalBackgroundColor = core.normalizeHex(color) || "#ffffff";
  if (modalHexInput) modalHexInput.value = modalBackgroundColor;
  modalColorPreview.style.background = modalBackgroundColor;
  modalColorValue.textContent = modalBackgroundColor;
  syncModalButtons();
}

function openColorModal() {
  updateModalPreview(core.normalizeHex(bgHexInput.value) || "#ffffff");
  colorModal.hidden = false;
}

function closeColorModal() {
  colorModal.hidden = true;
}

function getCurrentPreset() {
  return core.layoutPresets[sizeSelect.value] || core.layoutPresets.square;
}

function updatePreviewCanvasSize(preset) {
  previewCanvas.width = preset.width;
  previewCanvas.height = preset.height;

  var widthRatio = preset.width / preset.height;
  var heightRatio = preset.height / preset.width;
  var displayWidth = preset.width >= preset.height
    ? PREVIEW_MAX_SIDE
    : Math.round(PREVIEW_MAX_SIDE * widthRatio);
  var displayHeight = preset.height >= preset.width
    ? PREVIEW_MAX_SIDE
    : Math.round(PREVIEW_MAX_SIDE * heightRatio);

  previewCanvas.style.width = displayWidth + "px";
  previewCanvas.style.height = "auto";
  previewCanvas.style.maxHeight = displayHeight + "px";
}

function render() {
  var preset = getCurrentPreset();
  updatePreviewCanvasSize(preset);
  core.applyDrawingQuality(ctx);
  core.drawPoster(ctx, preset, 1, {
    bgColor: bgHexInput.value,
    screenshotImage: screenshotImage,
    gradientKey: gradientSelect.value,
    title: titleInput.value,
    subtitle: subtitleInput.value
  });
  syncBackgroundButtons();
  savePersistedState();
}

function setImageFileName(name) {
  persistedImageName = name || "";
  if (persistedImageName) {
    imageFileName.textContent = persistedImageName;
    return;
  }
  imageFileName.textContent = emptyFileName;
}

function setScreenshotImage(dataUrl, fileName) {
  var img = new Image();
  img.onload = function () {
    screenshotImage = img;
    setImageFileName(fileName || "");
    render();
  };
  img.src = dataUrl;
}

function readImage(file) {
  var reader = new FileReader();
  reader.onload = function () {
    setScreenshotImage(reader.result, file.name);
  };
  reader.readAsDataURL(file);
}

imageInput.addEventListener("change", function (event) {
  var file = (event.target.files || [])[0];
  if (file) {
    readImage(file);
  } else {
    screenshotImage = null;
    setImageFileName("");
    render();
  }
});

[titleInput, subtitleInput, gradientSelect, sizeSelect].forEach(function (el) {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

sizeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    sizeSelect.value = button.dataset.size;
    syncSizeButtons();
    render();
  });
});

schemeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    gradientSelect.value = button.dataset.scheme;
    syncSchemeButtons();
    render();
  });
});

bgInput.addEventListener("input", function () {
  bgHexInput.value = bgInput.value;
  render();
});

bgHexInput.addEventListener("input", render);

backgroundButtons.forEach(function (button) {
  if (button === pickColorBtn) return;
  button.addEventListener("click", function () {
    bgHexInput.value = button.dataset.bg;
    render();
  });
});

pickColorBtn.addEventListener("click", function () {
  openColorModal();
});

modalBgButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    updateModalPreview(button.dataset.modalBg);
  });
});

if (modalHexInput) {
  modalHexInput.addEventListener("input", function () {
    var color = core.normalizeHex(modalHexInput.value);
    if (color) updateModalPreview(color);
  });
}

closeColorModalBtn.addEventListener("click", closeColorModal);

colorModal.addEventListener("click", function (event) {
  if (event.target.dataset.closeModal === "true") {
    closeColorModal();
  }
});

modalEyedropperBtn.addEventListener("click", function () {
  if (!("EyeDropper" in window)) {
    if (typeof bgInput.showPicker === "function") {
      bgInput.showPicker();
    } else {
      bgInput.click();
    }
    return;
  }

  var eyeDropper = new EyeDropper();
  eyeDropper.open().then(function (result) {
    if (result && result.sRGBHex) {
      updateModalPreview(result.sRGBHex.toLowerCase());
    }
  }).catch(function () {
    // User cancel is expected.
  });
});

applyColorBtn.addEventListener("click", function () {
  bgHexInput.value = modalBackgroundColor;
  bgInput.value = modalBackgroundColor;
  closeColorModal();
  render();
});

downloadBtn.addEventListener("click", function () {
  var preset = getCurrentPreset();
  var exportCanvas = document.createElement("canvas");
  var exportWidth = preset.width * EXPORT_SCALE;
  var exportHeight = preset.height * EXPORT_SCALE;
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;

  var exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) return;
  core.applyDrawingQuality(exportCtx);
  core.drawPoster(exportCtx, preset, EXPORT_SCALE, {
    bgColor: bgHexInput.value,
    screenshotImage: screenshotImage,
    gradientKey: gradientSelect.value,
    title: titleInput.value,
    subtitle: subtitleInput.value
  });

  var link = document.createElement("a");
  link.download = "debuginn-wx-xhs-poster-" + Date.now() + ".png";

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
  subtitleInput.value = savedState.subtitle || subtitleInput.value;
  gradientSelect.value = savedState.gradient || gradientSelect.value;
  sizeSelect.value = savedState.size || sizeSelect.value;
  bgHexInput.value = core.normalizeHex(savedState.background || "") || bgHexInput.value;
  bgInput.value = bgHexInput.value;
  persistedImageName = savedState.imageName || "";
}

syncSizeButtons();
syncSchemeButtons();
render();

if (savedState && savedState.imageData) {
  setScreenshotImage(savedState.imageData, savedState.imageName || "");
}
})();
