import * as THREE from 'three';
import UI from '../ui.js';
import Camera from './camera.js';
import StateManager from './state_manager.js';

const state = StateManager.instance;

const unwrap = (t) => { return t ? t : 'none'; }
const clamp = (v) => { return v < 0 ? 0 : v > 255 ? 255 : v; }

export default class Engine {
    // TODO: Maybe we move these out somewhere else
    camera_enabled = false;
    enableCamera = () => { console.error("[Engine]::error : Camera fn() not defined."); };
    disableCamera = () => { console.error("[Engine]::error : Camera fn() not defined."); };
    enableMapCursor = () => { console.error("[Engine]::error : Map Cursor fn() not defined."); };
    disableMapCursor = () => { console.error("[Engine]::error : Map Cursor fn() not defined."); };

    constructor() 
        {
            this.clock = new THREE.Clock();
            this.scene = new THREE.Scene();
            this.initRenderer();
            this.ui = new UI(this.enableListeners, this.disableListeners);
            this.camera = new Camera(this.renderer);

            state.updateUI = this.ui.updateUI;
        }

    initRenderer = () => 
        {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setClearColor(0x000000);
            this.renderer.gammaFactor = 2.2;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            let canvas = document.getElementById('canvas');
            canvas.appendChild(this.renderer.domElement);
        }

    // This function has to be called at the end of the Game Initialization
    // as the Camera is a part of the Engine, but the Map is part of the Game
    configureListeners = () => 
        {
            this.enableCamera = this.camera.enable;
            this.disableCamera = this.camera.disable;
            this.enableMapCursor = this.map.enable;
            this.disableMapCursor = this.map.disable;
        }

    enableListeners = () => 
        {
            console.log("[Engine]: Enabling Listeners");
            this.enableCamera();
            this.enableMapCursor();
        }

    disableListeners = () => 
        {
            console.log("[Engine]: Disabling Listeners");
            this.disableCamera();
            this.disableMapCursor();
        }
}