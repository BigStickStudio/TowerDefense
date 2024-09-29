import Chunk from './chunk.js';
import * as config from './chunk_config.js';

const HALF_CHUNK = config.CHUNK_SIZE / 2;
const HALF_SQUARE = config.SQUARE_SIZE / 2;
const HALF_MAP = config.MAP_SIZE / 2;  

const OFFSETS = [config.MAX_CHUNK_OFFSET, config.MEGA_CHUNK_OFFSET, config.MID_CHUNK_OFFSET, config.MIN_CHUNK_OFFSET, 0];
const OFFSET_SIZES = [config.MAX_OFFSET_SIZE, config.MEGA_OFFSET_SIZE, config.MID_OFFSET_SIZE, config.MIN_OFFSET_SIZE, 0];
const SIZES = [config.MAX_CHUNK_SIZE, config.MEGA_CHUNK_SIZE, config.MID_CHUNK_SIZE, config.MIN_CHUNK_SIZE, config.CHUNK_SIZE];
const COUNTS = [config.MAX_CHUNK_COUNT, config.MEGA_CHUNK_COUNT, config.MID_CHUNK_COUNT, config.MIN_CHUNK_COUNT, 1];

const calculatePosition = (index, size) => 
    { return (index * config.CHUNK_SIZE) + (size / 2) - config.MAP_CENTER; }

export default class HexNode {
    chunks = [];               // Array of chunks in the region

    constructor(subdivision, start, end, init) {
        this.layer = subdivision;
        this.start = start;
        this.end = end;

        if (init) 
            { this.initGrid(); }
    }
}


HexNode.prototype.initGrid = function()
    {
        const { layer, start, end } = this;
        let offset_count = OFFSETS[layer];
        let offset_size = OFFSET_SIZES[layer];
        let chunk_size = SIZES[layer];
        let chunk_count = COUNTS[layer];

        this.subdivideGrid(start, end, offset_count, offset_size, chunk_size, chunk_count, layer);
    }

// This handles a single layer of the grids subdivision
HexNode.prototype.subdivideGrid = function(start, end, offset_count, offset_size, chunk_size, chunk_count, layer) 
{
        let [start_x, start_z] = start.x ? [start.x, start.z] : [start, start];
        let [end_x, end_z] = end.x ? [end.x, end.z] : [end, end];

        // console.log("Start", start_x, start_z);
        // console.log("End", end_x, end_z);
        // console.log("Offset", offset_count, offset_size);
        // console.log("Chunk", chunk_count, chunk_size);

        while (start_z < end_z)
            {
                let [z_chunk_size, z_count] = (start_z < offset_count || start_z >= config.CHUNK_COUNT - offset_count) ? 
                            [offset_size, offset_count] : [chunk_size, chunk_count];

                let z_position = calculatePosition(start_z, z_chunk_size);
                let height = z_chunk_size;
                let x = start_x;

                // Calculate the X position and width of the chunk
                while (x < end_x)
                    {
                        let [x_chunk_size, x_count] = (x < offset_count || x >= config.CHUNK_COUNT - offset_count) ?
                                [offset_size, offset_count] : [chunk_size, chunk_count];

                        let x_position = calculatePosition(x, x_chunk_size);
                        let width = x_chunk_size;

                        let chunk = new Chunk(layer, 
                            {x: x_position, z: z_position}, 
                            {w: width, h: height},
                            {x: x, z: start_z},                         // Start Position
                            {x: x + x_count, z: start_z + z_count},     // End Position
                            {x: x_count, z: z_count}                    // Offset
                        );

                        this.chunks.push(chunk);
                        x += x_count;
                    }

                start_z += z_count;
            }
    }

HexNode.prototype.calculateSubdivisions = function(position) 
    {
        if (this.layer >= 3)
            { return; }

        let new_chunks = [];

        const filter = (chunk) => { 
            if (chunk.contains(position)) 
                {
                    // console.log("Chunk Contains", chunk);
                    // console.log("Position", position);

                    let start = chunk.start;
                    let end = chunk.end;
                    let offset = chunk.offset;
                    
                    let offset_count = OFFSETS[this.layer + 1];
                    let offset_size = OFFSET_SIZES[this.layer + 1];
                    let chunk_size = SIZES[this.layer + 1];
                    let chunk_count = COUNTS[this.layer + 1];

                    let new_chunk = new HexNode(this.layer + 1, start, end, false);
                    new_chunk.subdivideGrid(start, end, offset_count, offset_size, chunk_size, chunk_count, this.layer + 1);
                    new_chunk.calculateSubdivisions(position);
                    new_chunks.push(...new_chunk.chunks);

                    chunk.delete();
                    
                    return false;
                }

            return true;
        }

        this.chunks = this.chunks.filter(filter);
        this.chunks.push(...new_chunks);
        return;
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


