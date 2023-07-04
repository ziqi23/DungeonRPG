class Ui {
    constructor() {
        // Set initial player attributes
        this.health = 100;
        this.mana = 100;
        this.exp = 0;
        this.level = 1;
        this.potions = 3;
        this.manaPotions = 3;
        this.enemyHealth = 10;

        // Fetch menu background image & border
        let backgroundImage = document.createElement("img");
        backgroundImage.setAttribute("src", "./assets/menu.jpg");
        backgroundImage.style.filter = "saturate(150%)";

        let imageBorder = document.createElement("img");
        imageBorder.setAttribute("src", "./assets/menu-border.png");
        imageBorder.style.position = "absolute";
        imageBorder.style.left = '0';
        imageBorder.style.top = '-2vh';
        imageBorder.style.filter = "saturate(150%)";
        imageBorder.style.filter = "opacity(70%)";

        // Create instructions
        let text = document.createElement("div")
        text.style.position = "absolute";
        text.style.fontSize = "24px";
        text.style.fontWeight = "normal";
        text.style.fontFamily = "fantasy";
        text.innerHTML = "Use WASD to control your airship movement. <br><br>\
                    Move your mouse to aim and left-click to fire. <br><br>\
                    Switch between attack modes using the numbers 1 & 2. <br>\
                    Use Q and E to drink potions. <br>\
                    Hold right click to adjust camera angles. <br><br>\
                    Press Tab to target a specific enemy. <br><br>\
                    Press M to mute or unmute. <br><br>\
                    Press P to toggle this menu on and off.";
        text.style.width = '50vw';
        text.style.height = '30vh';
        text.style.top = '15vh';
        text.style.left = '10vw';
        text.style.textAlign = 'center';

        // Combine the previous items into one menu
        let menu = document.createElement("div");
        menu.style.position = 'absolute';
        menu.style.zIndex = '100';
        menu.style.filter = "opacity(85%)";
        menu.style.height = '70vh';
        menu.style.width = '70vw';
        menu.style.left = '15vw';
        menu.style.top = '5vh';
        menu.appendChild(backgroundImage);
        menu.appendChild(text);
        menu.appendChild(imageBorder);
        document.getElementById("ui").appendChild(menu);
        
        // Track whether menu is currently displayed (default true)
        let displayOn = true;

        // Add event listeners ("P" to toggle menu, "Q" and "E" to drink potions)
        document.addEventListener("keydown", (e) => {
            if (e.code === "KeyQ") {
                if (this.potions >= 1) {
                    let audio = new Audio("./assets/drink-potion.mp3");
                    audio.play();
                    this.potions -= 1;
                    this.health = 100;
                }
            } else if (e.code === "KeyE") {
                if (this.manaPotions >= 1) {
                    let audio = new Audio("./assets/drink-potion.mp3");
                    audio.play();
                    this.manaPotions -= 1;
                    this.mana = 100;
                }
            } else if (e.code === "KeyP") {
                if (!displayOn) {
                    document.getElementById("ui").appendChild(menu);
                    displayOn = true;
                } else {
                    menu.remove();
                    displayOn = false;
                }
            } else if (e.code === "Enter") {
                document.getElementById("endgame-stats").style.visibility = "hidden";
            }
        })


        // Another option to stop menu from displaying is to click anywhere on the screen
        document.addEventListener("mousedown", () => {
            if (displayOn) {
                menu.remove();
                displayOn = false;
            }
        })
        
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
        health.style.height = `${this.health / 100 * 215}px`

        let mana = document.getElementById("mp-img");
        mana.style.height = `${this.mana / 100 * 215}px`

        // Update image opacity once out of potions.
        if (this.potions === 0) {
            let el = document.getElementById("red")
            el.style.opacity = "20%";
        }
        if (this.manaPotions === 0) {
            let el = document.getElementById("blue")
            el.style.opacity = "20%";
        }

        // Update exp bar based on current exp
        let el = document.getElementById("dup-exp-bar")
        el.style.width = `${this.exp}vw`

        // Update enemy health visual
        const enemyHealth = document.getElementById("enemy-health-full")
        enemyHealth.style.width = `${this.enemyHealth / 10 * 70}vw`
        

        // Update user level
        if (this.exp >= 100) {
            this.level += 1
            this.potions += 1;
            this.manaPotions += 1;
            this.exp %= 100;
        }        
    }
}

export default Ui;