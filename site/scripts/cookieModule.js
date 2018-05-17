function getCookie(){
  let cookie, tmp, splitted;
  
  cookie = {};
  
  if( document.cookie != "" ){
    tmp = document.cookie.split( "; " );
    
    for( let i = 0; i < tmp.length; i++ ){
      splitted = tmp[i].split( "=" );
      cookie[ splitted[0] ] = splitted[1];
    }
  }
  
  return cookie;
}

function setCookie( key, val ){
  document.cookie = key + "=" + val + "; path=/";
}

function setManyCookie( cookie ){
  for( key in cookie ) setCookie( key, cookie[ key ] );
}