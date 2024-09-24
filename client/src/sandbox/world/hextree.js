import Chunk from './chunk.js';
import * as config from './chunk_config.js';

const HALF_CHUNK = config.CHUNK_SIZE / 2;
const HALF_SQUARE = config.SQUARE_SIZE / 2;
const HALF_MAP = config.MAP_SIZE / 2;  

const OFFSETS = [config.MAX_CHUNK_OFFSET, config.MID_CHUNK_OFFSET, config.MIN_CHUNK_OFFSET, 0];
const OFFSET_SIZES = [config.MAX_OFFSET_SIZE, config.MID_OFFSET_SIZE, config.MIN_OFFSET_SIZE, 0];
const SIZES = [config.MAX_CHUNK_SIZE, config.MID_CHUNK_SIZE, config.MIN_CHUNK_SIZE, config.CHUNK_SIZE];
const COUNTS = [config.MAX_CHUNK_COUNT, config.MID_CHUNK_COUNT, config.MIN_CHUNK_COUNT, 1];



export default class HexNode {
    chunks = [];               // Array of chunks in the region

    constructor(subdivision, start, end) {
        this.layer = subdivision;
        this.start = start;
        this.end = end;
        this.initGrid();
    }

    initGrid = () => {
        const offset = OFFSETS[this.layer];
        const offset_size = OFFSET_SIZES[this.layer];
        const chunk_size = SIZES[this.layer];
        const count = COUNTS[this.layer];

        console.log("Creating Hex Grid", this.layer);
        console.log("Layer", this.layer);
        console.log("Offset", offset);
        console.log("Offset Size", offset_size);
        console.log("Size", chunk_size);
        console.log("Count", count);
        console.log("Start", this.start);
        console.log("End", this.end);
        
        const calculatePosition = (index, size) => 
            { return (index * config.CHUNK_SIZE) + (size / 2) - config.MAP_CENTER; }

        let z = this.start?.z ? this.start.z : this.start;
        let end_z = this.end?.z ? this.end.z : this.end;
        let end_x = this.end?.x ? this.end.x : this.end;

        while (z < end_z)
            {
                let x_position = 0;
                let z_position = 0;
                let width = 0;
                let height = 0;
                let x = this.start?.x ? this.start.x : this.start;
                console.warn("Z", z);
                let start_z = z;

                // Calculate the Z position and size of the chunk for the max chunk size
                if (z < offset || z >= (config.CHUNK_COUNT - offset))
                    {
                        z_position = calculatePosition(z, offset_size);
                        height = offset_size;
                        z += offset;
                    }
                else
                    {
                        z_position = calculatePosition(z, chunk_size);
                        height = chunk_size;
                        z += count;
                    }

                // Calculate the X position and size of the chunk
                while (x < end_x)
                    {
                        let start_x = x;

                        if (x < offset || x >= config.CHUNK_COUNT - offset)
                            {
                                x_position = calculatePosition(x, offset_size);
                                width = offset_size;
                                x += offset;
                            }
                        else
                            {
                                x_position = calculatePosition(x, chunk_size);
                                width = chunk_size;
                                x += count;
                            }

                        let chunk = new Chunk(this.layer, 
                            {x: x_position, z: z_position}, 
                            {w: width, h: height},
                            {x: start_x, z: start_z},   // Start Position
                            {x: x, z: z},                // End Position
                            (COUNTS[this.layer + 1])            // Offset
                        );
                        console.warn("New Chunk", chunk);
                        this.chunks.push(chunk);
                    }
            }

            console.log("Chunks", this.chunks);
    }

    calculateSubdivisions = (position) => {
        if (this.layer >= 3)
            { return; }

        let new_chunks = [];

        const filter = (chunk) => { 
            if (chunk.contains(position)) {
                console.log("Chunk", chunk, "contains Position", position);
                    {
                        let new_nodes = new HexNode(chunk.layer + 1, chunk.start, chunk.end);
                        new_nodes.calculateSubdivisions(position);
                        new_chunks.push(...new_nodes.chunks);
                    }
                return false;
            }
            return true;
        }

        this.chunks = this.chunks.filter(filter);
        this.chunks.push(...new_chunks);
    }
}


HexNode.prototype.getPosition = function(n)  
    { return (n * CHUNK_SIZE) - HALF_MAP + HALF_CHUNK; }


HexNode.prototype.calculatePosition = function()
    {
        let x = Math.floor((this.min.x + this.max.x) / 2);
        let z = Math.floor((this.min.z + this.max.z) / 2);
        this.position = { x: x, z: z };
    }

HexNode.prototype.calculateSize = function()
    {
        this.size = { h: h, w: w };
    }


