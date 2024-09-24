
export default class Chunk {
    constructor(layer, position, size, start, end, offset) {
        console.log("Creating Chunk", layer, position, size)
        this.layer = layer;
        this.position = position;
        this.size = size;
        this.start = start;
        this.end = end;
        this.offset = offset;
    }
}

Chunk.prototype.contains = function(position)
    {
        return this.start.x - this.offset < position.x && 
               position.x < this.end.x + this.offset && 
               this.start.z - this.offset < position.z && 
               position.z < this.end.z + this.offset;
    }