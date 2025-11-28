import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  FontLoader,
  GLTFLoader,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7d6ff);

const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(3, 5, 3);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = true;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTextTexture = textureLoader.load("/textures/matcaps/15.png");

matcapTextTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Object
 */
const fontLoader = new FontLoader();
const bounceText = new THREE.Group();
const textScale = getResponsiveScale(0.6, 0.45, 0.32);

fontLoader.load("/fonts/optimer_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Khushi Johri", {
    font: font,
    size: textScale,
    depth: textScale * 0.33,
    curveSegments: 4,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.01,
    bevelOffset: 0.01,
    bevelSegments: 5,
  });

  textGeometry.center();

  const textMaterial = new THREE.MeshMatcapMaterial({ map: matcapTextTexture });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  bounceText.add(textMesh);
  scene.add(bounceText);
});

// 3D Models
const gltfLoader = new GLTFLoader();

gltfLoader.load("/models/pink_donut.glb", (model) => {
  model.scene.children.map((child) =>
    child.name === "Plane" ? (child.visible = false) : null
  );

  makeRandomObjects(model.scene, 1, 8);
});

gltfLoader.load("/models/pink_glazed_donut/scene.gltf", (model) => {
  makeRandomObjects(model.scene, 0.2, 0.5);
});

gltfLoader.load("/models/elegant_cupcake.glb", (model) => {
  model.scene.scale.set(0.001, 0.001, 0.001);
  makeRandomObjects(model.scene, 0.001, 0.004);
});

gltfLoader.load("/models/oreo_cupcake.glb", (model) => {
  makeRandomObjects(model.scene, 0.2, 0.4);
});

function makeRandomObjects(gltfModel, minScale, maxScale) {
    const responsiveMinScale = getResponsiveScale(minScale, minScale * 0.8, minScale * 0.5);
    const responsiveMaxScale = getResponsiveScale(maxScale, maxScale * 0.8, maxScale * 0.5);

    const responsiveDistance = getResponsiveScale(10, 8, 6);
  for (let i = 0; i < 15; i++) {
    const clone = gltfModel.clone(true);

    clone.position.x = (Math.random() - 0.5) * responsiveDistance;
    clone.position.y = (Math.random() - 0.5) * responsiveDistance;
    clone.position.z = (Math.random() - 0.5) * responsiveDistance;

    clone.rotation.x = (Math.random() - 0.5) * Math.PI * 0.5; //no upside down
    clone.rotation.y = Math.random() * Math.PI;

    const randomScale = Math.random() * (responsiveMaxScale - responsiveMinScale) + responsiveMinScale;
    clone.scale.set(randomScale, randomScale, randomScale);

    scene.add(clone);
  }
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const s = getResponsiveScale(0.6, 0.45, 0.32);
  bounceText.scale.set(s, s, s);

  // ⭐ EASY FIX: responsive camera distance
  camera.position.z = window.innerWidth < 600 ? 5 : 3.5;
});

function getResponsiveScale(desktop, tablet, mobile) {
  const w = window.innerWidth;

  if (w > 1024) return desktop;    // Desktop
  if (w > 600) return tablet;      // Tablet
  return mobile;                   // Mobile
}


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 1;
if (window.innerWidth < 600) {
  camera.position.z = 5; 
} else {
  camera.position.z = 3.5;
}
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const speed = 1.2; // different speed for each clone
  const height = 0.005; // bounce height

  bounceText.position.y += Math.sin(elapsedTime * speed) * height ;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
