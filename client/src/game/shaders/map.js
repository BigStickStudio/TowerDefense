const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D top1_texture;
    uniform sampler2D top1_bump;
    uniform sampler2D top1_normal;
    uniform sampler2D top2_texture;
    uniform sampler2D top2_bump;
    uniform sampler2D top2_normal;
    uniform sampler2D top3_texture;
    uniform sampler2D top3_bump;
    uniform sampler2D top3_normal;
    uniform float top_bounds;
    uniform vec3 top_scale;

    uniform sampler2D middle1_texture;
    uniform sampler2D middle1_bump;
    uniform sampler2D middle1_normal;
    uniform sampler2D middle2_texture;
    uniform sampler2D middle2_bump;
    uniform sampler2D middle2_normal;
    uniform sampler2D middle3_texture;
    uniform sampler2D middle3_bump;
    uniform sampler2D middle3_normal;
    uniform float middle_bounds;
    uniform vec3 middle_scale;

    uniform sampler2D lower1_texture;
    uniform sampler2D lower1_bump;
    uniform sampler2D lower1_normal;
    uniform sampler2D lower2_texture;
    uniform sampler2D lower2_bump;
    uniform sampler2D lower2_normal;
    uniform float lower_bounds;
    uniform vec3 lower_scale;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    uniform sampler2D top_noise_map1;
    uniform sampler2D top_noise_map2;
    uniform sampler2D middle_noise_map1;
    uniform sampler2D middle_noise_map2;
    uniform sampler2D bottom_noise_map;
    uniform sampler2D uv_noise;
    uniform vec2 uv_offset;
    uniform vec2 uv_scale;

    vec3 applyBumpMap(sampler2D bumpMap, vec3 normal, vec2 uv) {
        vec3 bumpNormal = texture2D(bumpMap, uv).rgb * 2.0 - 1.0; // Convert to [-1, 1]
        return normalize(normal + bumpNormal);
    }

    mat2 rotationMatrix(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
    }

    vec2 applyRandomRotation(vec2 uv, vec2 tile, float scale) {
        vec3 offset = texture2D(uv_noise, tile).rgb;
        vec2 angle = vec2(offset.x, offset.y) * 6.28318530718;
        mat2 rot = rotationMatrix(angle.x);
        vec2 rotated = rot * uv;
        return vec2(rotated.x * scale, rotated.y);
    }

    vec2 getTileOffset(vec2 tile) {
        vec3 offset = texture2D(uv_noise, tile).rgb;
        return vec2(offset.xy) * uv_scale + uv_offset;
    }

    vec4 textureUV(sampler2D tex, vec2 uv) {
        float k = texture2D(tex, 0.0025 * uv).r;
        float l = k * 8.0;
        float f = fract(l);

        float ia = floor(l+0.5); // kudos suslik
        float ib = floor(l);
        f = min(f, 1.0 - f) * 2.0;

        vec2 offset_a = sin(vec2(3.0, 7.0) * ia);
        vec2 offset_b = sin(vec2(3.0, 7.0) * ib);

        vec4 color_a = texture2D(tex, uv.xy + offset_a);
        vec4 color_b = texture2D(tex, uv.xy + offset_b);

        return mix(color_a, color_b, smoothstep(0.2, 0.8, f - 0.1 * (color_a.x + color_a.y + color_a.z - color_b.x - color_b.y - color_b.z)));
    }

    vec4 triplanar(vec3 normal, vec3 objectPosition, sampler2D tex, vec3 scale) {
        vec3 n = normalize(normal);
        vec3 nabs = abs(n);

        vec2 texCoordX = objectPosition.yz;
        vec2 texCoordY = objectPosition.xz;
        vec2 texCoordZ = objectPosition.xy;

        vec3 blendWeights = normalize(nabs);
        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

        vec4 texX = textureUV(tex, texCoordX * scale.xy);
        vec4 texY = textureUV(tex, texCoordY * scale.yz);
        vec4 texZ = textureUV(tex, texCoordZ * scale.xz);

        return texX * blendWeights.x + texY * blendWeights.y + texZ * blendWeights.z;
    }

    vec3 textureUVNormal(sampler2D tex, vec2 uv) {
        float k = texture2D(tex, 0.0025 * uv).r;
        float l = k * 8.0;
        float f = fract(l);

        float ia = floor(l+0.5); // kudos suslik
        float ib = floor(l);
        f = min(f, 1.0 - f) * 2.0;

        vec2 offset_a = sin(vec2(5.0, 9.0) * ia);
        vec2 offset_b = sin(vec2(12.0, 19.0) * ib);

        vec3 color_a = texture2D(tex, uv.xy + offset_a).rgb;
        vec3 color_b = texture2D(tex, uv.xy + offset_b).rgb;

        return mix(color_a, color_b, smoothstep(0.2, 0.8, f - 0.1 * (color_a.x + color_a.y + color_a.z - color_b.x - color_b.y - color_b.z)));
    }

    vec3 triplanarNormal(vec3 normal, vec3 objectPosition, sampler2D normalMap, vec3 scale) {
        vec3 n = normalize(normal);
        vec3 nabs = abs(n);

        vec2 texCoordX = objectPosition.yz;
        vec2 texCoordY = objectPosition.xz;
        vec2 texCoordZ = objectPosition.xy;

        vec3 blendWeights = normalize(nabs);
        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

        vec3 xNormal = textureUVNormal(normalMap, texCoordX * scale.xy);
        vec3 yNormal = textureUVNormal(normalMap, texCoordY * scale.yz);
        vec3 zNormal = textureUVNormal(normalMap, texCoordZ * scale.xz);

        vec3 bumpNormal = xNormal * blendWeights.x + yNormal * blendWeights.y + zNormal * blendWeights.z;
        return bumpNormal;
    }

    float noiseColor(sampler2D noiseMap, vec2 uv, vec2 coords, vec2 base) {
        vec4 colorA = texture2D(noiseMap, uv);
        vec4 colorB = texture2D(noiseMap, coords);
        vec4 noiseColor = mix(colorA, colorB, base.r);
        return dot(noiseColor.rgb, vec3(0.299, 0.587, 0.114));
    }

    vec4 colorMixer(sampler2D tex1, sampler2D tex2, float noise1, vec3 scale) {
        vec4 color1 = triplanar(vWorldNormal, vWorldPosition, tex1, scale);
        vec4 color2 = triplanar(vWorldNormal, vWorldPosition, tex2, scale);
        return mix(color1, color2, noise1);
    }

    vec3 normalMixer(sampler2D normal1, sampler2D normal2, float noise1, vec3 scale) {
        vec3 norm1 = triplanarNormal(vWorldNormal, vWorldPosition, normal1, scale);
        vec3 norm2 = triplanarNormal(vWorldNormal, vWorldPosition, normal2, scale);
        return mix(norm1, norm2, noise1);
    }

    vec4 colorDoubleMixer(sampler2D tex1, sampler2D tex2, sampler2D tex3, float noise1, float noise2, vec3 scale) {
        vec4 color1 = triplanar(vWorldNormal, vWorldPosition, tex1, scale);
        vec4 color2 = triplanar(vWorldNormal, vWorldPosition, tex2, scale);
        vec4 color3 = triplanar(vWorldNormal, vWorldPosition, tex3, scale);
        return mix(mix(color1, color2, noise1), color3, noise2);
    }

    vec3 normalDoubleMixer(sampler2D norm1, sampler2D norm2, sampler2D norm3, float noise1, float noise2, vec3 scale) {
        vec3 normal1 = triplanarNormal(vWorldNormal, vWorldPosition, norm1, scale);
        vec3 normal2 = triplanarNormal(vWorldNormal, vWorldPosition, norm2, scale);
        vec3 normal3 = triplanarNormal(vWorldNormal, vWorldPosition, norm3, scale);
        return mix(mix(normal1, normal2, noise1), normal3, noise2);
    }

    void main() {
        // blend top textures using noise map
        vec2 tiledUv = vUv * uv_scale;
        vec2 tileCoords = fract(tiledUv);
        vec2 baseTile = tiledUv - floor(tileCoords);
        vec2 tileOffset1 = getTileOffset(baseTile);
        vec2 tileOffset2 = getTileOffset(baseTile + vec2(1.0, 0.0));
        vec2 uv1 = applyRandomRotation(tileCoords + tileOffset1, baseTile, 1.0);
        vec2 uv2 = applyRandomRotation(tileCoords + tileOffset2, baseTile + vec2(1.0, 0.0), 1.2);

        float top_noise1 = noiseColor(top_noise_map1, uv1, tileCoords, baseTile);
        float top_noise2 = noiseColor(top_noise_map2, uv2, tileCoords, baseTile);

        vec4 color1 = colorDoubleMixer(top1_texture, top2_texture, top3_texture, top_noise2, top_noise1, top_scale);
        vec3 normal1 = normalDoubleMixer(top1_normal, top2_normal, top3_normal, top_noise2, top_noise1, top_scale);

        float middle_noise1 = noiseColor(middle_noise_map1, uv2, tileCoords, baseTile);
        float middle_noise2 = noiseColor(middle_noise_map2, uv1, tileCoords, baseTile);

        vec4 color2 = colorDoubleMixer(middle1_texture, middle2_texture, middle3_texture, middle_noise1, middle_noise2, middle_scale);
        vec3 normal2 = normalDoubleMixer(middle1_normal, middle2_normal, middle3_normal, middle_noise1, middle_noise2, middle_scale);

        float lower_noise = noiseColor(bottom_noise_map, uv1, tileCoords, baseTile);

        vec3 normal3 = normalMixer(lower1_normal, lower2_normal, lower_noise, lower_scale);
        vec4 color3 = colorMixer(lower1_texture, lower2_texture, lower_noise, lower_scale);

        vec4 finalColor;
        vec3 finalNormal;

        float mid_top = top_bounds - middle_bounds;
        float mid_low = lower_bounds + middle_bounds;

        if (vWorldPosition.y <= lower_bounds) {
            finalColor = color3;
            finalNormal = normal3;    
        } else if (vWorldPosition.y > lower_bounds && vWorldPosition.y <= mid_low) {
            finalColor = mix(color3, color2, smoothstep(lower_bounds, mid_low, vWorldPosition.y));
            finalNormal = mix(normal3, normal2, smoothstep(lower_bounds, mid_low, vWorldPosition.y));
        } else if (vWorldPosition.y > mid_low && vWorldPosition.y <= mid_top) {
            finalColor = color2;
            finalNormal = normal2;
        } else if (vWorldPosition.y > mid_top && vWorldPosition.y <= top_bounds) {
            finalColor = mix(color2, color1, smoothstep(mid_top, top_bounds, vWorldPosition.y));
            finalNormal = mix(normal2, normal1, smoothstep(mid_top, top_bounds, vWorldPosition.y));
        } else {
            finalColor = color1;
            finalNormal = normal1;    
        }

        gl_FragColor = finalColor;
    }
`;

export { fragmentShader, vertexShader };
