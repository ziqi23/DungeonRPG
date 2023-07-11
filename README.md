## Overview

Last One Standing is a role-playing game set in a post-apocalyptic world. As the main character, you wake up one day to find a deadly virus has swept through your town. You scramble outside but see no signs of life. Hoding on to the last glimmer of hope, you pick up your bow and arrow and set out to find other survivors.

Click [here](https://ziqi23.github.io/Last-One-Standing) to play now!

## Basic Controls

Movement: `Left Mouse Button` <br>
Aim/Shoot: `1 & 2` <br>
Target/Select Enemy: `Tab` <br>
Drink Potions: `Q & E` <br>
Mute/Unmute: `M`

## Library Usage

`Three.js` - Utilized for creating elements of the game world and rendering its contents. Specifically, the following elements were created using this library:

### Main Components
1. the `camera`, the coordinates of which represent the player's viewpoint.
2. the `scene`, where all models live.
3. the `light`, which illuminates the scene.
4. the `built-in 3d models`, which were created using the library's built in geometries.
5. the `external 3D models`, which were imported using the `OBJLoader` and `FBXLoader` functionality.

### Supporting Components
1. THREE.Raycaster - assists in determining the coordinate at which the player's cursor is pointing.
2. THREE.AnimationMixer, THREE.AnimationClip, THREE.AnimationAction - creates an environment to play or pause animations.
3. THREE.Clock - implements an internal clock to keep track of game time allowing for dynamic game design such as animations playback and cooldown between abilities.
   
## Key Features

### 1. Player Movement

Movement is simulated by listening for mousedown events and shifting the player's and camera's position accordingly. Once a mousedown event fires, a sequence of events are triggered:

First, THREE.RayCaster determines the coordinates at which the user's cursor is pointed. 
```js
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
```

Then, a movement indicator is created in the game world to show where the player will move to.
```js
createMovementIndicator(x, z) {
     if (!this.movementIndicator) {
         const indicatorGeometry = new THREE.RingGeometry(1.5, 2, 30);
         const indicatorMaterial = new THREE.MeshStandardMaterial({color: 0xAAFF00, side: THREE.DoubleSide});
         const mesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
         this.movementIndicator = mesh;
         mesh.rotation.x = Math.PI / 2;
         this.scene.add(mesh);
     }
     this.movementIndicator.position.set(x, 2, z);
 }

 removeMovementIndicator() {
     if (this.movementIndicator) {
         this.scene.remove(this.movementIndicator);
         this.movementIndicator = null;
     }
 }
```

Lastly, the player and camera moves closer to the cursor location each frame.
```js
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
```

<br>

### 2. Animations

3D models in `Last One Standing` are animated, including the main character, NPCs and enemies. Animations are handled by `THREE.AnimationMixer` and loaded as `AnimationClips`. Animations are then played and paused conditionally. For example, an enemy chasing the main character will play a running animation, whereas an enemy that has not yet noticed the character will be idle.

```js
let enemyMixer = new THREE.AnimationMixer(fbx);
const animation = new FBXLoader();
animation.load("./assets/zombie/zombie-idle.fbx", (animation) => {
    let clip = animation.animations[0];
    let renamedClip = new THREE.AnimationClip('idle', clip.duration, clip.tracks);
    let action = enemyMixer.clipAction(renamedClip).play();
    action.loop = THREE.LoopOnce;
})
const animation2 = new FBXLoader();
animation2.load("./assets/zombie/zombie-attack.fbx", (animation) => {
    let clip = animation.animations[0];
    let renamedClip = new THREE.AnimationClip('attack', clip.duration, clip.tracks);
    let action = enemyMixer.clipAction(renamedClip);
    action.loop = THREE.LoopOnce;
})
const animation3 = new FBXLoader();
animation3.load("./assets/zombie/zombie-running.fbx", (animation) => {
    let clip = animation.animations[0];
    let renamedClip = new THREE.AnimationClip('running', clip.duration, clip.tracks);
    let action = enemyMixer.clipAction(renamedClip);
    action.loop = THREE.LoopOnce;
})
```
<br>

### 3. Projectile and Collision Management

A key component of the game is handling projectiles and determining when a collision has occurred between the player's arrow and an enemy.

Projectiles in the game are stored in a `shotObjects` array along with its initial and destination coordinates. The initial coordinate is simply the player's current position, and the destination coordinate is calculated based on the player's cursor location upon keypress.
```js
let x = pointingTo.x;
let z = pointingTo.z;
shotObjects.push({
    arrow 
    initialX: player.position.x, 
    initialZ: player.position.z, 
    destinationX: x, 
    destinationZ: z
});
```

In each frame, projectiles travel closer to its destination until they either collide with another object or fly too far away from the scene, in both cases they will be deleted from the game.

Either collision logic or removal logic may be triggered to handle these projectiles if they collide with another object or fly too far away from the scene.
```js
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
```
<br>

### 4. RPG Elements
Inspired by traditional RPG games, `Last One Standing` showcases different abilities (attack patterns) that can be toggled between by the player, an experience system which grants level-ups based on the number of enemies eliminated, as well as player stats (HP, MP).

The UI class tracks all of the above attributes, and within each frame of the game rendering, updates the UI display through DOM manipulation to dynamically present accurate HP, MP and EXP data.

<br>

```js
constructor() {
   this.health = 100;
   this.mana = 100;
   this.exp = 0;
   this.level = 1;
   this.potions = 3;
   this.manaPotions = 3;
}
```

<br>

## Attributions
- Mixamo - 3D Character Models and Animations
- CGTrader, TurboSquid - Other 3D Assets
- Pixabay - Sound Effects
