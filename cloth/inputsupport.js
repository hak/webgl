/*
* Copyright 2011, Hakuro Matsuda (hakuroum@gmail.com)
* All rights reserved.
*
*/

//
//Mouse motion
//
var mouseEvents = {};
var objectPool = [];

//
//Touch handler
//
function touchHandler(e) {
	if ( e.type == "touchstart" )
	{
		for( var i = 0; i < e.touches.length; ++i )
		{
			var touch = e.touches[i];
			handleMouseDown( touch );
		}
		e.preventDefault();
	} else if (e.type == "touchmove")
	{
		e.preventDefault();
		for( var i = 0; i < e.touches.length; ++i )
		{
			var touch = e.touches[i];
			handleMouseMove( touch );
		}
	} else if ( e.type == "touchend" )
	{
		e.preventDefault();
		for( var i = 0; i < e.changedTouches.length; ++i )
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
	{
		if( objectPool.length == 0 )
			mouseEvents[ event.identifier ] = new Object();
		else
		{
			mouseEvents[ event.identifier ] = objectPool[ objectPool.length - 1 ];
			objectPool.pop();
		}
	}

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

	objectPool.push( mouseEvents[ event.identifier ] );
	mouseEvents[ event.identifier ] = null;
	cloth.release( event.identifier );
}

function handleMouseMove(event) {
	if( event.identifier == null )
	{
		event.identifier = 0;
	}

	if( mouseEvents[ event.identifier ] == null )
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
