/*globals mat4, ShapeFactory, vec4*/
/*jshint unused: false*/
'use strict';
var webGL = (function () {
    
    var gl;
    var currentShaderProgram;
    var glCanvas;

    var DrawableBuffer = [];
    
    function initWebGL(canvas) {
        gl = null;

        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            glCanvas = canvas;
        } catch (e) {}

        // If we don't have a GL context, give up now
        if (!gl) {
            window.alert('Unable to initialize WebGL. Your browser may not support it.');
            gl = null;
        }

        return gl;
    }
    
    /**
    * Get WebGL ready for usage.
    **/
    function startWebGL() {
        var canvas = document.getElementById('cMain');
        gl = initWebGL(canvas);
        
        if (gl) {
            // Set clear color to black, fully opaque
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // Enable depth testing
            gl.enable(gl.DEPTH_TEST);
            // Near things obscure far things
            gl.depthFunc(gl.LEQUAL);
            // Clear the color as well as the depth buffer.
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //load the shaders from the Dom
            var fragmentShader = getShaderFromDom('shader-fs');
            var vertexShader = getShaderFromDom('shader-vs');
            //create an empty gl program
            currentShaderProgram = createProgramWithShaders(vertexShader, fragmentShader);
            //use the program
            gl.useProgram(currentShaderProgram);
            //hack to push vars
            currentShaderProgram.vertexPositionAttribute = gl.getAttribLocation(currentShaderProgram, 'aVertexPosition');
            gl.enableVertexAttribArray(currentShaderProgram.vertexPositionAttribute);
            currentShaderProgram.rgba = gl.getUniformLocation(currentShaderProgram, 'rgba');
            currentShaderProgram.pMatrixUniform = gl.getUniformLocation(currentShaderProgram, 'uPMatrix');
            currentShaderProgram.mvMatrixUniform = gl.getUniformLocation(currentShaderProgram, 'uMVMatrix');

            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

            drawScene();
        }
    }

    function createProgramWithShaders(vertexShader, fragmentShader){
        var newProgram = gl.createProgram();
        //attach the shaders to the program
        gl.attachShader(newProgram, fragmentShader);
        gl.attachShader(newProgram, vertexShader);
        //link the program
        gl.linkProgram(newProgram);
        //TODO assert
        if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
          window.alert('Could not initialise shaders');
          return;
        }

        return newProgram;
    }

    function getShaderFromDom(id) {
        var shaderScriptElement, shaderSource, currentChild, shader;

        shaderScriptElement = document.getElementById(id);

        if (!shaderScriptElement) {
            return null;
        }

        shaderSource = '';
        currentChild = shaderScriptElement.firstChild;

        while(currentChild) {
            if (currentChild.nodeType == currentChild.TEXT_NODE) {
                shaderSource += currentChild.textContent;
            }

            currentChild = currentChild.nextSibling;
        }

        if (shaderScriptElement.type == 'x-shader/x-fragment') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScriptElement.type == 'x-shader/x-vertex') {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            // Unknown shader type
            return null;
        }

        gl.shaderSource(shader, shaderSource);
    
        // Compile the shader program
        gl.compileShader(shader);  

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
            window.alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));  
            return null;  
        }

        return shader;
    }

    function drawSingleObject(drawable){
        gl.uniform4fv(currentShaderProgram.rgba, drawable.getColor());

        var mvMatrix = mat4.create();
        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, mvMatrix, [drawable.getWorldPosition().x, drawable.getWorldPosition().y, drawable.getLayer()]);
        mat4.scale(mvMatrix, mvMatrix, [drawable.getScale().x, drawable.getScale().y,0]);
        mat4.rotateZ(mvMatrix, mvMatrix, drawable.getRotation());
        gl.uniformMatrix4fv(currentShaderProgram.mvMatrixUniform, false, mvMatrix);

        var shape = drawable.getShape();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(currentShaderProgram.vertexPositionAttribute, shape.itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.numItem);
    }

    function indexToScreenPosition(tileData, cameraData){
        var screenPosition = {};
        
        screenPosition.x = ((cameraData.zoom - (1-Math.sin(Math.PI/3))*cameraData.zoom)*2)*tileData.x;
        //offset
        screenPosition.x -= tileData.y%2 === 0 ? (cameraData.zoom - (1-Math.sin(Math.PI/3))*cameraData.zoom): 0;

        screenPosition.y = ((cameraData.zoom + (Math.cos(Math.PI/3))*cameraData.zoom)*1)*tileData.y;

        // screenPosition.x += cameraData.getX();

        // screenPosition.y += cameraData.getY();
        
        return screenPosition;
    }

    var testTransform = {
        worldPosition: [400, 300],
        layer: 1,
        rotation: Math.PI/2,
        scale: {x: 50, y:50}
    }

    function drawScene() {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var pMatrix = mat4.create();
        mat4.ortho(pMatrix, 0.0, gl.drawingBufferWidth, 0.0, gl.drawingBufferHeight, 0.1, 100);
        gl.uniformMatrix4fv(currentShaderProgram.pMatrixUniform, false, pMatrix);

        var drawable = VisualObject.createDrawable(ShapeFactory.hexagon, [0, 255, 0, 1], 400, 300, -1, 50, 50, Math.PI/2);
        drawSingleObject(drawable);
        DrawableBuffer.forEach(function(drawable){
            drawSingleObject(drawable);
        });
    }

    //public stuff
    return {
        startWebGL: startWebGL
    };
}());