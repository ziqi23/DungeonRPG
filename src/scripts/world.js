import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
class World {
    constructor() {

        // Initialize scene, camera and lights
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 1000);
        const light = new THREE.DirectionalLight();
        light.position.x = 0;
        light.position.z = -100;
        light.position.y = 50;
        scene.add(light);
        const light2 = new THREE.DirectionalLight();
        light2.position.x = 0;
        light2.position.z = 100;
        light2.position.y = 50;
        scene.add(light2);
        
        // Initialize 500x500 plane at y = 0
        const rockTexture = new THREE.TextureLoader().load('./assets/moon-texture.jpeg');
        const geometry = new THREE.BoxGeometry(500, 500, 0.1);
        const material = new THREE.MeshStandardMaterial({map: rockTexture});
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2;
        plane.receiveShadow = true;
        plane.name = "plane";
        scene.add(plane);

        // Initialize base
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('./assets/ISS_stationary.glb', function(gltf) {
            gltf.scene.position.x = 45;
            gltf.scene.position.y = 10;
            gltf.scene.position.z = 80;
            gltf.scene.rotation.z = Math.PI;
            gltf.scene.rotation.y = Math.PI / 4;
            scene.add(gltf.scene);
        })
        const beamTexture = new THREE.TextureLoader().load('./assets/cannon.jpeg');
        const beamGeometry = new THREE.SphereGeometry(3, 32, 32);
        const beamMaterial = new THREE.MeshStandardMaterial({map: beamTexture});
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.x = 23;
        beam.position.y = 10;
        beam.position.z = 56;
        beam.name = 'cannonAttack'
        scene.add(beam)


        // Initialize globe background
        const globeTexture = new THREE.TextureLoader().load('./assets/globetexture.png');
        const bgGeometry = new THREE.SphereGeometry(200, 64, 64);
        const bgMaterial = new THREE.MeshStandardMaterial({map: globeTexture});
        const bg = new THREE.Mesh(bgGeometry, bgMaterial);
        bg.position.x = 200;
        bg.position.y = -20;
        bg.position.z = -450;
        bg.name = "sky";
        scene.add(bg);

        // Initialize terrain
        const loader = new OBJLoader();
        loader.load("./assets/LargeCaveRock_Obj.obj", function(obj) {
            obj.position.y = 40;
            obj.position.x = 200;
            obj.rotation.y = Math.PI / 2
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.name = "sky"
            scene.add(obj);
        })

        loader.load("./assets/LargeCaveRock_Obj.obj", function(obj) {
            obj.position.y = 40;
            obj.position.z = 200;
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.name = "sky"
            scene.add(obj);
        })

        loader.load("./assets/LargeCaveRock_Obj.obj", function(obj) {
            obj.position.y = 40;
            obj.position.x = -200;
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.rotation.y = Math.PI / 2
            obj.name = "sky"
            scene.add(obj);
        })

        // Initialize static scene background
        const texture = new THREE.TextureLoader().load('./assets/space-background.jpg')
        scene.background = texture;  

        // Load smaller rocks at random locations
        for(let i = 0; i < 20; i++) {
            loader.load("./assets/rock1.obj", function(obj) {
                for (let i = 0; i < 3; i++) {
                    let randomRock = obj.children[i]
                    randomRock.material = new THREE.MeshStandardMaterial({map: rockTexture});
                    randomRock.scale.x = 2;
                    randomRock.scale.y = 2;
                    randomRock.scale.z = 2;
                    randomRock.position.y = -5;
                    if (Math.random() > 0.5) {
                        randomRock.position.x = (100 + Math.random() * 50)
                    } else {
                        randomRock.position.x = -(100 + Math.random() * 50)
                    }
                    randomRock.position.z = (Math.random() * 2 - 1) * 300 - 100;
                    obj.name = "sky"
                    scene.add(randomRock);
                }
            })
        }

        // Set camera location
        camera.position.set(0, 20, 50);

        // Add handler for window resize
        window.addEventListener('resize', handleResize) 
        
        function handleResize(e) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }

        // Render everything above
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(innerWidth, innerHeight);
        renderer.render(scene, camera);
        document.body.appendChild(renderer.domElement);

        // // Set camera rotation properties
        // const controls = new OrbitControls( camera, renderer.domElement );
        // controls.rotateSpeed = 3;
        // controls.enablePan = false;
        // controls.enableDamping = true;
        // controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        // controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        // controls.minDistance = 30;
        // controls.maxDistance = 70;
        // controls.minPolarAngle = 1 * Math.PI / 3
        // controls.maxPolarAngle = 0.9 * Math.PI / 2;

        // Pass objects to other classes
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.plane = plane;
        // this.controls = controls;
    }
}

export default World;