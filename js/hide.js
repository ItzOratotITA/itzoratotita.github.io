const svgWarning = document.getElementById("hideMe");
const hideSvgWarning = document.getElementById("hideMeButton");

hideSvgWarning.addEventListener("click", () => {
  svgWarning.classList.add("d-none");
});
