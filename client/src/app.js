import Game from './game.js';

let instance = null;

window.addEventListener('DOMContentLoaded', () => {
    instance = new Game();
    // TODO: Add Server Connection + Session Management
});
