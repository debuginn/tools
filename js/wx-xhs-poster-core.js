(function () {

var gradients = {
  cool: ["#4CC9F0", "#3A86FF", "#7B61FF", "#5EEAD4"],
  warm: ["#FFB86B", "#FF8A65", "#FF5E7A", "#FF7CE5"],
  ocean: ["#38BDF8", "#0EA5E9", "#2563EB", "#22D3EE"],
  mono: ["#111827", "#1F2937", "#374151", "#111827"]
};

var layoutPresets = {
  square: {
    width: 1080,
    height: 1080,
    screenshotBox: { x: 86, y: 96, w: 458, h: 900, r: 54 },
    title: { x: 612, y: 438, fontSize: 110 },
    subtitle: { x: 612, y: 560, maxWidth: 400, lineHeight: 34, fontSize: 24 },
    placeholder: { x: 238, y: 540 }
  },
  xhs: {
    width: 1080,
    height: 1440,
    screenshotBox: { x: 109, y: 185, w: 545, h: 1071, r: 59 },
    title: { x: 686, y: 619, fontSize: 101 },
    subtitle: { x: 686, y: 731, maxWidth: 294, lineHeight: 31, fontSize: 22 },
    placeholder: { x: 292, y: 726 }
  }
};

function applyDrawingQuality(context) {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
}

function fitRect(srcW, srcH, dstX, dstY, dstW, dstH) {
  var srcRatio = srcW / srcH;
  var dstRatio = dstW / dstH;
  var drawW = dstW;
  var drawH = dstH;
  if (srcRatio > dstRatio) {
    drawW = dstW;
    drawH = dstW / srcRatio;
  } else {
    drawH = dstH;
    drawW = dstH * srcRatio;
  }
  var x = dstX + (dstW - drawW) / 2;
  var y = dstY + (dstH - drawH) / 2;
  return { x: x, y: y, w: drawW, h: drawH };
}

function drawRoundedClip(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  var chars = Array.from ? Array.from(text) : text.split('');
  var line = "";
  var drawY = y;
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i];
    var next = line + ch;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, drawY);
      line = ch;
      drawY += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) context.fillText(line, x, drawY);
}

function normalizeHex(value) {
  var v = (value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  return null;
}

/**
 * Draw the full poster onto the given canvas context.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} preset   — one of the layoutPresets values
 * @param {number} scale    — export scale factor (1 for preview, 2 for export)
 * @param {Object} opts     — rendering parameters
 * @param {string} opts.bgColor
 * @param {Object|null} opts.screenshotImage — browser Image or node-canvas Image
 * @param {string} opts.gradientKey           — key in gradients
 * @param {string} opts.title
 * @param {string} opts.subtitle
 */
function drawPoster(context, preset, scale, opts) {
  var bgColor = normalizeHex(opts.bgColor) || "#ffffff";

  context.save();
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, preset.width, preset.height);
  context.fillStyle = bgColor;
  context.fillRect(0, 0, preset.width, preset.height);

  if (opts.screenshotImage) {
    var screenshotBox = preset.screenshotBox;
    var target = fitRect(
      opts.screenshotImage.width,
      opts.screenshotImage.height,
      screenshotBox.x, screenshotBox.y, screenshotBox.w, screenshotBox.h
    );
    context.save();
    drawRoundedClip(context, screenshotBox.x, screenshotBox.y, screenshotBox.w, screenshotBox.h, screenshotBox.r);
    context.clip();
    context.drawImage(opts.screenshotImage, target.x, target.y, target.w, target.h);
    context.restore();
  } else {
    var screenshotBox = preset.screenshotBox;
    context.save();
    context.fillStyle = "#eef2f7";
    drawRoundedClip(context, screenshotBox.x, screenshotBox.y, screenshotBox.w, screenshotBox.h, screenshotBox.r);
    context.fill();
    context.fillStyle = "#9aa3af";
    context.font = "600 28px SF Pro Display, PingFang SC, sans-serif";
    context.fillText("\u4E0A\u4F20\u622A\u56FE", preset.placeholder.x, preset.placeholder.y);
    context.restore();
  }

  var scheme = gradients[opts.gradientKey] || gradients.cool;
  var titleGradient = context.createLinearGradient(
    preset.title.x,
    preset.title.y,
    preset.title.x + 238,
    preset.title.y + 122
  );
  titleGradient.addColorStop(0, scheme[0]);
  titleGradient.addColorStop(0.34, scheme[1]);
  titleGradient.addColorStop(0.68, scheme[2]);
  titleGradient.addColorStop(1, scheme[3]);

  var title = (opts.title || "\u603B\u89C8").trim();
  var subtitle = (opts.subtitle || "").trim();

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = titleGradient;
  context.font = "700 " + preset.title.fontSize + "px SF Pro Display, PingFang SC, sans-serif";
  context.fillText(title, preset.title.x, preset.title.y);

  context.fillStyle = "#6e6e73";
  context.font = "400 " + preset.subtitle.fontSize + "px SF Pro Display, PingFang SC, sans-serif";
  wrapText(
    context,
    subtitle,
    preset.subtitle.x,
    preset.subtitle.y,
    preset.subtitle.maxWidth,
    preset.subtitle.lineHeight
  );
  context.restore();
}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { drawPoster: drawPoster, fitRect: fitRect, drawRoundedClip: drawRoundedClip, wrapText: wrapText, gradients: gradients, layoutPresets: layoutPresets, normalizeHex: normalizeHex, applyDrawingQuality: applyDrawingQuality };
  } else {
    window.WxXhsPoster = { drawPoster: drawPoster, fitRect: fitRect, drawRoundedClip: drawRoundedClip, wrapText: wrapText, gradients: gradients, layoutPresets: layoutPresets, normalizeHex: normalizeHex, applyDrawingQuality: applyDrawingQuality };
  }

})();
