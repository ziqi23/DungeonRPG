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
        camera.position.set(-270, 60, -270);
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
            plane.scene.name = "plane";
            plane.scene.scale.setScalar(2);
            scene.add(plane.scene);
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
            plane.scene.name = "plane";
            plane.scene.scale.setScalar(2);
            scene.add(plane.scene);
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
            plane.scene.name = "plane";
            plane.scene.scale.setScalar(2);
            scene.add(plane.scene);
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
        
        const geometry2 = new THREE.BoxGeometry(115, 500, 0.1);
        const material2 = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane2 = new THREE.Mesh(geometry2, material2);
        plane2.position.set(-60, 0, -270);
        plane2.rotation.x = Math.PI / 2;
        plane2.rotation.z = 3 * Math.PI / 4;
        plane2.castShadow = true;
        plane2.receiveShadow = true;
        plane2.name = "plane";
        scene.add(plane2);

        const geometry3 = new THREE.BoxGeometry(120, 120, 0.1);
        const material3 = new THREE.MeshStandardMaterial({color: 0x000000});
        const plane3 = new THREE.Mesh(geometry3, material3);
        plane3.position.set(-210, 0, -360);

        plane3.rotation.x = Math.PI / 2;
        plane3.castShadow = true;
        plane3.receiveShadow = true;
        plane3.name = "plane";
        scene.add(plane3);

        const mtlLoader = new MTLLoader();
        mtlLoader.load('./assets/world/concrete_house.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('./assets/world/concrete_house.obj', obj => {
                obj.scale.setScalar(1.5);
                obj.position.set(-250, 1, -450);
                scene.add(obj);
                load();
            })
        })

        const mtlLoader2 = new MTLLoader();
        mtlLoader2.load('./assets/world/concrete_house.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('./assets/world/concrete_house.obj', obj => {
                obj.rotation.y = Math.PI / 2;
                obj.scale.setScalar(1.5);
                obj.position.set(-300, 1, -400);
                scene.add(obj);
                load();
            })
        })

        mtlLoader2.load('./assets/world/concrete_house.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('./assets/world/concrete_house.obj', obj => {
                obj.rotation.y = Math.PI / 2;
                obj.scale.setScalar(1.5);
                obj.position.set(-300, 1, -330);
                scene.add(obj);
                load();
            })
        })

        const fbxLoader = new FBXLoader();
        fbxLoader.load('./assets/world/RiverRock_FBX.fbx', fbx => {
            fbx.position.set(-149, 0, 161);
            fbx.scale.setScalar(0.014);
            fbx.rotation.y = 5.5 * Math.PI / 8;
            scene.add(fbx);
        })

        const fbxLoader2 = new FBXLoader();
        fbxLoader2.load('./assets/world/RiverRock_FBX.fbx', fbx => {
            fbx.position.set(-160, 0, 150);
            fbx.scale.setScalar(0.014);
            fbx.rotation.y = - 1.5 * Math.PI / 8;
            scene.add(fbx);
        })

        const fbxLoader3 = new FBXLoader();
        fbxLoader3.load('./assets/world/RiverRock_FBX.fbx', fbx => {
            fbx.position.set(-162, 0, 162);
            fbx.scale.setScalar(0.014);
            fbx.rotation.y = 1.5 * Math.PI / 8;
            scene.add(fbx);
        })

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

        // Pass objects to other classes
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
    }
}

export default World;