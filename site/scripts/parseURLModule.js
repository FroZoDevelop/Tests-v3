function parseURL( URL ){
  let parsedURL, params;
  
  parsedURL = {};
  
  if( URL == undefined ) params = window.location[ "search" ];
  else params = URL;
  
  params = params.slice( 1, params.length );
  params = params.split( "&" );
  
  for( let i = 0; i < params.length; i++ )
    parsedURL[ params[i].slice( 0, params[i].indexOf( "=" ) ) ] = params[i].slice( params[i].indexOf( "=" ) + 1, params[i].length );
  
  return parsedURL;
}