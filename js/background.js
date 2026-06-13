const backgrounds = [
  "/assets/versailles.avif",
  "/assets/bridge_view.avif",
  "/assets/castle_view.avif",
  "/assets/mar_grande_view.avif",
];

const randomBackground =
  backgrounds[Math.floor(Math.random() * backgrounds.length)];

document.body.style.setProperty("--random-bg", `url("${randomBackground}")`);
