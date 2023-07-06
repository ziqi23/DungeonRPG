import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

class WorldLogic {
    constructor(world, worldObjects, ui, muted) {
        this.scene = world.scene;
        this.camera = world.camera;
        this.renderer = world.renderer;
        this.worldObjects = worldObjects;
        this.enemies = worldObjects.enemies;
        this.enemyMixers = worldObjects.enemyMixers;
        this.mixers = worldObjects.playerMixers;
        this.ui = ui;
        this.muted = muted;
    }
    
    // Main function to initiate all game logic
    run() {
        // Assign variables to be handled by logic below.
        let worldObjects = this.worldObjects;
        let mixers = this.mixers;
        let enemyMixers = this.enemyMixers;
        let previousMove = 'idle';
        let currentMove = 'idle';
        let scene = this.scene;
        let camera = this.camera;
        let renderer = this.renderer;
        let ui = this.ui;
        let muted = this.muted;
        let shotCount = 0;
        let hitCount = 0;
        let enemies = this.enemies;
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
            player: undefined
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
                selectedEnemyIdx %= enemies.length;
                selectedEnemy = enemies[selectedEnemyIdx];
                document.getElementById('enemy-health-empty').style.visibility = 'visible';
                document.getElementById('enemy-health-full').style.visibility = 'visible';
            }
            if (selectedEnemyMesh) scene.remove(selectedEnemyMesh);
            if (selectedEnemy) selectedEnemyMesh = ui.displaySelectedEnemy(selectedEnemy);
        }

        // Sort enemies
        enemies.sort(sortEnemies);
                
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
        
        let skillClock = new THREE.Clock();
        skillClock.getDelta();
        let cooldown = 0.5;
        function handleShoot(e) {
            // Determine skill to cast and execute associated logic
            let distanceX = pointingTo.x - objects.player.position.x;
            let distanceZ = pointingTo.z - objects.player.position.z;      
            if (e.key === '1' && ui.mana >= 1 && skillClock.getDelta() >= cooldown) {
                document.removeEventListener("keydown", handleShoot)
                setTimeout(() => document.addEventListener("keydown", handleShoot), 600)
                idle = true;
                firing = true;
                objects.player.lookAt(new THREE.Vector3(pointingTo.x, 0, pointingTo.z));
                setTimeout(() => {
                    const loader = new FBXLoader();
                    loader.load("./assets/player/arrow3.fbx", function(fbx) {
                        fbx.position.x = objects.player.position.x;
                        fbx.position.y = objects.player.position.y + 5;
                        fbx.position.z = objects.player.position.z;
                        fbx.rotation.z = Math.PI / 2
                        if (distanceZ > 0) {
                            fbx.rotation.y = Math.atan(distanceX / distanceZ) - Math.PI / 2
                        } else {
                            fbx.rotation.y = Math.atan(distanceX / distanceZ) + Math.PI / 2
                        }              
                        fbx.scale.setScalar(0.5);
                        fbx.name = "arrow";
                        let audio = new Audio("./assets/laser-gun-shot.wav");
                        if (!muted) audio.play();
                        shotCount += 1;
                        ui.mana -= 1;
                        shotObjects.push({
                            obj: fbx, 
                            initialX: objects.player.position.x, 
                            initialZ: objects.player.position.z, 
                            destinationX: pointingTo.x, 
                            destinationZ: pointingTo.z
                        });
                        scene.add(fbx);
                    })
                }, 400)
            } else if (e.key === '2' && ui.mana >= 3 && skillClock.getDelta() >= cooldown) {
                document.removeEventListener("keydown", handleShoot)
                setTimeout(() => document.addEventListener("keydown", handleShoot), 600)
                idle = true;
                firing = true;
                objects.player.lookAt(new THREE.Vector3(pointingTo.x, 0, pointingTo.z));
                setTimeout(() => {
                    let audio = new Audio("./assets/shock-spell.mp3");
                    if (!muted) audio.play();
                    shotCount += 1;
                    ui.mana -= 3;
                    const loader = new FBXLoader();
                    for (let i = 0; i < 3; i++) {
                        loader.load("./assets/player/arrow3.fbx", function(fbx) {
                            fbx.position.x = objects.player.position.x;
                            fbx.position.y = objects.player.position.y + 2;
                            fbx.position.z = objects.player.position.z;
                            fbx.rotation.z = Math.PI / 2
                            if (distanceZ > 0) {
                                fbx.rotation.y = Math.atan(distanceX / distanceZ) - Math.PI / 2
                            } else {
                                fbx.rotation.y = Math.atan(distanceX / distanceZ) + Math.PI / 2
                            }   
                            fbx.scale.setScalar(0.5);
                            fbx.name = "multiArrow";
    
                            let modifier;
                            switch (i) {
                                case 0:
                                    modifier = 0.8;
                                    break;
                                case 1:
                                    modifier = 1;
                                    break;
                                case 2:
                                    modifier = 1.2;
                                    break;
                                default:
                                    break;
                            }
                            shotObjects.push({
                                obj: fbx, 
                                initialX: objects.player.position.x, 
                                initialZ: objects.player.position.z, 
                                destinationX: pointingTo.x * modifier, 
                                destinationZ: pointingTo.z * modifier
                            });
                            scene.add(fbx);
                        })
                    }
                }, 400)
            }
        }

        // Once all logic established above, run update() which handles frame by frame rendering
        function update() {
            requestAnimationFrame(update);
            worldObjects.move();

            if (!idle) {
                let xDelta = movingTo.x - objects.player.position.x;
                let zDelta = movingTo.z - objects.player.position.z;
                let distance = Math.sqrt(xDelta ** 2 + zDelta ** 2);
                let speed = 0.3;
                if (distance < 1) {
                    idle = true;
                }
                else {
                    // face this direction and move at constant speed
                    objects.player.lookAt(new THREE.Vector3(movingTo.x, 2, movingTo.z));
                    objects.player.position.x += speed * xDelta / distance;
                    camera.position.x += speed * xDelta / distance;
                    objects.player.position.z += speed * zDelta / distance;
                    camera.position.z += speed * zDelta / distance;
                }
            }
            let currentAnimation;
            let previousAnimation;
            for (let i in mixers) {
                if (mixers[i].name === currentMove) {
                    currentAnimation = mixers[i]
                }
                if (mixers[i].name === previousMove) {
                    previousAnimation = mixers[i]
                }
            }
            const delta = playTimeClock.getDelta();
            let timeout;
            mixers.map(mixer => {
                if (firing && mixer.name === 'draw-arrow') {
                    currentMove = 'draw-arrow'
                    idle = true;
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    timeout = setTimeout(() => firing = false, 500);
                    if (currentMove !== previousMove) {
                        previousMove = currentMove;
                        previousAnimation._actions[0].stop()
                        currentAnimation._actions[0].play()
                    }
                    mixer.update(delta * 2)
                }
                else if (!firing && idle && mixer.name === 'idle') {
                    currentMove = 'idle'
                    if (currentMove !== previousMove) {
                        previousMove = currentMove;
                        previousAnimation._actions[0].stop()
                        currentAnimation._actions[0].play()
                    }
                    mixer.update(delta)
                }
                else if (!firing && !idle && mixer.name === 'run-forward') {
                    currentMove = 'run-forward'
                    if (currentMove !== previousMove) {
                        previousMove = currentMove;
                        previousAnimation._actions[0].stop()
                        currentAnimation._actions[0].play()
                    }
                    mixer.update(delta)
                }
            });

            enemyMixers.forEach(mixer => {
                // find root and play clip according to position
                let enemy = scene.getObjectByProperty('uuid', mixer._root.uuid);
                if (enemy) {
                    let xDistance = (enemy.position.x - objects.player.position.x);
                    let zDistance = (enemy.position.z - objects.player.position.z);
                    let distance = Math.sqrt(xDistance ** 2 + zDistance ** 2);
                    let speed = 0.2;
                    if ((distance > 1 && distance < 50) || enemy.health < 3) {
                        if (zDistance > 0) {
                            enemy.rotation.y = Math.atan(xDistance / zDistance) - Math.PI / 4
                        } else {
                            enemy.rotation.y = Math.atan(xDistance / zDistance) + Math.PI / 4
                        }   
                        enemy.position.x -= xDistance / distance * speed;
                        enemy.position.z -= zDistance / distance * speed;
                        mixer.existingAction(mixer._actions[0]._clip).stop();
                        mixer.existingAction(mixer._actions[1]._clip).stop();
                        mixer.existingAction(mixer._actions[2]._clip).play(); // Run 
                    }
                    else if (distance >= 0 && distance <= 1) {
                        // mixer.stopAllAction()
                        mixer.existingAction(mixer._actions[0]._clip).stop();
                        mixer.existingAction(mixer._actions[2]._clip).stop();
                        mixer.existingAction(mixer._actions[1]._clip).play(); // Attack  
                        if (that.worldObjects.objectsBoundingBox[enemy.uuid]?.intersectsBox(that.worldObjects.objectsBoundingBox[objects.player.uuid])) {
                            if (Math.floor(enemy.clock.getElapsedTime()) > 1) {
                                enemy.clock.start();
                                objects.player.collided = true;
                            }
                        }
                    }
                    else {
                        // mixer.stopAllAction()
                        mixer.existingAction(mixer._actions[2]._clip).stop();
                        mixer.existingAction(mixer._actions[1]._clip).stop();
                        mixer.existingAction(mixer._actions[0]._clip).play(); // Idle
                    }
                    mixer.update(enemy.clock.getDelta())
                }
            })

            // Move player projectiles in their PointingTo position. Remove projectiles too far out
            shotObjects.forEach((projectile) => {
                let distance = Math.sqrt((projectile.initialX - projectile.destinationX) ** 2 + (projectile.initialZ - projectile.destinationZ) ** 2);
                projectile.obj.position.x += -(projectile.initialX - projectile.destinationX) / distance * 5;
                projectile.obj.position.z += -(projectile.initialZ - projectile.destinationZ) / distance * 5;
                if (Math.sqrt(projectile.obj.position.x ** 2 + projectile.obj.position.z ** 2) > 300) {
                    scene.remove(projectile.obj);
                }
            })

            // Find objects in the scene and handle collision
            shotObjects.forEach((object) => {
                scene.children.forEach((object2) => {
                    if (object2.name === "enemy") {
                        if (that.worldObjects.objectsBoundingBox[object.obj.uuid]?.intersectsBox(that.worldObjects.objectsBoundingBox[object2.uuid])) { 
                            let audio = new Audio("./assets/enemy-hit.mp3");
                            if (!muted) audio.play();
                            scene.remove(object.obj)
                            object2.health -= 1;
                            if (object2.health === 0) {
                                object2.collided = true;
                                if (selectedEnemy === object2) {
                                    selectedEnemy = null;
                                }
                            }
                            else {
                                document.getElementById('enemy-health-empty').style.visibility = 'visible';
                                document.getElementById('enemy-health-full').style.visibility = 'visible';
                                selectedEnemy = object2;
                                ui.displaySelectedEnemy(selectedEnemy);
                            }
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
            
            // Camera always follows player
            camera.lookAt(objects.player.position);

            // Render everything above
            renderer.render(scene, camera);

            // Game over logic - reset all objects and display end game graph
            if (ui.health <= 0) {
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
                ui.health = 100;
                ui.mana = 100;
                ui.potions = 3;
                ui.manaPotions = 3;
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
