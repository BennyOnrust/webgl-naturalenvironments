Dike = function(worldScale, worldHeightScale, dikeModel, dikeTexture){
    THREE.Object3D.call( this );    
    dikeModel.scale.x *= 1.0;
    dikeModel.scale.y *= worldHeightScale * 0.9;
    dikeModel.scale.z *= 1.0;

    dikeModel.position.y -= worldScale*1.5;
    dikeModel.position.x += 33 * worldScale;
    dikeModel.position.z -= 10 * worldScale;

    dikeModel.autoupdate = false;
    dikeModel.updateMatrix();

    dikeModel.geometry.computeBoundingBox();

    dikeModel.material.uniforms.stoneTexture.value = dikeTexture;
    this.add(dikeModel);
};

Dike.prototype = Object.create( THREE.Object3D.prototype );