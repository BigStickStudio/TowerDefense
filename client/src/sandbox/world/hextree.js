import { MAP_SIZE, SQUARE_SIZE } from './chunk_config.js';

export default class HexNode {
    constructor(level) {
        this.hexes = {};
        this.position = { x: 0, z: 0 }; // Center of the region
        this.size = { h: 0, w: 0 }; // Height and Width of the region
        this.level = level;
        this.cells = [];
        this.min = { x: 77777, z: 77777 }; // Top Left
        this.max = { x: 0, z: 0 }; // Bottom Right
    }
}

HexNode.prototype.getPosition = function(n)  
    { return (n * SQUARE_SIZE) - (MAP_SIZE / 2); }

HexNode.prototype.setMinMax = function(x, z)
    {
        if (x < this.min.x) { this.min.x = x; }
        if (z < this.min.z) { this.min.z = z; }
        if (x > this.max.x) { this.max.x = x; }
        if (z > this.max.z) { this.max.z = z; }
    }

HexNode.prototype.calculatePosition = function()
    {
        let x = Math.floor((this.min.x + this.max.x) / 2);
        let z = Math.floor((this.min.z + this.max.z) / 2);
        this.position = { x: x, z: z };
    }

HexNode.prototype.calculateSize = function()
    {
        let h = this.max.x - this.min.x + SQUARE_SIZE;
        let w = this.max.z - this.min.z + SQUARE_SIZE;
        this.size = { h: h, w: w };
    }

HexNode.prototype.update = function(x, z)
    {
        this.setMinMax(x, z);
        this.calculatePosition();
        this.calculateSize();
    }

HexNode.prototype.addHex = function(hex)
    {
        if (this.hexes[hex.region] === undefined)
            { this.hexes[hex.region] = new HexNode('region'); }
        
        if (this.hexes[hex.region].hexes[hex.chunk] === undefined)
            { this.hexes[hex.region].hexes[hex.chunk] = new HexNode('chunk'); }
        
        if (this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile] === undefined)
            { this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile] = new HexNode('tile'); }
        
        const x_position = this.getPosition(hex.x);
        const z_position = this.getPosition(hex.z);
        this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile].cells.push({ x: x_position, z: z_position });
        this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile].update(x_position, z_position); // We can move this outside of the loop to optimize
        this.hexes[hex.region].hexes[hex.chunk].update(x_position, z_position);
        this.hexes[hex.region].update(x_position, z_position);
        this.update(x_position, z_position);
    }