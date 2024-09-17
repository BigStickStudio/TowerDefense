// This is the entity manager. It is responsible for managing all entities in the game.
// If you are reading this, you are probably a developer. If you are not, you are probably lost.

// (c) 2024 by the entity manager. All rights reserved. //

export default class EntityManager {
    constructor() {
        this.inventory = {};
    }
    
    add = (entity) => { 
        if (!entity.name)
            { throw new Error("Entity must have a name to be added to the inventory."); }
        // if (!entity.update)
        //     { throw new Error("Entity must have an update method to be added to the inventory."); }

        this.inventory[entity.name] = entity; 

    }
    delete = (entity) => { delete this.inventory[entity.name]; }
    get = (name) => { return this.inventory[name]; }
    all = () => { return this.inventory; }
    names = () => { return Object.keys(this.inventory); }
    count = () => { return Object.keys(this.inventory).length; }
    clear = () => { this.inventory = {}; }
    update = () => { Object.values(this.inventory).forEach(entity => entity.update()); }
}