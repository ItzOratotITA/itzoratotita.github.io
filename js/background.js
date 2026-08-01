const backgrounds = [
  "/assets/versailles.avif",
  "/assets/bridge_view.avif",
  "/assets/castle_view.avif",
  "/assets/mar_grande_view.avif",
  "/assets/chicchiribike_p.avif",
  "/assets/grotta1.avif",
  "/assets/grotta2.avif",
  "/assets/grotta3.avif",
  "/assets/grotta4.avif",
  "/assets/grotta5.avif",
];

const randomBackground =
  backgrounds[Math.floor(Math.random() * backgrounds.length)];

document.body.style.setProperty("--random-bg", `url("${randomBackground}")`);
