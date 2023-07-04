import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

class WorldLogic {
    constructor(world, worldObjects, ui, muted) {
        this.scene = world.scene;
        this.camera = world.camera;
        this.renderer = world.renderer;
        this.plane = world.plane;
        this.worldObjects = worldObjects;
        this.mixers = worldObjects.mixers;
        this.ui = ui;
        this.muted = muted;
    }
    
    // Main function to initiate all game logic
    run() {
        // Assign variables to be handled by logic below.
        let worldObjects = this.worldObjects;
        let mixers = this.mixers;
        let scene = this.scene;
        let plane = this.plane;
        let camera = this.camera;
        let renderer = this.renderer;
        let ui = this.ui;
        let muted = this.muted;
        let shotCount = 0;
        let hitCount = 0;
        let enemyAttacks = [];
        let that = this;
        let idle = true;
        let firing = false;
        let movingTo;
        let popUp;
        let playTimeClock = new THREE.Clock();
        let playerHitClock = new THREE.Clock();
        let popUpClock = new THREE.Clock();
        let objects = {
            cylinder2: undefined, 
            cylinder3: undefined, 
            cylinder4: undefined, 
            cylinder5: undefined, 
            player: undefined,
            enemySpaceship: undefined,
            cannonAttack: undefined
        };

        // Handle "M" to mute all sound
        document.addEventListener('keydown', handleMute)
        function handleMute(e) {
            if (e.code === "KeyM") {
                muted = !muted;
            }
            if (muted) {
                document.getElementById('background-music').muted = true;
            } else {
                document.getElementById('background-music').muted = false;
            }
        }

        // Track key objects to later reference
        scene.children.forEach((child) => {
            if (Object.keys(objects).includes(child.name)) {
                objects[child.name] = child;
            }
        })   
        
        // Handle skill selection - toggle using keys '1' and '2'
        window.addEventListener("keydown", handleSkillToggle);
        let currentSkill = 1;
        function handleSkillToggle(e) {
            if (e.key === '1') {
                document.getElementById('skill-one').style.border = "3px solid gold";
                document.getElementById('skill-two').style.border = "3px solid black";
                currentSkill = 1;
            } else if (e.key === '2') { 
                document.getElementById('skill-two').style.border = "3px solid gold";
                document.getElementById('skill-one').style.border = "3px solid black";
                currentSkill = 2;
            }
        }

        // Handle 'tab' to select enemies
        let selectedEnemyIdx = -1;
        let selectedEnemy;
        let selectedEnemyMesh;
        window.addEventListener('keydown', handleTab);
        function handleTab(e) {
            e.preventDefault()
            if (selectedEnemyMesh) {
                document.getElementById('enemy-banner')?.remove();
                scene.remove(selectedEnemyMesh);
            }
            if (e.key === 'Tab') {
                selectedEnemyIdx += 1;
                selectedEnemyIdx %= enemies.length + 1;
                if (selectedEnemyIdx === enemies.length) {
                    selectedEnemy = objects.enemySpaceship;
                    document.getElementById('enemy-health-empty').style.visibility = 'visible'
                    document.getElementById('enemy-health-full').style.visibility = 'visible'
                }
                else {
                    selectedEnemy = enemies[selectedEnemyIdx];
                    document.getElementById('enemy-health-empty').style.visibility = 'hidden'
                    document.getElementById('enemy-health-full').style.visibility = 'hidden'
                }
            }
            const boundingBox = new THREE.Box3().setFromObject(selectedEnemy);
            let selectedEnemyGeometry;
            if (selectedEnemy === objects.enemySpaceship) {
                selectedEnemyGeometry = new THREE.RingGeometry(30, 40, 8);
            }
            else {
                selectedEnemyGeometry = new THREE.RingGeometry(5, 6, 8);
            }
            const selectedEnemyMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});

            selectedEnemyMesh = new THREE.Mesh(selectedEnemyGeometry, selectedEnemyMaterial);
            selectedEnemyMesh.rotation.x = Math.PI / 2;
            selectedEnemyMesh.position.x = (boundingBox.max.x + boundingBox.min.x) / 2;
            selectedEnemyMesh.position.y = 0.1;
            selectedEnemyMesh.position.z = (boundingBox.max.z + boundingBox.min.z) / 2;
            scene.add(selectedEnemyMesh)
        }

        // Define enemy spawn logic
        let enemies = [];
        async function gameStart() {
            for (let i = 0; i < 5; i++) {
                const loader = new FBXLoader();
                loader.load('./assets/zombie/zombie-model.fbx', (fbx) => {
                    fbx.scale.setScalar(0.04);
                    fbx.traverse(c => {
                        if (c.isMesh) {
                            c.castShadow = true;
                            c.receiveShadow = false;
                        }
                    });
                    // const animation = new FBXLoader();
                    // animation.load("./assets/zombie/zombie-idle.fbx", (animation) => {
                    //     const mixer = new THREE.AnimationMixer(fbx);
                    //     mixer.name = 'idle'
                    //     this.mixers.push(mixer);
                    //     mixer.clipAction(animation.animations[0]).play();
                    // })

                    // const animation2 = new FBXLoader();
                    // animation2.load("./assets/player/animation-run-forward.fbx", (animation) => {
                    //     const mixer = new THREE.AnimationMixer(fbx);
                    //     mixer.name = 'run-forward'
                    //     this.mixers.push(mixer);
                    //     mixer.clipAction(animation.animations[0]).play();
                    // })
                    fbx.position.x = (Math.random() - 0.5) * 70;
                    fbx.position.z = Math.random() * -100 - 25;
                    fbx.name = "enemy"
                    fbx.nametag = 'Enemy Minion'
                    // Each enemy has an internal timer to space attacks between
                    fbx.clock = new THREE.Clock();
                    scene.add(fbx);
                    enemies.push(fbx);
                    enemies.sort(sortEnemies)
                    scene.add(fbx)
                })
            }
                
            function sortEnemies(a, b) {
                const playerLocation = objects.player.position;
                const distanceFromA = Math.sqrt((a.position.x - playerLocation.x) ** 2 + 
                (a.position.y - playerLocation.y) ** 2 + 
                (a.position.z - playerLocation.z) ** 2)
                const distanceFromB = Math.sqrt((b.position.x - playerLocation.x) ** 2 + 
                (b.position.y - playerLocation.y) ** 2 + 
                (b.position.z - playerLocation.z) ** 2)
                if (distanceFromA < distanceFromB) return -1
                if (distanceFromA > distanceFromB) return 1
                return 0;
            }
        }

        // Utilize three.js raycaster to determine the coordinates at which cursor is pointed to
        const raycaster = new THREE.Raycaster();
        const mousePos = new THREE.Vector2();
        window.addEventListener('mousemove', handleMouseMoveForRaycaster);
        let pointingTo = {x: undefined, z: undefined};
        let canvasWidth = document.getElementsByTagName("canvas")[0].width;
        let canvasHeight = document.getElementsByTagName("canvas")[0].height;

        function handleMouseMoveForRaycaster(e) {
            mousePos.x = (e.clientX / canvasWidth) * 2 - 1;
            mousePos.y = - ((e.clientY / canvasHeight) * 2 - 1);
            raycaster.setFromCamera(mousePos, camera);
            const intersects = raycaster.intersectObjects(scene.children);
            if (intersects[0]) {
                // Save coordinates to pointingTo object
                pointingTo.x = intersects[0].point.x;
                pointingTo.z = intersects[0].point.z;
            }
        }

        // Handle player movement - left mouse button
        window.addEventListener("mousedown", handlePlayerMove);
        function handlePlayerMove(e) {
            if (e.buttons === 1) {
                idle = false;
                movingTo = {x: pointingTo.x, z:pointingTo.z}
            }
        }

        // Listen for click and use pointingTo to determine the direction to fire object
        document.addEventListener("keydown", handleShoot)
        let shotObjects = [];
        const skillOneTexture = new THREE.TextureLoader().load('./assets/energy-orb2.png');
        
        function handleShoot(e) {
            // Determine skill to cast and execute associated logic
            if (e.key === '1' && ui.mana >= 1) {
                firing = true;
                objects.player.lookAt(new THREE.Vector3(pointingTo.x, 0, pointingTo.z));
                const loader = new OBJLoader();
                // const rockTexture = new THREE.TextureLoader().load('./assets/rocktexture.jpg');
                loader.load("./assets/player/arrow.obj", function(obj) {
                    obj.position.x = objects.player.position.x;
                    obj.position.y = objects.player.position.y + 2;
                    obj.position.z = objects.player.position.z;
                    console.log(obj.quaternion)
                    // obj.quaternion.copy(objects.player.quaternion)
                    obj.rotation.y += Math.PI / 4;
                    console.log(obj.quaternion)
                    obj.scale.setScalar(0.1);
                    obj.name = "arrow";
                    let audio = new Audio("./assets/laser-gun-shot.wav");
                    if (!muted) audio.play();
                    shotCount += 1;
                    ui.mana -= 1;
                    shotObjects.push({
                        obj, 
                        initialX: objects.player.position.x, 
                        initialZ: objects.player.position.z, 
                        destinationX: pointingTo.x, 
                        destinationZ: pointingTo.z
                    });
                    scene.add(obj);
                })
            } else if (e.key === '2' && ui.mana >= 3) {
                firing = true;
                objects.player.lookAt(new THREE.Vector3(pointingTo.x, 0, pointingTo.z));
                
                loader.load("./assets/player/arrow.obj", function(obj) {
                    obj.position.x = objects.player.position.x;
                    obj.position.y = objects.player.position.y + 2;
                    obj.position.z = objects.player.position.z;
                    console.log(obj.quaternion)
                    // obj.quaternion.copy(objects.player.quaternion)
                    obj.rotation.y += Math.PI / 4;
                    console.log(obj.quaternion)
                    obj.scale.setScalar(0.1);
                    obj.name = "multiarrow";
                    let audio = new Audio("./assets/shock-spell.mp3");
                    if (!muted) audio.play();
                    shotCount += 1;
                    ui.mana -= 3;
                    shotObjects.push({
                        obj, 
                        initialX: objects.player.position.x, 
                        initialZ: objects.player.position.z, 
                        destinationX: pointingTo.x, 
                        destinationZ: pointingTo.z
                    });
                    scene.add(obj);
                })
            }
        }

        // Once all logic established above, run update() which handles frame by frame rendering
        function update() {
            requestAnimationFrame(update);
            // Call WorldObjects#Move method to handle movement
            worldObjects.move();

            if (!idle) {
                let xDelta = movingTo.x - objects.player.position.x;
                let zDelta = movingTo.z - objects.player.position.z;
                let distance = Math.sqrt(xDelta ** 2 + zDelta ** 2);
                let speed = 0.05;
                if (distance < 1) {
                    idle = true;
                }
                else {
                    // face this direction and move at constant speed
                    objects.player.lookAt(new THREE.Vector3(movingTo.x, 0, movingTo.z));
                    objects.player.position.x += speed * xDelta / distance;
                    camera.position.x += speed * xDelta / distance;
                    objects.player.position.z += speed * zDelta / distance;
                    camera.position.z += speed * zDelta / distance;
                }

            }

            mixers.map(mixer => {
                if (firing && mixer.name === 'draw-arrow') {
                    idle = true;
                    setTimeout(() => firing = false, 1000)
                    mixer.update(playTimeClock.getDelta())
                }
                else if (!firing && idle && mixer.name === 'idle') {
                    mixer.update(playTimeClock.getDelta())
                }
                else if (!firing && !idle && mixer.name === 'run-forward') {
                    mixer.update(playTimeClock.getDelta())
                }
            });

            // Move player projectiles in their PointingTo position. Remove projectiles too far out
            shotObjects.forEach((projectile) => {
                if (projectile.obj.name === "arrow") {
                    let distance = Math.sqrt((projectile.initialX - projectile.destinationX) ** 2 + (projectile.initialZ - projectile.destinationZ) ** 2);
                    projectile.obj.position.x += -(projectile.initialX - projectile.destinationX) / distance;
                    projectile.obj.position.z += -(projectile.initialZ - projectile.destinationZ) / distance;
                    if (Math.sqrt(projectile.obj.position.x ** 2 + projectile.obj.position.z ** 2) > 300) {
                        scene.remove(projectile.obj);
                    }
                } else if (projectile.obj.name === "thunder") {
                    projectile.position.y += -1;
                }
            })

            // Find objects in the scene and handle collision
            shotObjects.forEach((object) => {
                scene.children.forEach((object2) => {
                    if (object.obj.uuid !== object2.uuid && that.worldObjects.objectsBoundingBox[object2.uuid] && (object2.name.includes("cylinder") || object2.name === "enemy")) {
                        if (that.worldObjects.objectsBoundingBox[object.obj.uuid]?.intersectsBox(that.worldObjects.objectsBoundingBox[object2.uuid])) { 
                            let audio = new Audio("./assets/enemy-hit.mp3");
                            if (!muted) audio.play();
                            object2.collided = true;
                            scene.remove(object.obj);
                        }
                    }
                })
            })
            // Show enemy banner if selected
            if (selectedEnemy && !document.getElementById('enemy-banner')) {
                const banner = document.createElement('div');
                banner.id = 'enemy-banner';
                document.getElementById('body').appendChild(banner);
                banner.innerHTML = selectedEnemy.nametag
            }
            else if (!selectedEnemy) {
                document.getElementById('enemy-banner')?.remove();
            }

            // Game start condition
            if (objects.cylinder2.collided === true) {
                scene.remove(objects.cylinder2);
            }
            if (objects.cylinder3.collided === true) {
                scene.remove(objects.cylinder3);
            }
            if (objects.cylinder4.collided === true) {
                scene.remove(objects.cylinder4);
            }
            if (objects.cylinder5.collided === true) {
                scene.remove(objects.cylinder5);
            }

            let spaceship = objects.enemySpaceship;
            let cannon = objects.cannonAttack;
            if (objects.cylinder2.collided === true && objects.cylinder3.collided === true && objects.cylinder4.collided === true && objects.cylinder5.collided === true) {
                // Cannon attack moves towards enemy spaceship
                const xMovement = spaceship.position.x - cannon.position.x;
                const yMovement = spaceship.position.y - cannon.position.y;
                const zMovement = spaceship.position.z - cannon.position.z;
                cannon.position.x += xMovement * 0.05;
                cannon.position.y += yMovement * 0.05;
                cannon.position.z += zMovement * 0.05;
            }
            
            if (that.worldObjects.objectsBoundingBox[cannon.uuid]?.intersectsBox(that.worldObjects.objectsBoundingBox[spaceship.uuid])) {
                spaceship.health -= 1;
                ui.enemyHealth -= 1;
                const task = document.getElementById('task')
                task.children[1]?.remove();
                const newTask = document.createElement('h2');
                newTask.innerHTML = 'Eliminate enemy minions!';
                task.appendChild(newTask);
                let audio = new Audio("./assets/metal-hit.wav");
                if (!muted) audio.play();
                cannon.position.x = 23;
                cannon.position.y = 10;
                cannon.position.z = 56;
                objects.cylinder2.collided = false;
                objects.cylinder3.collided = false;
                objects.cylinder4.collided = false;
                objects.cylinder5.collided = false;
                let gameStartAudio = new Audio("./assets/alien-hum.wav");
                if (!muted) gameStartAudio.play();
                gameStart();
            }

            // Handle enemies hit by player projectiles
            enemies.forEach((enemy) => {
                if (enemy.collided) {
                    scene.remove(enemy);
                    hitCount += 1;
                    ui.exp += 3;
                    if (enemies.indexOf(enemy) === selectedEnemyIdx) {
                        selectedEnemyIdx = -1;
                        selectedEnemy = null;
                        scene.remove(selectedEnemyMesh)
                        selectedEnemyMesh = null;
                    }
                    if (enemies.indexOf(enemy) < selectedEnemyIdx) {
                        selectedEnemyIdx -= 1;
                    }
                    enemies.splice(enemies.indexOf(enemy), 1);
                } else {
                    if (Math.floor(enemy.clock.getElapsedTime()) > 1) {
                        enemy.clock.start();
                        const beamGeometry = new THREE.SphereGeometry(1, 32, 32);
                        const beamMaterial = new THREE.MeshToonMaterial({map: enemyAttackTexture});
                        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
                        beam.rotation.z = -Math.PI / 2;
                        beam.rotation.y = Math.PI / 2;
                        beam.rotation.x = (Math.random() * 2 - 1);
                        beam.position.x = enemy.position.x;
                        beam.position.y = enemy.position.y + 1;
                        beam.position.z = enemy.position.z;
                        beam.name = "enemyAttack";
                        enemyAttacks.push(beam);
                        scene.add(beam);
                    }
                }
                if (enemies.length === 0) {
                    scene.add(objects.cylinder2);
                    scene.add(objects.cylinder3);
                    scene.add(objects.cylinder4);
                    scene.add(objects.cylinder5);
                    const task = document.getElementById('task');
                    task.children[1].remove();
                    const newTask = document.createElement('h2');
                    newTask.innerHTML = 'Destroy the space rocks to establish a clear line of sight between your cannon and the target!'
                    task.appendChild(newTask)
                
                }
            })

            // Move each enemy attack closer to center and handle collision
            enemyAttacks.forEach((beam) => {
                beam.position.x -= beam.rotation.x * 0.5;
                beam.position.z -= beam.rotation.z;
                if (that.worldObjects.objectsBoundingBox[beam.uuid] && that.worldObjects.objectsBoundingBox[beam.uuid].intersectsBox(that.worldObjects.objectsBoundingBox[objects.player.uuid])) {
                    objects.player.collided = true;
                }
                // Remove enemy attacks too far out
                let distance = Math.sqrt((beam.position.x - objects.player.position.x) ** 2 + (beam.position.z - objects.player.position.z) ** 2);
                if (distance > 300) {
                    scene.remove(beam);
                }
            })

            // Handle player hit by enemy projectile, one second timeout between hits registering
            if (objects.player.collided === true && playerHitClock.getElapsedTime() > 1) {
                if (!popUp) {
                    let audio = new Audio("./assets/player-hit.wav");
                    if (!muted) audio.play();
                    // Show pop up damage inflicted
                    popUp = document.createElement("h1");
                    popUp.innerHTML = `-10`
                    popUp.style.position = 'absolute';
                    popUp.style.top = '30vh'
                    popUp.style.right = '50vw';
                    popUp.style.color = 'Red';
                    popUp.setAttribute("id", "pop-up")
                    document.getElementById("ui").appendChild(popUp);
                    popUpClock.start();
                    playerHitClock.start();
                    if (ui.health >= 10) {
                        ui.health -= 10;
                    } else {
                        ui.health = 0;
                    }
                }
            }
            // Remove pop up damage inflicted after 0.5 seconds
            if (popUpClock.getElapsedTime() > 0.5 && popUp) {
                let el = document.getElementById("pop-up");
                el.remove();
                popUp = undefined;
            }

            objects.player.collided = false;

            // Call Ui#BuildUi to render most updated player attributes
            ui.buildUi();

            // Simulate gravity by stopping objects when y-coordinate coincides with ground plane
            if (objects.cylinder2.position.y - 10 > plane.position.y) {
                objects.cylinder2.position.x += objects.cylinder2.direction.x
                objects.cylinder2.position.y += -1;
                objects.cylinder2.position.z += objects.cylinder2.direction.z

                objects.cylinder3.position.x += objects.cylinder3.direction.x
                objects.cylinder3.position.y += -1;
                objects.cylinder3.position.z += objects.cylinder3.direction.z

                objects.cylinder4.position.x += objects.cylinder4.direction.x
                objects.cylinder4.position.y += -1;
                objects.cylinder4.position.z += objects.cylinder4.direction.z

                objects.cylinder5.position.x += objects.cylinder5.direction.x
                objects.cylinder5.position.y += -1;
                objects.cylinder5.position.z += objects.cylinder5.direction.z
            }
            
            // Camera always follows player
            camera.lookAt(objects.player.position);

            // Render everything above
            renderer.render(scene, camera);

            // Game over logic - reset all objects and display end game graph
            if (ui.health <= 0 || spaceship.health <= 0) {
                if (selectedEnemyMesh) {
                    selectedEnemy = null;
                    selectedEnemyIdx = -1;
                    scene.remove(selectedEnemyMesh);
                    selectedEnemyMesh = null;
                }
                shotObjects.forEach(object => scene.remove(object));
                enemies.forEach(enemy => scene.remove(enemy));
                enemies = [];
                enemyAttacks.forEach(attack => scene.remove(attack));
                objects.player.position.x = 0;
                objects.player.position.y = 1.5;
                objects.player.position.z = 0;
                spaceship.health = 10;
                ui.health = 100;
                ui.mana = 100;
                ui.potions = 3;
                ui.manaPotions = 3;
                scene.add(objects.cylinder2);
                scene.add(objects.cylinder3);
                scene.add(objects.cylinder4);
                scene.add(objects.cylinder5);
                camera.position.set(0, 10, 50);

                let gameOver = document.getElementById("endgame-stats");
                gameOver.style.visibility = "visible";
                let score = shotCount? Math.floor(hitCount ** 2 / shotCount * playTimeClock.getElapsedTime()) : 0;
                let rating;
                switch (true) {
                    case (score < 99):
                        rating = "D";
                        break;
                    case (score >= 100 && score < 999):
                        rating = "C";
                        break;
                    case (score >= 1000 && score < 9999):
                        rating = "B";
                        break;
                    case (score >= 10000 && score < 99999):
                        rating = "A";
                        break;
                    case (score >= 100000):
                        rating = "S";
                        break;
                }
                let stats = document.getElementById("stats");
                if (spaceship.health <= 0) {
                    stats.innerHTML = `You Won! <br><br>
                    Total number of shots: ${shotCount}<br>
                    Total hits: ${hitCount}<br>
                    Accuracy: ${shotCount ? Math.floor(hitCount / shotCount * 100) : 0}%<br>
                    Total time survived: ${Math.floor(playTimeClock.getElapsedTime())} seconds<br>
                    Rating: ${rating}<br><br>
                    Press 'enter' to play again!`
                }
                else {
                    stats.innerHTML = `You were defeated! <br><br>
                    Total number of shots: ${shotCount}<br>
                    Total hits: ${hitCount}<br>
                    Accuracy: ${shotCount ? Math.floor(hitCount / shotCount * 100) : 0}%<br>
                    Total time survived: ${Math.floor(playTimeClock.getElapsedTime())} seconds<br>
                    Rating: ${rating}<br><br>
                    Press 'enter' to play again!`
                }
                playTimeClock.start();
            }
        }
        update();
    }
}

export default WorldLogic;
