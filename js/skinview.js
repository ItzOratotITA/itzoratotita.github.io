const skinCanvas = document.getElementById("skin_container");
const skinViewerBox = document.querySelector(".skin-viewer-box");
const skinViewerFallback = document.querySelector(".skin-viewer-fallback");
const animationButton = document.getElementById("toggleSkinAnimation");
const animationButtonIcon = document.getElementById("skinAnimationIcon");
const skinViewerStatus = document.getElementById("skinViewerStatus");

let skinViewer = null;
let skinview3d = null;
let skinAnimationPlaying = false;
let initializationStarted = false;

function updateAnimationButton(playing) {
  animationButtonIcon.src = playing ? "/assets/pause.svg" : "/assets/play.svg";
  animationButtonIcon.alt = playing ? "⏸" : "▶";
  animationButton.setAttribute(
    "aria-label",
    playing ? "Stop animation" : "Start animation",
  );
  animationButton.setAttribute("aria-pressed", String(playing));
  skinAnimationPlaying = playing;
}

function showSkinViewerError() {
  skinViewerStatus.textContent =
    "The interactive skin viewer could not be loaded. The skin download is still available.";
  skinViewerStatus.classList.remove("d-none");
}

async function initializeSkinViewer() {
  if (initializationStarted) return;
  initializationStarted = true;

  try {
    skinview3d = await import(
      "https://cdn.jsdelivr.net/npm/skinview3d@3.4.2/+esm"
    );

    skinViewer = new skinview3d.SkinViewer({
      canvas: skinCanvas,
      width: skinViewerBox.clientWidth,
      height: skinViewerBox.clientHeight,
    });
    skinViewer.renderer.outputColorSpace = "srgb-linear";
    skinViewer.fxaaPass.enabled = false;
    skinViewer.controls.enableRotate = true;
    skinViewer.controls.enableZoom = true;
    skinViewer.controls.enablePan = true;

    const resizeObserver = new ResizeObserver(() => {
      skinViewer.setSize(
        skinViewerBox.clientWidth,
        skinViewerBox.clientHeight,
      );
    });
    resizeObserver.observe(skinViewerBox);

    await Promise.all([
      skinViewer.loadSkin("/assets/ItzOratotITA.png"),
      skinViewer.loadCape("/assets/eye-blossom-cape.png"),
    ]);

    skinViewerFallback.classList.add("d-none");
    animationButton.disabled = false;
    updateAnimationButton(false);
  } catch (error) {
    console.error("Could not initialize the skin viewer:", error);
    showSkinViewerError();
  }
}

animationButton.addEventListener("click", () => {
  if (!skinViewer || !skinview3d) return;

  if (skinAnimationPlaying) {
    skinViewer.animation = null;
    updateAnimationButton(false);
  } else {
    skinViewer.animation = new skinview3d.WalkingAnimation();
    skinViewer.animation.speed = 0.8;
    updateAnimationButton(true);
  }
});

if ("IntersectionObserver" in window) {
  const visibilityObserver = new IntersectionObserver(
    (entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        initializeSkinViewer();
      }
    },
    { rootMargin: "300px" },
  );
  visibilityObserver.observe(skinViewerBox);
} else {
  initializeSkinViewer();
}
