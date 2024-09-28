import * as THREE from 'three';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
console.log(screen.width /screen.height);
const camera = new THREE.PerspectiveCamera(75, screen.width /screen.height, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor =  0.25;
controls.enableZoom = true;

renderer.setSize(screen.width, screen.height);

document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
textureLoader.load('./assets/background.jpg', function(texture) {
    scene.background = texture;  // Set the background texture
});



const loader = new GLTFLoader();
loader.load('./assets/edited exo.glb', function (gltf){
    const model = gltf.scene;   
    model.name = "planet";
    model.position.set(0, 0, 0);  // Position in the center
    model.scale.set(0.1, 0.1, 0.1);     // Adjust scale if necessary
    model.traverse((child) => {
        console.log(child);
        if (child.name === 'Testing_Click')
        {
            child.userData.clickable = true;
        }
    })
    scene.add(model);
    console.log(model);
    renderer.render(scene, camera);   //  <-  add this line
});

camera.position.set(20,0,100);
camera.lookAt(0,0,0);

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);  // Ambient light
scene.add(ambientLight);

var light = new THREE.PointLight( 0xff0001, 1, 100 );
light.position.set( 50, 50, 50 );
var light2 = new THREE.PointLight( 0xff0001, 1, 100 );
light.position.set( 0, 0, 0 );
scene.add( light);
scene.add( light2);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);  // Directional light
directionalLight.position.set(1, 1, 1).normalize();  // Set the direction
scene.add(directionalLight);

scene.background = new THREE.Color( 0x999999 );


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        // Perform an action on the clicked object
        console.log(clickedObject.name);
        if (clickedObject.userData.clickable) {
            // Example action: Change color on click
            console.log("you clicked on me");  // Change color randomly
        }
    }
});

animate();

