import * as THREE from 'three';
import { VRButton } from './node_modules/three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';


const scene = new THREE.Scene();

function addCamera() {
    const camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    )
    camera.position.set(0, 1.6, 0)
    camera.lookAt(0, 0, 0)
    return camera
}
let camera = addCamera()
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer)); // Add VR Button to enter VR mode

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);


const loader = new GLTFLoader();
loader.load('/assets/edited exo.glb', function(gltf) {
    const model = gltf.scene;   
    model.name = "planet";
    model.position.set(0, 0, -1000);  // Position in the center
    model.scale.set(1, 1, 1);     // Adjust scale if necessary
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


const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

scene.add(controller1);
scene.add(controller2);

// Load controller models
const controllerModelFactory = new XRControllerModelFactory();
const controller1Model = controllerModelFactory.createControllerModel(controller1);
const controller2Model = controllerModelFactory.createControllerModel(controller2);

controller1.add(controller1Model);
controller2.add(controller2Model);


// Create controllers

// Set up interaction with the controllers


// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate the cube and render the scene
function render() {
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(render);
