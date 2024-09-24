
export default class Chunk {
    constructor(layer, position, size, start, end, offset) {
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
        return this.start.x - this.offset.x * 6 < position.x &&
                position.x < this.end.x + this.offset.x * 4 && 
                this.start.z - this.offset.z * 6 < position.z &&
                position.z < this.end.z + this.offset.z * 4 ;
    }