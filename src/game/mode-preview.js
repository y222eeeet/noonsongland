import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createSongi } from '../models/songi.js';
import { createRemoteActions } from './remote-actions.js';

const stage = document.querySelector('main');
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
stage.append(renderer.domElement);

const scene = new T.Scene();
scene.background = new T.Color('#ede8f4');
const camera = new T.PerspectiveCamera(34, 1, .1, 70);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.45, 0);
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 22;

function setCamera(x, y, z) {
  camera.position.set(x, y, z);
  controls.update();
}
setCamera(0, 4, 12);
document.querySelector('#front').onclick = () => setCamera(0, 4, 12);
document.querySelector('#side').onclick = () => setCamera(-12, 4, 0);

scene.add(new T.HemisphereLight('#fff8ff', '#c8b4d7', 1.65));
const key = new T.DirectionalLight('#fff7e5', 2.15);
key.position.set(-5, 9, 7);
key.castShadow = true;
scene.add(key);
const floor = new T.Mesh(new T.PlaneGeometry(100, 100), new T.MeshStandardMaterial({ color: '#ddd2ec' }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const avatar = createSongi();
scene.add(avatar);
const effects = createRemoteActions(avatar, scene);
const modes = {
  sigh: { label: '한숨', phases: { idle: '대기', inhale: '들숨', exhale: '날숨' } },
  smoke: { label: '담타', phases: { idle: '대기', inhale: '흡입', exhale: '날숨' } },
  drink: { label: '병나발', phases: { idle: '대기', drink: '들이키기', dizzy: '헤롱헤롱' } },
};

let mode = 'sigh';
let phase = 'idle';
let started = performance.now();
let event = 0;

function buttons(container, labels, selection, select) {
  document.querySelector(container).replaceChildren(...Object.entries(labels).map(([id, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(id === selection));
    button.onclick = () => select(id);
    return button;
  }));
}
function selectPhase(next) {
  phase = next;
  started = performance.now();
  event++;
  buttons('#phases', modes[mode].phases, phase, selectPhase);
}
function selectMode(next) {
  mode = next;
  effects.hide();
  buttons('#modes', Object.fromEntries(Object.entries(modes).map(([id, data]) => [id, data.label])), mode, selectMode);
  selectPhase('idle');
}
selectMode(mode);

new ResizeObserver(() => {
  const { clientWidth: width, clientHeight: height } = stage;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}).observe(stage);

let previous = performance.now();
renderer.setAnimationLoop(now => {
  const age = Math.max(0, (now - started) / 1000);
  const dt = Math.min(.05, Math.max(0, (now - previous) / 1000));
  previous = now;
  const exhaling = phase === 'exhale';
  effects.update({
    realm: 'campus', rotation: 0,
    action: mode === 'sigh' ? phase : 'idle',
    held: phase === 'inhale' ? age : 0,
    sighEvent: mode === 'sigh' && exhaling ? event : 0,
    sighAge: age,
    sighVisual: { origin: [0, 2.65, 1], rotation: 0, puff: .1, profile: { count: 10, scale: 1.4, opacity: .53 } },
    smoking: mode === 'smoke', smokePhase: phase,
    smokeEvent: exhaling ? event : 0, smokeAge: age, smokeHeld: 3,
    smokeBurn: phase === 'inhale' ? Math.max(.2, 1 - age * .12) : 1,
    drinking: mode === 'drink', drinkPhase: phase, drinkAge: age,
  }, now, 0, dt);
  renderer.render(scene, camera);
});
