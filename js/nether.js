const netherForm = document.getElementById("netherForm");
const directionInput = document.getElementById("direction");
const xInput = document.getElementById("x");
const zInput = document.getElementById("z");
const netherResult = document.getElementById("result");
const resetNether = document.getElementById("resetNether");

function netherT(key, fallback, params = {}) {
  return (
    window.SiteI18n?.t(key, fallback, params) ??
    fallback.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match)
  );
}

const DEFAULT_RESULT = netherT(
  "utilities.result_placeholder",
  "Result will appear here.",
);

function formatCoordinate(value) {
  const rounded = Number(value.toFixed(8));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function showConversion(dimension, x, z) {
  const heading = document.createElement("strong");
  heading.textContent = netherT(
    "utilities.coordinates",
    "{dimension} coordinates:",
    { dimension },
  );

  netherResult.replaceChildren(
    heading,
    document.createElement("br"),
    `X: ${formatCoordinate(x)}`,
    document.createElement("br"),
    `Z: ${formatCoordinate(z)}`,
  );
}

function convertCoordinates(event) {
  event.preventDefault();

  const rawX = xInput.value.trim();
  const rawZ = zInput.value.trim();
  const x = Number(rawX);
  const z = Number(rawZ);

  if (!rawX || !rawZ || !Number.isFinite(x) || !Number.isFinite(z)) {
    netherResult.textContent = netherT(
      "utilities.invalid_coordinates",
      "Enter valid X and Z coordinates.",
    );
    return;
  }

  if (directionInput.value === "overworld-to-nether") {
    showConversion(
      netherT("utilities.dimension_nether", "Nether"),
      x / 8,
      z / 8,
    );
  } else {
    showConversion(
      netherT("utilities.dimension_overworld", "Overworld"),
      x * 8,
      z * 8,
    );
  }
}

netherForm.addEventListener("submit", convertCoordinates);
resetNether.addEventListener("click", () => {
  netherForm.reset();
  netherResult.textContent = DEFAULT_RESULT;
  xInput.focus();
});
