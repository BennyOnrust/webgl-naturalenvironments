PlantDistribution = function(worldScale, worldWidth, worldDepth, plantTypes, levelsLOD, locations, terrain, plantModelSizes, plantBillboardSizes, billboardSizeMultiplier, offsetDist) {    
    this.objectPositions = [];
    this.objectColors = [];
    this.objectScales = [];
    this.objectRotations = [];
    this.objectPlantType = [];
    this.billboardPositions = [];
    this.billboardSizes = [];
    this.billboardTextureNumber = [];
    this.objectColorRandom = [];
    
    this.plantPositions = [];
    this.plantScales = [];
    this.plantColorVariations = [];
    this.plantRotations = [];
    
    for(var i = 0; i < locations.length-1; i+=3){
        var xpos = locations[i];
        var zpos = locations[i+1];
        var ypos = this.calculateHeight(worldWidth, terrain, xpos, zpos);
        
        var plantType = locations[i+2];

        var rScale = Math.random();
        var rRotate = Math.random() * Math.PI * 2;
        var colorVariation = this.calculateColorVariation(plantType, rScale);
        
        this.plantPositions[i+0] = (xpos - worldWidth/2) * worldScale;
        this.plantPositions[i+1] = ypos;
        this.plantPositions[i+2] = (zpos - worldDepth/2) * worldScale;
        
        this.plantScales[i+0] = rScale;
        this.plantScales[i+1] = rScale;
        this.plantScales[i+2] = rScale;
        
        this.plantColorVariations[i+0] = colorVariation.r;
        this.plantColorVariations[i+1] = colorVariation.g;
        this.plantColorVariations[i+2] = colorVariation.b;
        
        this.plantRotations[i+0] = 0;
        this.plantRotations[i+1] = rRotate;
        this.plantRotations[i+2] = 0;
    }
    this.createLocationQuads(worldWidth, worldDepth, levelsLOD, locations);
    
    for (var i = 0; i < this.locationsPerBlock.length; i++){
        var locBlock = this.locationsPerBlock[i];
        var pos = new Float32Array( locBlock.length * 3 );
        var colors = new Float32Array(locBlock.length * 3);
        var scales = new Float32Array(locBlock.length * 3);
        var rotations = new Float32Array(locBlock.length * 3);
        var color = new THREE.Color();
        var types = new Float32Array( locBlock.length );
        var billboardPos = new Float32Array( locBlock.length * 3);
        var billboardSize = new Float32Array( locBlock.length );
        var colorRandom = new Float32Array( locBlock.length * 3);
        var billboardTN = new Float32Array( locBlock.length);

        for (var j = 0; j < locBlock.length; j++) {
            var ind = locBlock[j];
          
            var t = locations[ind+2];

            if ( t === 1){
                color.setRGB(0,1,0);
            }
            else if ( t === 2){
                color.setRGB(1,1,0);
            }
            else if ( t === 3){
                color.setRGB(1,0,0);
            }
            else if ( t === 4){
                color.setRGB(0,0,1);
            }
            else if ( t === 5){
                color.setRGB(0,1,1);
            }
            else if ( t === 6){
                color.setRGB(1,0,1);
            }
            else if ( t === 7){
                color.setRGB(1,1,1);
            }
            var pScale = this.plantScales[ind];
            
            billboardSize[j] = plantBillboardSizes[t-1] + pScale * plantModelSizes[t-1];
            billboardSize[j] *= billboardSizeMultiplier;

            colors[j * 3 + 0] = color.r;
            colors[j * 3 + 1] = color.g;
            colors[j * 3 + 2] = color.b;

            colorRandom[j*3 + 0] = this.plantColorVariations[ind+0];
            colorRandom[j*3 + 1] = this.plantColorVariations[ind+1];
            colorRandom[j*3 + 2] = this.plantColorVariations[ind+2];

            scales[j * 3 + 0] = plantModelSizes[t-1] + pScale * plantModelSizes[t-1];
            scales[j * 3 + 1] = plantModelSizes[t-1] + pScale * plantModelSizes[t-1];
            scales[j * 3 + 2] = plantModelSizes[t-1] + pScale * plantModelSizes[t-1];

            rotations[j * 3 + 0] = this.plantRotations[ind+0];
            rotations[j * 3 + 1] = this.plantRotations[ind+1];
            rotations[j * 3 + 2] = this.plantRotations[ind+2];

            types[j] = t-1;

            pos[ j * 3 + 0 ] = this.plantPositions[ind+0];
            pos[ j * 3 + 1 ] = this.plantPositions[ind+1]
            pos[ j * 3 + 2 ] = this.plantPositions[ind+2];
//            var rotMat = new THREE.Matrix4();
//            var scaleMat = new THREE.Matrix4();
//            var transMat = new THREE.Matrix4();
//
//            rotMat.set(Math.cos(rRotate), 0.0, -1.0*Math.sin(rRotate), 0.0, 0.0, 1.0, 0.0, 0.0, Math.sin(rRotate), 0.0, Math.cos(rRotate), 0.0, 0.0, 0.0, 0.0, 1.0);
//            scaleMat.set(scales[j * 3 + 0], 0.0, 0.0, 0.0, 0.0, scales[j * 3 + 1], 0.0, 0.0, 0.0, 0.0, scales[j * 3 + 2], 0.0, 0.0, 0.0, 0.0, 1.0);
//            transMat.set(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,  pos[ j * 3 + 0 ],  pos[ j * 3 + 1 ],  pos[ j * 3 + 2 ], 1.0);
//            var tm = new THREE.Matrix4();
//            tm.multiply(transMat);
//            tm.multiply(rotMat);
//            tm.multiply(scaleMat);

            billboardPos[j*3 + 0] = this.plantPositions[ind+0];
            billboardPos[j*3 + 1] = this.plantPositions[ind+1] + Math.sqrt(billboardSize[j]*.5) * .024;
            billboardPos[j*3 + 2] = this.plantPositions[ind+2];

            billboardTN[j] = Math.floor(Math.random() * 4);
        }
        this.objectColors[i] = colors;
        this.objectPositions[i] = pos;
        this.objectScales[i] = scales;
        this.objectRotations[i] = rotations;
        this.objectPlantType[i] = types;
        this.billboardPositions[i] = billboardPos;
        this.billboardSizes[i] = billboardSize;
        this.objectColorRandom[i] = colorRandom;
        this.billboardTextureNumber[i] = billboardTN;
    }
    this.updateTerrainInformation(worldWidth, worldDepth, worldScale, offsetDist, plantTypes, locations, terrain);
};

PlantDistribution.prototype = Object.create( THREE.Object3D.prototype );
    
PlantDistribution.prototype.calculateHeight = function(worldWidth, terrain, xpos, zpos) {
    var xf = Math.floor(xpos);
    var xc = Math.ceil(xpos);
    var zf = Math.floor(zpos);
    var zc = Math.ceil(zpos);

    var iBotLeft = (xf + zf * (worldWidth)) * 3 + 1;
    var iBotRight = (xc + zf * (worldWidth)) * 3 + 1;
    var iTopRight = (xc + zc * (worldWidth)) * 3 + 1;
    var iTopLeft = (xf + zc * (worldWidth)) * 3 + 1;
    var quadIndex = xf + zf * (worldWidth);

    var ypos = 0;
    var h1 = 0;
    var h2 = 0;
    var h3 = 0;
    var h4 = 0;
    var hxBot = 0;
    var hxTop = 0;
    var hyLeft = 0;
    var hyRight = 0;
    var heights = [];
    var vertices = terrain.terrainGeometry.attributes.position.array;
    var quads = terrain.quads;
    // X bottom
    if(iBotLeft < vertices.length && iBotRight < vertices.length){
        h1 = vertices[iBotLeft];
        h2 = vertices[iBotRight];
        hxBot = h1 + (h2 - h1) * (xpos - xf);
        heights[0] = hxBot;
    }
    if(iBotLeft < vertices.length && iTopLeft < vertices.length){
        h1 = vertices[iBotLeft];
        h4 = vertices[iTopLeft];
        hyLeft = h1 + (h4 - h1) * (zpos - zf);
        heights[1] = hyLeft;
    }
    if(iTopRight < vertices.length && iBotRight < vertices.length){
        h2 = vertices[iBotRight];
        h3 = vertices[iTopRight];
        hyRight = h2 + (h3 - h2) * (zpos - zf);
        heights[2] = hyRight;
    }
    if(iTopRight < vertices.length && iTopLeft < vertices.length){
        h3 = vertices[iTopRight];
        h4 = vertices[iTopLeft];
        hxTop = h4 + (h3 - h4) * (xpos - xf);
        heights[3] = hxTop;
    }

    var distA = distance(xpos,zpos,xf,zf);
    var distB = distance(xpos,zpos,xf,zc);
    var distC = distance(xpos,zpos,xc,zc);
    var distD = distance(xpos,zpos,xc,zf);
    var avgDist1, avgDist2;
    var xdist, zdist, tdist;
    if(quads[quadIndex] === 1){
        avgDist1 = distA + distB + distD;
        avgDist2 = distB + distC + distD;
        if(avgDist1 < avgDist2){
            xdist = distance(xpos,zpos,xpos,zf);
            zdist = distance(xpos,zpos,xf,zpos);
            tdist = xdist+zdist;
            ypos = (zdist / tdist) * heights[1] + (xdist / tdist) * heights[0];
        }
        else{
            xdist = distance(xpos,zpos,xpos,zf);
            zdist = distance(xpos,zpos,xc,zpos);
            tdist = xdist+zdist;
            ypos = (xdist / tdist) * heights[3] + (zdist / tdist) * heights[2];
        }
    }
    else{
        avgDist1 = distA + distB + distC;
        avgDist2 = distA + distC + distD;
        if(avgDist1 < avgDist2){
            xdist = distance(xpos,zpos,xpos,zf);
            zdist = distance(xpos,zpos,xf,zpos);
            tdist = xdist+zdist;
            ypos = (zdist / tdist) * heights[1] + (xdist / tdist) * heights[3];
        }
        else{
            xdist = distance(xpos,zpos,xpos,zf);
            zdist = distance(xpos,zpos,xc,zpos);
            tdist = xdist+zdist;
            ypos = (xdist / tdist) * heights[0] + (zdist / tdist) * heights[2];
        }
    }
    
    return ypos;
},
    
PlantDistribution.prototype.calculateColorVariation = function(plantType, rScale) {
    var rColorLight = .8 + rScale * .125; 
    var rColorSpartina = .8 + (Math.random() * .1);
    var rColorArtemisia = .95 + (Math.random() * .05);
    var rColorElymus = .9 + (Math.random() * .1);
    var rColorLimonium = .9 + (Math.random() * 0.3);
    var rColorAtriplex =.9 + Math.random() * .02;
    var cRandom = new THREE.Color();
    if ( plantType === 1){
        cRandom.setRGB(rColorElymus*rColorLight,1.0*rColorLight,rColorElymus*rColorLight);
    }
    else if ( plantType === 2){
        cRandom.setRGB(rColorSpartina*rColorLight,1.0*rColorLight,rColorSpartina*rColorLight);
    }
    else if ( plantType === 3){
        cRandom.setRGB(rColorAtriplex*rColorLight,1.0*rColorLight,rColorAtriplex*rColorLight);
    }
    else if ( plantType === 4){
        cRandom.setRGB(1.0,1.0,1.0);
    }
    else if ( plantType === 5){
        cRandom.setRGB(rColorLimonium*rColorLight,rColorLimonium*rColorLight,1.0*rColorLight);
    }
    else if ( plantType === 6){
        cRandom.setRGB(rColorArtemisia*rColorLight,1.0*rColorLight,rColorArtemisia*rColorLight);
    }
    else if ( plantType === 7){
        cRandom.setRGB(1.0,1.0,1.0);
    }

    return cRandom;
};

PlantDistribution.prototype.updateTerrainInformation = function(worldWidth, worldDepth, worldScale, offsetDist, plantTypes, locations, terrain) {
    var terrainColors = new Float32Array(worldWidth*worldDepth * 3);
    var terrainPlants = new Float32Array(worldWidth*worldDepth * 1);
    var terrainTypes = new Float32Array(worldWidth*worldDepth * 1);
    var terrainTempTypes = [];
    var terrainTempColors = [];

    for(var i = 0; i < worldWidth*worldDepth; i++){
        terrainPlants[i] = 0;
        terrainColors[i] = new THREE.Color(0,0,0);
        terrainTypes[i] = 0;
        terrainTempTypes[i] = [];
        terrainTempColors[i] = [];
        for (var j = 0; j < plantTypes.length; j++){
            terrainTempTypes[i][j] = 0.0;
            terrainTempColors[i][j] = new THREE.Color(0,0,0);
        }
    }
    
    for (var i = 0; i < locations.length-1; i+=3) {
        var xpos = locations[i];
        var zpos = locations[i+1];

        var xf = Math.floor(xpos);
        var xc = Math.ceil(xpos);
        var zf = Math.floor(zpos);
        var zc = Math.ceil(zpos);

        var iBotLeft = (xf + zf * (worldWidth)) * 3 + 1;
        var iBotRight = (xc + zf * (worldWidth)) * 3 + 1;
        var iTopRight = (xc + zc * (worldWidth)) * 3 + 1;
        var iTopLeft = (xf + zc * (worldWidth)) * 3 + 1;

        var distA = distance(xpos,zpos,xf,zf);
        var distB = distance(xpos,zpos,xf,zc);
        var distC = distance(xpos,zpos,xc,zc);
        var distD = distance(xpos,zpos,xc,zf);

        var t = locations[i+2];
        
        var vi;
        var cRandom = new THREE.Color(this.plantColorVariations[i+0],this.plantColorVariations[i+1],this.plantColorVariations[i+2]);
        if(t !== 7 && t !== 4 && t!== 5){
            if(distA < worldScale * offsetDist){
                vi = (iBotLeft - 1) / 3;
                if(vi < worldWidth*worldDepth){
                    terrainTempColors[vi][t-1].add(cRandom);
                    terrainPlants[vi] += 1;
                    terrainTempTypes[vi][t-1] += 1.0;
                }
            }
            if(distB < worldScale * offsetDist){
                vi = (iTopLeft - 1) / 3;
                if(vi < worldWidth*worldDepth){
                    terrainTempColors[vi][t-1].add(cRandom);
                    terrainPlants[vi] += 1;
                    terrainTempTypes[vi][t-1] += 1.0;
                }
            }
            if(distC < worldScale * offsetDist){
                vi = (iTopRight - 1) / 3;
                if(vi < worldWidth*worldDepth){
                    terrainTempColors[vi][t-1].add(cRandom);
                    terrainPlants[vi] += 1;
                    terrainTempTypes[vi][t-1] += 1.0;
                }
            }
            if(distD < worldScale * offsetDist){
                vi = (iBotRight - 1) / 3;
                if(vi < worldWidth*worldDepth){
                    terrainTempColors[vi][t-1].add(cRandom);
                    terrainPlants[vi] += 1;
                    terrainTempTypes[vi][t-1] += 1.0;
                }
            }
        }
    }
    for(var i = 0; i < worldWidth*worldDepth; i++){
        terrainTypes[i] = 0;

        var max = -Infinity;
        var maxIndex = 0;
        var modifiers = [3.5, 3.5, 3.5, 1.0, 1.0, 1.0, 1.0];
        for (var j = 0; j < terrainTempTypes[i].length; j++) {
            if ((terrainTempTypes[i][j]*modifiers[j]) > max){
                max = terrainTempTypes[i][j]*modifiers[j];
                maxIndex = j;
            }
        }
        terrainTypes[i] = maxIndex;
        if(terrainTempTypes[i][maxIndex] > 0.0){
            terrainTempColors[i][maxIndex].r /= terrainTempTypes[i][maxIndex];
            terrainTempColors[i][maxIndex].g /= terrainTempTypes[i][maxIndex];
            terrainTempColors[i][maxIndex].b /= terrainTempTypes[i][maxIndex];
            terrainColors[i*3 + 0] = terrainTempColors[i][maxIndex].r;
            terrainColors[i*3 + 1] = terrainTempColors[i][maxIndex].g;
            terrainColors[i*3 + 2] = terrainTempColors[i][maxIndex].b;
        }
        else{
            terrainColors[i*3 + 0] = 1.0;
            terrainColors[i*3 + 1] = 1.0;
            terrainColors[i*3 + 2] = 1.0;
        }
    }
    terrain.terrainGeometry.addAttribute( 'nPlants', new THREE.BufferAttribute( terrainPlants, 1 ));
    terrain.terrainGeometry.addAttribute( 'tColor', new THREE.BufferAttribute( terrainColors, 3 ));
    terrain.terrainGeometry.addAttribute( 'tType', new THREE.BufferAttribute( terrainTypes, 1 ));
    
};

PlantDistribution.prototype.createLocationQuads = function(worldWidth, worldDepth, levelsLOD, locations) {
    var nBlocksWidth = Math.pow(2,levelsLOD-1);
    var nBlocksDepth = Math.pow(2,levelsLOD-1);

    var blockWidth = worldWidth / nBlocksWidth;
    var blockDepth = worldDepth / nBlocksDepth;

    this.totalBlocks = nBlocksWidth * nBlocksDepth;

    this.locationsPerBlock = [];
    for (var i = 0; i < this.totalBlocks; i++){
        this.locationsPerBlock[i] = [];
    }

    for (var i = 0; i < locations.length-1; i+=3){
        var blockIndex = Math.floor(locations[i+0] / blockWidth) + Math.floor(locations[i+1] / blockDepth) * nBlocksWidth;
        this.locationsPerBlock[blockIndex].push(i);
    }
};