import Game from './game.js';

let game = null;

window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    game.requestFrame();
});
