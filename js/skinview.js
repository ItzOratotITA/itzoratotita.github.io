import * as skinview3d from "https://cdn.jsdelivr.net/npm/skinview3d@3.4.2/+esm";

const skinViewer = new skinview3d.SkinViewer({
  canvas: document.getElementById("skin_container"),
  width: 300,
  height: 400,
  skin: "/assets/skin_definitiva.png",
  cape: "/assets/eye-blossom-cape.png",
});

skinViewer.controls.enableRotate = true;
skinViewer.controls.enableZoom = true;
let skinAnimationPlaying = false;

const animationButton = document.getElementById("toggleSkinAnimation");

function startSkinAnimation() {
  skinViewer.animation = new skinview3d.WalkingAnimation();
  skinViewer.animation.speed = 0.8;

  animationButton.textContent = "⏸";
  skinAnimationPlaying = true;
}

function stopSkinAnimation() {
  skinViewer.animation = null;

  animationButton.textContent = "▶";
  skinAnimationPlaying = false;
}

animationButton.addEventListener("click", () => {
  if (skinAnimationPlaying) {
    stopSkinAnimation();
  } else {
    startSkinAnimation();
  }
});
