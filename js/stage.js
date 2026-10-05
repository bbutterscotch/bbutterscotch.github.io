// Minimal three.js stage: renderer, studio lighting, soft ground shadow,
// orbit controls and a camera framed to the object's bounds.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export { THREE };

export function createStage(host, { autorotate = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.outline = 'none';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
  camera.position.set(3, 2.2, 4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = autorotate;
  controls.autoRotateSpeed = 1.2;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // Sky/ground wash, a shadow-casting key light, and a dim fill from behind.
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
  fill.position.set(-5, 3, -4);
  scene.add(hemi, key, fill);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const fit = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  fit();
  new ResizeObserver(fit).observe(host);
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });

  // Show the object: shadows on every mesh, rest it on the ground, frame the camera.
  const setObject = (object) => {
    object.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const box = new THREE.Box3().setFromObject(object);
    if (!box.isEmpty()) {
      ground.position.y = box.min.y;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const dist = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.35;
      camera.position.copy(sphere.center).add(new THREE.Vector3(1, 0.55, 1.25).normalize().multiplyScalar(dist));
      camera.near = Math.max(dist / 100, 0.01);
      camera.far = dist * 100;
      camera.updateProjectionMatrix();
      controls.target.copy(sphere.center);
      controls.update();
      const span = sphere.radius * 3;
      Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span });
      key.shadow.camera.updateProjectionMatrix();
    }
    scene.add(object);
  };

  return { THREE, scene, camera, renderer, controls, hemi, key, fill, canvas: renderer.domElement, setObject };
}
