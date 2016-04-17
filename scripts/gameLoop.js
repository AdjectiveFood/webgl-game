/*jshint unused: false*/
/*global Rendering*/
'use strict';
const startGameLoop = (function(){
    //fps stuff
    const fpsCounter = document.getElementById('fpsCounter');
    const maxFps = 61;
    const timestep = 1000 / 60;
    var lastFrameTimeMs = 0;
    var framesThisSecond = 0;
    var lastFpsUpdate = 0;
    var fps = maxFps;
    var delta = 0;
    
    //canvas
    // const background = Rendering.createCanvas('test',800, 600);
    const test = Rendering.createCanvas('test',800, 600,1);
    
    //test
    var i = 0;
    const speed = 0.03;

    function updateFps(timestamp){
        if (timestamp > lastFpsUpdate + 1000) { // update every second
            fps = 0.75 * framesThisSecond + 0.25 * fps; // compute the new FPS

            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
            fpsCounter.innerHTML = Math.floor(fps);
        }
        framesThisSecond++;
    }

    function eraseCanvas(canvas, color){
        canvas.fillCanvas(color);
    }
    
    function update(delta){
        i += speed*delta;
    }
    
    function draw(){
        eraseCanvas(test, 'black');
        Rendering.TileMapRenderer.buildBasicWorldFromScratch(100, 100,test);
    }

    //http://www.isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
    function gameloop(timestamp){
        //throttle the frame rate
        if(timestamp < lastFrameTimeMs + (1000/maxFps)){
            requestAnimationFrame(gameloop);
            return;
        }
        
        delta += timestamp - lastFrameTimeMs;
        lastFrameTimeMs = timestamp;
        
        updateFps(timestamp);
        
        while(delta >= timestep){
            update(delta);
            delta -= timestep;
        }
        
        draw();

        requestAnimationFrame(gameloop);
    }

    requestAnimationFrame(gameloop);
}());