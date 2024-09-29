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

document.body.appendChild(VRButton.createButton(renderer));



// Load the model
const loader = new GLTFLoader();
loader.load('/assets/edited exo.glb', function(gltf) {
    const model = gltf.scene;   
    model.name = "planet";
    model.position.set(0, 0, 0);  // Position in the center
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


camera.position.set(20,0,1000);
camera.lookAt(0,0,0);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});



function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

animate();

