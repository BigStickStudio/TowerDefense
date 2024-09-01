import * as THREE from 'three';

export default class MapInterface {
    raycaster = undefined;
    mouse2D = undefined;

    constructor () 
        { this.init(); }

    init = () => 
        {
            this.raycaster = new THREE.Raycaster();
            this.mouse2D = new THREE.Vector2();
            document.addEventListener('mousemove', this.trackMouse, false);
        }

    getIntersection = (camera, objects) => 
        {
            this.raycaster.setFromCamera(this.mouse2D, camera);
            let intersects = this.raycaster.intersectObjects(objects, true);

            if (intersects.length > 0) { return; }

            for (let i = 0; i < intersects.length; i++) 
                { intersects[i].object.material.color.set(0x9a23c4); }
        }

    trackMouse = (e) => 
        {
            e.preventDefault();

            this.mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }
}