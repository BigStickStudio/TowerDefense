import * as THREE from 'three';
import Character from '/src/engine/entities/character/character.js';

const bases = "/assets/models/bases/";
const towers = "/assets/models/towers/";
const creatures = "/assets/models/troops/creatures/";
const machines = "/assets/models/troops/machines/";
const military = "/assets/models/troops/military/";
const warriors = "/assets/models/troops/warriors/";

const directories = [ bases, towers, creatures, machines, military, warriors ];


const getFiles = async (dir) => {
    let file_list;

    try {
        const response = await fetch('http://127.0.0.1:9001/models', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `path=${encodeURIComponent(dir)}`,
        });
        
        if (!response.ok) 
            { throw new Error('Network response was not ok', response); }

        file_list = await response.text();
        file_list = file_list.split("\n");
        file_list = file_list.filter((file) => file.length > 0);
        file_list = JSON.parse(file_list[file_list.length - 1]).files;
    } catch (error) {
        console.error('Error:', error);
    }

    return file_list;
}

const loadModels = async () => 
    {
        const models = [];

        for (let dir of directories)
            { models.push(...await getFiles(dir)); }

        let x = -128;
        let z = 0;
        for (let model of models) 
            { 
                new Character(model, new THREE.Vector3(x, 0, z)); 
                x += 12;

                if (x > 128) 
                    { x = -64; z += 12; }
            }
    }

export default loadModels;