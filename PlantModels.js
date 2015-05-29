PlantModels = function(plantDistribution, plantTypes, levelsLOD){
    THREE.Object3D.call( this ); 
    this.plantModelBlocks = [];
    var plantPositions = [];
    var plantRotations = [];
    var plantScales = [];
    var plantColors = [];
    for(var i = 0; i < plantTypes.length; i++){
        plantPositions[i] = [];
        plantRotations[i] = [];
        plantScales[i] = [];
        plantColors[i] = [];
    }

    var pt;
    for (var i = 0; i < plantDistribution.totalBlocks; i++){

        for(var t = 0; t < plantTypes.length; t++){
            plantPositions[t][i] = [];
            plantRotations[t][i] = [];
            plantScales[t][i] = [];
            plantColors[t][i] = [];
        }

        for (var j = 0; j < plantDistribution.objectPlantTypeLODs[levelsLOD-1][i].length; j++){
            pt = plantDistribution.objectPlantTypeLODs[levelsLOD-1][i][j];
            for(var t = 0; t < plantTypes.length; t++){
                if(t === pt){
                    plantPositions[t][i].push(plantDistribution.objectPositionLODs[levelsLOD-1][i][j*3 + 0]);
                    plantPositions[t][i].push(plantDistribution.objectPositionLODs[levelsLOD-1][i][j*3 + 1]);
                    plantPositions[t][i].push(plantDistribution.objectPositionLODs[levelsLOD-1][i][j*3 + 2]);
                    plantRotations[t][i].push(plantDistribution.objectRotationLODs[levelsLOD-1][i][j*3 + 0]);
                    plantRotations[t][i].push(plantDistribution.objectRotationLODs[levelsLOD-1][i][j*3 + 1]);
                    plantRotations[t][i].push(plantDistribution.objectRotationLODs[levelsLOD-1][i][j*3 + 2]);
                    plantScales[t][i].push(plantDistribution.objectScaleLODs[levelsLOD-1][i][j*3 + 0]);
                    plantScales[t][i].push(plantDistribution.objectScaleLODs[levelsLOD-1][i][j*3 + 1]);
                    plantScales[t][i].push(plantDistribution.objectScaleLODs[levelsLOD-1][i][j*3 + 2]);
                    plantColors[t][i].push(plantDistribution.objectColorRandomLODs[levelsLOD-1][i][j*3 + 0]);
                    plantColors[t][i].push(plantDistribution.objectColorRandomLODs[levelsLOD-1][i][j*3 + 1]);
                    plantColors[t][i].push(plantDistribution.objectColorRandomLODs[levelsLOD-1][i][j*3 + 2]);
                    break;
                }
            }
        }
    }

    this.plantInstancePositions = [];
    this.plantInstanceRotations = [];
    this.plantInstanceScales = [];
    this.plantInstanceColors = [];

    for(var t = 0; t < plantTypes.length; t++){
        this.plantInstancePositions[t] = [];
        this.plantInstanceRotations[t] = [];
        this.plantInstanceScales[t] = [];
        this.plantInstanceColors[t] = []
        for(var i = 0; i < plantDistribution.totalBlocks; i++){
            this.plantInstancePositions[t][i] = new Float32Array(plantPositions[t][i]);
            this.plantInstanceRotations[t][i] = new Float32Array(plantRotations[t][i]);
            this.plantInstanceScales[t][i] = new Float32Array(plantScales[t][i]);
            this.plantInstanceColors[t][i] = new Float32Array(plantColors[t][i]);
        }
    }
};

PlantModels.prototype = Object.create( THREE.Object3D.prototype );

PlantModels.prototype.generateMaterials = function(plantModelMaterials, thresholdNear, offsetLOD, transitionZone, plantTypes, nTextures){
    var depthMaterial = new THREE.ShaderMaterial(ShaderLibrary['depthRGBA_instancing']);
    depthMaterial._shadowPass = true;
    this.instancingMaterials = [];
    this.instancingDepthMaterials = [];

    var instancingMaterialReference = new THREE.ShaderMaterial( ShaderLibrary['instancingTextureMaterial'] );
    instancingMaterialReference.uniforms.threshNear.value = thresholdNear * offsetLOD;
    instancingMaterialReference.uniforms.threshFar.value = thresholdNear * offsetLOD + transitionZone;
    instancingMaterialReference.side = THREE.DoubleSide;
    for(var t =0; t < plantTypes.length; t++){
        this.instancingMaterials[t] = instancingMaterialReference.clone();
        this.instancingMaterials[t].uniforms.textureMap.value = plantModelMaterials[t];
        this.instancingMaterials[t].uniforms.nTexture.value = nTextures[t];

        this.instancingDepthMaterials[t] = depthMaterial.clone();
        this.instancingDepthMaterials[t].uniforms.textureMap.value = plantModelMaterials[t];
        this.instancingDepthMaterials[t].uniforms.nTexture.value = nTextures[t];
    }
                                
};

PlantModels.prototype.generateMeshes = function(plantTypes, levelsLOD, plantModels, plantDistribution){
    for(var t = 0; t < plantTypes.length; t++){
        this.plantModelBlocks[t] = [];
        for(var j = 0; j < plantDistribution.objectPositionLODs[levelsLOD-1].length; j++){
            var plantModelInstancedGeom = new THREE.BufferGeometry();
            plantModelInstancedGeom.addAttribute( 'position', plantModels[t].geometry.attributes.position);
            plantModelInstancedGeom.addAttribute( 'normal', plantModels[t].geometry.attributes.normal);
            plantModelInstancedGeom.addAttribute( 'uv', plantModels[t].geometry.attributes.uv);
            plantModelInstancedGeom.addAttribute( 'textureIndex', plantModels[t].geometry.attributes.textureIndex );
            plantModelInstancedGeom.addAttribute( 'positionInstances', new THREE.BufferAttribute( this.plantInstancePositions[t][j], 3 ) );
            plantModelInstancedGeom.addAttribute( 'colorInstances', new THREE.BufferAttribute( this.plantInstanceColors[t][j], 3 ) );
            plantModelInstancedGeom.addAttribute( 'colorInstance', new THREE.BufferAttribute( this.plantInstanceColors[t][j], 3 ) );
            plantModelInstancedGeom.addAttribute( 'scaleInstances', new THREE.BufferAttribute( this.plantInstanceScales[t][j], 3 ) );
            plantModelInstancedGeom.addAttribute( 'rotateInstances', new THREE.BufferAttribute( this.plantInstanceRotations[t][j], 3 ) );
            plantModelInstancedGeom.attributes.positionInstances.instancing = true;
            plantModelInstancedGeom.attributes.colorInstances.instancing = true;
            plantModelInstancedGeom.attributes.colorInstance.instancing = true;
            plantModelInstancedGeom.attributes.scaleInstances.instancing = true;
            plantModelInstancedGeom.attributes.rotateInstances.instancing = true;

            this.plantModelBlocks[t][j] = new THREE.Mesh( plantModelInstancedGeom, this.instancingMaterials[t] );
            this.plantModelBlocks[t][j].rotation.x = -Math.PI / 2;
            this.plantModelBlocks[t][j].scale.x *= 1.0;
            this.plantModelBlocks[t][j].scale.y *= 1.0;
            this.plantModelBlocks[t][j].scale.z *= 1.0;
            this.plantModelBlocks[t][j].instancing = true;
            this.plantModelBlocks[t][j].visible = false;
            this.plantModelBlocks[t][j].frustumCulled = false;
            this.plantModelBlocks[t][j].autoupdate = false;
            this.plantModelBlocks[t][j].updateMatrix();
            this.plantModelBlocks[t][j].castShadow = true;
            this.plantModelBlocks[t][j].receiveShadow = true;
            this.plantModelBlocks[t][j].customDepthMaterial = this.instancingDepthMaterials[t];
            this.add(this.plantModelBlocks[t][j]);
        }
    }  
};