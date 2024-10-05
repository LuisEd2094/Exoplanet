import * as THREE from 'three';
import { VRButton } from './node_modules/three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const lineLayer = 1;  // Layer 1 for line
const objectLayer = 0;  // Default layer for all objects
let line1, line2;  // Declare a global variable for the line so we can update it


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
/*loader.load('/assets/lowerspaceplanet.glb', function(gltf) {
    const model = gltf.scene;   
    model.name = "planet";
    model.position.set(0, 0, -1000);  // Position in the center
    model.scale.set(1, 1, 1);     // Adjust scale if necessary  
    model.layers.set(objectLayer);
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
}); */
let panels;
let leftpanel;
loader.load('/assets/kepplersun.glb', function(gltf) {
    const model = gltf.scene;   
    model.name = "cockpit";
    model.position.set(0, 0, 0);  // Position in the center
    model.scale.set(1, 1, 1);     // Adjust scale if necessary  
    model.layers.set(objectLayer);
    scene.add(gltf.scene);  
    renderer.render(scene, camera);   //  <-  add this line

    // Traverse through the model to find clickable parts
    gltf.scene.traverse((child) => {
        console.log(child.name)     
        if (child.isMesh) {

            if (child.name === 'Rectangle_Bot') 
            {
                child.visible = false;
                panels = child;  // Mark this mesh as clickable

                // The `groups` array contains information about the face ranges for each material group
                panels.children.forEach(panel => {
                    panel.visible = false;              // Number of faces in the group
                });
            }
            else if (child.name === 'Left_Panel')
            {
                child.visible = false;
                leftpanel = child;
            }
        }
    });
});

scene.background = new THREE.Color(0xffffff);  // Full white background


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

controller1.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectstart', onSelectStart);




// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Raycaster and line setup


// Create the line using the geometry and material

/* const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 1.6, -1); // Position it directly in front of the camera
cube.name = "red";
scene.add(cube); 
cube.layers.set(objectLayer);
 */



//const raycaster = new THREE.Raycaster();


controller1.raycaster = new THREE.Raycaster();
controller1.raycaster.layers.set(objectLayer);

controller2.raycaster = new THREE.Raycaster();
controller2.raycaster.layers.set(objectLayer);



function handleControllerLine(controller,  line)
{
    const rayOrigin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
    const direction = new THREE.Vector3(0, 0, -1); // -Z axis is forward in three.js
    const raycaster = controller.raycaster;
    direction.applyQuaternion(controller.quaternion); // Apply controller's rotation
    const offset = 0.1; // Adjust this value as needed
    const rayOffset = rayOrigin.clone().add(direction.clone().multiplyScalar(offset));
    raycaster.ray.origin.copy(rayOffset); // Use the offset position as the origin
    raycaster.ray.direction.copy(direction); // Use the controller's direction
   const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    
    const points1 = [];
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (line) {
        scene.remove(line);
    }     
    if (intersects.length > 0) 
    {
   
        const controllerPosition = new THREE.Vector3();
        const intersection = intersects[0];


        controller.getWorldPosition(controllerPosition);
        points1.push(controllerPosition);
        points1.push(intersection.point);

        const geometry = new THREE.BufferGeometry().setFromPoints( points1 );
        line = new THREE.Line(geometry, material);
        line.layers.set(lineLayer); 


        scene.add( line );
    }
    return line;
}

function render() {
    line1 = handleControllerLine(controller1, line1);
    line2 = handleControllerLine(controller2, line2);
    renderer.render(scene, camera);

}


// Event handlers for controller interaction
function onSelectStart(event) {
    const controller = event.target;
    const raycaster = controller.raycaster;
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log(event);
    console.log(controller);
    console.log(intersects);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object; // Get the intersected object
        console.log(intersectedObject.name);
        if (intersectedObject.name === "Kepler_-_K2")
        {
            leftpanel.visible = !leftpanel.visible;
            panels.visible = !panels.visible;
            panels.children.forEach(panel => {
                panel.visible = !panel.visible;
            })
        }
         if (intersectedObject.material.color.getHex() === 0x00ff00)
            intersectedObject.material.color.set(0xFFFFFF); // Change color on click
        else
        {
            intersectedObject.material.color.set(0x00ff00); // Change color on click
        }
    }
}


renderer.setAnimationLoop(render);
