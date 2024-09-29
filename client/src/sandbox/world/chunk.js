import * as THREE from "three";
import StateManager from "/src/engine/state_manager.js";

const state = StateManager.instance;
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });

export default class Chunk {
    constructor(layer, position, size, start, end) {
        this.layer = layer;
        this.position = position;
        this.size = size;
        this.start = start;
        this.end = end;
        this.mesh = this.createMesh();
    }
}

Chunk.prototype.contains = function(position)
    {
        return this.start.x < position.x &&
                position.x < this.end.x && 
                this.start.z < position.z &&
                position.z < this.end.z ;
    }

Chunk.prototype.createMesh = function()
    {
        let position = this.position;
        let size = this.size;
        let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, 1, position.z);
        mesh.rotation.x = -Math.PI / 2;
        mesh.name = "hex";
        state.scene.add(mesh);
    }

Chunk.prototype.delete = function()
    { state.scene.remove(this.mesh); }