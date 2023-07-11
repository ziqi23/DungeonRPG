import * as THREE from 'three';

class Ui {
    constructor(world) {
        // Set initial player attributes
        this.scene = world.scene;
        this.health = 100;
        this.mana = 100;
        this.exp = 0;
        this.level = 1;
        this.potions = 3;
        this.manaPotions = 3;

        // Add event listeners ("Q" and "E" to drink potions)
        document.addEventListener("keydown", (e) => {
            if (e.code === "KeyQ") {
                if (this.potions >= 1) {
                    let audio = new Audio("./assets/audio/drink-potion.mp3");
                    audio.play();
                    this.potions -= 1;
                    this.health = 100;
                }
            } else if (e.code === "KeyE") {
                if (this.manaPotions >= 1) {
                    let audio = new Audio("./assets/audio/drink-potion.mp3");
                    audio.play();
                    this.manaPotions -= 1;
                    this.mana = 100;
                }
            }
        })

        // Handle skill selection - toggle using keys '1' and '2'
        window.addEventListener("keydown", handleSkillToggle);
        let currentSkill = 1;
        function handleSkillToggle(e) {
            if (e.key === '1') {
                document.getElementById('skill-one').style.border = "3px solid gold";
                document.getElementById('skill-two').style.border = "3px solid black";
                document.getElementById('skill-one').style.filter = "grayscale(1)";
                document.getElementById('skill-two').style.filter = "grayscale(1)";
                setTimeout(() => {
                    document.getElementById('skill-one').style.filter = "none";
                    document.getElementById('skill-two').style.filter = "none";
                }, 600)
                currentSkill = 1;
            } else if (e.key === '2') { 
                document.getElementById('skill-two').style.border = "3px solid gold";
                document.getElementById('skill-one').style.border = "3px solid black";
                document.getElementById('skill-one').style.filter = "grayscale(1)";
                document.getElementById('skill-two').style.filter = "grayscale(1)";
                setTimeout(() => {
                    document.getElementById('skill-one').style.filter = "none";
                    document.getElementById('skill-two').style.filter = "none";
                }, 600)
                currentSkill = 2;
            }
        }
    }

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

    displaySelectedEnemy(selectedEnemyMesh, selectedEnemy) {
        if (selectedEnemy && !document.getElementById('enemy-banner')) {
            const banner = document.createElement('div');
            banner.id = 'enemy-banner';
            document.getElementById('body').appendChild(banner);
            banner.innerHTML = selectedEnemy.nametag;
        }
        else if (!selectedEnemy) {
            document.getElementById('enemy-banner')?.remove();
        }

        if (!selectedEnemy) {
            return;
        }
        this.selectedEnemy = selectedEnemy;
        const boundingBox = new THREE.Box3().setFromObject(selectedEnemy);
        let position = {
            x: (boundingBox.max.x + boundingBox.min.x) / 2,
            y: 2,
            z: (boundingBox.max.z + boundingBox.min.z) / 2
        }

        if (!selectedEnemyMesh) {
            const selectedEnemyGeometry = new THREE.RingGeometry(5, 6, 30);
            const selectedEnemyMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
            const mesh = new THREE.Mesh(selectedEnemyGeometry, selectedEnemyMaterial);
            mesh.rotation.x = Math.PI / 2;
            mesh.position.set(position.x, position.y, position.z);
            this.scene.add(mesh);
            return mesh;
        }
        else {
            selectedEnemyMesh.position.set(position.x, position.y, position.z);
            return selectedEnemyMesh;
        }
    }

    // Function that is run at every frame to update UI based on current player health, exp, etc.
    buildUi() {
        // Update HP potion count display
        if (document.getElementById("potion-count")) {
            document.getElementById("potion-count").innerHTML = `${this.potions}`;
        } else {
            let potionCount = document.createElement("h1");
            potionCount.setAttribute("id", "potion-count");
            potionCount.innerHTML = `${this.potions}`;
            potionCount.style.position = 'absolute';
            potionCount.style.zIndex = "40";
            document.getElementById("ui").appendChild(potionCount);
        }

        // Update MP potion count display
        if (document.getElementById("mp-potion-count")) {
            document.getElementById("mp-potion-count").innerHTML = `${this.manaPotions}`;
        } else {
            let mpPotionCount = document.createElement("h1");
            mpPotionCount.setAttribute("id", "mp-potion-count");
            mpPotionCount.innerHTML = `${this.manaPotions}`;
            mpPotionCount.style.position = 'absolute';
            mpPotionCount.style.zIndex = "40";
            document.getElementById("ui").appendChild(mpPotionCount);
        }

        // Update HP and MP bar display based on current health and mana
        let health = document.getElementById("hp-img");
        health.style.height = `${this.health / 100 * 215}px`;

        let mana = document.getElementById("mp-img");
        mana.style.height = `${this.mana / 100 * 215}px`;

        // Update image opacity once out of potions.
        if (this.potions === 0) {
            let el = document.getElementById("red");
            el.style.opacity = "20%";
        }
        if (this.manaPotions === 0) {
            let el = document.getElementById("blue");
            el.style.opacity = "20%";
        }

        // Update exp bar based on current exp
        let el = document.getElementById("dup-exp-bar");
        el.style.width = `${this.exp}vw`;

        // Update enemy health visual
        if (this.selectedEnemy) {
            const enemyHealth = document.getElementById("enemy-health-full");
            enemyHealth.style.width = `${this.selectedEnemy.health / this.selectedEnemy.maxHealth * 70}vw`;
            if (this.selectedEnemy.health <= 0) {
                document.getElementById('enemy-health-empty').style.visibility = 'hidden';
                document.getElementById('enemy-health-full').style.visibility = 'hidden';
            }
        }
        
        // Update user level
        if (this.exp >= 100) {
            this.level += 1;
            this.potions += 1;
            this.manaPotions += 1;
            this.exp %= 100;
        }        
    }
}

export default Ui;