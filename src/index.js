import World from './scripts/world.js';
import WorldObjects from './scripts/worldObjects.js';
import WorldLogic from './scripts/worldLogic.js';
import Ui from './scripts/ui.js';

let muted = false;
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

let numLoads = 0;
let world = new World();
let objects = new WorldObjects(world);
let ui = new Ui(world);

export function load() {
    numLoads += 1;
    if (numLoads === 41) {
        document.getElementById('background-music').muted = false;
        const loadingPage = document.getElementById('loading-page');
        const loadingAnimation = document.getElementById('loading-animation');
        if (loadingAnimation) loadingPage.removeChild(loadingAnimation);
        const instructions = document.createElement('IMG');
        instructions.src = './assets/ui/instructions.png';
        instructions.style.width = 'fill';
        instructions.style.height = 'fill';
        loadingPage.appendChild(instructions);
        loadingPage.addEventListener('click', handleEnterGame);
        function handleEnterGame(e) {
            e.preventDefault();
            document.getElementById('body').removeChild(loadingPage);
            start();
        }

    }
}

export function start() {
    let logic = new WorldLogic(world, objects, ui, muted);
    logic.run();
}

