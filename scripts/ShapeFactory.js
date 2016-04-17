/*jshint unused: false*/
"use strict";
/**
* Build the basic shape needed
*/
const ShapeFactory = (function(){
    /*
    ** Private
    */
    function hexagonVertices(angle, vertices, limit){
        if(angle < limit){
            return hexagonVertices(angle + Math.PI/3, vertices.concat([Math.cos(angle), Math.sin(angle), 0]), limit);
        }else{
            return vertices;
        }
    }
    

    /*
    ** Public
    */
    const hexagonShape = {
      vertices: hexagonVertices(0, [], Math.PI*2),
      itemSize: 3,
      numItem: hexagonVertices(0, [], Math.PI*2).length/3
    };
    
    //TODO: change???
    const hexagonBorderShape = {
      vertices: hexagonVertices(Math.PI/3, [], Math.PI*2 - 2*Math.PI/3)  
    };
    return {   
        hexagon: hexagonShape,
        hexagonBorder: hexagonBorderShape
    };
}());