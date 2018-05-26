let cookie, originURL, lastMyTestId, answersEditTable, questionsEditTable, questions, myTestsEditTable, page, isQuestionSelected;

function switchPage(){
  let selectTestsDiv, backButton, myTestsDiv, editQuestionsDiv;
  
  selectTestsDiv = $( "#selectTestsDiv" );
  backButton = $( "#backButton" );
  myTestsDiv = $( "#myTestsDiv" );
  editQuestionsDiv = $( "#editQuestionsDiv" );
  
  selectTestsDiv.attr( "hidden", true );
  backButton.css( "display", "none" );
  myTestsDiv.attr( "hidden", true );
  editQuestionsDiv.attr( "hidden", true );
  
  switch( page ){
    case "selectTests": selectTestsDiv.attr( "hidden", false ); break;
    case "myTests":
      myTestsDiv.attr( "hidden", false );
      backButton.css( "display", "inline-block" );
    break;
    case "editTest":
      editQuestionsDiv.attr( "hidden", false );
      backButton.css( "display", "inline-block" );
      answersEditTable.clear();
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
  let data, testURL, testURLA;
  
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
      
      for( let i = 0; i < questions.length - 1; i++ ){
        editTable.addRow( null, questions[i][2] );
        editTable.getLastRow().attr( "questionId", questions[i][0] );
        questions[i][4] = questions[i][4].split( questions[i][3] );
      }
      
      testURL = originURL + "/test.html?token=" + questions[ questions.length - 1 ];
      testURLA = $( "#testURLA" );
      testURLA.attr( "href", testURL );
      testURLA.html( testURL );
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

function getAnswers( sender, editTable ){
  let prnt, id, data;
  
  prnt = sender.parent();
  id = prnt.attr( "questionId" );
  
  for( let i = 0; i < questions.length; i++ ) if( questions[i][0] == id ){
    prnt.parent().find( ".title" ).each( function(){
      $( this ).removeClass( "titleSelected" );
    } );
    prnt.children().eq( 1 ).addClass( "titleSelected" );
    editTable.table.attr( "questionIndex", i );
    editTable.clear();
    
    if( questions[i][4].length > 0 && questions[i][4][0] != "" ){
      for( let j = 0; j < questions[i][4].length; j++ ){
        editTable.addRow( null, questions[i][4][j] );
        editTable.getLastRow().attr( "answerIndex", j );
      }
      
      data = {
        "event" : "get right answer",
        "token" : cookie[ "token" ],
        "questionId" : questions[i][0]
      };
      
      sendRequest( "POST", originURL, data, ( r ) => {
        if( r[ "event" ] == "success" ){
          editTable.table.find( ".title" ).eq( parseInt( r[ "message" ][0][3] ) ).addClass( "titleSelected" );
        }
      } );
    }
  }
  
  isQuestionSelected = true;
}

function saveAnswers( editTable ){
  let index, answers, data;
  
  editTable = editTable.table;
  index = parseInt( editTable.attr( "questionIndex" ) );
  answers = [];
  editTable.find( ".title" ).each( function(){
    answers.push( $( this ).html() );
  } );
  questions[ index ][4] = answers;
  
  data = {
    "event" : "edit answers",
    "token" : cookie[ "token" ],
    "questionId" : questions[ index ][0],
    "splitter" : ", ",
    "answers" : answers.join( ", " ),
    "type" : 0
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "error" ) alert( r[ "message" ] );
  } );
}

function selectRightAnswer( editTable, sender ){
  let answer, data;
  
  data = {
    "event" : "add right answer",
    "token" : cookie[ "token" ],
    "questionId" : questions[ parseInt( editTable.table.attr( "questionIndex" ) ) ][0],
    "splitter" : ", ",
    "answers" : sender.parent().attr( "answerIndex" )
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      editTable.table.find( ".title" ).each( function(){
        $( this ).removeClass( "titleSelected" );
      } );
      sender.addClass( "titleSelected" );
    }
  } );
}

$( document ).ready( () => {
  let parsedURL;
  
  cookie = getCookie();
  
  if( cookie[ "token" ] == undefined || cookie[ "token" ] == "" || cookie[ "enterType" ] == undefined || cookie[ "enterType" ] == "" )
    window.open( "index.html", "_self" );
  
  originURL = window.location[ "origin" ];
  lastMyTestId = 0;
  isQuestionSelected = false;
  
  answersEditTable = new EditTable( $( "#answersTable" ), {
    "title" : "Вариант ответа",
    "addClick" : () => {
      if( !isQuestionSelected ) answersEditTable.clear();
      else saveAnswers( answersEditTable );
    },
    "handlers" : {
      "titleClick" : ( sender ) => {
        selectRightAnswer( answersEditTable, sender );
      },
      "editClick" : () => {
        saveAnswers( answersEditTable );
      },
      "deleteClick" : () => {
        saveAnswers( answersEditTable );
      }
    }
  } );
  questionsEditTable = new EditTable( $( "#questionsTable" ), {
    "title" : "Вопрос",
    "addClick" : () => {
      addQuestion( questionsEditTable );
    },
    "handlers" : {
      "titleClick" : ( sender ) => {
        getAnswers( sender, answersEditTable );
      },
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