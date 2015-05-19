Lights = function(worldScale, fov, conditionLOD){
    THREE.Object3D.call( this );    
    this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    this.hemiLight.position.set(1, 1600 * worldScale, 1);

    this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    this.dirLight.color.setHSL(1,1,.95);
    this.dirLight.position.set( 0, 20 * worldScale, 0);
    
    this.conditionLOD = conditionLOD;
    
    if(this.conditionLOD === "object"){
        this.dirLight.castShadow = true;

        this.dirLight.shadowCameraNear = 12 * worldScale;
        this.dirLight.shadowCameraFar = 30 * worldScale;
        this.dirLight.shadowCameraFov = fov;

        this.dirLight.shadowCameraLeft = -38 * worldScale;
        this.dirLight.shadowCameraRight = 38 * worldScale;
        this.dirLight.shadowCameraTop = 38 * worldScale;
        this.dirLight.shadowCameraBottom = -38 * worldScale;

        this.dirLight.shadowBias = -0.001;
        this.dirLight.shadowDarkness = 0.21;

        this.dirLight.shadowMapWidth = 2048;
        this.dirLight.shadowMapHeight = 2048;

        var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(worldScale*1.5,worldScale*1.5,worldScale*1.5));
        lightTarget.visible = false;
        this.dirLight.target = lightTarget;
        this.add(lightTarget);
    }
    
    this.add(this.hemiLight);
    this.add(this.dirLight);
};

Lights.prototype = Object.create( THREE.Object3D.prototype );
  
Lights.prototype.update = function(camPos){
    this.dirLight.target.position.set( camPos.x, 0, camPos.z );
    this.dirLight.position.x = camPos.x;
    this.dirLight.position.z = camPos.z;
};