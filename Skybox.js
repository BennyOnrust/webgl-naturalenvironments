Skybox = function(worldScale, skyboxTexture){
    THREE.Object3D.call( this );    
    var skyboxSize = worldScale * 560;

    var skyboxGeometry = new THREE.BoxGeometry(skyboxSize-200, skyboxSize+0, skyboxSize+200);
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = skyboxTexture;

    var skyboxMaterial = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: true,
            side: THREE.BackSide,
    } );
    var skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    skyboxMesh.position.x -= 0*worldScale;
    skyboxMesh.position.z += 50*worldScale;
    
    this.add(skyboxMesh);
};

Skybox.prototype = Object.create( THREE.Object3D.prototype );