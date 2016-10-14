var THREE = require('../node_modules/three');

function room(id, par){
	
var self = this
var par = par
var loader = require("three-json-loader")(THREE);

	this.id = id
	this.OBJECT_LIST = [];
	this.conditions = []
	
	this.checkIfEnded = function(){
		for (var i in self.conditions){
			if (self.conditions[i]){
				delete par[self.id]
			}
		}
	}
	
	this.threeGeometry = [];
	this.faces = [];
	
	
	this.setFaces = function(fileName){
		data = require(fileName)
		self.threeGeometry.push(parse(data))
		
		//console.log(self.threeGeometry[0].faces[0])
	}
	
}

///exports.room = room

//var testRoom = new room(0, [])
//testRoom.setFaces('./maps/samplePlanet.json')

exports.room = room;

////////////////////////////
function parse( json ) {

    if ( json.metadata === undefined) {

        console.error( 'Deprecated file format.' );
        return;

    }

    function isBitSet( value, position ) {

        return value & ( 1 << position );

    };
	var scope = {
		faces : [],
		vertices : []
	}
    var i, j, 

    offset, zLength,

    type,
    isQuad, 
    hasMaterial, 
    hasFaceUv, hasFaceVertexUv,
    hasFaceNormal, hasFaceVertexNormal,
    hasFaceColor, hasFaceVertexColor,

    vertex, face,

    faces = json.faces,
    vertices = json.vertices,
    normals = json.normals,
    colors = json.colors,

    nUvLayers = 0;

    // disregard empty arrays

    for ( i = 0; i < json.uvs.length; i++ ) {

        if ( json.uvs[ i ].length ) nUvLayers ++;

    }

    for ( i = 0; i < nUvLayers; i++ ) {

        scope.faceUvs[ i ] = [];
        scope.faceVertexUvs[ i ] = [];

    }

    offset = 0;
    zLength = vertices.length;

    while ( offset < zLength ) {

		function vertexClass(){
			this.position = {x:0, y:0, z:0}
		}
		
        vertex = new vertexClass//THREE.Vertex();

        vertex.position.x = vertices[ offset ++ ];
        vertex.position.y = vertices[ offset ++ ];
        vertex.position.z = vertices[ offset ++ ];

        scope.vertices.push( vertex );

    }

    offset = 0;
    zLength = faces.length;

    while ( offset < zLength ) {

        type = faces[ offset ++ ];

        isQuad              = isBitSet( type, 0 );
        hasMaterial         = isBitSet( type, 1 );
        hasFaceUv           = isBitSet( type, 2 );
        hasFaceVertexUv     = isBitSet( type, 3 );
        hasFaceNormal       = isBitSet( type, 4 );
        hasFaceVertexNormal = isBitSet( type, 5 );
        hasFaceColor        = isBitSet( type, 6 );
        hasFaceVertexColor  = isBitSet( type, 7 );

        if ( isQuad ) {

            face = new THREE.Face4();

            face.a = faces[ offset ++ ];
            face.b = faces[ offset ++ ];
            face.c = faces[ offset ++ ];
            face.d = faces[ offset ++ ];

            nVertices = 4;

        } else {

            face = new THREE.Face3();

            face.a = faces[ offset ++ ];
            face.b = faces[ offset ++ ];
            face.c = faces[ offset ++ ];

            nVertices = 3;

        }

        if ( hasMaterial ) {

            materialIndex = faces[ offset ++ ];
            face.materials = scope.materials[ materialIndex ];

        }

        if ( hasFaceUv ) {

            for ( i = 0; i < nUvLayers; i++ ) {

                uvLayer = json.uvs[ i ];

                uvIndex = faces[ offset ++ ];

                u = uvLayer[ uvIndex * 2 ];
                v = uvLayer[ uvIndex * 2 + 1 ];

                scope.faceUvs[ i ].push( new THREE.UV( u, v ) );

            }

        }

        if ( hasFaceVertexUv ) {

            for ( i = 0; i < nUvLayers; i++ ) {

                uvLayer = json.uvs[ i ];

                uvs = [];

                for ( j = 0; j < nVertices; j ++ ) {

                    uvIndex = faces[ offset ++ ];

                    u = uvLayer[ uvIndex * 2 ];
                    v = uvLayer[ uvIndex * 2 + 1 ];

                    uvs[ j ] = new THREE.UV( u, v );

                }

                scope.faceVertexUvs[ i ].push( uvs );

            }

        }

        if ( hasFaceNormal ) {

            normalIndex = faces[ offset ++ ] * 3;

            normal = new THREE.Vector3();

            normal.x = normals[ normalIndex ++ ];
            normal.y = normals[ normalIndex ++ ];
            normal.z = normals[ normalIndex ];

            face.normal = normal;

        }

        if ( hasFaceVertexNormal ) {

            for ( i = 0; i < nVertices; i++ ) {

                normalIndex = faces[ offset ++ ] * 3;

                normal = new THREE.Vector3();

                normal.x = normals[ normalIndex ++ ];
                normal.y = normals[ normalIndex ++ ];
                normal.z = normals[ normalIndex ];

                face.vertexNormals.push( normal );

            }

        }

        if ( hasFaceColor ) {

            color = new THREE.Color( faces[ offset ++ ] );
            face.color = color;

        }

        if ( hasFaceVertexColor ) {

            for ( i = 0; i < nVertices; i++ ) {

                colorIndex = faces[ offset ++ ];

                color = new THREE.Color( colors[ colorIndex ] );
                face.vertexColors.push( color );

            }

        }

        scope.faces.push( face );

    }
		return scope
};