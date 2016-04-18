/*globals mat4, ShapeFactory, vec4*/
/*jshint unused: false*/
'use strict';
var WebGL = (function () {
    const WebGLContext = function(){
        var gl;
        var data = {
            drawableBuffer: [],
            currentShaderProgram: null,
            glCanvas: null,
            vertexShader: null,
            fragmentShader: null
        }

        function initWebGL(canvas) {
            gl = null;

            try {
                // Try to grab the standard context. If it fails, fallback to experimental.
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                data.glCanvas = canvas;
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
        function startWebGL(canvasDomId) {
            var canvas = document.getElementById(canvasDomId);
            Utils.assert(canvas !== null);
            gl = initWebGL(canvas);
            
            if (gl) {
                // Set clear color to black, fully opaque
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                // Enable depth testing
                gl.enable(gl.DEPTH_TEST);
                // Near things obscure far things
                gl.depthFunc(gl.LEQUAL);

                //load the shaders from the Dom
                setFragmentShader('shader-fs');
                setVertexShader('shader-vs');

                gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            }

            return this;
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

        /**
        * Create a shader program if the vertex and fragment shader are set.
        */
        function useShaderProgram(){
            if(data.vertexShader && data.fragmentShader){
                data.currentShaderProgram = createProgramWithShaders(data.vertexShader, data.fragmentShader);
                gl.useProgram(data.currentShaderProgram);
                //hack to push vars
                data.currentShaderProgram.vertexPositionAttribute = gl.getAttribLocation(data.currentShaderProgram, 'aVertexPosition');
                gl.enableVertexAttribArray(data.currentShaderProgram.vertexPositionAttribute);
                data.currentShaderProgram.rgba = gl.getUniformLocation(data.currentShaderProgram, 'rgba');
                data.currentShaderProgram.pMatrixUniform = gl.getUniformLocation(data.currentShaderProgram, 'uPMatrix');
                data.currentShaderProgram.mvMatrixUniform = gl.getUniformLocation(data.currentShaderProgram, 'uMVMatrix');
            }
        }

        const setVertexShader = function(domId){
            data.vertexShader = getShaderFromDom('shader-vs');
            useShaderProgram();
        }

        const setFragmentShader = function(domId){
            data.fragmentShader = getShaderFromDom('shader-fs');
            useShaderProgram();
        }

        //Performance matter for this function
        //TODO: Batch draws together
        function drawSingleObject(drawable){
            gl.uniform4fv(data.currentShaderProgram.rgba, drawable.getColor());

            var mvMatrix = mat4.create();
            mat4.identity(mvMatrix);

            mat4.translate(mvMatrix, mvMatrix, [drawable.getWorldPosition().x, drawable.getWorldPosition().y, drawable.getLayer()]);
            mat4.scale(mvMatrix, mvMatrix, [drawable.getScale().x, drawable.getScale().y,0]);
            mat4.rotateZ(mvMatrix, mvMatrix, drawable.getRotation());
            gl.uniformMatrix4fv(data.currentShaderProgram.mvMatrixUniform, false, mvMatrix);

            var shape = drawable.getShape();
            
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(data.currentShaderProgram.vertexPositionAttribute, shape.itemSize, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.numItem);
        }

        //Performance matter for this function
        const drawScene = function() {
            var frame = {vertices: [], numItem: 0, itemSize: 3};

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            clearScreen();

            var pMatrix = mat4.create();
            mat4.ortho(pMatrix, 0.0, gl.drawingBufferWidth, 0.0, gl.drawingBufferHeight, -0.1, -100);
            gl.uniformMatrix4fv(data.currentShaderProgram.pMatrixUniform, false, pMatrix);

            for(var i=0; i < data.drawableBuffer.length; i++){
                drawSingleObject(data.drawableBuffer[i]);
            }

            data.drawableBuffer = [];
        }

        const addToDraw = function(drawable){
            data.drawableBuffer.push(drawable);
        }

        const clearScreen = function(){
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        return {
            startWebGL: startWebGL,
            addToDraw: addToDraw,
            drawScene: drawScene,
            clearScreen: clearScreen
        }
    }

    //public stuff
    return {
        createContext: function(canvasDomId){
            return WebGLContext().startWebGL(canvasDomId);
        },
        smokeTest: function(canvasDomId){
            var context = WebGLContext().startWebGL(canvasDomId);
            var drawable = VisualObject.createDrawable(ShapeFactory.hexagon, [0, 255, 0, 1], 400, 300, -1, 50, 50, Math.PI/2);
            context.addToDraw(drawable);
            context.drawScene();
            return context;
        }
    };
}());