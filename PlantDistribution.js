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

    var nBlocksWidth = Math.pow(2,levelsLOD-1);
    var nBlocksDepth = Math.pow(2,levelsLOD-1);

    var blockWidth = worldWidth / nBlocksWidth;
    var blockDepth = worldDepth / nBlocksDepth;

    this.totalBlocks = nBlocksWidth * nBlocksDepth;

    var locationsPerBlock = [];
    for (var i = 0; i < this.totalBlocks; i++){
        locationsPerBlock[i] = [];
    }

    for (var i = 0; i < locations.length-1; i+=3){
        var blockIndex = Math.floor(locations[i+0] / blockWidth) + Math.floor(locations[i+1] / blockDepth) * nBlocksWidth;
        locationsPerBlock[blockIndex].push(i);
    }

    var quads = terrain.quads;
    var geometry = terrain.terrainGeometry;

    for (var i = 0; i < this.totalBlocks; i++){
        var locBlock = locationsPerBlock[i];
        var pos = new Float32Array( locBlock.length * 3 );
        var colors = new Float32Array(locBlock.length * 3);
        var scales = new Float32Array(locBlock.length * 3);
        var rotations = new Float32Array(locBlock.length * 3);
        var color = new THREE.Color();
        var cRandom = new THREE.Color();
        var types = new Float32Array( locBlock.length );
        var billboardPos = new Float32Array( locBlock.length * 3);
        var billboardSize = new Float32Array( locBlock.length );
        var colorRandom = new Float32Array( locBlock.length * 3);
        var billboardTN = new Float32Array( locBlock.length);

        for (var j = 0; j < locBlock.length; j++) {
            var ind = locBlock[j];
            var xpos = locations[ind];
            var zpos = locations[ind+1];
            var ypos = this.calculateHeight(worldWidth, terrain, xpos, zpos);
            
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
          
            var t = locations[ind+2];

            var rScale = Math.random();
            var rColorLight = .8 + rScale * .125; 
            var rColorSpartina = .8 + (Math.random() * .1);
            var rColorArtemisia = .95 + (Math.random() * .05);
            var rColorElymus = .9 + (Math.random() * .1);
            var rColor = .5 + (Math.random() / 2.0);
            var rColorLimonium = .9 + (Math.random() * (1 - 0.8));
            var rColorAtriplex =.9 + Math.random() * .02;
            if ( t === 1){
                color.setRGB(0,1,0);
                cRandom.setRGB(rColorElymus*rColorLight,1.0*rColorLight,rColorElymus*rColorLight);
            }
            else if ( t === 2){
                color.setRGB(1,1,0);
                cRandom.setRGB(rColorSpartina*rColorLight,1.0*rColorLight,rColorSpartina*rColorLight);
            }
            else if ( t === 3){
                color.setRGB(1,0,0);
                cRandom.setRGB(rColorAtriplex*rColorLight,1.0*rColorLight,rColorAtriplex*rColorLight);
            }
            else if ( t === 4){
                color.setRGB(0,0,1);
                cRandom.setRGB(1.0,1.0,1.0);
            }
            else if ( t === 5){
                color.setRGB(0,1,1);
                cRandom.setRGB(rColorLimonium*rColorLight,rColorLimonium*rColorLight,1.0*rColorLight);
            }
            else if ( t === 6){
                color.setRGB(1,0,1);
                cRandom.setRGB(rColorArtemisia*rColorLight,1.0*rColorLight,rColorArtemisia*rColorLight);
            }
            else if ( t === 7){
                color.setRGB(1,1,1);
                cRandom.setRGB(rColor,1.0,rColor);
            }
            billboardSize[j] = plantBillboardSizes[t-1] + rScale * plantModelSizes[t-1] * 1.0;
            billboardSize[j] *= billboardSizeMultiplier;

            colors[j * 3 + 0] = color.r;
            colors[j * 3 + 1] = color.g;
            colors[j * 3 + 2] = color.b;

            colorRandom[j*3 + 0] = cRandom.r;
            colorRandom[j*3 + 1] = cRandom.g;
            colorRandom[j*3 + 2] = cRandom.b;

            scales[j * 3 + 0] = plantModelSizes[t-1] + rScale * plantModelSizes[t-1];
            scales[j * 3 + 1] = plantModelSizes[t-1] + rScale * plantModelSizes[t-1];
            scales[j * 3 + 2] = plantModelSizes[t-1] + rScale * plantModelSizes[t-1];

            var rRotate = Math.random() * Math.PI * 2;
            rotations[j * 3 + 0] = 0;
            rotations[j * 3 + 1] = rRotate;
            rotations[j * 3 + 2] = 0;

            types[j] = t-1;

            pos[ j * 3 + 0 ] = (xpos - worldWidth/2) * worldScale;
            pos[ j * 3 + 1 ] = ypos + scales[j * 3 + 1] * .0; //I only take into account the random scales but not the initial scale of each plant (for cubes I do)
            pos[ j * 3 + 2 ] = (zpos - worldDepth/2) * worldScale;
            var rotMat = new THREE.Matrix4();
            var scaleMat = new THREE.Matrix4();
            var transMat = new THREE.Matrix4();

            rotMat.set(Math.cos(rRotate), 0.0, -1.0*Math.sin(rRotate), 0.0, 0.0, 1.0, 0.0, 0.0, Math.sin(rRotate), 0.0, Math.cos(rRotate), 0.0, 0.0, 0.0, 0.0, 1.0);
            scaleMat.set(scales[j * 3 + 0], 0.0, 0.0, 0.0, 0.0, scales[j * 3 + 1], 0.0, 0.0, 0.0, 0.0, scales[j * 3 + 2], 0.0, 0.0, 0.0, 0.0, 1.0);
            transMat.set(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,  pos[ j * 3 + 0 ],  pos[ j * 3 + 1 ],  pos[ j * 3 + 2 ], 1.0);
            var tm = new THREE.Matrix4();
            tm.multiply(transMat);
            tm.multiply(rotMat);
            tm.multiply(scaleMat);

            billboardPos[j*3 + 0] = (xpos - worldWidth/2) * worldScale;
            billboardPos[j*3 + 1] = ypos+ Math.sqrt(billboardSize[j]*.5) * .024;
            billboardPos[j*3 + 2] = (zpos - worldDepth/2) * worldScale;

            billboardTN[j] = Math.floor(Math.random() * 4);

            var vi;
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
    geometry.addAttribute( 'nPlants', new THREE.BufferAttribute( terrainPlants, 1 ));
    geometry.addAttribute( 'tColor', new THREE.BufferAttribute( terrainColors, 3 ));
    geometry.addAttribute( 'tType', new THREE.BufferAttribute( terrainTypes, 1 ));
    
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
    
PlantDistribution.prototype.generateGeometry = function(worldScale, worldWidth, worldDepth, worldHeightScale, heightData, heightDataInterpolated) {
        this.quads = [];
        var quadIndex = 0;
        var width = worldScale * worldWidth; 
        var height = worldScale * worldDepth;
        var widthSegments = worldWidth-1; 
        var heightSegments = worldDepth-1;
        var geometry = new THREE.BufferGeometry();

        var width_half = worldScale*(worldWidth/2);
        var height_half = worldScale*(worldDepth/2);

        var gridX = widthSegments || 1;
        var gridY = heightSegments || 1;

        var gridX1 = gridX + 1;
        var gridY1 = gridY + 1;

        var segment_width = width / gridX;
        var segment_height = height / gridY;

        var vertices = new Float32Array( gridX1 * gridY1 * 3 );
        var normals = new Float32Array( gridX1 * gridY1 * 3 );
        var uvs = new Float32Array( gridX1 * gridY1 * 2 );

        var offset = 0;
        var offset2 = 0;
        var index = 0;
        for ( var iy = 0; iy < gridY1; iy ++ ) {
                var y = iy * segment_height - height_half;
                for ( var ix = 0; ix < gridX1; ix ++ ) {
                        var x = ix * segment_width - width_half;

                        index = offset / 3;
                        vertices[ offset     ] = x;
                        vertices[ offset + 1 ] = - y;
                        vertices[ offset + 2 ] = heightData[index] * worldScale * worldHeightScale;

                        normals[ offset + 2 ] = 1;

                        uvs[ offset2     ] = ix / gridX;
                        uvs[ offset2 + 1 ] = 1 - ( iy / gridY );

                        offset += 3;
                        offset2 += 2;
                }
        }

        offset = 0;
        offset2 = 0;

        var indices = new Uint32Array( gridX * gridY * 6 );

        for ( var iy = 0, iy2 = 1; iy < gridY; iy ++, iy2 += 2 ) {
                offset2 += iy2 * gridX1*2;

                for ( var ix = 0, ix2 = 1; ix < gridX; ix ++, ix2 += 2 ) {
                        var s = heightDataInterpolated[offset2+ix2];

                        var a = (ix + gridX1 * iy);
                        var b = (ix + gridX1 * ( iy + 1 ));
                        var c = (( ix + 1 ) + gridX1 * ( iy + 1 ));
                        var d = (( ix + 1 ) + gridX1 * iy);
                        var ph1 = (heightData[a]+heightData[c]) / 2;
                        var ph2 = (heightData[b]+heightData[d]) / 2;

                        var diff1 = Math.abs(ph1 - s);
                        var diff2 = Math.abs(ph2 - s);

                        if (diff1 > diff2){
                            this.quads[quadIndex] = 1;
                            indices[ offset     ] = a; // left bot
                            indices[ offset + 1 ] = b; // left top
                            indices[ offset + 2 ] = d; // right bot

                            indices[ offset + 3 ] = b; //left top
                            indices[ offset + 4 ] = c; //right top
                            indices[ offset + 5 ] = d; //right bot 
                        }
                        else{
                            this.quads[quadIndex] = 0;
                            indices[ offset     ] = a;
                            indices[ offset + 1 ] = c;
                            indices[ offset + 2 ] = d;

                            indices[ offset + 3 ] = a;
                            indices[ offset + 4 ] = b;
                            indices[ offset + 5 ] = c;
                        }

                        offset += 6;
                        quadIndex++;

                }

        }
        geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
        geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
        geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

        geometry.computeVertexNormals();
        geometry.computeTangents();
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        
        return geometry;
};