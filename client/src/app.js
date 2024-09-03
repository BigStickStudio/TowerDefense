import Engine from './engine.js';

let instance = null;

window.addEventListener('DOMContentLoaded', () => {
    instance = Engine.instance;
    // TODO: Add Server Connection + Session Management
});
