/*
* Copyright 2011, Hakuro Matsuda (hakuroum@gmail.com)
* All rights reserved.
*
*/

//
//Mouse motion
//
var mouseEvents = {};

//
//Touch handler
//
function touchHandler(e) {
	if ( e.type == "touchstart" )
	{
		if (e.touches.length == 1)
		{
			var touch = e.touches[0];
			handleMouseDown( touch );
		}
		e.preventDefault();
	} else if (e.type == "touchmove")
	{
		e.preventDefault();
		if ( e.touches.length == 1 )
		{
			var touch = e.touches[0];
			handleMouseMove( touch );
		}
	} else if ( e.type == "touchend" )
	{
		e.preventDefault();
		if ( e.touches.length == 1 )
		{
			var touch = e.changedTouches[0];
			handleMouseUp( touch );
		}
	}
}

function handleMouseDown(event) {
	if( event.identifier == null )
	{
		event.identifier = 0;
	}

	if( mouseEvents[ event.identifier ] == null )
		mouseEvents[ event.identifier ] = new Object();
	
	mouseEvents[ event.identifier ].active = true;
	mouseEvents[ event.identifier ].lastMouseX = event.clientX;
	mouseEvents[ event.identifier ].lastMouseY = event.clientY;
	
	var point = [ 0, 0, 0 ];
	var vec = [ 0, 0, 0 ];
	eyeVector( event.clientX, event.clientY, point, vec );

	cloth.pick( event.identifier, point[ 0 ], point[ 1 ], point[ 2 ],
		vec[ 0 ], vec[ 1 ], vec[ 2 ] );
	
	cloth.move( event.identifier, 
			point[ 0 ] - (vec[ 0 ] * point[ 2 ]/vec[2]),
			point[ 1 ] - (vec[ 1 ] * point[ 2 ]/vec[2]),
			0 );
	
}

function handleMouseUp(event) {
	if( event.identifier == null )
	{
		event.identifier = 0;
	}

	mouseEvents[ event.identifier ].active = false;
	cloth.release( event.identifier );
}

function handleMouseMove(event) {
	if( event.identifier == null )
	{
		event.identifier = 0;
	}

	if( mouseEvents[ event.identifier ] == null
		|| mouseEvents[ event.identifier ].active == false )
	{
		return;
	}

	var point = [ 0, 0, 0 ];
	var vec = [ 0, 0, 0 ];
	eyeVector( mouseEvents[ event.identifier ].lastMouseX, mouseEvents[ event.identifier ].lastMouseY, point, vec );

	cloth.move( event.identifier, 
		point[ 0 ] - (vec[ 0 ] * point[ 2 ]/vec[2]),
		point[ 1 ] - (vec[ 1 ] * point[ 2 ]/vec[2]),
		0 );

	mouseEvents[ event.identifier ].lastMouseX = event.clientX;
	mouseEvents[ event.identifier ].lastMouseY = event.clientY;
}

function initInput(canvas) {
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	document.addEventListener("touchmove",   touchHandler,  false);
	document.addEventListener("touchstart",  touchHandler,  false);
	document.addEventListener("touchend",    touchHandler,  false);
}
