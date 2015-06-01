#!/usr/local/bin/node

var http = require( "http" ),
	connect = require( "connect" ),
	app = connect(),
	fs = require( "fs" ),
	path = require( "path" ),
	url = require( "url" ),
	serveStatic = require('serve-static'),
	basePath = process.env[ "HOME" ] + "/Documents/LimeChat Transcripts/",
	pmfiles = fs.readdirSync( basePath + "Talk" ),
	channels =  getDirectories( basePath ),
	messages = {
		pms: {},
		channels: {}
	};

pmfiles.forEach(function( name ){
	if ( /^\./.test( name ) || /status/.test( name ) ) {
		return;
	}
	var parts = name.split( "_2" ),
		user = parts[ 0 ],
		date = "2" + parts[ 1 ].split( "_" )[ 0 ];

	messages.pms[ user ] = messages.pms[ user ] || {};
	messages.pms[ user ][ date ] = fs.readFileSync( basePath + "Talk/" + name, "utf8" ).split( "\n" );
});
channels.forEach( function( channel ) {
	var channelFiles = fs.readdirSync( basePath + channel );

	if( channel === "Talk" ) {
		return;
	}
	messages.channels[ channel ] = {};
	channelFiles.forEach(function( file ) {
		var date = file.split( "_" )[ 0 ],
			fileContents = fs.readFileSync( basePath + channel + "/" + file, "utf8" ).split( "\n" );

		messages.channels[ channel ][ date ] = fileContents;
	});
});
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}
app.use(function( req, res, next ){
	console.log( req.url )
	if ( /api/.test( req.url ) ) {
		var query = {},
			output = messages,
			urlBits = url.parse( req.url, true ),
			parts = urlBits.pathname.split( "/" );
		for ( i = 2; i < parts.length; i += 2 ) {
			query[ parts[ i ] ] = parts[ i + 1 ];
		}
		console.log( query );
		if ( query.type ) {
			output = output[ query.type ];
			if ( query.name ) {
				output = output[ ( query.type === "channels" ? "#" : "" ) + query.name ];
				if ( query.date ) {
					output = output[ query.date ];
				}
			}
		}
		console.log( urlBits.query );
		if ( urlBits.query.keys ) {
			console.log( "keys" );
			output = Object.keys( output );
		}
		if ( urlBits.query.format === "json" ) {
			var page = JSON.stringify( output );
		} else {
			var page = "window." + query.type + " = " + JSON.stringify( output ) + ";";
		}
		res.setHeader("Content-Type", "application/javascript");
		res.end( page );
	}
	next();
}).use( serveStatic( './', {'index': ['index.html']}) );
http.createServer( app ).listen( 1432 );
