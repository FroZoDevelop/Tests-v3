let originURL, GEnterType;

function switchForms( enterType, noClicked ){
  let loginInput, passwordInput, signButton;
  
  GEnterType = enterType;
  
  if( noClicked != true ) history.pushState( "", "", "/?enterType=" + enterType );
  
  $( "#mainDiv" ).attr( "hidden", true );
  $( "#signDiv" ).attr( "hidden", false );
  
  loginInput = $( "#loginInput" );
  loginInput.val( "" );
  
  passwordInput = $( "#passwordInput" );
  
  signButton = $( "#signButton" );
  
  if( enterType < 2 ){
    loginInput.attr( "placeholder", "логин" );
    passwordInput.attr( "hidden", false );
    passwordInput.val( "" );
  }
  else{
    loginInput.attr( "placeholder", "код" );
    passwordInput.attr( "hidden", true );
  }
  
  if( enterType == 1 ) signButton.val( "Зарегистрироваться" );
  else signButton.val( "Войти" );
  
  center( $( "#centerDiv" ) );
}

function backButtonHandler(){
  history.pushState( "", "", "/" );
  
  $( "#signDiv" ).attr( "hidden", true );
  $( "#mainDiv" ).attr( "hidden", false );
  center( $( "#centerDiv" ) );
}

function signButtonHandler(){
  let data, loginInputVal, token;
  
  data = {
    "event" : "enter" + GEnterType
  };
  loginInputVal = $( "#loginInput" ).val();
  
  if( GEnterType < 2 ){
    data[ "login" ] = loginInputVal;
    data[ "password" ] = $( "#passwordInput" ).val();
    
    if( data[ "login" ] == "" || data[ "password" ] == "" ){
      alert( "Логин и пароль не могут быть пустыми" );
      
      return;
    }
  } else{
    data[ "token" ] = loginInputVal;
    
    if( data[ "token" ] == "" ){
      alert( "Токен не может быть пустой" );
      
      return;
    }
  }
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
    else if( GEnterType == 1 ){
      backButtonHandler();
      alert( "Успешно" );
    }
    else{
      if( GEnterType != 2 ) token = r[ "message" ];
      else token = data[ "token" ];
      
      setManyCookie( {
        "token" : token,
        "enterType" : GEnterType
      } );
      
      window.open( "privateOffice.html", "_self" );
    }
  } );
}

$( document ).ready( function(){
  let cookie, parsedURL;
  
  cookie = getCookie();
  
  if( cookie[ "token" ] != undefined && cookie[ "token" ] != "" &&
      cookie[ "enterType" ] != undefined && cookie[ "enterType" ] != ""
    ) window.open( "privateOffice.html", "_self" );
  
  originURL = window.location[ "origin" ];
  parsedURL = parseURL();
  
  if( parsedURL[ "enterType" ] != undefined ) switchForms( parseInt( parsedURL[ "enterType" ] ), true );
  else backButtonHandler();
  
  $( "#enterByLoginAndPassButton" ).click( () => {
    switchForms( 0 );
  } );
  $( "#registerButton" ).click( () => {
    switchForms( 1 );
  } );
  $( "#enterByTokenButton" ).click( () => {
    switchForms( 2 );
  } );
  
  $( "#signButton" ).click( signButtonHandler );
  $( "#backButton" ).click( backButtonHandler );
} );