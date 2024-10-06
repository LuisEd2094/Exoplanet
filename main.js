import * as THREE from 'three';
import { VRButton } from './node_modules/three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const notCollide = 1;  // Layer 1 for line
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

const ambientLight = new THREE.AmbientLight(0xFFF2F0, 0.7);
scene.add(ambientLight);
/* const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);
 */



const loader = new GLTFLoader();
let leftpanel;
let planet;
let sun;
let telescope;
let panels;


function changeVisibility()
{
    panels.visible = !panels.visible;
    if (panels.visible)
        panels.layers.set(objectLayer);
    else
        panels.layers.set(notCollide);
    panels.children.forEach(panel => {
        panel.visible = !panel.visible;
        if (panel.visible)
            panel.layers.set(objectLayer);
        else
        panel.layers.set(notCollide);

    })

    return panels;
}
//keplerbig
//keplersmall
//keplermid
loader.load('/assets/keplerbig.glb', function(gltf) {
    const model = gltf.scene;   
    model.name = "cockpit";
    model.position.set(0, 0, 0);  // Position in the center
    model.scale.set(1, 1, 1);     // Adjust scale if necessary  
    model.layers.set(objectLayer);
    scene.add(gltf.scene);  
    renderer.render(scene, camera);   //  <-  add this line

    // Traverse through the model to find clickable parts
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.name === 'toppanel') 
            {
                child.visible = false;
                panels = child;  // Mark this mesh as clickable

                panels.layers.set(notCollide);

                // The `groups` array contains information about the face ranges for each material group
                panels.children.forEach(panel => {
                    panel.visible = false;
                    panel.layers.set(notCollide);
                });
            }
            else if (child.name === 'leftpanel')
            {
                child.visible = false;
                leftpanel = child;
                leftpanel.layers.set(notCollide);
            }
            else if (child.name === 'telescope')
                {
                    telescope = child;
                }
            else if (child.name === 'Planet')
            {
                child.visible = false;
                planet = child; 
            }
            else if (child.name === 'Sun')
            {
                sun = child;
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
        line.layers.set(notCollide); 

        scene.add( line );
    }
    return line;
}


const sounds = {};


const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();

audioLoader.load( 'assets/big_planet.wav', function( buffer ) {
    const sound = new THREE.Audio(listener);
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.7 );
    sounds.big = sound;
});
audioLoader.load( 'assets/medium.wav', function( buffer ) {
    const sound = new THREE.Audio(listener);
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.7 );
    sounds.mid = sound;
});
audioLoader.load( 'assets/small_planet.wav', function( buffer ) {
    const sound = new THREE.Audio(listener);
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.7 );
    sounds.small = sound;
});

audioLoader.load( 'assets/congrats.wav', function( buffer ) {
    const sound = new THREE.Audio(listener);
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.7 );
    sounds.congrats = sound;
});


audioLoader.load( 'assets/kepler_audio.wav', function( buffer ) {
    const sound = new THREE.Audio(listener);
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.7 );
    sounds.kepler = sound;
});

const background = new THREE.Audio(listener);

audioLoader.load( 'assets/background.mp3', function( buffer ) {
	background.setBuffer( buffer );
	background.setLoop( true );
	background.setVolume( 0.2 );
    sounds.background = background;
});



function render() {
    line1 = handleControllerLine(controller1, line1);
    line2 = handleControllerLine(controller2, line2);
    sun.rotation.y += 0.00005;
    sun.rotation.x += 0.00002;
    sun.rotation.z -= 0.00001;
    telescope.rotation.y += 0.0002;

    planet.rotation.y += 0.0008;
    renderer.render(scene, camera);

}

function getTextureName(object)
{
    return object.material.map.name;
    const material = object.material;
    const texture = material.map;       // Access the texture object
    const imageSource = texture.name; // Get the file path of the texture

}

function playAudio(texture)
{
    if (texture.includes('big'))
        sounds.big.play();
    else if (texture.includes('small'))
        sounds.small.play();
    else if (texture.includes('med'))
        sounds.mid.play();
}

// Event handlers for controller interaction
function onSelectStart(event) {
    const controller = event.target;
    const raycaster = controller.raycaster;
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object; // Get the intersected object
        if (intersectedObject.name === "telescope")
        {
            sounds.kepler.play();
            leftpanel.visible = !leftpanel.visible;
            if (leftpanel.visible)
                leftpanel.layers.set(objectLayer);
            else
                leftpanel.layers.set(notCollide);

            changeVisibility();
            if (intersectedObject.material.color.getHex() === 0xFFFFFF)
                intersectedObject.material.color.set(0xE7E7E7); // Change color on click
            else
            {
                intersectedObject.material.color.set(0xFFFFFF); // Change color on click
            }
        }
        else if (intersectedObject.name === "toppanel") //Always the correct one 
        {
            sounds.congrats.play();
            planet.visible = true;
            //sounds.good.play();
            changeVisibility();
        }
        else if(intersectedObject.name === "leftpanel")
        {
            let name = getTextureName(intersectedObject)
            playAudio(name);
        }
        else if (intersectedObject.name === "botpanel")
        {
            let name = getTextureName(intersectedObject)
            playAudio(name);

        }
        else if (intersectedObject.name === "midpanel")
        {
            let name = getTextureName(intersectedObject)
            playAudio(name);
        }

    }
}


renderer.xr.addEventListener('sessionstart', () => {
    if (!background.isPlaying) {
        background.play();  // Play sound once they enter VR mode
    }
});

renderer.setAnimationLoop(render);
