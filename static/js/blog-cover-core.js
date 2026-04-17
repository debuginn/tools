(function () {

var COVER_SIZE = { width: 1600, height: 900 };

function normalizeHex(value) {
  var v = (value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  return "#3a66ff";
}

function hexToRgba(hex, alpha) {
  var clean = normalizeHex(hex).slice(1);
  var num = parseInt(clean, 16);
  var r = (num >> 16) & 255;
  var g = (num >> 8) & 255;
  var b = num & 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

function roundedRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function fitContain(srcW, srcH, dstW, dstH) {
  var ratio = Math.min(dstW / srcW, dstH / srcH);
  return { width: srcW * ratio, height: srcH * ratio };
}

function drawGlowBackground(ctx, width, height, accentColor, glowStrength) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, width, height);

  var glowRatio = Math.max(0.2, Math.min(1, glowStrength / 100));
  var innerRadius = Math.max(40, width * (0.035 + glowRatio * 0.045));
  var outerRadius = width * (0.22 + glowRatio * 0.34);
  var midStop = 0.28 + glowRatio * 0.24;

  var glow = ctx.createRadialGradient(
    width / 2, height / 2, innerRadius,
    width / 2, height / 2, outerRadius
  );
  glow.addColorStop(0, hexToRgba("#ffffff", 0.28 + glowRatio * 0.4));
  glow.addColorStop(midStop, hexToRgba("#9dd0ff", 0.12 + glowRatio * 0.22));
  glow.addColorStop(1, hexToRgba(accentColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawTrackingText(ctx, text, centerX, centerY, tracking) {
  var chars = Array.from ? Array.from(text) : text.split('');
  var widths = chars.map(function (ch) { return ctx.measureText(ch).width; });
  var totalWidth = widths.reduce(function (sum, w) { return sum + w; }, 0) + Math.max(0, chars.length - 1) * tracking;
  var cursorX = centerX - totalWidth / 2;
  var metrics = ctx.measureText(text);
  var ascent = metrics.actualBoundingBoxAscent || 0;
  var descent = metrics.actualBoundingBoxDescent || 0;
  var drawY = centerY + (ascent - descent) / 2;

  chars.forEach(function (char, index) {
    ctx.fillText(char, cursorX, drawY);
    cursorX += widths[index] + tracking;
  });
}

function drawBackdropText(ctx, width, height, title, tracking) {
  var fontSize = Math.round(width * 0.12);
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "800 " + fontSize + 'px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
  drawTrackingText(ctx, title || "BLOG", width / 2, height / 2, tracking);
  ctx.restore();
}

function drawCenterImage(ctx, width, height, accentColor, image) {
  var cardSize = Math.round(Math.min(width, height) * 0.36);
  var cardX = Math.round((width - cardSize) / 2);
  var cardY = Math.round((height - cardSize) / 2);

  if (image) {
    var fit = fitContain(image.width, image.height, cardSize, cardSize);
    var drawX = cardX + (cardSize - fit.width) / 2;
    var drawY = cardY + (cardSize - fit.height) / 2;
    ctx.drawImage(image, drawX, drawY, fit.width, fit.height);
  }

  ctx.strokeStyle = hexToRgba(accentColor, 0.16);
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.strokeRect(0, 0, width, height);
}

/**
 * Draw the blog cover onto the given canvas context.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} opts
 * @param {string} opts.title          — main title text
 * @param {string} opts.accentColor    — hex color, e.g. "#3a66ff"
 * @param {number} opts.glowStrength   — 0-100
 * @param {number} opts.tracking       — letter spacing in px
 * @param {Object|null} opts.centerImage — browser Image or node-canvas Image
 */
/**
 * Draw the blog cover onto the given canvas context.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {number} scale              — export scale factor (1 for preview, 2 for export)
 * @param {Object} opts
 * @param {string} opts.title          — main title text
 * @param {string} opts.accentColor    — hex color, e.g. "#3a66ff"
 * @param {number} opts.glowStrength   — 0-100
 * @param {number} opts.tracking       — letter spacing in px
 * @param {Object|null} opts.centerImage — browser Image or node-canvas Image
 */
function drawCover(context, scale, opts) {
  var title = (opts.title || "BLOG").trim();
  var accentColor = normalizeHex(opts.accentColor || "#3a66ff");
  var glowStrength = typeof opts.glowStrength === "number" ? opts.glowStrength : 68;
  var tracking = typeof opts.tracking === "number" ? opts.tracking : 0;
  var centerImage = opts.centerImage || null;
  var width = COVER_SIZE.width;
  var height = COVER_SIZE.height;

  context.save();
  context.setTransform(scale, 0, 0, scale, 0, 0);
  drawGlowBackground(context, width, height, accentColor, glowStrength);
  drawBackdropText(context, width, height, title, tracking);
  drawCenterImage(context, width, height, accentColor, centerImage);
  context.restore();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    drawCover: drawCover,
    drawGlowBackground: drawGlowBackground,
    drawTrackingText: drawTrackingText,
    drawBackdropText: drawBackdropText,
    drawCenterImage: drawCenterImage,
    normalizeHex: normalizeHex,
    hexToRgba: hexToRgba,
    roundedRect: roundedRect,
    fitContain: fitContain,
    COVER_SIZE: COVER_SIZE
  };
} else {
  window.BlogCoverCore = {
    drawCover: drawCover,
    drawGlowBackground: drawGlowBackground,
    drawTrackingText: drawTrackingText,
    drawBackdropText: drawBackdropText,
    drawCenterImage: drawCenterImage,
    normalizeHex: normalizeHex,
    hexToRgba: hexToRgba,
    roundedRect: roundedRect,
    fitContain: fitContain,
    COVER_SIZE: COVER_SIZE
  };
}

})();
