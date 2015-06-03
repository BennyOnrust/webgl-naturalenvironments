BillboardDistribution = function(billboardTextureMap,thresholdNear,offsetLOD, transitionZone, thresholdBillboard, transitionZoneBillboards, overlayFactor, plantDistribution, levelsLOD, nPlantTextures){
    THREE.Object3D.call( this );
    
    this.billboardMaterial = new THREE.ShaderMaterial(ShaderLibrary['billboard']);
                                                                                                
    this.billboards = [];

    this.billboardMaterial.uniforms.billboardTextureAtlas.value = billboardTextureMap;
    this.billboardMaterial.uniforms.threshNear.value = thresholdNear * offsetLOD;
    this.billboardMaterial.uniforms.threshFar.value = thresholdNear * offsetLOD + transitionZone;
    this.billboardMaterial.uniforms.threshLODNear.value = thresholdBillboard;
    this.billboardMaterial.uniforms.threshLODFar.value = thresholdBillboard + transitionZoneBillboards;
    this.billboardMaterial.sizeAttenuation = true;
    this.billboardMaterial.uniforms.nTypes.value = 3;
    this.billboardMaterial.uniforms.overlayFactor.value = overlayFactor;
    this.billboardMaterial.uniforms.nPlantTextures.value = nPlantTextures;
    for( var l = 0; l < levelsLOD; l++){
        this.billboards[l] = [];
        for(var i = 0; i < plantDistribution.objectPositionLODs[l].length; i++){
            var billboardGeometry = new THREE.BufferGeometry();
            billboardGeometry.addAttribute( 'position', new THREE.BufferAttribute( plantDistribution.billboardPositionLODs[l][i], 3 ) );
            billboardGeometry.addAttribute( 'colorInstance', new THREE.BufferAttribute( plantDistribution.objectColorRandomLODs[l][i], 3 ) );
            billboardGeometry.addAttribute( 'plantType', new THREE.BufferAttribute( plantDistribution.objectPlantTypeLODs[l][i], 1 ) );
            billboardGeometry.addAttribute( 'size', new THREE.BufferAttribute( plantDistribution.billboardSizeLODs[l][i], 1 ) );
            billboardGeometry.addAttribute( 'textureNumber', new THREE.BufferAttribute( plantDistribution.billboardTextureNumberLODs[l][i], 1 ) );
            this.billboards[l][i] = new THREE.PointCloud( billboardGeometry, this.billboardMaterial );
            this.billboards[l][i].frustumCulled = false;
            this.billboards[l][i].autoupdate = false;
            this.billboards[l][i].updateMatrix();
            this.billboards[l][i].visible = false;
            this.add(this.billboards[l][i]);
        }
    }
};

BillboardDistribution.prototype = Object.create( THREE.Object3D.prototype );