let cookie, originURL, lastMyTestId, page;

function switchPage(){
  let selectTestsDiv, backButton, myTestsTable, editTestTable;
  
  selectTestsDiv = $( "#selectTestsDiv" );
  backButton = $( "#backButton" );
  myTestsTable = $( "#myTestsTable" );
  editTestTable = $( "#editTestTable" );
  
  selectTestsDiv.attr( "hidden", true );
  backButton.css( "display", "none" );
  myTestsTable.attr( "hidden", true );
  editTestTable.attr( "hidden", true );
  
  switch( page ){
    case "selectTests": selectTestsDiv.attr( "hidden", false ); break;
    case "myTests":
      myTestsTable.attr( "hidden", false );
      backButton.css( "display", "inline-block" );
    break;
    case "editTest":
      editTestTable.attr( "hidden", false );
      backButton.css( "display", "inline-block" );
    break;
  }
}

function switchToSelectTestsPage(){
  history.pushState( "", "", "/privateOffice.html" );
  page = "selectTests";
  switchPage();
  center( $( "#centerDiv" ) );
}

function exitButtonHandler(){
  setManyCookie( {
    "token" : "",
    "enterType" : ""
  } );
  
  window.open( "index.html", "_self" );
}

function myTestsButtonHandler(){
  let data, tests;
  
  data = {
    "event" : "get user tests",
    "token" : cookie[ "token" ],
    "lastTestId" : lastMyTestId
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      page = "myTests";
      switchPage();
      history.pushState( "", "", "/privateOffice.html?page=myTests" );
      tests = r[ "message" ];
      lastMyTestId = tests[ tests.length - 1 ][0];
      
      for( let i = 0; i < tests.length; i++ ) addNewTestHandler( tests[i][0], tests[i][2] );
    } else alert( r[ "message" ] );
  } );
}

function backButtonHandler(){
  switch( page ){
    case "myTests": switchToSelectTestsPage(); break;
    case "editTest":
      page = "myTests";
      switchPage();
    break;
  }
}

function editHTMLWithInput( target, mode, successFunc ){
  let input, inputValue, inputOldValue;
  
  if( mode ){
    input = $( "<input>" );
    input.attr( "type", "text" );
    input.addClass( "editText fullWidth" );
    input.attr( "oldValue", target.html() );
    input.attr( "value", target.html() );
    
    target.html( input );
    input.select();
  } else {
    input = target.children().eq( 0 );
    inputValue = input.val();
    inputOldValue = input.attr( "oldValue" );
    
    if( inputValue != "" && inputValue != inputOldValue ){
      target.html( inputValue );
      
      if( successFunc != undefined && typeof( successFunc ) == "function" ) successFunc();
    }
    else target.html( inputOldValue );
  }
}

function editNameHandler(){
  let ths, target;
  
  ths = $( this );
  target = ths.parent().children().eq( 1 );
  
  if( parseInt( ths.attr( "isSelected" ) ) == 0 ){
    ths.addClass( "selected" );
    ths.attr( "isSelected", 1 );
    editHTMLWithInput( target, true );
  } else {
    ths.removeClass( "selected" );
    ths.attr( "isSelected", 0 );
    editHTMLWithInput( target, false );
  }
}

function editMyTestTdHandler( testId ){
  let data, questions;
  
  data = {
    "event" : "get questions",
    "token" : cookie[ "token" ],
    "testId" : testId
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      page = "editTest";
      switchPage();
      history.pushState( "", "", "/privateOffice.html?page=editTest&testId=" + testId );
      questions = r[ "message" ];
      
      /* for( let i = 0; i < questions.length; i++ ){
        getEditTableTr( i + 1, questions[i][2] ).insertBefore( $( "#newQuestionNameTd" ).parent() );
      } */
    }
  } );
}

function editMyTestNameTdHandler( sender, successFunc ){
  let target;
  
  target = sender.parent().children().eq( 1 );
  
  if( parseInt( sender.attr( "isSelected" ) ) == 0 ){
    sender.addClass( "selected" );
    sender.attr( "isSelected", 1 );
    editHTMLWithInput( target, true );
  } else {
    sender.removeClass( "selected" );
    sender.attr( "isSelected", 0 );
    editHTMLWithInput( target, false, successFunc );
  }
}

function saveMyTestNameTdHandler( sender, testId ){
  let name, data;
  
  name = sender.parent().children().eq( 1 ).html();
  
  data = {
    "event" : "edit test name",
    "token" : cookie[ "token" ],
    "testId" : testId,
    "name" : name
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

function deleteMyTestTdHandler( sender, testId ){
  let data, i;
  
  data = {
    "event" : "delete test",
    "token" : cookie[ "token" ],
    "testId" : testId
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      sender.parent().remove();
      i = 1;
      $( "#myTestsTable .index" ).each( function(){
        $( this ).html( i );
        i++;
      } );
    } else alert( r[ "message" ] );
  } );
}

function getEditTableTr( index, html, handlers ){
  let tr, td;
  
  if( handlers == undefined ) handlers = {};
  if( handlers.toString() != "[object Object]" ) handlers = {};
  
  tr = $( "<tr>" );
  
  td = $( "<td>" );
  td.addClass( "allBorder index" );
  td.html( index );
  tr.append( td );
  
  td = $( "<td>" );
  td.addClass( "bottomBorder title" );
  td.html( html );
  
  if( handlers[ "title" ] != undefined && typeof( handlers[ "title" ] ) == "function" ) td.click( handlers[ "title" ] );
  
  tr.append( td );
  
  td = $( "<td>" );
  td.addClass( "allBorder icon edit" );
  td.attr( "isSelected", 0 );
  
  if( handlers[ "edit" ] != undefined && typeof( handlers[ "edit" ] ) == "function" ) td.click( handlers[ "edit" ] );
  
  tr.append( td );
  
  td = $( "<td>" );
  td.addClass( "allBorder icon delete" );
  
  if( handlers[ "delete" ] != undefined && typeof( handlers[ "delete" ] ) == "function" ) td.click( handlers[ "delete" ] );
  
  tr.append( td );
  
  return tr;
}

function addNewTestHandler( testId, html ){
  let index, handlers;
  
  index = $( "#myTestsTable" ).children().eq( 0 ).children().length;
  handlers = {
    "title" : () => {
      editMyTestTdHandler( testId );
    },
    "edit" : function(){
      ths = $( this );
      
      editMyTestNameTdHandler( ths, () => {
        saveMyTestNameTdHandler( ths, testId );
      } );
    },
    "delete" : function(){
      deleteMyTestTdHandler( $( this ), testId );
    }
  };
  getEditTableTr( index, html, handlers ).insertBefore( $( "#newTestNameTd" ).parent() );
}

function addNewTestTdHandler(){
  let data, index;
  
  data = {
    "event" : "add test",
    "token" : cookie[ "token" ],
    "name" : $( "#newTestNameTd" ).html()
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ) addNewTestHandler( r[ "message" ], data[ "name" ] );
    else alert( r[ "message" ] );
  } );
}

$( document ).ready( () => {
  let parsedURL;
  
  cookie = getCookie();
  
  if( cookie[ "token" ] == undefined || cookie[ "enterType" ] == undefined ) window.open( "index.html", "_self" );
  
  originURL = window.location[ "origin" ];
  lastMyTestId = 0;
  parsedURL = parseURL();
  
  switch( parsedURL[ "page" ] ){
    case "myTests": myTestsButtonHandler(); break;
    case "editTest":
      if( parsedURL[ "testId" ] != undefined ) editMyTestTdHandler( parsedURL[ "testId" ] );
    break;
    default: switchToSelectTestsPage()
  }
  
  $( "#exitButton" ).click( exitButtonHandler );
  $( "#myTestsButton" ).click( myTestsButtonHandler );
  $( "#backButton" ).click( backButtonHandler );
  $( "#editNewTestNameTd" ).click( editNameHandler );
  $( "#addNewTestTd" ).click( addNewTestTdHandler );
  $( "#editNewQuestionNameTd" ).click( editNameHandler );
} );