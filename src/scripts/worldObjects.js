import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { load } from '..';

class WorldObjects {
    constructor(world) {
        this.scene = world.scene;
        this.camera = world.camera;
        // this.controls = world.controls;
        this.mixers = [];
        this.constructRocks();
        this.loadAnimatedModel();   
    }

    async loadAnimatedModel() {
        let that = this;
        const loader = new FBXLoader();
        loader.load('./assets/player/archer-model.fbx', (fbx) => {
            fbx.scale.setScalar(0.04)
            fbx.rotateY(Math.PI);
            fbx.traverse(c => {
                if (c.isMesh) {
                    c.castShadow = true;
                    c.receiveShadow = false;
                    c.geometry.computeVertexNormals();
                }
            });
            const animation = new FBXLoader();
            animation.load("./assets/player/animation-idle.fbx", (animation) => {
                const mixer = new THREE.AnimationMixer(fbx);
                mixer.name = 'idle'
                this.mixers.push(mixer);
                mixer.clipAction(animation.animations[0]).play();
            })

            const animation2 = new FBXLoader();
            animation2.load("./assets/player/animation-run-forward.fbx", (animation) => {
                const mixer = new THREE.AnimationMixer(fbx);
                mixer.name = 'run-forward'
                this.mixers.push(mixer);
                mixer.clipAction(animation.animations[0]).play();
            })

            const animation3 = new FBXLoader();
            animation3.load("./assets/player/animation-draw-arrow.fbx", (animation) => {
                const mixer = new THREE.AnimationMixer(fbx);
                mixer.name = 'draw-arrow'
                this.mixers.push(mixer);
                mixer.clipAction(animation.animations[0]).play();
            })
            fbx.name = 'player';
            that.scene.add(fbx);
            that.camera.lookAt(fbx.position);
            load();
        });
    }
    
    // Construct center pillars and wait for models to load
    async constructRocks() {
        let that = this;
        // Construct Cylinder 1
        const loader = new OBJLoader();
        const rockTexture = new THREE.TextureLoader().load('./assets/rocktexture.jpg');
        loader.load("./assets/asteroid.obj", function(obj) {
            obj.scale.x = 15;
            obj.scale.y = 15;
            obj.scale.z = 15;
            obj.position.x = (Math.random() * 100) - 50;
            obj.position.y = 80;
            obj.position.z = -((Math.random() * 100) + 50);
            obj.rotation.z = Math.random() * Math.PI;
            obj.direction = {x: Math.random() - 0.5, z: Math.random() - 0.5}
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.name = "cylinder2";
            that.scene.add(obj);
            load();
        })

        // Construct Cylinder 2
        loader.load("./assets/asteroid.obj", function(obj) {
            obj.scale.x = 15;
            obj.scale.y = 15;
            obj.scale.z = 15;
            obj.position.x = (Math.random() * 100) - 50;
            obj.position.y = 80;
            obj.position.z = -((Math.random() * 100) + 50);
            obj.rotation.z = Math.random() * Math.PI;
            obj.direction = {x: Math.random() - 0.5, z: Math.random() - 0.5}
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.name = "cylinder3";
            that.scene.add(obj);
            load();
        })

        // Construct Cylinder 3
        loader.load("./assets/asteroid.obj", function(obj) {
            obj.scale.x = 15;
            obj.scale.y = 15;
            obj.scale.z = 15;
            obj.position.x = (Math.random() * 100) - 50;
            obj.position.y = 80;
            obj.position.z = -((Math.random() * 100) + 50);
            obj.rotation.z = Math.random() * Math.PI;
            obj.direction = {x: Math.random() - 0.5, z: Math.random() - 0.5}
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.name = "cylinder4";
            that.scene.add(obj);
            load();
        })
        
        // Construct Cylinder 4
        loader.load("./assets/asteroid.obj", function(obj) {
            obj.scale.x = 15;
            obj.scale.y = 15;
            obj.scale.z = 15;
            obj.position.x = (Math.random() * 100) - 50;
            obj.position.y = 80;
            obj.position.z = -((Math.random() * 100) + 50);
            obj.rotation.z = Math.random() * Math.PI;
            obj.direction = {x: Math.random() - 0.5, z: Math.random() - 0.5}
            obj.children[0].material = new THREE.MeshStandardMaterial({map: rockTexture});
            obj.name = "cylinder5";
            that.scene.add(obj);
            load();
        })

        loader.load("./assets/enemy-spaceship.obj", function(obj) {
            obj.scale.x = 12;
            obj.scale.y = 12;
            obj.scale.z = 12;
            obj.rotation.x = Math.PI / 16;
            obj.position.y = 30;
            obj.position.z = -250;
            const texture = new THREE.TextureLoader().load('./assets/dark-metal-grid-1.jpg');
            obj.material = new THREE.MeshStandardMaterial({map: texture});
            obj.children.forEach(child => {
                child.material = new THREE.MeshStandardMaterial({map: texture});
            })
            obj.name = 'enemySpaceship'
            obj.nametag = 'Alien Spaceship'
            obj.health = 10;
            obj.clock = new THREE.Clock();
            that.scene.add(obj);
            load()
        })
    }
    
    move() {
        //Handle collision between projectiles and enemies - Map each object to its bounding box
        let player;
        let enemySpaceship;
        this.objectsBoundingBox = {}
        this.scene.children.forEach((object) => {
            if (object.name === "player") {
                player = object;
                this.player = player;
            }
            if (object.name === "enemySpaceship") {
                enemySpaceship = object;
                this.objectsBoundingBox[object.uuid] = new THREE.Box3().setFromObject(object);
            }
            if (object.name === "cannonAttack" || object.name === "arrow") {
                this.objectsBoundingBox[object.uuid] = new THREE.Box3().setFromObject(object);
            }
            if (object.geometry || object.clock || object.name.includes("cylinder") || object.name === "player") {
                this.objectsBoundingBox[object.uuid] = new THREE.Box3().setFromObject(object);
            }
        })

        // Handle enemy spaceship movement
        enemySpaceship.position.x += Math.cos(enemySpaceship.clock.getElapsedTime()) / 4;
        enemySpaceship.position.z += Math.sin(enemySpaceship.clock.getElapsedTime()) / 4;
        enemySpaceship.rotation.z = Math.sin((enemySpaceship.clock.getElapsedTime())) / 4;

        // this.controls.update();
    }
}

export default WorldObjects;