const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");

const imageInput = document.getElementById("imageInput");
const titleInput = document.getElementById("titleInput");
const subtitleInput = document.getElementById("subtitleInput");
const bgInput = document.getElementById("bgInput");
const bgHexInput = document.getElementById("bgHexInput");
const gradientSelect = document.getElementById("gradientSelect");
const pickColorBtn = document.getElementById("pickColorBtn");
const downloadBtn = document.getElementById("downloadBtn");

let screenshotImage = null;

const gradients = {
  cool: ["#4CC9F0", "#3A86FF", "#7B61FF", "#5EEAD4"],
  warm: ["#FFB86B", "#FF8A65", "#FF5E7A", "#FF7CE5"],
  ocean: ["#38BDF8", "#0EA5E9", "#2563EB", "#22D3EE"],
  mono: ["#111827", "#1F2937", "#374151", "#111827"]
};

function fitRect(srcW, srcH, dstX, dstY, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  let drawW = dstW;
  let drawH = dstH;
  if (srcRatio > dstRatio) {
    drawW = dstW;
    drawH = dstW / srcRatio;
  } else {
    drawH = dstH;
    drawW = dstH * srcRatio;
  }
  const x = dstX + (dstW - drawW) / 2;
  const y = dstY + (dstH - drawH) / 2;
  return { x, y, w: drawW, h: drawH };
}

function normalizeHex(value) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  return null;
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
  const chars = [...text];
  let line = "";
  let drawY = y;
  for (const ch of chars) {
    const next = line + ch;
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

function render() {
  const bgColor = normalizeHex(bgHexInput.value) || "#ffffff";
  bgInput.value = bgColor;

  ctx.clearRect(0, 0, 1080, 1080);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1080, 1080);

  if (screenshotImage) {
    const target = fitRect(
      screenshotImage.width,
      screenshotImage.height,
      86, 96, 458, 900
    );
    ctx.save();
    drawRoundedClip(ctx, 86, 96, 458, 900, 54);
    ctx.clip();
    ctx.drawImage(screenshotImage, target.x, target.y, target.w, target.h);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = "#eef2f7";
    drawRoundedClip(ctx, 86, 96, 458, 900, 54);
    ctx.fill();
    ctx.fillStyle = "#9aa3af";
    ctx.font = "600 28px SF Pro Display, PingFang SC, sans-serif";
    ctx.fillText("上传截图", 238, 540);
    ctx.restore();
  }

  const scheme = gradients[gradientSelect.value] || gradients.cool;
  const titleGradient = ctx.createLinearGradient(612, 438, 850, 560);
  titleGradient.addColorStop(0, scheme[0]);
  titleGradient.addColorStop(0.34, scheme[1]);
  titleGradient.addColorStop(0.68, scheme[2]);
  titleGradient.addColorStop(1, scheme[3]);

  const title = (titleInput.value || "总览").trim();
  const subtitle = (subtitleInput.value || "").trim();

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = titleGradient;
  ctx.font = "700 110px SF Pro Display, PingFang SC, sans-serif";
  ctx.fillText(title, 612, 438);

  ctx.fillStyle = "#6e6e73";
  ctx.font = "400 24px SF Pro Display, PingFang SC, sans-serif";
  wrapText(ctx, subtitle, 612, 560, 400, 34);
}

function readImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      screenshotImage = img;
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) readImage(file);
});

[titleInput, subtitleInput, gradientSelect].forEach((el) => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

bgInput.addEventListener("input", () => {
  bgHexInput.value = bgInput.value;
  render();
});

bgHexInput.addEventListener("input", render);

if (!("EyeDropper" in window)) {
  pickColorBtn.disabled = true;
  pickColorBtn.title = "当前浏览器不支持取色器";
} else {
  pickColorBtn.addEventListener("click", async () => {
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        bgHexInput.value = result.sRGBHex.toLowerCase();
        render();
      }
    } catch (error) {
      // User cancel is expected.
    }
  });
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "screenshot-layout.png";
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
});

render();
