/**
 * bike.js — GLTFLoader + PBR + GSAP
 *
 * Model: models/bike.glb (CarbonFrameBike z three.js examples)
 * Nahradit motorkou: stáhnout volný GLB z https://sketchfab.com/tags/motorcycle?features=downloadable
 * a uložit jako models/bike.glb
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader }      from 'three/addons/loaders/GLTFLoader.js';

async function initBike() {
  const canvas = document.getElementById('heroBike');
  if (!canvas) return;
  const par = canvas.parentElement;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) { setTimeout(initBike, 80); return; }

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ── Scene / Camera ── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.01, 200);
  camera.position.set(1.4, 1.0, 4.0);
  camera.lookAt(0, 0.2, 0);

  /* ── PBR Environment — realistické odrazy na kovech ── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  /* ── Světla ── */
  scene.add(new THREE.HemisphereLight(0x1a1a4e, 0x050508, 0.45));

  const key = new THREE.DirectionalLight(0xfff0d0, 5.5);
  key.position.set(5, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.001;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x3060cc, 5.8);
  rim.position.set(-5, 1.5, -5);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(0, -3, 4);
  scene.add(fill);

  /* ── Načtení GLB modelu ── */
  let pivot;
  try {
    const loader = new GLTFLoader();
    const gltf   = await loader.loadAsync('models/bike.glb');
    const model  = gltf.scene;

    /* Vystředění a škálování na jednotkovou velikost */
    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    model.position.sub(center);  // vystředit
    const maxDim = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(3.0 / maxDim);  // přizpůsobit scéně

    /* Stíny na všechna mesh */
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    /* Pivot group pro rotaci + GSAP float */
    pivot = new THREE.Group();
    pivot.add(model);

    /* Stín na zemi */
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.8, 40),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.20 })
    );
    shadow.scale.set(1, 0.2, 1);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -box.min.y * (3.0 / maxDim) - 0.01;
    pivot.add(shadow);

    scene.add(pivot);

  } catch (err) {
    console.warn('bike.glb se nepodařilo načíst:', err);
    return;
  }

  /* ── Mouse parallax state ── */
  const ms = { x: 0, y: 0 };
  let baseRotY = 0.45;
  const clock = new THREE.Clock();

  /* ── GSAP animace ── */
  const gsap = window.gsap;
  if (gsap) {
    /* Entry — najede zprava */
    pivot.position.x = 3.2;
    gsap.to(pivot.position, { x: 0, duration: 1.1, ease: 'power3.out', delay: 0.25 });

    /* Float — pluje nahoru/dolů */
    gsap.to(pivot.position, {
      y: 0.18, duration: 2.5, ease: 'sine.inOut',
      yoyo: true, repeat: -1, delay: 1.45,
    });

    /* Mouse parallax — nakloní model při pohybu myši */
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', e => {
        const r = heroEl.getBoundingClientRect();
        gsap.to(ms, {
          x: ((e.clientX - r.left) / r.width  - 0.5) * 0.85,
          y: -((e.clientY - r.top)  / r.height - 0.5) * 0.38,
          duration: 1.1, ease: 'power2.out', overwrite: true,
        });
      });
      heroEl.addEventListener('mouseleave', () => {
        gsap.to(ms, { x: 0, y: 0, duration: 1.8, ease: 'power2.out', overwrite: true });
      });
    }
  }

  /* ── Render loop ── */
  function render() {
    requestAnimationFrame(render);
    const dt = Math.min(clock.getDelta(), 0.05);
    baseRotY += dt * 0.22;
    pivot.rotation.y = baseRotY + ms.x;
    pivot.rotation.x = ms.y;
    renderer.render(scene, camera);
  }
  render();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    const nw = par.clientWidth, nh = par.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  }, { passive: true });
}

if (document.readyState === 'complete') requestAnimationFrame(initBike);
else window.addEventListener('load', () => requestAnimationFrame(initBike));
