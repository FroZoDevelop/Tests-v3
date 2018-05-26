let cookie, originURL;

function createQuestions( questions ){
  let questionsDiv, questionDiv, div, label, input;
  
  questionsDiv = $( "#questionsDiv" );
  
  for( let i = 0; i < questions.length; i++ ){
    questionDiv = $( "<div>" );
    questionDiv.addClass( "question" );
    questionDiv.attr( "questionId", questions[i][0] );
    
    div = $( "<div>" );
    div.addClass( "index" );
    div.html( i + 1 );
    
    questionDiv.append( div );
    
    div = $( "<div>" );
    div.addClass( "title" );
    div.html( questions[i][2] );
    
    questionDiv.append( div );
    questionDiv.append( "<br>" );
    answers = questions[i][4].split( questions[i][3] );
    
    for( let j = 0; j < answers.length; j++ ){
      label = $( "<label>" );
      label.addClass( "answer" );
      
      input = $( "<input>" );
      input.attr( "type", "radio" );
      input.attr( "name", "q" + i );
      
      label.append( input );
      label.append( answers[j] );
      
      questionDiv.append( label );
      questionDiv.append( "<br>" );
    }
    
    questionsDiv.append( questionDiv );
  }
}

function createTest( testToken ){
  let data, questions, title;
  
  data = {
    "event" : "get test",
    "token" : cookie[ "token" ],
    "testToken" : testToken
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ){
      questions = r[ "message" ][1];
      title = $( "title" );
      title.html( title.html() + r[ "message" ][0] );
      $( "#titleDiv" ).html( r[ "message" ][0] );
      createQuestions( r[ "message" ][1] );
    }
  } );
}

function sendResultsButtonHandler( testToken ){
  let answers, i, tmp, j, data;
  
  answers = [];
  i = 0;
  
  $( "#questionsDiv .question" ).each( function(){
    tmp = [ $( this ).attr( "questionId" ), [ -1 ] ];
    j = 0;
    
    $( "[name='q" + i + "']" ).each( function(){
      if( $( this ).prop( "checked" ) ){
        tmp[1] = [ j ];
        
        return false;
      }
      
      j++;
    } );
    
    i++;
    answers.push( tmp );
  } );
  
  data = {
    "event" : "add answers",
    "token" : cookie[ "token" ],
    "testToken" : testToken,
    "answers" : answers
  };
  
  sendRequest( "POST", originURL, data, ( r ) => {
    if( r[ "event" ] == "success" ) alert( "Вы успешно прошли тест!\nКоличество набранных баллов: " + r[ "message" ] );
    else alert( "Во время отправки произошла ошибка\nПопробуйте позже" );
  } );
}

$( document ).ready( () => {
  let parsedURL;
  
  cookie = getCookie();
  parsedURL = parseURL();
  
  if( cookie[ "token" ] == undefined || cookie[ "token" ] == "" || parsedURL[ "token" ] == undefined || parsedURL[ "token" ] == "" )
    window.open( "index.html", "_self" );
  
  originURL = window.location[ "origin" ];
  createTest( parsedURL[ "token" ] );
  
  $( "#sendResultsButton" ).click( () => {
    sendResultsButtonHandler( parsedURL[ "token" ] );
  } );
} );