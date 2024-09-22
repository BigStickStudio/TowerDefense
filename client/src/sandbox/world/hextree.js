import { CHUNK_SIZE, MAP_SIZE, SQUARE_SIZE } from './chunk_config.js';

const HALF_CHUNK = CHUNK_SIZE / 2;
const HALF_SQUARE = SQUARE_SIZE / 2;
const HALF_MAP = MAP_SIZE / 2;  

export default class HexNode {
    constructor(level) {
        this.hexes = {};
        this.position = { x: 0, z: 0 }; // Center of the region
        this.size = { h: 0, w: 0 }; // Height and Width of the region
        this.level = level;
        this.min = { x: 10000, z: 10000 }; // Top Left
        this.max = { x: -10000, z: -10000 }; // Bottom Right
        this.count = 0;
    }
}

HexNode.prototype.getPosition = function(n)  
    { return (n * CHUNK_SIZE) - HALF_MAP + HALF_CHUNK; }

HexNode.prototype.setMinMax = function(x, z)
    {
        console.log("Setting minmax at @", this.level, ": ", x, z);
        if (x < this.min.x) { this.min.x = x - HALF_CHUNK; }
        if (z < this.min.z) { this.min.z = z - HALF_CHUNK; }
        if (x > this.max.x) { this.max.x = x + HALF_CHUNK; }
        if (z > this.max.z) { this.max.z = z + HALF_CHUNK; }
        console.log("Min", this.min, "Max", this.max);
    }

HexNode.prototype.calculatePosition = function()
    {
        let x = Math.floor((this.min.x + this.max.x) / 2);
        let z = Math.floor((this.min.z + this.max.z) / 2);
        this.position = { x: x, z: z };
    }

HexNode.prototype.calculateSize = function()
    {
        let h = this.count * CHUNK_SIZE;
        let w = this.count * CHUNK_SIZE;
        this.size = { h: h, w: w };
    }

HexNode.prototype.update = function(x, z)
    {
        this.count += 1;
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
        
        if (this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile].hexes[hex.hex] === undefined)
            { this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile].hexes[hex.hex] = new HexNode('hex'); }


        const x_position = this.getPosition(hex.x);
        const z_position = this.getPosition(hex.z);

        this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile].hexes[hex.hex].update(x_position, z_position);
        this.hexes[hex.region].hexes[hex.chunk].hexes[hex.tile].update(x_position, z_position); // We can move this outside of the loop to optimize
        this.hexes[hex.region].hexes[hex.chunk].update(x_position, z_position);
        this.hexes[hex.region].update(x_position, z_position);
        this.update(x_position, z_position);
    }