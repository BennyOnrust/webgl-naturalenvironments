Terrain = function(worldScale, worldWidth, worldDepth, worldHeightScale, heightData, heightDataInterpolated) {
    THREE.Object3D.call( this );
    
    this.terrainGeometry = this.generateGeometry(worldScale, worldWidth, worldDepth, worldHeightScale, heightData, heightDataInterpolated);
    this.maxHeight = this.calculateMaxHeight(heightData) * worldScale * worldHeightScale;
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


