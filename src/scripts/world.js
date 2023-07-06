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
        const light = new THREE.DirectionalLight(0x000000, 1);
        light.position.x = 100;
        light.position.z = 100;
        light.position.y = 100;
        scene.add(light);
        const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.6);
        light2.position.x = -200;
        light2.position.z = 200;
        light2.position.y = 20;
        light2.castShadow = true;
        scene.add(light2);
        
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
        const geometry = new THREE.BoxGeometry(100, 420, 0.1);
        const material = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane = new THREE.Mesh(geometry, material);
        plane.position.y = 0;
        plane.position.x = 40;
        plane.rotation.x = Math.PI / 2;
        plane.rotation.z = Math.PI / 4;
        plane.castShadow = true;
        plane.receiveShadow = true;
        plane.name = "plane";
        scene.add(plane);
        
        const geometry2 = new THREE.BoxGeometry(180, 150, 0.1);
        const material2 = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane2 = new THREE.Mesh(geometry2, material2);
        plane2.position.y = 0;
        plane2.position.z = -120;
        plane2.position.x = 110;
        plane2.rotation.x = Math.PI / 2;
        plane2.castShadow = true;
        plane2.receiveShadow = true;
        plane2.name = "plane";
        scene.add(plane2);

        // // Initialize terrain
        // const rockTexture = new THREE.TextureLoader().load('./assets/world/large-rock-texture.jpg');
        // const loader = new OBJLoader();
        // loader.load("./assets/world/large-rock.obj", function(obj) {
        //     obj.position.y = 40;
        //     obj.position.x = 200;
        //     obj.rotation.y = Math.PI / 2;
        //     obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
        //     obj.name = "terrain";
        //     scene.add(obj);
        //     load();
        // })

        // // Initialize static scene background
        // const texture = new THREE.TextureLoader().load('./assets/space-background.jpg');
        // scene.background = texture;  

        // // Load decorations at random locations
        // for(let i = 0; i < 20; i++) {
        //     loader.load("./assets/world/small-rock.obj", function(obj) {
        //         for (let i = 0; i < 3; i++) {
        //             let randomRock = obj.children[i];
        //             randomRock.material = new THREE.MeshStandardMaterial({map: rockTexture});
        //             randomRock.scale.x = 2;
        //             randomRock.scale.y = 2;
        //             randomRock.scale.z = 2;
        //             randomRock.position.y = -5;
        //             if (Math.random() > 0.5) {
        //                 randomRock.position.x = (100 + Math.random() * 50);
        //             } else {
        //                 randomRock.position.x = -(100 + Math.random() * 50);
        //             }
        //             randomRock.position.z = (Math.random() * 2 - 1) * 300 - 100;
        //             obj.name = "terrain";
        //             scene.add(randomRock);
        //         }
        //     })
        // }

        // Set camera location
        camera.position.set(0, 50, 80);

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