import { CHUNK_SIZE, MAP_SIZE, SQUARE_SIZE } from './chunk_config.js';

const HALF_CHUNK = CHUNK_SIZE / 2;
const HALF_SQUARE = SQUARE_SIZE / 2;
const HALF_MAP = MAP_SIZE / 2;  

export default class HexNode {
    constructor(level) {
        this.hexes = {};
        this.index = { z: 0, x: 0 }; // Index of the region
        this.position = { x: 0, z: 0 }; // Center of the region
        this.size = { h: 0, w: 0 }; // Height and Width of the region
        this.level = level;
        this.min = { x: 10000, z: 10000 }; // Top Left
        this.max = { x: -10000, z: -10000 }; // Bottom Right
        this.count = 0;
    }
}

HexNode.prototype.distanceTo = function(position)
    {
        let dx = Math.abs(this.position.x - position.x);
        let dz = Math.abs(this.position.z - position.z);
        return Math.sqrt(dx * dx + dz * dz);
    }

HexNode.prototype.getPosition = function(n)  
    { return (n * CHUNK_SIZE) - HALF_MAP + HALF_CHUNK; }

HexNode.prototype.setMinMax = function(x, z)
    {
        x = this.getPosition(x);
        z = this.getPosition(z);
        if (x < this.min.x) { this.min.x = x - HALF_CHUNK; }
        if (z < this.min.z) { this.min.z = z - HALF_CHUNK; }
        if (x > this.max.x) { this.max.x = x + HALF_CHUNK; }
        if (z > this.max.z) { this.max.z = z + HALF_CHUNK; }
    }

HexNode.prototype.calculatePosition = function()
    {
        let x = Math.floor((this.min.x + this.max.x) / 2);
        let z = Math.floor((this.min.z + this.max.z) / 2);
        this.position = { x: x, z: z };
    }

HexNode.prototype.calculateSize = function()
    {
        let h = this.max.z - this.min.z;
        let w = this.max.x - this.min.x;
        this.size = { h: h, w: w };
    }

HexNode.prototype.update = function(x, z)
    {
        this.count += 1;
        this.index = { x: x, z: z };
        this.setMinMax(x, z);
        this.calculatePosition();
        this.calculateSize();
    }

HexNode.prototype.addHex = function(hex)
    {
        if (this.hexes[hex.region] === undefined)
            { this.hexes[hex.region] = new HexNode('region'); }
        
        let region = this.hexes[hex.region];

        if (region.hexes[hex.chunk] === undefined)
            { region.hexes[hex.chunk] = new HexNode('chunk'); }
        
        let chunk = region.hexes[hex.chunk];

        if (chunk.hexes[hex.tile] === undefined)
            { chunk.hexes[hex.tile] = new HexNode('tile'); }
        
        let tile = chunk.hexes[hex.tile];

        if (tile.hexes[hex.hex] === undefined)
            { tile.hexes[hex.hex] = new HexNode('hex'); }

        tile.hexes[hex.hex].update(hex.x, hex.z);
        tile.update(hex.x, hex.z); // We can move this outside of the loop to optimize
        chunk.update(hex.x, hex.z);
        region.update(hex.x, hex.z);
        this.update(hex.x, hex.z);
    }