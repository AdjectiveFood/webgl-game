'use strict';
const GameLoop = (function(){
    //fps stuff
    var fpsCounter;
    const maxFps = 61;
    const timestep = 1000 / 60;
    var lastFrameTimeMs = 0;
    var framesThisSecond = 0;
    var lastFpsUpdate = 0;
    var fps = maxFps;
    var delta = 0;
    
    //canvas
    var mainScreen;

    //test
    var greenHexagon = VisualObject.createDrawable(ShapeFactory.hexagon, [0, 255, 0, 1], 400, 300, 1, 50, 50, Math.PI/2);
    var redHexagon = VisualObject.createDrawable(ShapeFactory.hexagon, [255, 0, 0, 1], 450, 350, 3, 50, 50, Math.PI/2);

    var stressTest = [];
    for(var i=0; i < 2000; i++){
        stressTest.push(i%2 ? greenHexagon : redHexagon);
    }

    function updateFps(timestamp){
        if (timestamp > lastFpsUpdate + 1000) { // update every second
            fps = 0.75 * framesThisSecond + 0.25 * fps; // compute the new FPS

            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
            fpsCounter.innerHTML = Math.floor(fps);
        }
        framesThisSecond++;
    }
    
    function update(delta){
    }
    
    function draw(){
        stressTest.forEach(mainScreen.addToDraw);
        mainScreen.drawScene();
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

    const startGame = function(){
        mainScreen = WebGL.createContext('cMain');
        fpsCounter = document.getElementById('fpsCounter');
        requestAnimationFrame(gameloop);
    }

    return {
        startGame: startGame
    }
}());