$.getJSON( "/api/?format=json", function( data ){
	window.chat = data;
	populate();
});
chat = undefined;
function makeItem( index, name ) {
	var item = $( "<li>"),
		link = $( "<a>" );

	if ( typeof name === "object" ) {
		link.text( index ).attr( "href", "#" + index.replace( "#", "" ) );
		link.data( "childpage", {
			id: index.replace( "#", "" ),
			data: name
		});
		item.append( link );
	} else {
		item.text( name );
	}
	return item;
}
function populate(){
	var pms = window.chat ? window.chat.pms : window.pms,
		channels = window.chat ? window.chat.channels : window.channels,
		channelList = $( "#channel-list" ).html( "" ),
		pmList = $( "#pm-list" ).html( "" );

	$.each( channels, function( index, name ){
		var item = makeItem( index, name );
		channelList.append( item );
	});
	$.each( pms, function( index, name ){
		var item = makeItem( index, name );
		pmList.append( item );
	});

	$( "#channel-list, #pm-list" ).listview( "refresh" );
}
$(function(){
	populate();
	$.mobile.loader( "show" );
	$( "body" ).on( "click", "a:not(.ui-tabs-anchor)", function(){
		var data = $( this ).data( "childpage" ),
			page = $( "<div data-role='page' id='" + data.id + "'></div>" ),
			list = $( "<ul data-role='listview'></div>" );

			$.each( data.data, function( index, value ){
				var item = $( "<li>" ),
					link = $( "<a>" ),
					id = data.id + "_" + index;

				if ( typeof value === "object" ) {
					link.data( "childpage", {
						id: id,
						data: value
					});
					link.text( index ).attr( "href", "#" + id );
					link.appendTo( item );
				} else {
					item.text( value );
					if ( value.split( " " )[ 1 ] ) {
						var color = stringToColour( value.split( " " )[ 1 ].split( ":" )[0] )
						item.css({
							"background-color": color,
							"text-shadow": "none",
							"color": getContrast50( color )
						});
					}
				}
				item.appendTo( list );

			});
			list.appendTo( page );
			page.appendTo( "body" );
			$( "body" ).pagecontainer( "change", "#" + data.id );
	});
});
var stringToColour = function(str) {

    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return colour;
}
function getContrast50(hexcolor){
    return (parseInt(hexcolor.replace( "#", ""), 16) > 0xffffff/2) ? 'black':'white';
}
