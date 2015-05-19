ShaderLibrary = {
    'terrainPhongNear': {
        uniforms: 
            THREE.UniformsUtils.merge([
                THREE.UniformsLib[ "common" ],
                THREE.UniformsLib[ "lights" ],
                THREE.UniformsLib[ "shadowmap" ],

                {
                        "ambient"       : { type: "c", value: new THREE.Color( 0xffffff ) },
                        "emissive"      : { type: "c", value: new THREE.Color( 0x000000 ) },
                        "specular"      : { type: "c", value: new THREE.Color( 0x111111 ) },
                        "shininess"     : { type: "f", value: 20.0 },
                        "wrapRGB"       : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                        "heightScale"   : { type: "f", value: 0   },
                        "mudTexture"    : { type: "t", value: null    },
                        "grassTexture"  : { type: "t", value: null    },
                        "threshNear" : { type: "f", value: 1.0 },
                        "threshFar" : { type: "f", value: 1.0 },
                        "threshLODNear" : {type: "f", value: 1.0},
                        "threshLODFar" : {type: "f", value: 1.0},
                        "normalMap" : {type: "t", value: null},
                        "normalScale" : {type: "v2", value: new THREE.Vector2( 1, 1 )},
                        "environmentCube": { type: "t", value: null },
                        "mRefractionRatio": { type: "f", value: 1.02 },
                        "mFresnelBias": { type: "f", value: 0.01 },
                        "mFresnelPower": { type: "f", value: 2.0 },
                        "mFresnelScale": { type: "f", value: 0.01 },
                }
            ]),
        attributes: {
            "nPlants" : {type: "f", value: 0 },
        },
        vertexShader:  [
            "#define PHONG",
            "uniform float heightScale;",
            "uniform float threshNear;",
            "uniform float threshFar;",
            
            "attribute float nPlants;",
            
            "varying vec4 packedInformation;",

            "varying vec3 vViewPosition;",
            "varying vec3 vNormal;",
            "varying vec2 vUv;",

            "varying vec4 vShadowCoord[ MAX_SHADOWS ];",	
            "uniform mat4 shadowMatrix[ MAX_SHADOWS ];",

            "void main() {",
            
            "       float dist = distance(cameraPosition.xz,position.xz);",
            "       float thresh = threshFar - threshNear;",
            "       float newDist = dist - threshNear;",
            "       packedInformation.y = dist;",
            "       packedInformation.z = 1.0 - (newDist / thresh);",
            "       packedInformation.w = clamp(nPlants / 4.0, 0.0, 1.0);",
        
            "       vec3 objectNormal = normal;",
            "       vec3 transformedNormal = normalMatrix * objectNormal;",
            "       vNormal = normalize( transformedNormal );",
            "       vUv = uv * 16.0;",
            
            "       vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "       gl_Position = projectionMatrix * mvPosition;",

            "       vViewPosition = -mvPosition.xyz;",
            "       packedInformation.x = position.y / heightScale;",

            "       vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            "       for( int i = 0; i < MAX_SHADOWS; i ++ ) {",
            "           vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;",
            "       }",


            "}"

        ].join("\n"),
        fragmentShader: [
            "#extension GL_OES_standard_derivatives : enable",
            "uniform sampler2D mudTexture;",
            "uniform sampler2D grassTexture;",

            "varying vec4 packedInformation;",

            "#define PHONG",

            "uniform vec3 diffuse;",

            "uniform vec3 ambient;",
            "uniform vec3 emissive;",
            "uniform vec3 specular;",
            "uniform float shininess;",

            "uniform vec3 ambientLightColor;",
            "uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",	
            "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
            "uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];",
            "uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];",
            "uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];",
            
            "varying vec2 vUv;",
            "varying vec3 vViewPosition;",
            "varying vec3 vNormal;",
            
            "uniform sampler2D normalMap;",
            "uniform vec2 normalScale;",
            
            "uniform sampler2D shadowMap[ MAX_SHADOWS ];",	
            "uniform vec2 shadowMapSize[ MAX_SHADOWS ];",
            "uniform float shadowDarkness[ MAX_SHADOWS ];",	
            "uniform float shadowBias[ MAX_SHADOWS ];",	
            "varying vec4 vShadowCoord[ MAX_SHADOWS ];",	
            "float unpackDepth( const in vec4 rgba_depth ) {",
                "const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
                "float depth = dot( rgba_depth, bit_shift );",
                "return depth;",
            "}",
            "vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, float uvScale, float dist, float normalScaleBase ) {",
            "   vec2 uvNormal = vUv * uvScale;",
            "   vec3 q0 = dFdx( eye_pos.xyz );",		
            "   vec3 q1 = dFdy( eye_pos.xyz );",		
            "   vec2 st0 = dFdx( uvNormal.st);",
            "   vec2 st1 = dFdy( uvNormal.st);",
            "   vec3 S = normalize( q0 * st1.t - q1 * st0.t );",		
            "   vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",		
            "   vec3 N = normalize( surf_norm );",		
            "   vec3 mapN = texture2D( normalMap, uvNormal).xyz * 2.0 - 1.0;",		
            "   mapN.xy = ((normalScale+normalScaleBase) * mapN.xy) + clamp(dist,0.0,250.0) * 0.002;",		
            "   mat3 tsn = mat3( S, T, N );",		
            "   return tsn * mapN;",	
            "}",

            "void main() {",
                    "float vAmount = packedInformation.x;",
                    "float transition = packedInformation.z;",
                    "float plantDensity = packedInformation.w;",
                    "float dist = packedInformation.y;",
                    "vec4 grass = smoothstep(0.6, 1.0, vAmount) * texture2D( grassTexture, vUv * 16.0 );",
                    "vec4 mud = (smoothstep(-.7, 0.0, vAmount) - smoothstep(0.60, 1.0, vAmount)) * texture2D( mudTexture, vUv * 8.0 );",
                    
                    "vec4 colorTerrain = vec4( vec3( 0.0 ), 1.0 ) + mud + grass;",
                    "colorTerrain.w = transition;",
                    
                    "float specularStrength = 1.0;",

                    "vec3 normalR = normalize( vNormal );",
                    "vec3 viewPosition = normalize( vViewPosition );",
                    "vec3 normalP1 = perturbNormal2Arb( -vViewPosition, normalR, 1.1, dist, 4.0 );",
                    "vec3 normalP2 = perturbNormal2Arb( -vViewPosition, normalR, 0.6, dist, 2.0 );",
                    "vec3 normalP3 = perturbNormal2Arb( -vViewPosition, normalR, 0.15, dist, 2.0 );",
                    "vec3 normal = normalize(normalP3 + normalP1 + normalP2) * 1.02;",
                    "normal = smoothstep(0.3, 1.0, vAmount) * normalR + (smoothstep(-.7, 0.0, vAmount) - smoothstep(0.30, 1.0, vAmount)) * normal;",
                    "normal = mix(normal, normalR, plantDensity);",
                    "vec3 dirDiffuse = vec3( 0.0 );",	
                    "vec3 dirSpecular = vec3( 0.0 );",
                    "for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",	
                        "vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",	
                        "vec3 dirVector = normalize( lDirection.xyz );",	
                        "float dotProduct = dot( normal, dirVector );",
                        "float dirDiffuseWeight = max( dotProduct, 0.0 );",
                        "dirDiffuse += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;",
                        "vec3 dirHalfVector = normalize( dirVector + viewPosition );",
                        "float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",	
                        "float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );",
                        "float specularNormalization = ( shininess + 2.0 ) / 8.0;",
                        "vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );",	
                        "dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",	
                    "}",
                    "vec3 hemiDiffuse = vec3( 0.0 );",
                    "vec3 hemiSpecular = vec3( 0.0 );",
                    "for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",
                        "vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );",
                        "vec3 lVector = normalize( lDirection.xyz );",
                        "float dotProduct = dot( normal, lVector );",
                        "float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",
                        "vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",
                        "hemiDiffuse += diffuse * hemiColor;",
                        "vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );",
                        "float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
                        "float hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );",
                        "vec3 lVectorGround = -lVector;",
                        "vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );",
                        "float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
                        "float hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );",
                        "float dotProductGround = dot( normal, lVectorGround );",
                        "float specularNormalization = ( shininess + 2.0 ) / 8.0;",
                        "vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );",
                        "vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );",
                        "hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",
                    "}",
                    "vec3 totalDiffuse = vec3( 0.0 );",
                    "vec3 totalSpecular = vec3( 0.0 );",
                    "totalDiffuse += dirDiffuse;",
                    "totalSpecular += dirSpecular;",
                    "totalDiffuse += hemiDiffuse;",
                    "totalSpecular += hemiSpecular;",
                    "colorTerrain.xyz *= ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular * vec3(1.0);",
                    "gl_FragColor = colorTerrain;",
                    "float fDepth;\n	vec3 shadowColor = vec3( 1.0 );\n\n	for( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n\n				bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n		bool inFrustum = all( inFrustumVec );\n\n				bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\n		bool frustumTest = all( frustumTestVec );\n\n		if ( frustumTest ) {\n\n			shadowCoord.z += shadowBias[ i ];\n\n				float shadow = 0.0;\n\n				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n\n				float dx0 = -1.0 * xPixelOffset;\n				float dy0 = -1.0 * yPixelOffset;\n				float dx1 = 1.0 * xPixelOffset;\n				float dy1 = 1.0 * yPixelOffset;\n\n				mat3 shadowKernel;\n				mat3 depthKernel;\n\n				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\n				vec3 shadowZ = vec3( shadowCoord.z );\n				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));\n				shadowKernel[0] *= vec3(0.25);\n\n				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));\n				shadowKernel[1] *= vec3(0.25);\n\n				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));\n				shadowKernel[2] *= vec3(0.25);\n\n				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );\n\n				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );\n				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );\n\n				vec4 shadowValues;\n				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );\n				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );\n				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );\n				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );\n\n				shadow = dot( shadowValues, vec4( 1.0 ) );\n\n				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * .3 * shadow ) );\n\n			}\n\n\n		}\n\n	shadowColor *= shadowColor;\n\n 	gl_FragColor.xyz = gl_FragColor.xyz * shadowColor;\n\n",

            "}"
        ].join("\n"),
        lights: true
    },
    
    'terrainPhongFar': {
        uniforms: 
            THREE.UniformsUtils.merge([
            THREE.UniformsLib[ "common" ],
            THREE.UniformsLib[ "lights" ],

            {
                        "ambient"       : { type: "c", value: new THREE.Color( 0xffffff ) },
                        "emissive"      : { type: "c", value: new THREE.Color( 0x000000 ) },
                        "specular"      : { type: "c", value: new THREE.Color( 0x111111 ) },
                        "shininess"     : { type: "f", value: 20.0 },
                        "wrapRGB"       : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                        "heightScale"   : { type: "f", value: 0   },
                        "mudTexture"    : { type: "t", value: null    },
                        "grassTexture"  : { type: "t", value: null    },
                        "threshNear" : { type: "f", value: 1.0 },
                        "threshFar" : { type: "f", value: 1.0 },
                        "threshLODNear" : {type: "f", value: 1.0},
                        "threshLODFar" : {type: "f", value: 1.0},
                        "normalMap" : {type: "t", value: null},
                        "normalScale" : {type: "v2", value: new THREE.Vector2( 1, 1 )},
                        "environmentCube": { type: "t", value: null },
                        "mRefractionRatio": { type: "f", value: 1.02 },
                        "mFresnelBias": { type: "f", value: 0.01 },
                        "mFresnelPower": { type: "f", value: 2.0 },
                        "mFresnelScale": { type: "f", value: 0.5 },
                        "farawayTexture" : {type: "t", value: null},
                        "overlayFactor": { type: "f", value : 1.0 }, 
            }
        ]),
        
        attributes: {
            "nPlants" : {type: "f", value: 0 },
            "tColor" : {type: "c", value: null},
            "tType" : {type: "f", value: 0},
        },
        
        vertexShader:  [
            "#define PHONG",
            "uniform float heightScale;",
            "uniform float threshNear;",
            "uniform float threshFar;",
            "uniform float threshBillboard;",
            "uniform float threshLODNear;",
            "uniform float threshLODFar;",
            "uniform sampler2D farawayTexture;",
            
            "attribute float nPlants;",
            "attribute vec3 tColor;",
            "attribute float tType;",

            "varying vec4 cTerrain;",
            "varying vec4 packedInformation;",

            "varying vec3 vViewPosition;",
            "varying vec3 vNormal;",
            "varying vec2 vUv;",

            "void main() {",
            
            "       float dist = distance(cameraPosition.xz,position.xz);",
            "       float thresh = threshFar - threshNear;",
            "       float newDist = dist - threshNear;",
            
            "       float density = clamp(nPlants, 0.0, 1.0);",
            "       packedInformation.w = clamp(nPlants / 2.0, 0.0, 1.0);",
            "       cTerrain.w = newDist / thresh;",
            "       packedInformation.y = dist;",
            
            "       packedInformation.z = clamp(((dist - threshLODNear) / (threshLODFar - threshLODNear)), 0.0, 1.0) * density;",
            
            "       vec3 objectNormal = normal;",
            "       vec3 transformedNormal = normalMatrix * objectNormal;",
            "       vNormal = normalize( transformedNormal );",
            "       vUv = uv * 16.0;",
            
            "       vec2 uvNew = vec2((floor(mod(tType+.5, 3.0))  + .5) * (1.0/3.0), 1.0 - ((.5 + floor((tType+.5)/3.0)) * (1.0/3.0)));",
            "       cTerrain.xyz = vec3(texture2D(farawayTexture, uvNew)) * tColor;",
            
            "       vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "       gl_Position = projectionMatrix * mvPosition;",

            "       vViewPosition = -mvPosition.xyz;",
            "       packedInformation.x = position.y / heightScale;",

            "       vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            "}"

        ].join("\n"),
        fragmentShader: [
            "#extension GL_OES_standard_derivatives : enable",
            "uniform sampler2D mudTexture;",
            "uniform sampler2D grassTexture;",
            "uniform sampler2D farawayTexture;",
            "uniform float overlayFactor;",

            "varying vec4 cTerrain;",
            "varying vec4 packedInformation;",

            "#define PHONG",

            "uniform vec3 diffuse;",

            "uniform vec3 ambient;",
            "uniform vec3 emissive;",
            "uniform vec3 specular;",
            "uniform float shininess;",

            "uniform vec3 ambientLightColor;",
            "uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",	
            "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
            "uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];",
            "uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];",
            "uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];",
            
            "uniform sampler2D normalMap;",
            "uniform vec2 normalScale;",
            
            "varying vec3 vViewPosition;",
            "varying vec3 vNormal;",
            "varying vec2 vUv;",
            
            "vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, float uvScale, float dist, float normalScaleBase ) {",
            "   vec2 uvNormal = vUv * uvScale;",
            "   vec3 q0 = dFdx( eye_pos.xyz );",		
            "   vec3 q1 = dFdy( eye_pos.xyz );",		
            "   vec2 st0 = dFdx( uvNormal.st);",
            "   vec2 st1 = dFdy( uvNormal.st);",
            "   vec3 S = normalize( q0 * st1.t - q1 * st0.t );",		
            "   vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",		
            "   vec3 N = normalize( surf_norm );",		
            "   vec3 mapN = texture2D( normalMap, uvNormal).xyz * 2.0 - 1.0;",		
            "   mapN.xy = ((normalScale+normalScaleBase) * mapN.xy) + clamp(dist,0.0,250.0) * 0.002;",		
            "   mat3 tsn = mat3( S, T, N );",		
            "   return tsn * mapN;",	
            "}",

            "void main() {",
                    "float vAmount = packedInformation.x;",
                    "float dist = packedInformation.y;",
                    "float transition2 = packedInformation.z;",
                    "float plantDensity = packedInformation.w;",
            
                    "vec4 grass = smoothstep(0.6, 1.0, vAmount) * texture2D( grassTexture, vUv * 16.0 );",
                    "vec4 mud = (smoothstep(-.7, 0.0, vAmount) - smoothstep(0.60, 1.0, vAmount)) * texture2D( mudTexture, vUv * 8.0 );",
                    
                    "vec4 colorFarTerrain = cTerrain;",
                    "vec4 colorTerrain = vec4( vec3( 0.0 ), 1.0 ) + mud + grass;",
                    
                    "colorTerrain.w = cTerrain.w;",
                    "float specularStrength = 1.0;",

                    "vec3 normalR = normalize( vNormal );",
                    "vec3 viewPosition = normalize( vViewPosition );",
                    "vec3 normalP1 = perturbNormal2Arb( -vViewPosition, normalR, 1.1, dist, 4.0 );",
//                    "vec3 normalP1 = perturbNormal2Arb( -vViewPosition, normalR, 2.2, dist, 2.0 );",
//                    "vec3 normalP2 = perturbNormal2Arb( -vViewPosition, normalR, 1.8, dist, 2.0 );",
                    "vec3 normalP2 = perturbNormal2Arb( -vViewPosition, normalR, 0.6, dist, 2.0 );",
//                    "vec3 normalP3 = perturbNormal2Arb( -vViewPosition, normalR, 0.5, dist, 2.0 );",
                    "vec3 normalP3 = perturbNormal2Arb( -vViewPosition, normalR, 0.2, dist, 2.0 );",
                    "vec3 normal = normalize(normalP3 + normalP1 + normalP2) * 1.02;",
                    "normal = smoothstep(0.3, 1.0, vAmount) * normalR + (smoothstep(-.7, 0.0, vAmount) - smoothstep(0.30, 1.0, vAmount)) * normal;",
                    "normal = mix(normal, normalR, plantDensity);",
                    "vec3 dirDiffuse = vec3( 0.0 );",	
                    "vec3 dirSpecular = vec3( 0.0 );",
                    "for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",
                        "vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",	
                        "vec3 dirVector = normalize( lDirection.xyz );",	
                        "float dotProduct = dot( normal, dirVector );",
                        "float dirDiffuseWeight = max( dotProduct, 0.0 );",
                        "dirDiffuse += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;",
                        "vec3 dirHalfVector = normalize( dirVector + viewPosition );",
                        "float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",	
                        "float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );",
                        "float specularNormalization = ( shininess + 2.0 ) / 8.0;",
                        "vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );",	
                        "dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",	
                    "}",
                    "vec3 hemiDiffuse = vec3( 0.0 );",
                    "vec3 hemiSpecular = vec3( 0.0 );",
                    "for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",
                        "vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );",
                        "vec3 lVector = normalize( lDirection.xyz );",
                        "float dotProduct = dot( normal, lVector );",
                        "float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",
                        "vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",
                        "hemiDiffuse += diffuse * hemiColor;",
                        "vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );",
                        "float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
                        "float hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );",
                        "vec3 lVectorGround = -lVector;",
                        "vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );",
                        "float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
                        "float hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess*0.001 ), 0.0 );",
                        "float dotProductGround = dot( normal, lVectorGround );",
                        "float specularNormalization = ( shininess + 2.0 ) / 8.0;",
                        "vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );",
                        "vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );",
                        "hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",
                    "}",
                    "vec3 totalDiffuse = vec3( 0.0 );",
                    "vec3 totalSpecular = vec3( 0.0 );",
                    "totalDiffuse += dirDiffuse;",
                    "totalSpecular += dirSpecular;",
                    "totalDiffuse += hemiDiffuse;",
                    "totalSpecular += hemiSpecular;",
                    "colorTerrain.xyz *= ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular * vec3(1.0);",
                    "vec4 finalColor = mix(colorTerrain,mix(colorFarTerrain,vec4(0.0,0.0,1.0,1.0), overlayFactor),transition2);",
                    "vec3 finalColorShadow = vec3(finalColor) * .85;",
                    "gl_FragColor.xyz = mix(finalColor.xyz, finalColorShadow, plantDensity * (1.0-transition2));",
                    "gl_FragColor.w = finalColor.w;",
            "}"
        ].join("\n"),
        lights: true
    },
    
    'instancingColorMaterial': {
        uniforms: THREE.UniformsUtils.merge( [

                THREE.UniformsLib[ "common" ],
                THREE.UniformsLib[ "bump" ],
                THREE.UniformsLib[ "normalmap" ],
                THREE.UniformsLib[ "fog" ],
                THREE.UniformsLib[ "lights" ],
                THREE.UniformsLib[ "shadowmap" ],

                {
                        "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
                        "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
                        "specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
                        "shininess": { type: "f", value: 0.01 },
                        "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                        "threshNear" : { type: "f", value: 1.0 },
                        "threshFar" : { type: "f", value: 1.0 }
                }

        ] ),

        attributes: {
                        "positionInstances"  : { type: "v3", value: [] },
                        "colorInstances"  : { type: "v3", value: [] },
                        "scaleInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 )},
                        "rotateInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 )}
                },

        vertexShader: [

                "#define PHONG",

                "varying vec3 vViewPosition;",
                "varying vec3 vNormal;",
                "varying float transition;",
                "attribute vec3 positionInstances;",
                "attribute vec3 colorInstances;",
                "attribute vec3 scaleInstances;",
                "attribute vec3 rotateInstances;",
                "uniform float threshNear;",
                "uniform float threshFar;",

                "varying vec3 vColor;",

                "#ifdef USE_SHADOWMAP\n\n	varying vec4 vShadowCoord[ MAX_SHADOWS ];\n	uniform mat4 shadowMatrix[ MAX_SHADOWS ];\n\n#endif",

                "void main() {",

                "       float c = cos(rotateInstances.y);",
                "       float s = sin(rotateInstances.y);",
                "       mat4 scaleMatrix = mat4(scaleInstances.x, 0.0, 0.0, 0.0, 0.0, scaleInstances.y, 0.0, 0.0, 0.0, 0.0, scaleInstances.z, 0.0, 0.0, 0.0, 0.0, 1.0);",
                "       mat4 rotationMatrix = mat4(c, 0.0, -1.0*s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);",
                "       mat4 translationMatrix = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, positionInstances.x, positionInstances.y, positionInstances.z, 1.0);",
                "       mat4 transformationMatrix = translationMatrix * rotationMatrix * scaleMatrix;",
,
                "       vColor = color * color;",
                "	vColor = colorInstances;",
                "       float dist = distance(cameraPosition.xz,positionInstances.xz);",
                "       float thresh = threshFar - threshNear;",
                "       float newDist = dist - threshNear;",
                "       transition = 1.0 - (newDist / thresh);",
                "       float visible = sign(1.0 - (newDist / thresh));",
                
                "       vec3 objectNormal = normal;",
                "       vec3 transformedNormal = (normalMatrix*mat3(transformationMatrix)) * (objectNormal);",
                "       vNormal = normalize( transformedNormal );",

                "       vec4 mvPosition = viewMatrix * transformationMatrix * modelMatrix * vec4( position, 1.0 );",

                "	vViewPosition = -mvPosition.xyz;",
                "       mvPosition = mvPosition * vec4(1.0,1.0,1.0,visible);",

                "       #ifdef USE_SHADOWMAP\n\n	for( int i = 0; i < MAX_SHADOWS; i ++ ) { vShadowCoord[ i ] = shadowMatrix[ i ] * (transformationMatrix * modelMatrix * vec4( position, 1.0 ));\n\n	}\n\n#endif",

                "       gl_Position = projectionMatrix * mvPosition;",

                "}"

        ].join("\n"),

        fragmentShader: [

                "#define PHONG",

                "uniform vec3 diffuse;",
                "uniform float opacity;",

                "uniform vec3 ambient;",
                "uniform vec3 emissive;",
                "uniform vec3 specular;",
                "uniform float shininess;",

                "varying vec3 vColor;",
                "varying float transition;",

                THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
                THREE.ShaderChunk[ "shadowmap_pars_fragment" ],

                "void main() {",

                "	gl_FragColor = vec4( vec3( 1.0 ), transition );",

                        THREE.ShaderChunk[ "logdepthbuf_fragment" ],
                        THREE.ShaderChunk[ "map_fragment" ],
                        THREE.ShaderChunk[ "alphamap_fragment" ],
                        THREE.ShaderChunk[ "alphatest_fragment" ],
                        THREE.ShaderChunk[ "specularmap_fragment" ],

                        THREE.ShaderChunk[ "lights_phong_fragment" ],

                        THREE.ShaderChunk[ "lightmap_fragment" ],
                        THREE.ShaderChunk[ "color_fragment" ],
                        THREE.ShaderChunk[ "envmap_fragment" ],
                        THREE.ShaderChunk[ "shadowmap_fragment" ],

                        THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

                        THREE.ShaderChunk[ "fog_fragment" ],

                "}"

        ].join("\n"),
        lights: true
    },
    
    'billboard': {
        uniforms: {

                "psColor" : { type: "c", value: new THREE.Color( 0xeeeeee ) },
                "opacity" : { type: "f", value: 1.0 },
                "map" : { type: "t", value: null },
                "nTypes" : {type: "f", value: 1.0 },
                "billboardTextureAtlas" : { type: "t", value: null },
                "threshNear" : { type: "f", value: 1.0 },
                "threshFar" : { type: "f", value: 1.0 },
                "threshLODNear" : {type: "f", value: 1.0},
                "threshLODFar" : {type: "f", value: 1.0},
                "overlayFactor" : {type: "f", value: 0.0},
        },
        attributes: {

                "plantType" : { type: "f", value: 0 },
                "colorInstance" : {type: "c", value: new THREE.Color(1.0,1.0,1.0)},
                "size": { type: "f", value: 1.0},
                "textureNumber": {type: "g", value: 1.0},
        },

        vertexShader: [

                "attribute float size;",
                "uniform float threshNear;",
                "uniform float threshFar;",
                "uniform float threshLODNear;",
                "uniform float threshLODFar;",

                "attribute float plantType;",
                "attribute vec3 colorInstance;",
                "attribute float textureNumber;",
                "varying vec2 vUvBillboard;",
                "varying vec4 vColorInstance;",

                "void main() {",
                "       vColorInstance.xyz = colorInstance;",
                "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "       vUvBillboard.x = floor(mod(textureNumber+0.5,2.0)) * 0.5 + floor(mod(plantType+0.5,3.0)) * (1.0/6.0);",
                "       vUvBillboard.y = floor((textureNumber+0.5)/2.0) * 0.5 + floor((plantType+0.5)/3.0) * (1.0/6.0);",
                "       float dist = distance(cameraPosition.xz,position.xz);",
                "       float thresh = threshFar - threshNear;",
                "       float newDist = dist - threshNear;",
                "       float transition = newDist / thresh;",
                
                "       float transitionLOD = clamp(((dist - threshLODNear) / (threshLODFar - threshLODNear)), 0.0, 1.0);",
                "       float visible2 = ceil(1.0-transitionLOD-0.01);",
                "       float visible = sign(transition) * visible2;",
                "       vColorInstance.w = 1.0 - transitionLOD;",
                "	gl_PointSize = (size / (length( mvPosition.xz) * 1.0));",
                
                "       mvPosition = mvPosition * vec4(1.0, 1.0, 1.0, visible);",

                "	gl_Position = projectionMatrix * mvPosition;",

                "}"

        ].join("\n"),

        fragmentShader: [
                "uniform sampler2D billboardTextureAtlas;",
                "uniform float nTypes;",
                "uniform float overlayFactor;",
                
                "varying vec2 vUvBillboard;",
                "varying vec4 vColorInstance;",

                "void main() {",

//                "   vec4 tColor = texture2D(billboardTextureAtlas, vec2((gl_PointCoord.x + floor(mod(vUvBillboard+.5,nTypes))) * (1.0/nTypes),1.0 - (gl_PointCoord.y + floor((vUvBillboard+0.5)/nTypes)) * (1.0/nTypes)));",
                "   vec4 tColor = texture2D(billboardTextureAtlas, vec2(gl_PointCoord.x * (1.0/6.0) + vUvBillboard.x,1.0 - (gl_PointCoord.y * (1.0/6.0) + vUvBillboard.y)));",
                "   if (tColor.a < 0.3) discard;",
                "   gl_FragColor = mix(vec4(tColor.xyz,1.0) * vColorInstance,vec4(1.0,0.0,0.0,1.0), overlayFactor);",
                "}"

        ].join("\n"),
        transparent: true,
    },
    'instancingTextureMaterial': {
        uniforms: THREE.UniformsUtils.merge( [

                THREE.UniformsLib[ "common" ],
                THREE.UniformsLib[ "bump" ],
                THREE.UniformsLib[ "normalmap" ],
                THREE.UniformsLib[ "fog" ],
                THREE.UniformsLib[ "lights" ],
                THREE.UniformsLib[ "shadowmap" ],

                {
                        "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
                        "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
                        "specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
                        "shininess": { type: "f", value: 0.1 },
                        "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                        "textureMap" : { type: "t", value: null },
                        "nTexture": {type: "f", value: null},
                        "threshNear" : { type: "f", value: 1.0 },
                        "threshFar" : { type: "f", value: 1.0 },
                        "shadowMatrixInverse" : {type: "m4", value: new THREE.Matrix4()}
                }

        ] ),

        attributes: {
                        "textureIndex": { type: "f", value: 1.0},
                        "positionInstances"  : { type: "v3", value: null },
                        "colorInstance"  : { type: "v3", value: null },
                        "scaleInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 )},
                        "rotateInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 )},
                },

        vertexShader: [

                "#define PHONG",
                "uniform float threshNear;",
                "uniform float threshFar;",
                "attribute float textureIndex;",
                "varying vec2 vUv3;",
                "attribute vec3 positionInstances;",
                "attribute vec3 colorInstance;",
                "attribute vec3 scaleInstances;",
                "attribute vec3 rotateInstances;",
                "varying vec4 vColorInstance;",
                "uniform float nTexture;",

                "varying vec4 vShadowCoord[ MAX_SHADOWS ];\n	uniform mat4 shadowMatrix[ MAX_SHADOWS ];\n\n",

                "void main() {",
                "       vUv3.x = uv.x;",
                "       vUv3.y = uv.y / nTexture + textureIndex / nTexture;",
                "       vColorInstance.xyz = colorInstance;",

                "       float c = cos(rotateInstances.y);",
                "       float s = sin(rotateInstances.y);",
                "       mat4 scaleMatrix = mat4(scaleInstances.x, 0.0, 0.0, 0.0, 0.0, scaleInstances.y, 0.0, 0.0, 0.0, 0.0, scaleInstances.z, 0.0, 0.0, 0.0, 0.0, 1.0);",
                "       mat4 rotationMatrix = mat4(c, 0.0, -1.0*s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);",
                "       mat4 translationMatrix = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, positionInstances.x, positionInstances.y, positionInstances.z, 1.0);",
                "       mat4 transformationMatrix = translationMatrix * rotationMatrix * scaleMatrix;",
,
                "       float thresh = threshFar - threshNear;",
                "       float dist = distance(cameraPosition.xz,positionInstances.xz) - threshNear;",
                "       vColorInstance.w = 1.0 - (dist / thresh);",
                "       float visible = sign(vColorInstance.w);",
                
                "       vec3 objectNormal = normal;",
                "       vec4 mvPosition = viewMatrix * (transformationMatrix * modelMatrix) * vec4( position, 1.0 );",

                "       mvPosition = mvPosition * vec4(1.0,1.0,1.0,visible);",

                "       for( int i = 0; i < MAX_SHADOWS; i ++ ) { vShadowCoord[ i ] = shadowMatrix[ i ] * ( transformationMatrix * modelMatrix * vec4( position, 1.0 ));\n\n	}\n\n",

                "       gl_Position = projectionMatrix * mvPosition;",

                "}"

        ].join("\n"),

        fragmentShader: [

                "#define PHONG",

                "uniform vec3 diffuse;",
                "uniform float opacity;",

                "uniform vec3 ambient;",
                "uniform vec3 emissive;",
                "uniform vec3 specular;",
                "uniform float shininess;",
                
                "varying vec2 vUv3;",
                "uniform sampler2D textureMap;",
                
                "varying vec4 vColorInstance;",

                "uniform sampler2D shadowMap[ MAX_SHADOWS ];",	
                "uniform vec2 shadowMapSize[ MAX_SHADOWS ];",
                "uniform float shadowDarkness[ MAX_SHADOWS ];",	
                "uniform float shadowBias[ MAX_SHADOWS ];",	
                "varying vec4 vShadowCoord[ MAX_SHADOWS ];",	
                "float unpackDepth( const in vec4 rgba_depth ) {",
                    "const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
                    "float depth = dot( rgba_depth, bit_shift );",
                    "return depth;",
                "}",
                
                "void main() {",
                "       vec4 tColor = texture2D(textureMap, vUv3);",
                "       if( tColor.a < 0.5) discard;",
                "       tColor.xyz *= tColor.xyz;",
                "       gl_FragColor = vec4(tColor.xyz,1.0);",

                "       float fDepth;\n	vec3 shadowColor = vec3( 1.0 );\n\n	for( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n\n				bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n		bool inFrustum = all( inFrustumVec );\n\n				bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\n		bool frustumTest = all( frustumTestVec );\n\n		if ( frustumTest ) {\n\n			shadowCoord.z += shadowBias[ i ];\n\n				float shadow = 0.0;\n\n				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n\n				float dx0 = -1.0 * xPixelOffset;\n				float dy0 = -1.0 * yPixelOffset;\n				float dx1 = 1.0 * xPixelOffset;\n				float dy1 = 1.0 * yPixelOffset;\n\n				mat3 shadowKernel;\n				mat3 depthKernel;\n\n				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\n				vec3 shadowZ = vec3( shadowCoord.z );\n				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));\n				shadowKernel[0] *= vec3(0.25);\n\n				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));\n				shadowKernel[1] *= vec3(0.25);\n\n				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));\n				shadowKernel[2] *= vec3(0.25);\n\n				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );\n\n				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );\n				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );\n\n				vec4 shadowValues;\n				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );\n				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );\n				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );\n				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );\n\n				shadow = dot( shadowValues, vec4( 1.0 ) );\n\n				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n\n			}\n\n\n		}\n\n	shadowColor *= shadowColor;\n\n 	gl_FragColor.xyz = gl_FragColor.xyz * shadowColor;\n\n",

                "       gl_FragColor.xyz = sqrt( gl_FragColor.xyz );",
                "       gl_FragColor = gl_FragColor * vColorInstance;",
                "}"

        ].join("\n"),
        lights: true
    },
    
    'depthRGBA_instancing': {

		uniforms: {
                    "textureMap" : { type: "t", value: null },
                    "nTexture": {type: "f", value: null},
                },
                
                attributes: {
                        "textureIndex": { type: "f", value: 1.0},
                        "positionInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                        "scaleInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 )},
                        "rotateInstances"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 )},
                },

		vertexShader: [
                        "attribute vec3 positionInstances;",
                        "attribute vec3 scaleInstances;",
                        "attribute vec3 rotateInstances;",

			"void main() {",
                        "       float c = cos(rotateInstances.y);",
                        "       float s = sin(rotateInstances.y);",
                        "       mat4 scaleMatrix = mat4(scaleInstances.x, 0.0, 0.0, 0.0, 0.0, scaleInstances.y, 0.0, 0.0, 0.0, 0.0, scaleInstances.z, 0.0, 0.0, 0.0, 0.0, 1.0);",
                        "       mat4 rotationMatrix = mat4(c, 0.0, -1.0*s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);",
                        "       mat4 translationMatrix = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, positionInstances.x, positionInstances.y, positionInstances.z, 1.0);",
                        "       mat4 transformationMatrix = translationMatrix * rotationMatrix * scaleMatrix;",
                        "       vec4 mvPosition = viewMatrix * (transformationMatrix * modelMatrix) * vec4( position, 1.0 );",
                        "       gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n"),

		fragmentShader: [
			"vec4 pack_depth( const in float depth ) {",

			"	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );",
			"	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );",
			"	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );",
			"	res -= res.xxyz * bit_mask;",
			"	return res;",

			"}",

			"void main() {",
                        
			"	gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );",

			"}"

		].join("\n")

	},
        
        'waterNear': {

	uniforms: {
                "normalSampler":	{ type: "t", value: null },
                "mirrorSampler":	{ type: "t", value: null },
                "threshNear" :      { type: "f", value: 1.0 },
                "threshFar" :       { type: "f", value: 1.0 },
                "time":		{ type: "f", value: 0.0 },
                "distortionScale":	{ type: "f", value: 20.0 },
                "textureMatrix" :	{ type: "m4", value: new THREE.Matrix4() },
                "sunColor":		{ type: "c", value: new THREE.Color( 0x7F7F7F ) },
                "sunDirection":	{ type: "v3", value: new THREE.Vector3( 0.70707, 0.70707, 0 ) },
                "eye":		{ type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
                "waterColor":	{ type: "c", value: new THREE.Color( 0x555555 ) }
	},
        
        attributes: {
            
        },

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'uniform float time;',
                'uniform float threshNear;',
                'uniform float threshFar;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
                'varying float transition;',
		
		'void main()',
		'{',
		'	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
		'	worldPosition = mirrorCoord.xyz;',
                "       vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
		"       vec3 I = worldPosition.xyz - cameraPosition;",
		"       mirrorCoord = vec4(reflect( I, worldNormal ),1.0);",
                
                "       float dist = distance(cameraPosition.xz, worldPosition.xz);",
                "       float thresh = threshFar - threshNear;",
                "       float newDist = dist - threshNear;",
                "       transition = 1.0 - (newDist / thresh);",
                
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		"}"

	].join("\n"),

	fragmentShader: [
		'precision highp float;',
		
		'uniform samplerCube mirrorSampler;',
		//'uniform float alpha;',
		'uniform float time;',
		'uniform float distortionScale;',
		'uniform sampler2D normalSampler;',
		'uniform vec3 sunColor;',
		'uniform vec3 sunDirection;',
		'uniform vec3 eye;',
		'uniform vec3 waterColor;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
                'varying float transition;',
		
		'vec4 getNoise( vec2 uv )',
		'{',
		'	vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
		'	vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
		'	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
		'	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
		'	vec4 noise = ( texture2D( normalSampler, uv0 ) ) +',
        '		( texture2D( normalSampler, uv1 ) ) +',
        '		( texture2D( normalSampler, uv2 ) ) +',
		'		( texture2D( normalSampler, uv3 ) );',
		'	return noise * 0.5 - 1.0;',
		'}',
		
		'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor )',
		'{',
		'	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
		'	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
		'	specularColor += pow( direction, shiny ) * sunColor * spec;',
		'	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
		'}',
		
		'void main()',
		'{',
		'	vec4 noise = getNoise( worldPosition.xz );',
		'	vec3 surfaceNormal = normalize( noise.xzy * vec3( 0.24, 1.0, 0.24 ) );',

		'	vec3 diffuseLight = vec3(0.0);',
		'	vec3 specularLight = vec3(0.0);',

		'	vec3 worldToEye = eye-worldPosition;',
		'	vec3 eyeDirection = normalize( worldToEye );',
		'	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',
		
		'	float distance = length(worldToEye);',

		'	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
		//'	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.z + distortion ) );',
                '	vec3 reflectionSample = vec3( textureCube( mirrorSampler, vec3( -mirrorCoord.x, mirrorCoord.yz + distortion ) ) );',
		'	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
		'	float rf0 = 0.3;',
		'	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
		'	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
		'	vec3 albedo = mix( sunColor * diffuseLight * 0.3 + scatter, ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance );',
		'	gl_FragColor = vec4( albedo,transition);',
		'}'
	].join("\n"),
            transparent: false,
        },
        
        'waterFar': {

		uniforms: { "normalSampler":	{ type: "t", value: null },
                            "mirrorSampler":	{ type: "t", value: null },
                            "threshNear" :      { type: "f", value: 1.0 },
                            "threshFar" :       { type: "f", value: 1.0 },
                            "time":		{ type: "f", value: 0.0 },
                            "distortionScale":	{ type: "f", value: 20.0 },
                            "textureMatrix" :	{ type: "m4", value: new THREE.Matrix4() },
                            "sunColor":		{ type: "c", value: new THREE.Color( 0x7F7F7F ) },
                            "sunDirection":	{ type: "v3", value: new THREE.Vector3( 0.70707, 0.70707, 0 ) },
                            "eye":		{ type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
                            "waterColor":	{ type: "c", value: new THREE.Color( 0x555555 ) }
	},

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'uniform float time;',
                'uniform float threshNear;',
                'uniform float threshFar;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
                'varying float transition;',
		
		'void main()',
		'{',
		'	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
		'	worldPosition = mirrorCoord.xyz;',
                "       vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
		"       vec3 I = worldPosition.xyz - cameraPosition;",
		"       mirrorCoord = vec4(reflect( I, worldNormal ),1.0);",
                
                "       float dist = distance(cameraPosition.xz, worldPosition.xz);",
                "       float thresh = threshFar - threshNear;",
                "       float newDist = dist - threshNear;",
                "       transition = (newDist / thresh);",
                
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),

	fragmentShader: [
		'precision highp float;',
		
		'uniform samplerCube mirrorSampler;',
		//'uniform float alpha;',
		'uniform float time;',
		'uniform float distortionScale;',
		'uniform sampler2D normalSampler;',
		'uniform vec3 sunColor;',
		'uniform vec3 sunDirection;',
		'uniform vec3 eye;',
		'uniform vec3 waterColor;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
                'varying float transition;',
		
		'vec4 getNoise( vec2 uv )',
		'{',
		'	vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
		'	vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
		'	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
		'	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
		'	vec4 noise = ( texture2D( normalSampler, uv0 ) ) +',
        '		( texture2D( normalSampler, uv1 ) ) +',
        '		( texture2D( normalSampler, uv2 ) ) +',
		'		( texture2D( normalSampler, uv3 ) );',
		'	return noise * 0.5 - 1.0;',
		'}',
		
		'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor )',
		'{',
		'	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
		'	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
		'	specularColor += pow( direction, shiny ) * sunColor * spec;',
		'	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
		'}',
		
		'void main()',
		'{',
		'	vec4 noise = getNoise( worldPosition.xz );',
		'	vec3 surfaceNormal = normalize( noise.xzy * vec3( 0.24, 1.0, 0.24 ) );',

		'	vec3 diffuseLight = vec3(0.0);',
		'	vec3 specularLight = vec3(0.0);',

		'	vec3 worldToEye = eye-worldPosition;',
		'	vec3 eyeDirection = normalize( worldToEye );',
		'	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',
		
		'	float distance = length(worldToEye);',

		'	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
		//'	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.z + distortion ) );',
                '	vec3 reflectionSample = vec3( textureCube( mirrorSampler, vec3( -mirrorCoord.x, mirrorCoord.yz +distortion) ) );',
		'	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
		'	float rf0 = 0.3;',
		'	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
		'	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
		'	vec3 albedo = mix( sunColor * diffuseLight * 0.3 + scatter, ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance );',
		'	gl_FragColor = vec4( albedo,transition );',
		'}'
	].join('\n'),
        transparent: false,
        },
        
        'dykeShader': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "normalmap" ],
			THREE.UniformsLib[ "lights" ],

			{
				"ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
				"specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
				"shininess": { type: "f", value: 1.0 },
				"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                                "stoneTexture" : {type: "t", value: null},
                                "maxHeight" : {type: "f", value: 1.0},
			}

		] ),

		vertexShader: [

			"#define PHONG",
                                                                        
			"varying vec3 vViewPosition;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",
                        
			"void main() {",

				"vUv = uv;",
                        "       vec3 objectNormal = normal;",
                        "       vec3 transformedNormal = normalMatrix * objectNormal;",
			"	vNormal = normalize( transformedNormal );",

                        "       vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                        "       gl_Position = projectionMatrix * mvPosition;",

			"	vViewPosition = -mvPosition.xyz;",
                             
			"}"

		].join("\n"),

		fragmentShader: [

			"#define PHONG",

			"uniform vec3 diffuse;",

			"uniform vec3 ambient;",
			"uniform vec3 emissive;",
			"uniform vec3 specular;",
			"uniform float shininess;",
                        
                        "uniform sampler2D stoneTexture;",
                        
                        "varying vec2 vUv;",
                        "varying vec3 vColorVariance;",

			THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
			THREE.ShaderChunk[ "normalmap_pars_fragment" ],
			THREE.ShaderChunk[ "specularmap_pars_fragment" ],

			"void main() {",
                        "       vec4 stoneColor = texture2D(stoneTexture, vUv * 0.8);",
			"	gl_FragColor = stoneColor;",
				THREE.ShaderChunk[ "specularmap_fragment" ],

				THREE.ShaderChunk[ "lights_phong_fragment" ],

			"}"

		].join("\n"),
                lights: true
	},
};