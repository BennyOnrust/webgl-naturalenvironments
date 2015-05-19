Water = function(worldScale, worldWidth, worldDepth, worldHeightScale, resolution, lightPosition, waterNormals, skyboxTexture, conditionLOD){
    THREE.Object3D.call( this );    
    var waterGeometry = new THREE.PlaneBufferGeometry( worldWidth * worldScale, worldDepth * worldScale,Math.ceil(worldWidth * resolution),Math.ceil(worldDepth * resolution));
    var waterMaterial;
    
    if(conditionLOD === "object"){
        waterMaterial = new THREE.ShaderMaterial(ShaderLibrary['waterNear']);
    }
    else if(conditionLOD === "billboard"){
        waterMaterial = new THREE.ShaderMaterial(ShaderLibrary['waterFar']);
    }
    waterMaterial.uniforms.sunDirection.value = lightPosition.clone().normalize();
    waterMaterial.uniforms.normalSampler.value = waterNormals;
    waterMaterial.uniforms.mirrorSampler.value = skyboxTexture;
    waterMaterial.uniforms.sunColor.value = new THREE.Color(0xffffff);
    waterMaterial.uniforms.waterColor.value = new THREE.Color(0x001e0f);
    waterMaterial.uniforms.distortionScale.value = 500.0;

    this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    this.waterMesh.rotation.x = - Math.PI * 0.5;
    this.waterMesh.position.y = worldScale * worldHeightScale * 0.36;
    this.waterMesh.autoupdate = false;
    this.waterMesh.updateMatrix();
    
    this.add(this.waterMesh);
};

Water.prototype = Object.create( THREE.Object3D.prototype );