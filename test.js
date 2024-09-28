import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';


// Create the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
camera.position.set(0, 2, 5);  // Adjust camera position to see the object

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const loader = new GLTFLoader();
loader.load('./assets/55_Cancri_e_1_24364.glb', function (gltf){
    const model = gltf.scene;
    model.position.set(0, 0, 0);  // Position in the center
    model.scale.set(0.5, 0.5, 0.5);     // Adjust scale if necessary
    console.log(scene);
    scene.add(model);
    console.log(scene);
    renderer.render(scene, camera);   //  <-  add this line
});

// Create a basic cube geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });  // Standard material reacts to lighting
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
console.log(scene);




// Add Ambient Light (provides overall lighting)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Color and intensity
scene.add(ambientLight);

// Add Directional Light (acts like sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);  // Position of the light source
scene.add(directionalLight);

// Add OrbitControls to move around the scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the cube for demonstration
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Update controls
    controls.update();

    // Render the scene with the camera
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});