const qrForm = document.getElementById("qrForm");
const qrText = document.getElementById("qrText");
const qrLogo = document.getElementById("qrLogo");
const qrDotColor = document.getElementById("dotColor");
const qrDotType = document.getElementById("dotType");
const qrCornerColor = document.getElementById("cornerColor");
const qrCornerType = document.getElementById("cornerType");
const generateQr = document.getElementById("generateQr");
const resetQr = document.getElementById("resetQr");
const qrCanvas = document.getElementById("qrCanvas");
const qrDownload = document.getElementById("downloadQr");
const qrStatus = document.getElementById("qrStatus");

const MAX_LOGO_BYTES = 50 * 1024 * 1024;
const MAX_LOGO_PIXELS = 40_000_000;
const MAX_LOGO_DIMENSION = 512;
const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

let qrGeneration = 0;

function setQrStatus(message = "", kind = "danger") {
  qrStatus.replaceChildren();
  if (!message) return;

  const alert = document.createElement("div");
  alert.className = `alert alert-${kind}`;
  alert.textContent = message;

  if (kind === "success") {
    alert.classList.add("alert-dismissible", "fade", "show");
    const dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.className = "btn-close";
    dismissButton.dataset.bsDismiss = "alert";
    dismissButton.setAttribute("aria-label", "Dismiss status");
    alert.append(dismissButton);
  }

  qrStatus.append(alert);
}

function invalidateQr() {
  qrGeneration += 1;
  qrDownload.removeAttribute("href");
  qrDownload.classList.add("d-none");
  generateQr.disabled = false;
  setQrStatus();
}

function loadLogoImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.addEventListener("load", () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected logo is not a valid image."));
    });
    image.src = objectUrl;
  });
}

async function prepareLogo(file) {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error("Choose a PNG, JPEG, WebP or SVG logo.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("The logo must be 50 MiB or smaller.");
  }

  const image = await loadLogoImage(file);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (!width || !height) {
    throw new Error("The selected logo has invalid dimensions.");
  }
  if (width * height > MAX_LOGO_PIXELS) {
    throw new Error("The logo must be no larger than 40 megapixels.");
  }

  const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(width, height));
  const logoCanvas = document.createElement("canvas");
  logoCanvas.width = Math.max(1, Math.round(width * scale));
  logoCanvas.height = Math.max(1, Math.round(height * scale));
  const context = logoCanvas.getContext("2d");

  if (!context) throw new Error("The browser could not process the logo.");
  context.drawImage(image, 0, 0, logoCanvas.width, logoCanvas.height);

  try {
    return logoCanvas.toDataURL("image/png");
  } catch {
    throw new Error("The selected logo could not be safely rendered.");
  }
}

async function generateQrCode(event, announceSuccess = true) {
  if (event) event.preventDefault();

  const text = qrText.value.trim();
  if (!text) {
    setQrStatus("Write something before generating the QR code.");
    return;
  }
  if (typeof QrCodeWithLogo !== "function") {
    setQrStatus("The QR library could not be loaded. Try refreshing the page.");
    return;
  }

  const generation = ++qrGeneration;
  generateQr.disabled = true;
  qrDownload.removeAttribute("href");
  qrDownload.classList.add("d-none");
  setQrStatus();

  try {
    const logoFile = qrLogo.files[0];
    const renderCanvas = document.createElement("canvas");
    const options = {
      canvas: renderCanvas,
      content: text,
      width: 220,
      download: false,
      dotsOptions: { color: qrDotColor.value, type: qrDotType.value },
      cornersOptions: {
        color: qrCornerColor.value,
        type: qrCornerType.value,
      },
      nodeQrCodeOptions: {
        margin: 2,
        errorCorrectionLevel: logoFile ? "H" : "M",
      },
    };

    if (logoFile) {
      options.logo = {
        src: await prepareLogo(logoFile),
        bgColor: "#ffffff",
        borderWidth: 8,
        borderRadius: 8,
        logoRadius: 4,
      };
    }

    if (generation !== qrGeneration) return;

    const generatedQr = new QrCodeWithLogo(options);
    await generatedQr.getCanvas();
    if (generation !== qrGeneration) return;

    qrCanvas.width = renderCanvas.width;
    qrCanvas.height = renderCanvas.height;
    const context = qrCanvas.getContext("2d");
    if (!context) throw new Error("The browser could not display the QR code.");
    context.drawImage(renderCanvas, 0, 0);

    qrDownload.href = qrCanvas.toDataURL("image/png");
    qrDownload.classList.remove("d-none");
    setQrStatus(announceSuccess ? "QR code generated." : "", "success");
  } catch (error) {
    if (generation !== qrGeneration) return;
    console.error(error);
    setQrStatus(error.message || "The QR code could not be generated.");
  } finally {
    if (generation === qrGeneration) generateQr.disabled = false;
  }
}

qrForm.addEventListener("submit", generateQrCode);
qrForm.addEventListener("input", invalidateQr);
qrForm.addEventListener("change", invalidateQr);
resetQr.addEventListener("click", () => {
  invalidateQr();
  qrForm.reset();
  generateQrCode(null, true);
});

generateQrCode(null, false);
