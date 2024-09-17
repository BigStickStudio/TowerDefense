import * as THREE from 'three';

const textureLoader = (path, scale, map_size) => {
    const texture = new THREE.TextureLoader().load(path);
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set((map_size.x / scale), (map_size.y / scale));
    // rotate the texture by 90 degrees
    texture.rotation = Math.PI / 2;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    return texture;
} 

const batchTextureLoader = (path, scale, map_size) => {
    const diffuse = textureLoader(path + 'diffuse.jpg', scale, map_size);
    const normal = textureLoader(path + 'normal.jpg', scale, map_size);
    const bump = textureLoader(path + 'bump.jpg', scale, map_size);
    return { diffuse: diffuse, normal: normal, bump: bump };
}

export { batchTextureLoader, textureLoader };

