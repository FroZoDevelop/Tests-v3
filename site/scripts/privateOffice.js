let cookie, originURL, lastMyTestId, questionsEditTable, myTestsEditTable, page, gTestId;

function switchPage(){
  let selectTestsDiv, backButton, myTestsTable, questionsTable;
  
  selectTestsDiv = $( "#selectTestsDiv" );
  backButton = $( "#backButton" );
  myTestsTable = $( "#myTestsTable" );
  questionsTable = $( "#questionsTable" );
  
  selectTestsDiv.attr( "hidden", true );
  backButton.css( "display", "none" );
  myTestsTable.attr( "hidden", true );
  questionsTable.attr( "hidden", true );
  
  switch( page ){
    case "selectTests": selectTestsDiv.attr( "hidden", false ); break;
    case "myTests":
      myTestsTable.attr( "hidden", false );
      backButton.css( "display", "inline-block" );
    break;
    case "editTest":
      questionsTable.attr( "hidden", false );
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

function backButtonHandler(){
  switch( page ){
    case "myTests": switchToSelectTestsPage(); break;
    case "editTest": myTestsButtonHandler( myTestsEditTable ); break;
  }
}

function addTest( editTable ){
  let data, id;
  
  data = {
    "event" : "add test",
    "token" : cookie[ "token" ],
    "name" : editTable.getLastEl()
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      id = r[ "message" ];
      lastMyTestId = id;
      editTable.getLastRow().attr( "testId", id );
    }
    else alert( r[ "message" ] );
  } );
}

function saveTestName( sender ){
  let prnt, data;
  
  prnt = sender.parent();
  data = {
    "event" : "edit test name",
    "token" : cookie[ "token" ],
    "testId" : prnt.attr( "testId" ),
    "name" : prnt.children().eq( 1 ).html()
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

function deleteTest( sender ){
  let data;
  
  data = {
    "event" : "delete test",
    "token" : cookie[ "token" ],
    "testId" : sender.parent().attr( "testId" )
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

function myTestsButtonHandler( editTable ){
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
      
      if( tests.length > 0 ) lastMyTestId = tests[ tests.length - 1 ][0];
      
      for( let i = 0; i < tests.length; i++ ){
        editTable.addRow( null, tests[i][2] );
        editTable.getLastRow().attr( "testId", tests[i][0] );
      }
    } else alert( r[ "message" ] );
  } );
}

function getQuestions( sender, editTable, id ){
  let data, questions;
  
  if( sender != null ) id = sender.parent().attr( "testId" );
  
  data = {
    "event" : "get questions",
    "token" : cookie[ "token" ],
    "testId" : id
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      page = "editTest";
      switchPage();
      history.pushState( "", "", "/privateOffice.html?page=editTest&testId=" + data[ "testId" ] );
      questions = r[ "message" ];
      editTable.clear();
      editTable.table.attr( "testId", id );
      
      for( let i = 0; i < questions.length; i++ ){
        editTable.addRow( null, questions[i][2] );
        editTable.getLastRow().attr( "questionId", questions[i][0] );
      }
    } else alert( r[ "message" ] );
  } );
}

function addQuestion( editTable ){
  let data;
  
  data = {
    "event" : "add question",
    "token" : cookie[ "token" ],
    "testId" : editTable.table.attr( "testId" ),
    "question" : editTable.getLastEl(),
    "splitter" : ", ",
    "answers" : "",
    "type" : 0
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ) editTable.getLastRow().attr( "questionId", r[ "message" ] );
    else alert( r[ "message" ] );
  } );
}

function saveQuestionName( sender ){
  let prnt, data;
  
  prnt = sender.parent();
  
  data = {
    "event" : "edit question name",
    "token" : cookie[ "token" ],
    "questionId" : prnt.attr( "questionId" ),
    "question" : prnt.children().eq( 1 ).html()
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

function deleteQuestion( sender ){
  let data;
  
  data = {
    "event" : "delete question",
    "token" : cookie[ "token" ],
    "questionId" : sender.parent().attr( "questionId" )
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

$( document ).ready( () => {
  let parsedURL;
  
  cookie = getCookie();
  
  if( cookie[ "token" ] == undefined || cookie[ "enterType" ] == undefined ) window.open( "index.html", "_self" );
  
  originURL = window.location[ "origin" ];
  lastMyTestId = 0;
  
  questionsEditTable = new EditTable( $( "#questionsTable" ), {
    "title" : "Вопрос",
    "addClick" : () => {
      addQuestion( questionsEditTable );
    },
    "handlers" : {
      "titleClick" : () => {},
      "editClick" : saveQuestionName,
      "deleteClick" : deleteQuestion
    }
  } );
  myTestsEditTable = new EditTable( $( "#myTestsTable" ), {
    "title" : "Название теста",
    "addClick" : () => {
      addTest( myTestsEditTable );
    },
    "handlers" : {
      "titleClick" : ( sender ) => {
        getQuestions( sender, questionsEditTable );
      },
      "editClick" : saveTestName,
      "deleteClick" : deleteTest
    }
  } );
  
  parsedURL = parseURL();
  
  switch( parsedURL[ "page" ] ){
    case "myTests": myTestsButtonHandler( myTestsEditTable ); break;
    case "editTest":
      if( parsedURL[ "testId" ] != undefined ) getQuestions( null, questionsEditTable, parsedURL[ "testId" ] );
    break;
    default: switchToSelectTestsPage()
  }
  
  $( "#exitButton" ).click( exitButtonHandler );
  $( "#myTestsButton" ).click( () => {
    myTestsButtonHandler( myTestsEditTable );
  } );
  $( "#backButton" ).click( backButtonHandler );
} );