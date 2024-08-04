import World from './world.js';

let world = null;

window.addEventListener('DOMContentLoaded', () => {
    world = new World();
    world.requestFrame();
});
