let cookie, originURL, lastMyTestId, page, gTestId;

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

function getMyTestsOrQuestions( mode, testId ){
  let data, arr;
  
  if( !mode ) gTestId = testId;
  
  data = {
    "event" : "",
    "token" : cookie[ "token" ]
  };
  
  if( mode ){
    data[ "event" ] = "get user tests",
    data[ "lastTestId" ] = lastMyTestId
  } else {
    data[ "event" ] = "get questions",
    data[ "testId" ] = testId
  }
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      if( mode ){
        page = "myTests";
        switchPage();
        history.pushState( "", "", "/privateOffice.html?page=myTests" );
      } else {
        page = "editTest";
        switchPage();
        history.pushState( "", "", "/privateOffice.html?page=editTest&testId=" + testId );
        $( "#editTestTable .index" ).each( function(){
          $( this ).parent().remove();
        } );
      }
      
      arr = r[ "message" ];
      
      if( arr.length > 0 && mode ) lastMyTestId = arr[ arr.length - 1 ][0];
      
      for( let i = 0; i < arr.length; i++ ) addTestOrQuestion( mode, arr[i][0], arr[i][2] );
    } else alert( r[ "message" ] );
  } );
}

function backButtonHandler(){
  switch( page ){
    case "myTests": switchToSelectTestsPage(); break;
    case "editTest": getMyTestsOrQuestions( true ); break;
  }
}

function saveTitle( mode, sender, id ){
  let html, data;
  
  html = sender.parent().children().eq( 1 ).html();
  
  data = {
    "event" : "",
    "token" : cookie[ "token" ]
  };
  
  if( mode ){
    data[ "event" ] = "edit test name";
    data[ "testId" ] = id;
    data[ "name" ] = html;
  } else {
    data[ "event" ] = "edit question name",
    data[ "questionId" ] = id;
    data[ "question" ] = html;
  }
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

function deleteTestOrQuestion( mode, sender, id ){
  let data, indexes, i;
  
  data = {
    "event" : "",
    "token" : cookie[ "token" ]
  };
  
  if( mode ){
    data[ "event" ] = "delete test";
    data[ "testId" ] = id;
    indexes = $( "#myTestsTable .index" );
  } else{
    data[ "event" ] = "delete question";
    data[ "questionId" ] = id;
    indexes = $( "#editTestTable .index" );
  }
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      sender.parent().remove();
      i = 1;
      indexes.each( function(){
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

function addNewTestOrQuestion( mode ){
  let data;
  
  data = {
    "event" : "",
    "token" : cookie[ "token" ]
  };
  
  if( mode ){
    data[ "event" ] = "add test";
    data[ "name" ] = $( "#newTestNameTd" ).html();
  }
  else{
    data[ "event" ] = "add question";
    data[ "testId" ] = gTestId;
    data[ "question" ] = $( "#newQuestionNameTd" ).html();
    data[ "splitter" ] = ", ";
    data[ "answers" ] = "";
    data[ "type" ] = 0;
  }
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      id = r[ "message" ];
      
      if( mode ){
        lastMyTestId = id;
        addTestOrQuestion( true, id, data[ "name" ] );
      } else addTestOrQuestion( false, id, data[ "question" ] );
    } else alert( r[ "message" ] );
  } );
}

function addTestOrQuestion( mode, id, html ){
  let index, insertBeforeElement, handlers, sender;
  
  if( mode ){
    index = $( "#myTestsTable" ).children().eq( 0 ).children().length;
    insertBeforeElement = $( "#newTestNameTd" ).parent();
  } else {
    index = $( "#editTestTable" ).children().eq( 0 ).children().length;
    insertBeforeElement = $( "#newQuestionNameTd" ).parent();
  }
  
  handlers = {
    "title" : () => {
      if( mode ) getMyTestsOrQuestions( false, id );
    },
    "edit" : function(){
      sender = $( this );
      
      editTitle( sender, sender.parent().children().eq( 1 ), () => {
        saveTitle( mode, sender, id );
      } );
    },
    "delete" : function(){
      deleteTestOrQuestion( mode, $( this ), id );
    }
  };
  getEditTableTr( index, html, handlers ).insertBefore( insertBeforeElement );
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

function editTitle( sender, target, successFunc ){
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

function editTitleTdHandler(){
  let sender, target;
  
  sender = $( this );
  target = sender.parent().children().eq( 1 );
  
  editTitle( sender, target );
}

$( document ).ready( () => {
  let parsedURL;
  
  cookie = getCookie();
  
  if( cookie[ "token" ] == undefined || cookie[ "enterType" ] == undefined ) window.open( "index.html", "_self" );
  
  originURL = window.location[ "origin" ];
  lastMyTestId = 0;
  parsedURL = parseURL();
  
  switch( parsedURL[ "page" ] ){
    case "myTests": getMyTestsOrQuestions( true ); break;
    case "editTest":
      if( parsedURL[ "testId" ] != undefined ) getMyTestsOrQuestions( false, parsedURL[ "testId" ] );
    break;
    default: switchToSelectTestsPage()
  }
  
  $( "#exitButton" ).click( exitButtonHandler );
  $( "#myTestsButton" ).click( () => {
    getMyTestsOrQuestions( true );
  } );
  $( "#backButton" ).click( backButtonHandler );
  $( "#editNewTestNameTd" ).click( editTitleTdHandler );
  $( "#addNewTestTd" ).click( () => {
    addNewTestOrQuestion( true );
  } );
  $( "#editNewQuestionNameTd" ).click( editTitleTdHandler );
  $( "#addNewQuestionTd" ).click( () => {
    addNewTestOrQuestion( false );
  } );
} );