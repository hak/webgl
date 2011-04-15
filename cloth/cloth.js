/*
* Copyright 2011, Hakuro Matsuda (hakuroum@gmail.com)
* All rights reserved.
*
*/

clothSim = function() {


var init = function(width, height)
{
	if( width % 2 )
	{
		alert("width need to be multiple of 2!");
		return;
	}
	var object = new Array( width * height );

	//Initialize connections
	var index = 0;
	var totalSize = 4.0;
	var length_normal = totalSize / (width-1);
	var length_diagonal = length_normal * 1.4142;
	for( var y = 0; y < height; ++y )
	{
		for( var x = 0; x < width; ++x )
		{
			var array = new Array();
			var arraySpring = new Array();
			if( (x == 0 && y == width - 1 )
			|| (x == width - 1 && y == width - 1)
			|| (x == width / 2 && y == width - 1))
			{
				//Fixed
			}
			else
			{
				if( x >= 1 )
				{
					array.push( y * width + (x - 1) );
					arraySpring.push( length_normal );
				}
				if( x <= width - 2 )
				{
					array.push( y * width + (x + 1) );
					arraySpring.push( length_normal );
				}
				if( y >= 1 )
				{
					array.push( (y - 1) * width + x );
					arraySpring.push( length_normal );
				}
				if( y <= height - 2 )
				{
					array.push( (y + 1) * width + x );
					arraySpring.push( length_normal );
				}
				//
				if( x >= 1 && y >=1 )
				{
					array.push( (y - 1) * width + (x - 1) );
					arraySpring.push( length_diagonal );
				}
				if( x >= 1 && y <= height - 2 )
				{
					array.push( (y + 1) * width + (x - 1) );
					arraySpring.push( length_diagonal );
				}
				if( x <= width - 2 && y >=1 )
				{
					array.push( (y - 1) * width + (x + 1) );
					arraySpring.push( length_diagonal );
				}
				if( x <= width - 2 && y <= height - 2 )
				{
					array.push( (y + 1) * width + (x + 1) );
					arraySpring.push( length_diagonal );
				}

			}
			
			object[ index ] = new Object();
			object[ index ].connections = new Uint16Array( array );
			object[ index ].springLength = new Float32Array( arraySpring );
			index++;
		}
	}
	
	//Init arrays
	var arrayPosition =  new Float32Array(width * height * 9);
	var arrayParameters =  new Float32Array(width * height * 6);
						//Each node has: Velocity:3, Force:3
						
	//Init Positions
	var index = 0;
	var unitX = totalSize / width;
	var unitY = totalSize / height;
	var startX = -totalSize / 2.0;
	var startY = -totalSize / 2.0;
	for( var i = 0; i < height; ++i )
	{
		for( var j = 0; j < width; ++j )
		{
			arrayPosition[ index++ ] = startX + unitX * j;
			arrayPosition[ index++ ] = startY + unitY * i;
			arrayPosition[ index++ ] = 0.0;

			arrayPosition[ index++ ] = 1.0;
			arrayPosition[ index++ ] = 0.0;
			arrayPosition[ index++ ] = 0.0;

			arrayPosition[ index++ ] = 0.0;
			arrayPosition[ index++ ] = 1.0;
			arrayPosition[ index++ ] = 0.0;
		}
	}

	//Init indices
	var arrayIndices =  new Uint16Array(width * height * 6);
	index = 0;
	for( var i = 0; i < height - 1; ++i )
	{
		for( var j = 0; j < width - 1; ++j )
		{
			arrayIndices[ index++ ] = i * width + j;
			arrayIndices[ index++ ] = i * width + j + 1;
			arrayIndices[ index++ ] = (i + 1 ) * width + j;

			arrayIndices[ index++ ] = (i + 1 ) * width + j;
			arrayIndices[ index++ ] = (i + 1 ) * width + j + 1;
			arrayIndices[ index++ ] = i * width + j + 1;
		}
	}
	
	var arrayUV =  new Float32Array(width * height * 2);
	index = 0;
	for( var i = 0; i < height; ++i )
	{
		for( var j = 0; j < width; ++j )
		{
			arrayUV[ index++ ] = i * 1.0/(height - 1);
			arrayUV[ index++ ] = 1.0 - j * 1.0/(width - 1);
		}
	}
	
	var counter = 0;
	var update = function()
	{
		var targetForce = vec3.create();
		var targetPos = vec3.create();
		var vecTmp = vec3.create();
		var damper = -0.50;
		var gravity = 0.098;
		
		counter += 1.0;
		var r1 = counter/175.0;		
		var r2 = counter/25.5;
		var wind = (Math.sin(r1) * Math.sin(r2) * 0.5 ) * 0.5;
		
		for( var i = 0; i < object.length; ++i )
		{
			if( object[ i ].connections.length == 0 )
				continue;

			//Reset force
			targetForce[ 0 ] = arrayParameters[ i * 6 + 3 ] * damper;
			targetForce[ 1 ] = arrayParameters[ i * 6 + 4 ] * damper - gravity;
			targetForce[ 2 ] = arrayParameters[ i * 6 + 5 ] * damper + wind;
			
			targetPos[ 0 ] = arrayPosition[ i * 9 + 0 ];
			targetPos[ 1 ] = arrayPosition[ i * 9 + 1 ];
			targetPos[ 2 ] = arrayPosition[ i * 9 + 2 ];
			
			for( var j = 0; j < object[ i ].connections.length; ++j )
			{
				var index = object[ i ].connections[ j ];
				
				vecTmp[ 0 ] = targetPos[ 0 ] - arrayPosition[ index * 9 + 0 ];
				vecTmp[ 1 ] = targetPos[ 1 ] - arrayPosition[ index * 9 + 1 ];
				vecTmp[ 2 ] = targetPos[ 2 ] - arrayPosition[ index * 9 + 2 ];
				var length = vec3.length( vecTmp );				
				//Normalize
				vecTmp[ 0 ] /= length;
				vecTmp[ 1 ] /= length;
				vecTmp[ 2 ] /= length;

				vecTmp[ 0 ] *= (object[ i ].springLength[ j ] - length) * 4;
				vecTmp[ 1 ] *= (object[ i ].springLength[ j ] - length) * 4;
				vecTmp[ 2 ] *= (object[ i ].springLength[ j ] - length) * 4;
				
				targetForce[ 0 ] += vecTmp[ 0 ];
				targetForce[ 1 ] += vecTmp[ 1 ];
				targetForce[ 2 ] += vecTmp[ 2 ];
			}

			arrayParameters[ i * 6 + 0 ] = targetForce[ 0 ];
			arrayParameters[ i * 6 + 1 ] = targetForce[ 1 ];
			arrayParameters[ i * 6 + 2 ] = targetForce[ 2 ];
			
		}

		var dt = 1.00 / 15.0;
		//Update position
		for( var i = 0; i < width*height; ++i )
		{
			//Update v
			arrayParameters[ i * 6 + 3 ] += arrayParameters[ i * 6 + 0 ] * dt;
			arrayParameters[ i * 6 + 4 ] += arrayParameters[ i * 6 + 1 ] * dt;
			arrayParameters[ i * 6 + 5 ] += arrayParameters[ i * 6 + 2 ] * dt;
			
			//Update p
			arrayPosition[ i * 9 + 0 ] += arrayParameters[ i * 6 + 3 ] * dt;
			arrayPosition[ i * 9 + 1 ] += arrayParameters[ i * 6 + 4 ] * dt;
			arrayPosition[ i * 9 + 2 ] += arrayParameters[ i * 6 + 5 ] * dt;
		}
		
		//
		//Update normal
		//quick version
		//
		index = 0;
		for( var y = 1; y < height - 1; ++y )
		{
			for( var x = 1; x < width - 1; ++x )
			{
				index = (y * width + x) * 9;
				//Update p
				arrayPosition[ index + 3 ] = arrayPosition[ index + 9 + 0 ] - arrayPosition[ index - 9 + 0 ];
				arrayPosition[ index + 4 ] = arrayPosition[ index + 9 + 1 ] - arrayPosition[ index - 9 + 1 ];
				arrayPosition[ index + 5 ] = arrayPosition[ index + 9 + 2 ] - arrayPosition[ index - 9 + 2 ];

				arrayPosition[ index + 6 ] = arrayPosition[ index + width * 9 + 0 ] - arrayPosition[ index - width * 9 + 0 ];
				arrayPosition[ index + 7 ] = arrayPosition[ index + width * 9 + 1 ] - arrayPosition[ index - width * 9 + 1 ];
				arrayPosition[ index + 8 ] = arrayPosition[ index + width * 9 + 2 ] - arrayPosition[ index - width * 9 + 2 ];
			}
		}

		//
		//Edges
		//
		for( var y = 0; y < height - 1; ++y )
		{
			x = 0;
			index = (y * width + x) * 9;
			//Update p
			arrayPosition[ index + 3 ] = arrayPosition[ index + 9 + 3 ];
			arrayPosition[ index + 4 ] = arrayPosition[ index + 9 + 4 ];
			arrayPosition[ index + 5 ] = arrayPosition[ index + 9 + 5 ];
			arrayPosition[ index + 6 ] = arrayPosition[ index + 9 + 6 ];
			arrayPosition[ index + 7 ] = arrayPosition[ index + 9 + 7 ];
			arrayPosition[ index + 8 ] = arrayPosition[ index + 9 + 8 ];		

			x = width - 1;
			index = (y * width + x) * 9;
			//Update p
			arrayPosition[ index + 3 ] = arrayPosition[ index - 9 + 3 ];
			arrayPosition[ index + 4 ] = arrayPosition[ index - 9 + 4 ];
			arrayPosition[ index + 5 ] = arrayPosition[ index - 9 + 5 ];
			arrayPosition[ index + 6 ] = arrayPosition[ index - 9 + 6 ];
			arrayPosition[ index + 7 ] = arrayPosition[ index - 9 + 7 ];
			arrayPosition[ index + 8 ] = arrayPosition[ index - 9 + 8 ];		

		}

		for( var x = 0; x < width - 1; ++x )
		{
			y = 0;
			index = (y * width + x) * 9;
			//Update p
			arrayPosition[ index + 3 ] = arrayPosition[ index + 9*width + 3 ];
			arrayPosition[ index + 4 ] = arrayPosition[ index + 9*width + 4 ];
			arrayPosition[ index + 5 ] = arrayPosition[ index + 9*width + 5 ];
			arrayPosition[ index + 6 ] = arrayPosition[ index + 9*width + 6 ];
			arrayPosition[ index + 7 ] = arrayPosition[ index + 9*width + 7 ];
			arrayPosition[ index + 8 ] = arrayPosition[ index + 9*width + 8 ];		

			y = height - 1;
			index = (y * width + x) * 9;
			//Update p
			arrayPosition[ index + 3 ] = arrayPosition[ index - 9*width + 3 ];
			arrayPosition[ index + 4 ] = arrayPosition[ index - 9*width + 4 ];
			arrayPosition[ index + 5 ] = arrayPosition[ index - 9*width + 5 ];
			arrayPosition[ index + 6 ] = arrayPosition[ index - 9*width + 6 ];
			arrayPosition[ index + 7 ] = arrayPosition[ index - 9*width + 7 ];
			arrayPosition[ index + 8 ] = arrayPosition[ index - 9*width + 8 ];		
		}
	
		return arrayPosition;
	};
	
	
	var captured = {};
	var pick = function( id, a, b, c, p, q, r )
	{
		var closestIndex = -1;
		if( captured[ id ] != null )
		{
			release( id );
		}
		
		var n = Math.sqrt( p * p + q * q + r * r );
		var normP = p / n;
		var normQ = q / n;
		var normR = r / n;
		
		var index = 0;
		var minDistance = 10.0;
		for( var i = 0; i < width * height; ++i )
		{
			var x = (arrayPosition[ index + 0 ] - a);
			var y = (arrayPosition[ index + 1 ] - b);
			var z = (arrayPosition[ index + 2 ] - c);
			
			//Normalize
			var n = Math.sqrt( x * x + y * y + z * z );
			x /= n;
			y /= n;
			z /= n;
			
			x -= normP;
			y -= normQ;
			z -= normR;
			
			var distance = x * x + y * y + z * z;
			if( distance < minDistance )
			{
				closestIndex = i;
				minDistance = distance;
			}
			
			index += 9;			
		}

		captured[ id ] = new Object();
		captured[ id ].obj = object[ closestIndex ].connections;
		captured[ id ].index = closestIndex;
		object[ closestIndex ].connections = new Uint16Array();

		return closestIndex;
	}	

	var move = function( id, x, y, z )
	{
		i = captured[ id ].index;
		arrayPosition[ i * 9 + 0 ] = x;
		arrayPosition[ i * 9 + 1 ] = y;
		arrayPosition[ i * 9 + 2 ] = z;
		arrayParameters[ i * 6 + 0 ] = 0.0;
		arrayParameters[ i * 6 + 1 ] = 0.0;
		arrayParameters[ i * 6 + 2 ] = 0.0;
		arrayParameters[ i * 6 + 3 ] = 0.0;
		arrayParameters[ i * 6 + 4 ] = 0.0;
		arrayParameters[ i * 6 + 5 ] = 0.0;
	}	
	
	var release = function( id )
	{
		object[ captured[ id ].index ].connections = captured[ id ].obj;
		captured[ id ] = null;
	}

	object.update = update;
	object.pick = pick;
	object.move = move;
	object.release = release;
	
	object.elementArray = arrayIndices;
	object.arrayUV = arrayUV;
	return object;
};


return {
  init: init
};
}();
