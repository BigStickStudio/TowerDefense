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

    constructor(subdivision, start, end) {
        this.layer = subdivision;
        this.start = start;
        this.end = end;
        this.initGrid();
    }
}


HexNode.prototype.initGrid = function()
    {
        const { layer, start, end, chunks } = this;
        let offset_count = OFFSETS[layer];
        let offset_size = OFFSET_SIZES[layer];
        let chunk_size = SIZES[layer];
        let chunk_count = COUNTS[layer];

        this.subdivideGrid(start, end, offset_count, offset_size, chunk_size, chunk_count, layer);

        let chunk = this.chunks[0];
        let new_chunk_layer = chunk.layer + 1;
        chunk_count = COUNTS[new_chunk_layer];
        chunk_size = SIZES[new_chunk_layer];
        offset_size = chunk_size / 3;
        offset_count = chunk_count / 3;
        this.subdivideGrid(chunk.start, chunk.end, offset_count, offset_size, chunk.size, chunk_count, new_chunk_layer);
    }


HexNode.prototype.subdivideGrid = function(start, end, offset_count, offset_size, chunk_size, chunk_count, layer) 
{
        let [start_x, start_z] = start.x ? [start.x, start.z] : [start, start];
        let [end_x, end_z] = end.x ? [end.x, end.z] : [end - offset_count, end - offset_count];

        console.log("Start", start_x, start_z);
        console.log("End", end_x, end_z);
        console.log("Offset", offset_count, offset_size);
        console.log("Chunk", chunk_count, chunk_size);


        while (start_x < end_x) {
            let x = calculatePosition(start_x + offset_count, chunk_size);
            let z = calculatePosition(start_z + offset_count, chunk_size);
            let position = { x: x, z: z };
            let size = { h: chunk_size - offset_size, w: chunk_size - offset_size };
            let chunk = new Chunk(layer, position, size, { x: start_x, z: start_z}, { x: end_x, end_z}, offset_count);
            console.log("Chunk", chunk);
            this.chunks.push(chunk);
            start_x += chunk_count;
        }
    }

HexNode.prototype.calculateSubdivisions = function(position) 
    {
        if (this.layer >= 4)
            { return; }

        // let new_chunks = [];

        // // const filter = (chunk) => { 
        // //     if (chunk.contains(position)) 
        // //         {
        // //             let new_nodes = new HexNode(this.layer + 1, chunk.start, chunk.end);
        // //             new_nodes.calculateSubdivisions(position);
        // //             new_chunks.push(...new_nodes.chunks);
        // //             // TODO: Flag chunk in scene to be removed
        // //             return false;
        // //         }

        // //     return true;
        // // }

        // this.chunks = this.chunks.filter(filter);
        // this.chunks.push(...new_chunks);
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


