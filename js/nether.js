const netherForm = document.getElementById("netherForm");
const directionInput = document.getElementById("direction");
const xInput = document.getElementById("x");
const zInput = document.getElementById("z");
const netherResult = document.getElementById("result");
const resetNether = document.getElementById("resetNether");

const DEFAULT_RESULT = "Result will appear here.";

function formatCoordinate(value) {
  const rounded = Number(value.toFixed(8));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function showConversion(dimension, x, z) {
  const heading = document.createElement("strong");
  heading.textContent = `${dimension} coordinates:`;

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
    netherResult.textContent = "Enter valid X and Z coordinates.";
    return;
  }

  if (directionInput.value === "overworld-to-nether") {
    showConversion("Nether", x / 8, z / 8);
  } else {
    showConversion("Overworld", x * 8, z * 8);
  }
}

netherForm.addEventListener("submit", convertCoordinates);
resetNether.addEventListener("click", () => {
  netherForm.reset();
  netherResult.textContent = DEFAULT_RESULT;
  xInput.focus();
});
