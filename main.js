import * as THREE from 'three';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from './node_modules/three/examples/jsm/webxr/VRButton.js';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable VR
renderer.xr.enabled = true;

renderer.xr.addEventListener('sessionstart', () => {
    // Move the camera back when VR starts to avoid being inside the object
    camera.position.set(20,0,100);  // Set a higher Z value to avoid inside view
});

renderer.xr.addEventListener('sessionend', () => {
    // Reset the camera position after exiting VR
    camera.position.set(20,0,100);  // Reset or adjust based on normal view
});

document.body.appendChild(VRButton.createButton(renderer));

// Load the model
const loader = new GLTFLoader();
loader.load('/assets/edited exo.glb', function(gltf) {
    const model = gltf.scene;   
    model.name = "planet";
    model.position.set(0, 0, 0);  // Position in the center
    model.scale.set(0.1, 0.1, 0.1);     // Adjust scale if necessary
    scene.add(gltf.scene);  
    renderer.render(scene, camera);   //  <-  add this line

    // Traverse through the model to find clickable parts
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.name === 'ClickablePart1') {
                child.userData.clickable = true;  // Mark this mesh as clickable
            }
            if (child.name === 'ClickablePart2') {
                child.userData.clickable = true;  // Mark this mesh as clickable
            }
        }
    });
});



camera.position.set(20,0,100);
camera.lookAt(0,0,0);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// VR Controllers
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1);
scene.add(controller2);
    
// Raycaster for detecting clicks with controllers
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

// Handle controller interactions
/* function handleController(controller) {
    const userData = controller.userData;

    // Check for intersecting objects
    const intersections = controller.intersectObject(scene, true);
    if (intersections.length > 0) {
        const clickedObject = intersections[0].object;

        // Check if the clicked object is clickable
        if (clickedObject.userData.clickable) {
            console.log(`You clicked on ${clickedObject.name}!`);
            clickedObject.material.color.set(0xff0000); // Change color to red as an example
        }
    }
}
 */
// Animation loop
function animate() {
    renderer.setAnimationLoop(() => {
/*         handleController(controller1);
        handleController(controller2); */
        renderer.render(scene, camera);
    });
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
