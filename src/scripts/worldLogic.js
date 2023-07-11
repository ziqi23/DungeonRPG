import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

class WorldLogic {
    constructor(world, worldObjects, ui, muted) {
        this.scene = world.scene;
        this.camera = world.camera;
        this.renderer = world.renderer;
        this.worldObjects = worldObjects;
        this.player = worldObjects.player;
        this.enemies = worldObjects.enemies;
        this.enemyMixers = worldObjects.enemyMixers;
        this.npcMixers = worldObjects.npcMixers;
        this.mixers = worldObjects.playerMixers;
        this.ui = ui;
        this.muted = muted;
        this.renderer = world.renderer;
    }
    
    // Main function to initiate all game logic
    run() {
        let worldObjects = this.worldObjects;
        let mixers = this.mixers;
        let enemyMixers = this.enemyMixers;
        let npcMixers = this.npcMixers;
        let player = this.player;
        let enemies = this.enemies;
        let scene = this.scene;
        let camera = this.camera;
        let renderer = this.renderer;
        let ui = this.ui;
        let muted = this.muted;
        let shotCount = 0;
        let hitCount = 0;
        let previousMove = 'idle';
        let currentMove = 'idle';
        let that = this;
        let idle = true;
        let firing = false;
        let movingTo;
        let popUp;
        let playTimeClock = new THREE.Clock();
        let playerHitClock = new THREE.Clock();
        let popUpClock = new THREE.Clock();
        let npcClock = new THREE.Clock();
        
        renderer.compile(scene, camera);

        // Handle "M" to mute all sound
        document.addEventListener('keydown', handleMute);
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

        // Handle 'tab' to select enemies
        let selectedEnemyIdx = -1;
        let selectedEnemy;
        let selectedEnemyMesh;
        window.addEventListener('keydown', handleTab);
        function handleTab(e) {
            e.preventDefault();
            if (e.key === 'Tab') {
                selectedEnemyIdx += 1;
                selectedEnemyIdx %= enemies.length;
                selectedEnemy = enemies[selectedEnemyIdx];
                document.getElementById('enemy-health-empty').style.visibility = 'visible';
                document.getElementById('enemy-health-full').style.visibility = 'visible';
            }
            if (selectedEnemy) selectedEnemyMesh = ui.displaySelectedEnemy(selectedEnemyMesh, selectedEnemy);
        }

        // Sort enemies by position relative to player suc that 'tab' selects nearest enemy
        enemies.sort(sortEnemies);
                
        function sortEnemies(a, b) {
            const playerLocation = player.position;
            const distanceFromA = Math.sqrt((a.position.x - playerLocation.x) ** 2 + 
            (a.position.y - playerLocation.y) ** 2 + 
            (a.position.z - playerLocation.z) ** 2);
            const distanceFromB = Math.sqrt((b.position.x - playerLocation.x) ** 2 + 
            (b.position.y - playerLocation.y) ** 2 + 
            (b.position.z - playerLocation.z) ** 2);
            if (distanceFromA < distanceFromB) return -1;
            if (distanceFromA > distanceFromB) return 1;
            return 0;
        }
        
        // Play and switch between enemy animations
        enemyMixers.forEach(mixer => {
            mixer.addEventListener('finished', handleEnemyAnimation);
        })

        function handleEnemyAnimation(e) {
            let idleClip;
            let runningClip;
            let attackClip;
            this._actions.forEach(action => {
                if (action._clip.name === 'idle') {
                    idleClip = action._clip;
                }
                if (action._clip.name === 'running') {
                    runningClip = action._clip;
                }
                if (action._clip.name === 'attack') {
                    attackClip = action._clip;
                }
            })
            let enemy = this.getRoot();
            let xDistance = (enemy.position.x - player.position.x);
            let zDistance = (enemy.position.z - player.position.z);
            let distance = Math.sqrt(xDistance ** 2 + zDistance ** 2);
            if ((distance > 5 && distance < 50) || (distance > 5 && enemy.health < enemy.maxHealth)) {
                this.existingAction(runningClip).reset();
                this.existingAction(runningClip).play(); // Play running animation 
                enemy.moving = true;
            }
            else if (distance <= 5) {
                this.existingAction(attackClip).reset();
                this.existingAction(attackClip).play(); // Play attack animation  
                setTimeout(() => player.collided = true, 800)
                enemy.moving = false;
            }
            else {
                this.existingAction(idleClip).reset();
                this.existingAction(idleClip).play(); // Play idle animation
                enemy.moving = false;
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
                pointingTo.x = intersects[0].point.x;
                pointingTo.z = intersects[0].point.z;
            }
        }

        // Handle player movement via left mouse button
        setTimeout(() => window.addEventListener("mousedown", handlePlayerMove), 1000);
        function handlePlayerMove(e) {
            if (e.buttons === 1) {
                idle = false;
                movingTo = {x: pointingTo.x, z:pointingTo.z};
            }
        }

        // Listen for keypress and use pointingTo to determine direction to shoot arrow
        document.addEventListener("keydown", handleShoot);
        let shotObjects = [];
        let skillClock = new THREE.Clock();
        skillClock.getDelta();
        let cooldown = 0.5;

        function handleShoot(e) {
            let distanceX = pointingTo.x - player.position.x;
            let distanceZ = pointingTo.z - player.position.z;    
            let x = pointingTo.x;
            let z = pointingTo.z; 
            if (e.key === '1' && ui.mana >= 1 && skillClock.getDelta() >= cooldown) {
                // Remove event listener for 600ms to simulate time in between arrow shots
                document.removeEventListener("keydown", handleShoot);
                setTimeout(() => document.addEventListener("keydown", handleShoot), 600);

                // Stop character movement and remove movement indicator (green circle) when firing
                player.lookAt(new THREE.Vector3(pointingTo.x, 1, pointingTo.z));
                idle = true;
                firing = true;
                ui.removeMovementIndicator();
                setFiringToFalseAfterTimeout();

                // After a short delay (simulating drawing a bow), shoot arrow at cursor location
                setTimeout(() => {
                    const loader = new FBXLoader();
                    loader.load("./assets/player/arrow3.fbx", function(fbx) {
                        fbx.position.x = player.position.x;
                        fbx.position.y = player.position.y + 2;
                        fbx.position.z = player.position.z;
                        fbx.rotation.z = Math.PI / 2;
                        if (distanceZ > 0) {
                            fbx.rotation.y = Math.atan(distanceX / distanceZ) - Math.PI / 2;
                        } 
                        else {
                            fbx.rotation.y = Math.atan(distanceX / distanceZ) + Math.PI / 2;
                        }              
                        fbx.scale.setScalar(0.5);
                        fbx.name = "arrow";
                        let audio = new Audio("./assets/audio/arrow.mp3");
                        if (!muted) audio.play();
                        shotCount += 1;
                        ui.mana -= 1;
                        shotObjects.push({
                            obj: fbx, 
                            initialX: player.position.x, 
                            initialZ: player.position.z, 
                            destinationX: x, 
                            destinationZ: z
                        });
                        scene.add(fbx);
                    })
                }, 400)
            } 
            else if (e.key === '2' && ui.mana >= 3 && skillClock.getDelta() >= cooldown) {
                // Remove event listener for 600ms to simulate time in between arrow shots
                document.removeEventListener("keydown", handleShoot);
                setTimeout(() => document.addEventListener("keydown", handleShoot), 600);

                // Stop character movement and remove movement indicator (green circle) when firing
                player.lookAt(new THREE.Vector3(pointingTo.x, 1, pointingTo.z));
                idle = true;
                firing = true;
                ui.removeMovementIndicator();
                setFiringToFalseAfterTimeout();

                // After a short delay (simulating drawing a bow), shoot arrow at cursor location
                setTimeout(() => {
                    let audio = new Audio("./assets/audio/arrow.mp3");
                    if (!muted) audio.play();
                    shotCount += 1;
                    ui.mana -= 3;
                    const loader = new FBXLoader();
                    for (let i = 0; i < 3; i++) {
                        loader.load("./assets/player/arrow3.fbx", function(fbx) {
                            fbx.position.x = player.position.x;
                            fbx.position.y = player.position.y + 2;
                            fbx.position.z = player.position.z;
                            fbx.rotation.z = Math.PI / 2;
                            if (distanceZ > 0) {
                                fbx.rotation.y = Math.atan(distanceX / distanceZ) - Math.PI / 2;
                            } else {
                                fbx.rotation.y = Math.atan(distanceX / distanceZ) + Math.PI / 2;
                            }   
                            fbx.scale.setScalar(0.5);
                            fbx.name = "multiArrow";
                            let modifier;
                            switch (i) {
                                case 0:
                                    modifier = -1;
                                    break;
                                case 1:
                                    modifier = 0;
                                    break;
                                case 2:
                                    modifier = 1;
                                    break;
                                default:
                                    break;
                            }
                            shotObjects.push({
                                obj: fbx, 
                                initialX: player.position.x, 
                                initialZ: player.position.z, 
                                destinationX: x + 5 * modifier * Math.cos(player.rotation.y), 
                                destinationZ: z + 5 * modifier * Math.sin(player.rotation.y)
                            });
                            scene.add(fbx);
                        })
                    }
                }, 400)
            }
        }
        
        function debounce(func, timeout = 300){
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        }
        
        const setFiringToFalseAfterTimeout = debounce(() => firing = false, 500);

        // Run update() which handles frame by frame rendering
        function update() {
            requestAnimationFrame(update);

            // Call functions requiring calculations each frame
            worldObjects.calculateBoundingBox();
            selectedEnemyMesh = ui.displaySelectedEnemy(selectedEnemyMesh, selectedEnemy);
            ui.buildUi();
            
            // if (ui.movementIndicator) {
            //     ui.movementIndicator.scale.x += Math.sin(frame / 10) / 10;
            //     ui.movementIndicator.scale.z += Math.sin(frame / 10) / 10;
            // }

            // Handle player movement
            if (!idle) {
                let xDelta = movingTo.x - player.position.x;
                let zDelta = movingTo.z - player.position.z;
                let distance = Math.sqrt(xDelta ** 2 + zDelta ** 2);
                let speed = 0.3;
                if (distance < 1) {
                    idle = true;
                    ui.removeMovementIndicator();
                }
                else {
                    player.lookAt(new THREE.Vector3(movingTo.x, 1, movingTo.z));
                    player.position.x += speed * xDelta / distance;
                    camera.position.x += speed * xDelta / distance;
                    player.position.z += speed * zDelta / distance;
                    camera.position.z += speed * zDelta / distance;
                    ui.createMovementIndicator(movingTo.x, movingTo.z);
                }
            }

            // Handle player animation loop
            let currentAnimation;
            let previousAnimation;
            for (let i in mixers) {
                if (mixers[i].name === currentMove) {
                    currentAnimation = mixers[i];
                }
                if (mixers[i].name === previousMove) {
                    previousAnimation = mixers[i];
                }
            }
            const delta = playTimeClock.getDelta();
            mixers.map(mixer => {
                if (firing && mixer.name === 'draw-arrow') {
                    currentMove = 'draw-arrow';
                    idle = true;
                    if (currentMove !== previousMove) {
                        previousMove = currentMove;
                        previousAnimation._actions[0].stop();
                        currentAnimation._actions[0].play();
                    }
                    mixer.update(delta * 2);
                }
                else if (!firing && idle && mixer.name === 'idle') {
                    currentMove = 'idle'
                    if (currentMove !== previousMove) {
                        previousMove = currentMove;
                        previousAnimation._actions[0].stop();
                        currentAnimation._actions[0].play();
                    }
                    mixer.update(delta);
                }
                else if (!firing && !idle && mixer.name === 'run-forward') {
                    currentMove = 'run-forward'
                    if (currentMove !== previousMove) {
                        previousMove = currentMove;
                        previousAnimation._actions[0].stop();
                        currentAnimation._actions[0].play();
                    }
                    mixer.update(delta);
                }
            });

            // Handle NPC animation loop
            const npcDelta = npcClock.getDelta();
            npcMixers.forEach(mixer => {
                mixer.update(npcDelta);
            })

            // Handle enemy animation loop
            enemyMixers.forEach(mixer => {
                let enemy = scene.getObjectByProperty('uuid', mixer._root.uuid);
                if (enemy) {
                    let xDistance = (enemy.position.x - player.position.x);
                    let zDistance = (enemy.position.z - player.position.z);
                    let distance = Math.sqrt(xDistance ** 2 + zDistance ** 2);
                    let speed = 0.2;
                    if (((distance > 5 && distance < 50) || enemy.health < enemy.maxHealth)) {
                        enemy.currentMove = 'running';
                        if (enemy.moving) {
                            if (zDistance > 0) {
                                enemy.rotation.y = Math.atan(xDistance / zDistance) - 7 * Math.PI / 8;
                            } else {
                                enemy.rotation.y = Math.atan(xDistance / zDistance) + Math.PI / 8;
                            }   
                            enemy.position.x -= xDistance / distance * speed;
                            enemy.position.z -= zDistance / distance * speed;
                        }
                    }
                    else if (distance <= 5) {
                        if (that.worldObjects.objectsBoundingBox[enemy.uuid]?.intersectsBox(that.worldObjects.objectsBoundingBox[player.uuid])) {
                            enemy.currentMove = 'attack';
                        }
                    } else {
                        enemy.currentMove = 'idle';
                    }
                    if (enemy.currentMove !== enemy.prevMove) {
                        handleEnemyAnimation.bind(mixer)();
                    }
                    enemy.prevMove = enemy.currentMove
                    mixer.update(enemy.clock.getDelta());
                }
            })

            // Move player projectiles in their PointingTo direction and remove projectiles too far out
            shotObjects.forEach((projectile) => {
                let xDelta = projectile.initialX - projectile.destinationX;
                let zDelta = projectile.initialZ - projectile.destinationZ;
                let distance = Math.sqrt(xDelta ** 2 + zDelta ** 2);
                projectile.obj.position.x += -xDelta / distance * 5;
                projectile.obj.position.z += -zDelta / distance * 5;
                if (Math.sqrt((projectile.obj.position.x - projectile.initialX) ** 2 + 
                              (projectile.obj.position.z - projectile.initialZ) ** 2) > 300) {
                    scene.remove(projectile.obj);
                }
            })

            // Find objects in the scene and handle collision
            shotObjects.forEach((object) => {
                scene.children.forEach((object2) => {
                    if (object2.name === "enemy") {
                        if (that.worldObjects.objectsBoundingBox[object.obj.uuid]?.intersectsBox(that.worldObjects.objectsBoundingBox[object2.uuid])) { 
                            let audios = [
                                new Audio("./assets/audio/zombie1.mp3"),
                                new Audio("./assets/audio/zombie2.mp3"),
                                new Audio("./assets/audio/zombie3.mp3"),
                                new Audio("./assets/audio/zombie4.mp3")
                            ]
                            let audio = audios[Math.floor(Math.random() * audios.length)];
                            if (!muted) audio.play();
                            scene.remove(object.obj);
                            object2.health -= 1;
                            if (object2.health <= 0) {
                                object2.collided = true;
                                if (selectedEnemy === object2) {
                                    selectedEnemy = null;
                                    scene.remove(selectedEnemyMesh);
                                }
                            }
                            else {
                                document.getElementById('enemy-health-empty').style.visibility = 'visible';
                                document.getElementById('enemy-health-full').style.visibility = 'visible';
                                selectedEnemy = object2;
                            }
                        }
                    }
                })
            })


            // Handle enemies hit by player projectiles
            enemies.forEach((enemy) => {
                if (enemy.collided) {
                    scene.remove(enemy);
                    hitCount += 1;
                    ui.exp += 3;
                    if (enemies.indexOf(enemy) === selectedEnemyIdx) {
                        selectedEnemyIdx = -1;
                        selectedEnemy = null;
                        scene.remove(selectedEnemyMesh);
                        selectedEnemyMesh = null;
                    }
                    if (enemies.indexOf(enemy) < selectedEnemyIdx) {
                        selectedEnemyIdx -= 1;
                    }
                    enemies.splice(enemies.indexOf(enemy), 1);
                }
            })

            // Handle player hit by enemy projectile, one second timeout between hits registering
            if (player.collided === true && playerHitClock.getElapsedTime() > 1) {
                if (!popUp) {
                    let audio = new Audio("./assets/audio/player-hit.mp3");
                    if (!muted) audio.play();
                    popUp = document.createElement("h1");
                    popUp.innerHTML = `-10`;
                    popUp.style.position = 'absolute';
                    popUp.style.top = '30vh'
                    popUp.style.right = '50vw';
                    popUp.style.color = 'Red';
                    popUp.setAttribute("id", "pop-up");
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

            // Remove pop up display after 0.5 seconds
            if (popUpClock.getElapsedTime() > 0.5 && popUp) {
                let el = document.getElementById("pop-up");
                el.remove();
                popUp = undefined;
            }

            player.collided = false;

            // Camera always follows player
            camera.lookAt(player.position);

            // Render everything above
            renderer.render(scene, camera);

            // Game over logic - reset all objects
            const stats = document.getElementById("stats");
            if (ui.health <= 0) {
                stats.innerHTML = `You weren't able to survive. </br> Refresh the webpage to try again.`
                const gameOver = document.getElementById("endgame-stats");
                gameOver.style.visibility = "visible";
            }
            else if (player.position.x < -140 && player.position.z > 140) {
                stats.innerHTML = `You found other survivors! </br> Perhaps there is still hope left. </br> Refresh the webpage to play again.`
                const gameOver = document.getElementById("endgame-stats");
                gameOver.style.visibility = "visible";
            }
        }
        update();
    }
}

export default WorldLogic;
