function sendRequest( type, URL, data, successFunc, errorFunc ){
  var xhr;
  
  xhr = new XMLHttpRequest();
  
  xhr.onload = function(){
    if( this.readyState == 4 ){
      if( this.status == 200 ) successFunc( JSON.parse( this.responseText ) );
      else errorFunc( this.statusText );
    }
  };
  xhr.open( type, URL, true );
  xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
  
  xhr.send( JSON.stringify( data ) );
}