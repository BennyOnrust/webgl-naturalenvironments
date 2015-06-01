CubeDistribution = function(plantDistribution, levelsLOD,thresholdNear,offsetLOD, transitionZone){
    THREE.Object3D.call( this );
    
    var geo = new THREE.BoxGeometry(.33,.33,.33,1,1,1);
    geo.computeVertexNormals();
    var cubeGeo = new THREE.BufferGeometry().fromGeometry(geo);
    this.objects = [];
    for(var i = 0; i < plantDistribution.objectPositionLODs[levelsLOD-1].length; i++){
        var objectInstancedGeom = new THREE.BufferGeometry();
        objectInstancedGeom.addAttribute('position',cubeGeo.attributes.position);
        objectInstancedGeom.addAttribute('normal',cubeGeo.attributes.normal);
        objectInstancedGeom.addAttribute('uv',cubeGeo.attributes.uv);
        objectInstancedGeom.addAttribute( 'positionInstances', new THREE.BufferAttribute( plantDistribution.objectPositionLODs[levelsLOD-1][i], 3 ) );
        objectInstancedGeom.addAttribute( 'colorInstances', new THREE.BufferAttribute( plantDistribution.objectColorLODs[levelsLOD-1][i], 3 ) );
        objectInstancedGeom.addAttribute( 'scaleInstances', new THREE.BufferAttribute( plantDistribution.objectScaleLODs[levelsLOD-1][i], 3 ) );
        objectInstancedGeom.addAttribute( 'rotateInstances', new THREE.BufferAttribute( plantDistribution.objectRotationLODs[levelsLOD-1][i], 3 ) );
        objectInstancedGeom.attributes.positionInstances.instancing = true;
        objectInstancedGeom.attributes.colorInstances.instancing = true;
        objectInstancedGeom.attributes.scaleInstances.instancing = true;
        objectInstancedGeom.attributes.rotateInstances.instancing = true;

        this.instancingMaterialReference = new THREE.ShaderMaterial( ShaderLibrary['instancingColorMaterial'] );
        this.instancingMaterialReference.vertexColors = THREE.VertexColors;
        this.instancingMaterialReference.uniforms.threshNear.value = thresholdNear * offsetLOD;
        this.instancingMaterialReference.uniforms.threshFar.value = thresholdNear * offsetLOD + transitionZone;
        this.instancingMaterialReference.side = THREE.DoubleSide;

        this.objects[i] = new THREE.Mesh( objectInstancedGeom, this.instancingMaterialReference );
        this.objects[i].scale.x *= 2.0;
        this.objects[i].scale.y *= 2.0;
        this.objects[i].scale.z *= 2.0;
        this.objects[i].instancing = true;
        this.objects[i].visible = false;
        this.objects[i].frustumCulled = false;
        this.objects[i].autoupdate = false;
        this.objects[i].updateMatrix();
        this.objects[i].castShadow = true;
        this.objects[i].receiveShadow = true;
        this.add(this.objects[i]);
    }
};

CubeDistribution.prototype = Object.create( THREE.Object3D.prototype );


