// Srinidhi Somangili
// sksomang@ucsc.edu


// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position; 
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
        gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
      }
      else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
      }
      else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0,1.0);
      }
      else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      } 
      else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } 
      else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      } 
    //   else {
    //     gl_FragColor = vec4(1,.2,.2,1);
    //   }
      
    vec3 lightVector = u_lightPos-vec3(v_VertPos) ;
      float r = length(lightVector);
      
      // if (r < 1.0) {
      //   gl_FragColor = vec4(1,0,0,1);
      // } else if (r < 2.0) {
      //   gl_FragColor = vec4(0,1,0,1);
      // }

      //gl_FragColor=vec4(vec3(gl_FragColor)/(r*r),1);

      //N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, L), 0.0);

      // Reflection
      vec3 R = reflect(-L, N);
      
      // eye 
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

      // specular 
      float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

      vec3 diffuse =  vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.2;
      //gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
      if(u_lightOn){
        if(u_whichTexture == 0){
          gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
        }
        else{
          gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
      }


  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_whichTexture;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    //gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    gl = getWebGLContext(canvas, false);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

  // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    if (a_Normal < 0) {
        console.log("Failed to get the storage location of a_Normal");
        return;
    }

  // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    // get storage location of matrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // set initial value for this matrix to identity 
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const mydraw = 0;

// globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegs = 6;
let g_globalAngle = 0;
let g_headAngle = 0;
let g_trunkAngle = 0;
let g_bottrunkAngle = 0;
let g_earsangle = 0
let g_bodyangle = 0
let g_animation = false;
let g_xangle = 0;
let g_yangle = 0;
let g_normalOn = false;
let g_lightPos = [0,1,-2];
let g_LightOn = true;

// set up actions for HTML UI elements
function addActionsForHtmlUI() {

    document.getElementById("n_on").onclick = function () { g_normalOn = true; };
    document.getElementById("n_off").onclick = function () { g_normalOn = false; };

    // hor camera angle
    document.getElementById('horangleSlide').addEventListener('mousemove', function () { g_xangle = this.value; renderAllShapes(); });

    // ver camera angle
    document.getElementById('verangleSlide').addEventListener('mousemove', function () { g_yangle = this.value; renderAllShapes(); });

    // head angle
    document.getElementById('head').addEventListener('mousemove', function () { g_headAngle = this.value; renderAllShapes(); });

    // trunk angle
    document.getElementById('trunk').addEventListener('mousemove', function () { g_trunkAngle = this.value; renderAllShapes(); });

    // bot trunk
    document.getElementById('bottrunk').addEventListener('mousemove', function () { g_bottrunkAngle = this.value; renderAllShapes(); });

    // ears angle
    document.getElementById('ears').addEventListener('mousemove', function () { g_earsangle = this.value; renderAllShapes(); });

     // body angle
     document.getElementById('body').addEventListener('mousemove', function () { g_bodyangle = this.value; renderAllShapes(); });

    // lighting angles
    document.getElementById('Xlight').addEventListener('mousemove', function (ev) { if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes(); }});
    document.getElementById('Ylight').addEventListener('mousemove', function (ev) { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes(); }});
    document.getElementById('Zlight').addEventListener('mousemove', function (ev) { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes(); }});
    
    document.getElementById('animationon').onclick = function() { g_animation = true; };
    document.getElementById('animationoff').onclick = function() { g_animation = false; };

    document.getElementById('LightOn').onclick = function() {g_LightOn = false; };
    document.getElementById('LightOff').onclick = function() {g_LightOn = true; };
}

function initTextures() {
    
    var image = new Image(); // Create an image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    } 
    
    // Register the event handler to be called on loading an image
    image.onload = function(){ sendTextureToTEXTURE0(image, u_Sampler0, 0); };
    // Tell the browser to load an image 
    image.src = 'sky.jpg';

    // add more texture loading

    var image1 = new Image(); // Create an image object
    if (!image1) {
        console.log('Failed to create the image1 object');
        return false;
    } 
    
    // Register the event handler to be called on loading an image
    image1.onload = function(){ sendTextureToTEXTURE0(image1, u_Sampler1, 1); };
    // Tell the browser to load an image 
    //image1.src = 'grass.jpeg';
    //image1.src = 'dirt.jpeg';
    image1.src = 'floor.jpg';

    var image2 = new Image(); // Create an image object
    if (!image2) {
        console.log('Failed to create the image1 object');
        return false;
    } 
    
    // Register the event handler to be called on loading an image
    image2.onload = function(){ sendTextureToTEXTURE0(image2, u_Sampler2, 2); };
    // Tell the browser to load an image 
    image2.src = 'elephant.jpeg';

    return true;
}

function sendTextureToTEXTURE0(image, sampler, i) { 
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    
     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
     // Enable the texture unit 0
     if (i == 0) {
        gl.activeTexture(gl.TEXTURE0);
     }
     else if (i == 1) {
        gl.activeTexture(gl.TEXTURE1);
     }
     else if (i == 2) {
        gl.activeTexture(gl.TEXTURE2);
     }
     // Bind the texture object to the target
     gl.bindTexture(gl.TEXTURE_2D, texture);
     
     // Set the texture parameters
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
     // Set the texture image
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
     
     // Set the texture unit 0 to the sampler
     gl.uniform1i(sampler, i);
}
function main() {
  
    // set up canvas and GL vars
    setupWebGL();
    // set up GLSL shaders programs + connect GLSL vars
    connectVariablesToGLSL();

    // set up actions for HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    // //canvas.onmousemove = click;
    // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
    document.onkeydown = keydown;

    initTextures();

    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { cammove(ev); } };
    //canvas.onmousedown = function(ev) { if (ev.shiftKey) { g_specialAnimation = true;}};


    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);  

    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
    g_seconds = performance.now()/1000.0-g_startTime;
    //console.log(g_seconds);
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);

}

let headAngle = 0;
let bodyangle = 0
let trunkangle = 0
let earsangle = 0
let bottrunk = 0;
let trunkSwingDirection = 1;

function updateAnimationAngles() {
    if (g_animation) {
        headAngle = 15*Math.sin(g_seconds);
        trunkangle = 8*Math.sin(g_seconds);
        earsangle = 30*Math.sin(g_seconds);
        bodyangle = 10*Math.sin(g_seconds);
        bottrunk = 10*Math.sin(g_seconds);
    }
    else {
        headAngle = g_headAngle;
        trunkangle = g_trunkAngle;
        earsangle =  g_earsangle
        bodyangle = g_bodyangle
        bottrunk = g_bottrunkAngle
    }

    g_lightPos[0] = Math.cos(g_seconds);
}
var g_shapesList = [];

function click(ev) {
  
    // extract event click + return it in WebGL coords
    let [x,y] = convertCoordinatesEventToGL(ev);

    // create + store new point
    let point;
    if (g_selectedType==POINT) {
        point = new Point();
    } else if (g_selectedType==TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegs;
    }
    point.position=[x, y];
    point.color = g_selectedColor.slice()
    point.size = g_selectedSize;
    g_shapesList.push(point)


    // draw every shape that should be in canvas
    renderAllShapes();
}

let rotateanglex = 0;
let rotateangley = 0;

function cammove(ev){
    rotateanglex += ev.movementX;
    rotateangley += ev.movementY;
  }

// extract event click + return it in WebGL coords
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x, y]);
}


function sendTextToHTML(text, htmlID) {
    var htmlEm = document.getElementById(htmlID);
    if (!htmlEm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlEm.innerHTML = text;
}

var g_cameraAngle = 0; // Global variable for camera rotation angle

function keydown(ev) {
    switch(ev.keyCode) {
        case 87: // W 
            //g_eye[2] -= 0.2; // move camera forward
            g_eye[2] -= 0.2 * Math.cos(g_cameraAngle * Math.PI / 180);
            g_eye[0] -= 0.2 * Math.sin(g_cameraAngle * Math.PI / 180);
            break;
        case 83: // S 
            //g_eye[2] += 0.2; // move camera backward
            g_eye[2] += 0.2 * Math.cos(g_cameraAngle * Math.PI / 180);
            g_eye[0] += 0.2 * Math.sin(g_cameraAngle * Math.PI / 180);
            break;
        case 65: // A 
            //g_eye[0] -= 0.2; // move camera left
            g_eye[0] -= 0.2 * Math.cos(g_cameraAngle * Math.PI / 180);
            g_eye[2] += 0.2 * Math.sin(g_cameraAngle * Math.PI / 180);
            break;
        case 68: // D 
            //g_eye[0] += 0.2; // move camera right
            g_eye[0] += 0.2 * Math.cos(g_cameraAngle * Math.PI / 180);
            g_eye[2] -= 0.2 * Math.sin(g_cameraAngle * Math.PI / 180);
            break;
        case 81: // Q 
            g_cameraAngle -= 5; // rotate left
            break;
        case 69: // E 
            g_cameraAngle += 5; // rotate right
            break;
        case 39: 
            g_eye[0] += 0.2;
            break;
        case 37: 
            g_eye[0] -= 0.2;
            break;
        default:
            return; 
    }
    renderAllShapes(); // re-render the scene with the new camera position
}

var g_eye = [0,1,3.5];
var g_at = [0,0,0];
var g_up = [0,1,0];

// draw every shape that should be in canvas
function renderAllShapes() {
    // check start time
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    //viewMat.setLookAt(1,1,3.5, 0,0,0, 0,1,0);
    //viewMat.setLookAt(0, 0, -1, 0,0,0, 0,1,0);
    //viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); // (eye, at, up)
    viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_eye[0] + Math.sin(g_cameraAngle * Math.PI / 180), g_eye[1], g_eye[2] - Math.cos(g_cameraAngle * Math.PI / 180), 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // pass matrix to u_modelmatrix attrib
    // var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    var globalRotMat = new Matrix4().rotate(rotateanglex, 0, 1, 0).rotate(rotateangley, 1, 0, 0);
    globalRotMat.translate(-.25,.3,0);
    globalRotMat.scale(0.75, 0.75, 0.75);
    globalRotMat.rotate(g_xangle, 0, 1, 0);
    globalRotMat.rotate(g_yangle, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    renderScene();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + duration.toFixed(2) + " fps: " + Math.floor(10000/duration), "numdot");

}

// Function to add a new block
function addBlock() {
    var newBlock = new Cube(); // Assuming you have a Cube class that can create blocks
    newBlock.color = [1, 1, 1, 1]; // Default white color
    newBlock.matrix.setTranslate(0.9, -0.1, -.3); 
    newBlock.matrix.scale(0.5, 0.5, 0.5); // Default size
    g_shapesList.push(newBlock); // Add this block to the shapes list
    renderAllShapes(); // Re-render the scene
}

// Function to delete the last added block
function deleteBlock() {
    if (g_shapesList.length > 0) {
        g_shapesList.pop(); // Remove the last block from the list
        renderAllShapes(); // Re-render the scene
    }
}

function renderScene() {
    // Floor
    var floor = new Cube();
    floor.color = [1, 0, 0, 1];
    floor.textureNum = 1;
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-0.5, -0.5, -0.5);
    floor.render();

    // Sky
    var sky = new Cube();
    sky.color = [1, 0, 0, 1];
    sky.textureNum = 0;
    if (g_normalOn) sky.textureNum = -3;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // Body
     var body = new Cube();
     body.color = [0.4, 0.4, 0.4, 1.0]; // Grey color
     body.textureNum = 2;
     if (g_normalOn) body.textureNum = -3;
     body.matrix.setTranslate(0.9, -0.1, -.3);
     body.matrix.scale(1.1, 0.6, 0.8); // Scale it to elongated cube
     body.matrix.rotate(90, 0, 1, 0); // Rotate to face side
     body.matrix.rotate(180, 0, 1, 0); // Additional rotation to face left
     body.matrix.rotate(bodyangle, 0.3, 0, 0);
     body.render();

     // Head
     var head = new Cube();
     head.color = [0.5, 0.5, 0.5, 1.0]; // Grey color
     head.textureNum = 2;
     head.matrix.setTranslate(-0.1, 0.1, -0.2); // Adjust position to be on the left side
     head.matrix.scale(0.5, 0.5, 0.6); // Smaller cube for the head
     head.matrix.rotate(90, 0, 1, 0); // Maintain side view orientation
     head.matrix.rotate(180, 0, 1, 0); // Additional rotation to face left
     head.matrix.rotate(headAngle, 1, 0, 0);
     var headcoords = new Matrix4(head.matrix);
     var headcoords1 = new Matrix4(head.matrix);
     var headcoords2 = new Matrix4(head.matrix);
     head.render();

     // Ears
     var leftEar = new Cube();
     leftEar.color = [0.3, 0.3, 0.3, 1.0]; // Grey color
     leftEar.matrix = headcoords;
     leftEar.matrix.translate(1, 0.4, 0.6); // Adjust ear positions to the left
     leftEar.matrix.rotate(earsangle, -0.5, 1, 0); // Rotate around the z-axis for sway
     leftEar.matrix.scale(0.5, 0.5, 0.1); // Flat and wide for ears
     // leftEar.matrix.rotate(90, 0, 1, 0); // Ensure side view
     // leftEar.matrix.rotate(180, 0, 1, 0); // Additional rotation to face left
     leftEar.render();

     var rightEar = new Cube();
     rightEar.color = [0.3, 0.3, 0.3, 1.0];
     rightEar.matrix = headcoords1;
     rightEar.matrix.translate(-0.5, 0.4, 0.6);
     rightEar.matrix.rotate(earsangle, 0.5, 1, 0); // Rotate around the z-axis for sway
     rightEar.matrix.scale(0.5, 0.5, 0.1);
     // rightEar.matrix.rotate(90, 0, 1, 0);
     // rightEar.matrix.rotate(180, 0, 1, 0);
     rightEar.render();

     // Trunk
     var trunk = new Cube();
     trunk.color = [0.3, 0.3, 0.3, 1.0];
     trunk.matrix = headcoords2;
     trunk.matrix.translate(0.35, -0.5, 0.9); // Adjust trunk position to the left
     trunk.matrix.rotate(trunkangle, 1, 0, 1); // Rotate around the z-axis for sway
     trunk.matrix.scale(0.3, 1.2, 0.2);
     var trunkcoords = new Matrix4(trunk.matrix);
     trunk.render();

     //Trunk2
     var trunk2 = new Cube();
     trunk2.color = [0.3, 0.3, 0.3, 1.0];
     trunk2.matrix = trunkcoords;
     trunk2.matrix.translate(0, -0.5, 0); // Adjust trunk position to the left
     trunk2.matrix.scale(1, 0.6, 1);
     //trunk.matrix.rotate(trunkAngle, 0, 1, 0); // Rotate around the z-axis for sway
     trunk2.matrix.rotate(bottrunk, 1, 0, 0);
     trunk2.render();

     // Legs
     function createLeg(x, z) {
         var leg = new Cube();
         leg.color = [0.4, 0.4, 0.4, 1.0];
         leg.matrix.translate(x, -0.5, z);
         leg.matrix.scale(0.2, 0.5, 0.2); // Short and stout for legs
         leg.matrix.rotate(90, 0, 1, 0); // Orient legs for side view
         leg.matrix.rotate(180, 0, 1, 0); // Additional rotation to face left
         leg.render();
     }
     createLeg(0.9, 0.3);
     createLeg(0.6, -0.3);
     createLeg(0.3, 0.3);
     createLeg(0, -0.3);

     // pass the light pos to GLSL
     gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

     // pass camera pos to GLSL
     gl.uniform3f(u_cameraPos,  g_eye[0], g_eye[1], g_eye[2]);

     gl.uniform1f(u_lightOn, g_LightOn);

     // draw light
     var light = new Cube();
     light.color = [2,2,0,1];
     light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
     light.matrix.scale(.1,.1,.1);
     light.matrix.translate(-.5,-.5,-.5);
     light.render();

     var sph = new Sphere();
     sph.matrix.translate(-2, 3, -2);
     sph.render();


 }