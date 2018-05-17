function centerByObject( first, second, settings ){
  let offset;
  
  if( settings == undefined ) settings = {};
  if( settings.toString() != "[object Object]" ) settings = {};
  
  try{
    offset = second.offset();
  }
  catch( e ){
    offset = {
      left : 0,
      top : 0
    };
  }
  
  if( settings[ "left" ] == undefined || settings[ "left" ] ) first.css( "left", offset.left + second.width() / 2 - first.width() / 2 + "px" );
  if( settings[ "top" ] == undefined || settings[ "top" ] ) first.css( "top", offset.top + second.height() / 2 - first.height() / 2 + "px" );
}

function center( first, settings ){
  centerByObject( first, $( document ), settings );
}

function shift( first, second, settings ){
  let offset;
  
  if( settings == undefined ) settings = {};
  if( settings.toString() != "[object Object]" ) settings = {};
  
  try{
    offset = first.offset();
  }
  catch( e ){
    return;
  }
  
  if( settings[ "left" ] == undefined || settings[ "left" ] ) first.css( "left", offset.left + second.width() + "px" );
  if( settings[ "top" ] == undefined || settings[ "top" ] ) first.css( "top", offset.top + second.height() + "px" );
}