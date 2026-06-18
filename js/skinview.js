import * as skinview3d from "https://cdn.jsdelivr.net/npm/skinview3d@3.4.2/+esm";

const canvas = document.getElementById("skin_container");
const skinViewerBox = document.querySelector(".skin-viewer-box");

const skinViewer = new skinview3d.SkinViewer({
  canvas,
  width: skinViewerBox.clientWidth,
  height: skinViewerBox.clientHeight,
  skin: "/assets/ItzOratotITA.png",
  cape: "/assets/eye-blossom-cape.png",
});

function resizeSkinViewer() {
  skinViewer.setSize(skinViewerBox.clientWidth, skinViewerBox.clientHeight);
}

resizeSkinViewer();

const resizeObserver = new ResizeObserver(() => {
  resizeSkinViewer();
});

resizeObserver.observe(skinViewerBox);

window.addEventListener("resize", resizeSkinViewer);
skinViewer.controls.enableRotate = true;
skinViewer.controls.enableZoom = true;
skinViewer.controls.enablePan = true;
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
