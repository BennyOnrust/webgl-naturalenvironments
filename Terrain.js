Terrain = function(worldScale, worldWidth, worldDepth, worldHeightScale, heightData, heightDataInterpolated) {
    THREE.Object3D.call( this );
    
    this.terrainGeometry = this.generateGeometry(worldScale, worldWidth, worldDepth, worldHeightScale, heightData, heightDataInterpolated);
    this.maxHeight = this.calculateMaxHeight(heightData) * worldScale * worldHeightScale;
    this.terrainGeometryLODs = [];
    this.linesLOD = [];
    this.terrainToObjectIDs = [];
    this.terrainBoxes = [];
    
    this.terrainNearLODs = [];
    this.terrainFarLODs = [];
    
    this.terrainNear = new THREE.Object3D();
    this.terrainFar = new THREE.Object3D();
    this.linesNear = new THREE.Object3D();
    this.linesFar = new THREE.Object3D();
    this.add(this.linesNear);
    this.add(this.linesFar);
    this.add(this.terrainNear);
    this.add(this.terrainFar);
};

Terrain.prototype = Object.create( THREE.Object3D.prototype );
    
Terrain.prototype.calculateMaxHeight = function(data) {
        var max = -Infinity; 
        var min = +Infinity;

        for (var i = 0; i < data.length; i++) {
          if (data[i] > max)
            max = data[i];
          if (data[i] < min)
            min = data[i];
        }
        return max; 
    },
    
Terrain.prototype.generateGeometry = function(worldScale, worldWidth, worldDepth, worldHeightScale, heightData, heightDataInterpolated) {
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

Terrain.prototype.generateMaterial = function(grassTexture, mudTexture, thresholdNear, offsetLOD, transitionZone, mudNormal, skyboxTexture, thresholdBillboard, transitionZoneBillboards, offsetLODTerrain, farawayTextureMap, overlayFactor){
    this.materialNear = new THREE.ShaderMaterial( ShaderLibrary['terrainPhongNear']  );
    this.materialFar = new THREE.ShaderMaterial( ShaderLibrary['terrainPhongFar']  );
    
    this.materialNear.uniforms.grassTexture.value = grassTexture;
    this.materialNear.uniforms.mudTexture.value = mudTexture;
    this.materialNear.uniforms.heightScale.value = this.maxHeight;
    this.materialNear.uniforms.threshNear.value = thresholdNear * offsetLOD;
    this.materialNear.uniforms.threshFar.value = thresholdNear * offsetLOD + transitionZone;
    this.materialNear.uniforms.normalMap.value = mudNormal;
    this.materialNear.uniforms.normalScale.value = new THREE.Vector2(1.1,1.1);
    this.materialNear.uniforms.environmentCube.value = skyboxTexture;

    this.materialFar.uniforms.grassTexture.value = grassTexture;
    this.materialFar.uniforms.mudTexture.value = mudTexture;
    this.materialFar.uniforms.heightScale.value = this.maxHeight;
    this.materialFar.uniforms.threshNear.value = thresholdNear * offsetLOD;
    this.materialFar.uniforms.threshFar.value = thresholdNear * offsetLOD + transitionZone;
    this.materialFar.uniforms.threshLODNear.value = thresholdBillboard - transitionZoneBillboards * offsetLODTerrain;
    this.materialFar.uniforms.threshLODFar.value = thresholdBillboard + transitionZoneBillboards * offsetLODTerrain;
    this.materialFar.uniforms.farawayTexture.value = farawayTextureMap;
    this.materialFar.uniforms.normalMap.value = mudNormal;
    this.materialFar.uniforms.normalScale.value = new THREE.Vector2(1.1,1.1);
    this.materialFar.uniforms.environmentCube.value = skyboxTexture;
    this.materialFar.uniforms.overlayFactor.value = overlayFactor;
}

Terrain.prototype.generateMeshesLOD = function(levelsLOD, worldScale){
    var materialLines = new THREE.LineBasicMaterial({ color: "red" });

    for(var l = 0; l < levelsLOD; l++){
        this.terrainNearLODs[l] = [];
        this.terrainFarLODs[l] = [];
        this.linesLOD[l] = [];
        
        for(var i = 0; i < this.terrainGeometryLODs[l].length; i++){
            
            this.linesLOD[l][i] = this.drawLines(this.terrainGeometryLODs[l][i], worldScale, materialLines)
            this.linesNear.add(this.linesLOD[l][i]);
            this.linesFar.add(this.linesLOD[l][i]);
            
            this.terrainNearLODs[l][i] = new THREE.Mesh(this.terrainGeometryLODs[l][i],this.materialNear);
            this.terrainNearLODs[l][i].frustumCulled = false;
            this.terrainNearLODs[l][i].autoupdate = false;
            this.terrainNearLODs[l][i].visible = false;
            this.terrainNearLODs[l][i].updateMatrix();
            this.terrainNearLODs[l][i].castShadow = false;
            this.terrainNearLODs[l][i].receiveShadow = true;
            this.terrainNear.add(this.terrainNearLODs[l][i]);
            
            this.terrainFarLODs[l][i] = new THREE.Mesh(this.terrainGeometryLODs[l][i],this.materialFar);
            this.terrainFarLODs[l][i].frustumCulled = false;
            this.terrainFarLODs[l][i].autoupdate = false;
            this.terrainFarLODs[l][i].visible = false;
            this.terrainFarLODs[l][i].updateMatrix();
            this.terrainFar.add(this.terrainFarLODs[l][i]);
            
            
        }
    }
}

Terrain.prototype.generateLODStructure = function(levelsLOD, worldWidth,worldDepth, worldScale){
    var centerTerrains = [];

    for (var l = 0; l < levelsLOD; l++){
        this.terrainGeometryLODs[l] = [];
        this.linesLOD[l] = [];
        centerTerrains[l] = [];
        this.terrainToObjectIDs[l] = [];
        this.terrainBoxes[l] = [];

        var nParents, parent, nTerrainBlocksWidth, nTerrainBlocksDepth, nWidth, nDepth; 
        if(l === 0){
            nParents = 1;
            nTerrainBlocksWidth = 1;
            nTerrainBlocksDepth = 1;
            parent = this.terrainGeometry;
        }
        else{
            nParents = this.terrainGeometryLODs[l-1].length;
            nTerrainBlocksWidth = 2;
            nTerrainBlocksDepth = 2;
        }
        nWidth = Math.pow(2,l);
        nDepth = Math.pow(2,l);
        var tileSizeX = worldWidth / nWidth;
        var tileSizeY = worldDepth / nDepth;
        var tid = 0;

        for(var q = 0; q < nParents; q++) {
            if(l !== 0){
                parent = this.terrainGeometryLODs[l-1][q];
            }
            var width, depth;
            var parentWidth = Math.ceil(parent.boundingBox.size().x / worldScale);
            var parentDepth = Math.ceil(parent.boundingBox.size().z / worldScale); 

            var totWidth = 0;
            var totDepth = 0;

            var offsetWidth = 0;
            var offsetDepth = 0;
            var tBlockWidth = (parentWidth-1) / nTerrainBlocksWidth;
            var tBlockDepth = (parentDepth-1) / nTerrainBlocksDepth;
            var terrainBlockWidth = Math.floor(tBlockWidth);
            var terrainBlockDepth = Math.floor(tBlockDepth);
            var remainderWidth = (terrainBlockWidth - tBlockWidth) * nTerrainBlocksWidth;
            var remainderDepth = (terrainBlockDepth - tBlockDepth) * nTerrainBlocksDepth;

            var thresholdWidth, thresholdDepth;
            if(remainderWidth > 0){
                thresholdWidth = nTerrainBlocksWidth - remainderWidth;
            }
            else{
                thresholdWidth = nTerrainBlocksWidth - (-1 * remainderWidth);
                offsetWidth = 2;
            }
            thresholdWidth = Math.round(thresholdWidth);

            if(remainderDepth > 0){
                thresholdDepth = nTerrainBlocksDepth - remainderDepth;
            }
            else{
                thresholdDepth = nTerrainBlocksDepth - (-1 * remainderDepth);
                offsetDepth = 2;
            }
            thresholdDepth = Math.round(thresholdDepth);

            for(var i = 0; i < nTerrainBlocksDepth; i++){
                totWidth = 0;
                for(var j = 0; j < nTerrainBlocksWidth; j++){
                    if (i >= thresholdDepth){
                        depth = terrainBlockDepth + offsetDepth;
                    }
                    else{
                        depth = terrainBlockDepth+1;
                    }
                    if(j >= thresholdWidth){
                        width = terrainBlockWidth + offsetWidth;
                    }
                    else{
                        width = terrainBlockWidth+1;
                    }

                    this.terrainGeometryLODs[l][tid] = this.generateTerrainQuad(width,depth,worldScale,totWidth,totDepth,parent);

//                    this.linesLOD[l][tid] = drawLines(this.terrainGeometryLODs[l][tid]);
//                    this.add( this.linesLOD[l][tid] );

                    centerTerrains[l][tid] = new THREE.Vector3();

                    var terrainSize = this.terrainGeometryLODs[l][tid].boundingBox.size();
                    var terrainMinimum = this.terrainGeometryLODs[l][tid].boundingBox.min;
                    centerTerrains[l][tid].x = terrainMinimum.x + (terrainSize.x / 2);
                    centerTerrains[l][tid].z = terrainMinimum.z + (terrainSize.z / 2);
                    this.terrainBoxes[l][tid] = new THREE.Box2();
                    this.terrainBoxes[l][tid].setFromCenterAndSize(new THREE.Vector2(centerTerrains[l][tid].x,centerTerrains[l][tid].z), new THREE.Vector2(terrainSize.x,terrainSize.z));

                    var tMinScaledX = terrainMinimum.x / worldScale;
                    var tMinScaledZ = terrainMinimum.z / worldScale;
                    tMinScaledX += worldWidth/2;
                    tMinScaledZ += worldDepth/2;

                    var nxn = tMinScaledX / tileSizeX;
                    var nyn = tMinScaledZ / tileSizeY;
                    var nx = Math.round(nxn);
                    var ny = Math.round(nyn);

                    this.terrainToObjectIDs[l][tid] = nx + ny * nWidth;

                    totWidth += (width-1);

                    tid++; 
                }
                totDepth += (depth-1);
            }
        }
    }
}

Terrain.prototype.generateTerrainQuad = function(width,depth,worldScale,startWidth,startDepth,parentTerrainQuad){
    var positions = parentTerrainQuad.attributes.position.array;
    var indices = parentTerrainQuad.attributes.index.array;
    var normals = parentTerrainQuad.attributes.normal.array;
    var uvs = parentTerrainQuad.attributes.uv.array;
    var nPlants = parentTerrainQuad.attributes.nPlants.array;
    var tColors = parentTerrainQuad.attributes.tColor.array;
    var tTypes = parentTerrainQuad.attributes.tType.array;

    var parentWidth = Math.ceil(parentTerrainQuad.boundingBox.size().x / worldScale);

    var positions2 = new Float32Array( width * depth * 3 );
    var indices2 = new Uint32Array( (width-1) * (depth-1) * 6 );   
    var normals2 = new Float32Array( width * depth * 3 );
    var uvs2 = new Float32Array( width * depth * 2 );
    var nPlants2 = new Float32Array( width * depth);
    var tColors2 = new Float32Array( width * depth * 3);
    var tTypes2 = new Float32Array( width * depth );

    var index = 0;
    var index2 = 0;
    // should be updated when different planeblocks are created
    var startIndex = startWidth + startDepth * (parentWidth-1);
    var startInd = indices[startIndex*6];
    for(var bd  = 0; bd < depth-1; bd++){
        index = startIndex*6 + bd * (parentWidth-1) * 6;
        for(var bw = 0; bw < width-1; bw++){
            var i0 = indices[index+0];
            var i1 = indices[index+1];
            var i2 = indices[index+2];
            var i3 = indices[index+3];
            var i4 = indices[index+4];
            var i5 = indices[index+5];
            i0 -= bd * (parentWidth - width);
            i1 -= bd * (parentWidth - width);
            i2 -= bd * (parentWidth - width);
            i3 -= bd * (parentWidth - width);
            i4 -= bd * (parentWidth - width);
            i5 -= bd * (parentWidth - width);
            var avgi = (i0 + i2 + i2 + i3 + i4 + i5) / 6;
            var i0n = i0 - startInd - (i0 > avgi) * (parentWidth - width);
            var i1n = i1 - startInd - (i1 > avgi) * (parentWidth - width);
            var i2n = i2 - startInd - (i2 > avgi) * (parentWidth - width);
            var i3n = i3 - startInd - (i3 > avgi) * (parentWidth - width);
            var i4n = i4 - startInd - (i4 > avgi) * (parentWidth - width);
            var i5n = i5 - startInd - (i5 > avgi) * (parentWidth - width);

            indices2[index2+0] = i0n;
            indices2[index2+1] = i1n;
            indices2[index2+2] = i2n;
            index2 += 3;

            indices2[index2+0] = i3n;
            indices2[index2+1] = i4n;
            indices2[index2+2] = i5n;
            index2 += 3;

            index += 6;                                            
        }
    }

    var index1 = 0;
    var index2 = 0;
    var index3 = 0;
    var index4 = 0;
    var index5 = 0;
    var index6 = 0;
    var startIndex = startWidth + startDepth * (parentWidth-0);
    for(var bd  = 0; bd < depth; bd++){
        index1 = startIndex * 3 + bd * (parentWidth-0) * 3;
        index3 = startIndex * 2 + bd * (parentWidth-0) * 2;
        index5 = startIndex * 1 + bd * (parentWidth-0) * 1;
        for(var bw = 0; bw < width; bw++){
            positions2[index2+0] = positions[index1+0];
            positions2[index2+1] = positions[index1+1];
            positions2[index2+2] = positions[index1+2];
            normals2[index2+0] = normals[index1+0];
            normals2[index2+1] = normals[index1+1];
            normals2[index2+2] = normals[index1+2];
            uvs2[index4+0] = uvs[index3+0];
            uvs2[index4+1] = uvs[index3+1];
            nPlants2[index6] = nPlants[index5];
            tColors2[index2+0] = tColors[index1+0];
            tColors2[index2+1] = tColors[index1+1];
            tColors2[index2+2] = tColors[index1+2];
            tTypes2[index6] = tTypes[index5];

            index1 += 3;
            index2 += 3;
            index3 += 2;
            index4 += 2;
            index5 += 1;
            index6 += 1;
        }
    }

    var geometryBlock = new THREE.BufferGeometry();

    geometryBlock.addAttribute( 'index', new THREE.BufferAttribute( indices2, 1 ) );
    geometryBlock.addAttribute( 'position', new THREE.BufferAttribute( positions2, 3 ) );
    geometryBlock.addAttribute( 'normal', new THREE.BufferAttribute( normals2, 3 ) );
    geometryBlock.addAttribute( 'uv', new THREE.BufferAttribute( uvs2, 2 ) );
    geometryBlock.addAttribute( 'nPlants', new THREE.BufferAttribute( nPlants2, 1 ) );
    geometryBlock.addAttribute( 'tColor', new THREE.BufferAttribute( tColors2, 3 ) );
    geometryBlock.addAttribute( 'tType', new THREE.BufferAttribute( tTypes2, 1 ) );

    geometryBlock.computeBoundingSphere();
    geometryBlock.computeBoundingBox();
    var terrainQuad = geometryBlock;
    return terrainQuad;
}

Terrain.prototype.drawLines = function(geometry, worldScale, materialLines){
    //Draw Level of Detail lines
    var meshPositions = geometry.attributes.position.array;
    var size = geometry.boundingBox.size();
    var width = Math.ceil(size.x / worldScale)+0;
    var depth = Math.ceil(size.z / worldScale)+0;

    var geometryLines = new THREE.BufferGeometry();
    var positionsLines = new Float32Array((depth-1.5)*2*3 + (width)*2*3);
    var indexLine = 0;

    for(var i = 0; i < width*3; i+=3){
        positionsLines[indexLine+0] = meshPositions[i + 0];
        positionsLines[indexLine+1] = meshPositions[i + 1] + worldScale * 0.05;
        positionsLines[indexLine+2] = meshPositions[i + 2];
        indexLine += 3;
    }

    var startIndex = (width-1)*3;
    for(var i = 3; i < (depth-1)*3; i+=3){
        positionsLines[indexLine+0] = meshPositions[startIndex+i*width + 0];
        positionsLines[indexLine+1] = meshPositions[startIndex+i*width + 1] + worldScale * 0.05;
        positionsLines[indexLine+2] = meshPositions[startIndex+i*width + 2];
        indexLine += 3;
    }

    startIndex = width*(depth-1)*3;
    for(var i = (width-1)*3; i >= 0; i-=3){
        positionsLines[indexLine+0] = meshPositions[startIndex+i + 0];
        positionsLines[indexLine+1] = meshPositions[startIndex+i + 1] + worldScale * 0.05;
        positionsLines[indexLine+2] = meshPositions[startIndex+i + 2];
        indexLine += 3;
    }

    var startIndex = 0;
    for(var i = (depth-2)*3; i >= 0; i-=3){
        positionsLines[indexLine+0] = meshPositions[startIndex+i*width + 0];
        positionsLines[indexLine+1] = meshPositions[startIndex+i*width + 1] + worldScale * 0.05;
        positionsLines[indexLine+2] = meshPositions[startIndex+i*width + 2];
        indexLine += 3;
    }


    geometryLines.addAttribute( 'position', new THREE.BufferAttribute( positionsLines, 3 ) );
    geometryLines.computeBoundingSphere();

    var lineLOD = new THREE.Line(geometryLines, materialLines);

    lineLOD.frustumCulled = false;
    lineLOD.autoupdate = false;
    lineLOD.visible = false;
    lineLOD.updateMatrix();

    return lineLOD;
}


