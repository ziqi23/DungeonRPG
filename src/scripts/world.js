import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { load } from '..';

class World {
    constructor() {
        // Initialize scene, camera and lights
        const scene = new THREE.Scene();
        scene.background = 0x000000;
        const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 1000);
        camera.position.set(-300, 60, -220);

        const light = new THREE.DirectionalLight(0x000000, 1);
        light.position.set(100, 100, 100);
        light.castShadow = true;
        scene.add(light);

        const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        light2.position.set(200, 10, 200);
        light2.castShadow = true;
        scene.add(light2);

        const light3 = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        light3.position.set(-200, 10, -200);
        light3.castShadow = true;
        scene.add(light3);
        
        // Initialize plane at y = 0
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('./assets/world/scene.gltf', function(plane) {
            plane.scene.castShadow = true;
            plane.scene.receiveShadow = true;
            plane.scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            plane.scene.name = "plane"
            plane.scene.scale.setScalar(2)
            scene.add(plane.scene)
            load();
        })

        const gltfLoader2 = new GLTFLoader();
        gltfLoader2.load('./assets/world/scene.gltf', function(plane) {
            plane.scene.castShadow = true;
            plane.scene.receiveShadow = true;
            plane.scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            plane.scene.rotation.y = Math.PI / 2;
            plane.scene.position.set(-120, 0, -300);
            plane.scene.name = "plane"
            plane.scene.scale.setScalar(2)
            scene.add(plane.scene)
            load();
        })

        const gltfLoader3 = new GLTFLoader();
        gltfLoader3.load('./assets/world/scene.gltf', function(plane) {
            plane.scene.castShadow = true;
            plane.scene.receiveShadow = true;
            plane.scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            plane.scene.rotation.y = - 1.2 * Math.PI / 4;
            plane.scene.position.set(220, -15, -350);
            plane.scene.name = "plane"
            plane.scene.scale.setScalar(2)
            scene.add(plane.scene)
            load();
        })

        const geometry = new THREE.BoxGeometry(100, 420, 0.1);
        const material = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, 30);
        plane.rotation.x = Math.PI / 2;
        plane.rotation.z = Math.PI / 4;
        plane.castShadow = true;
        plane.receiveShadow = true;
        plane.name = "plane";
        scene.add(plane);
        
        const geometry2 = new THREE.BoxGeometry(100, 500, 0.1);
        const material2 = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane2 = new THREE.Mesh(geometry2, material2);
        plane2.position.y = 0;
        plane2.position.z = -300;
        plane2.position.x = -90;
        plane2.rotation.x = Math.PI / 2;
        plane2.rotation.z = 3 * Math.PI / 4;
        plane2.castShadow = true;
        plane2.receiveShadow = true;
        plane2.name = "plane";
        scene.add(plane2);

        const geometry3 = new THREE.BoxGeometry(100, 200, 0.1);
        const material3 = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane3 = new THREE.Mesh(geometry3, material3);
        plane3.position.y = 0;
        plane3.position.z = -380;
        plane3.position.x = -270;
        plane3.rotation.x = Math.PI / 2;
        plane3.castShadow = true;
        plane3.receiveShadow = true;
        plane3.name = "plane";
        scene.add(plane3);

        const geometry4 = new THREE.BoxGeometry(50, 50, 0.1);
        const material4 = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane4 = new THREE.Mesh(geometry4, material4);
        plane4.position.y = 0;
        plane4.position.z = -335;
        plane4.position.x = -200;
        plane4.rotation.x = Math.PI / 2;
        plane4.castShadow = true;
        plane4.receiveShadow = true;
        plane4.name = "plane";
        scene.add(plane4);

        // Add handler for window resize
        window.addEventListener('resize', handleResize);
        
        function handleResize(e) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }

        // Render everything above
        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setSize(innerWidth, innerHeight);
        renderer.render(scene, camera);
        document.body.appendChild(renderer.domElement);

        // Set camera rotation properties
        const controls = new OrbitControls( camera, renderer.domElement );
        controls.rotateSpeed = 3;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        // controls.minDistance = 30;
        // controls.maxDistance = 70;
        // controls.minPolarAngle = 1 * Math.PI / 3
        // controls.maxPolarAngle = 0.9 * Math.PI / 2;

        // Pass objects to other classes
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        // this.controls = controls;
    }
}

export default World;