from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from databaseModule import CDatabase
from contentTypeModule import getContentType
from parseURLModule import parseURL

IP = '0.0.0.0'
PORT = 8020
siteFolder = 'site/'
database = CDatabase( 'database.db' )

def printConnectInfo( requestType, connectInfo, requestURL = None ):
  print( '[{}] New request'.format( requestType.upper() ) )
  print( '  Address: {}:{}'.format( connectInfo[0], connectInfo[1] ) )
  
  if requestURL != None: print( "  Request URL: '{}'".format( requestURL ) )
  
  print()

def getResponse( event, message ):
  return { 'event' : event, 'message' : message }

class CRequestHandler( BaseHTTPRequestHandler ):
  # GET запрос
  def do_GET( self ):
    self.send_response( 200 )
    
    parsedURL = parseURL( self.path )
    contentType = getContentType( parsedURL[ 'fileExtension' ] )
    self.send_header( 'Content-type', contentType )
    
    self.end_headers()
    
    fileName = parsedURL[ 'fileName' ]
    
    if parsedURL[ 'fileExtension' ] != '': fileName += '.' + parsedURL[ 'fileExtension' ]
    
    if fileName == '': filePath = 'index.html'
    elif fileName == 'favicon.ico': pass
    else: filePath = parsedURL[ 'filePath' ] + fileName
    
    printConnectInfo( 'get', self.client_address, self.path )
    
    if fileName != 'favicon.ico':
      try:
        response = open( siteFolder + filePath, 'rb' ).read()
      except:
        try:
          response = open( siteFolder + 'badPage.html', 'rb' ).read()
        except:
          response = bytes( 'Bad page', 'utf8' )
      
      self.wfile.write( response )
  
  # POST запрос
  def do_POST( self ):
    self.send_response( 200 )
    
    # self.send_header( 'Access-Control-Allow-Origin', self.headers[ 'Origin' ] )
    # self.send_header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE' )
    # self.send_header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' )
    
    self.end_headers()
    
    data = self.rfile.read( int( self.headers[ 'Content-Length' ] ) ).decode( 'utf8' )
    
    if data != '': data = json.loads( data )
    if not 'dict' in str( type( data ) ): data = {}
    
    printConnectInfo( 'post', self.client_address )
    
    try:
      event = data[ 'event' ]
      
      # [E] Enter by login & password
      if event == 'enter0':
        code = database.checkUser( data[ 'login' ], data[ 'password' ] )
        
        if code[0] == 'success':
          token = database.addToken( data[ 'login' ] )
          response = getResponse( token[0], token[1] )
        else: response = getResponse( code[0], code[1] )
      
      # [E] Register by login & password
      elif event == 'enter1':
        code = database.addUser( data[ 'login' ], data[ 'password' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Enter by token
      elif event == 'enter2':
        code = database.getTokenIdByToken( data[ 'token' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Get user tests
      elif event == 'get user tests':
        tests = database.getUserTests( data[ 'token' ], data[ 'lastTestId' ] )
        response = getResponse( tests[0], tests[1] )
      
      # [E] Add test
      elif event == 'add test':
        code = database.addTest( data[ 'token' ], data[ 'name' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Edit test name
      elif event == 'edit test name':
        code = database.editTestName( data[ 'token' ], data[ 'testId' ], data[ 'name' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Delete test
      elif event == 'delete test':
        code = database.deleteTest( data[ 'token' ], data[ 'testId' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Get questions
      elif event == 'get questions':
        code = database.getQuestions( data[ 'token' ], data[ 'testId' ] )
        print( code[1] )
        response = getResponse( code[0], code[1] )
      
      # [E] Add question
      elif event == 'add question':
        code = database.addQuestion( data[ 'token' ], data[ 'testId' ], data[ 'question' ], data[ 'splitter' ], data[ 'answers' ], data[ 'type' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Edit question
      elif event == 'edit question name':
        code = database.editQuestionName( data[ 'token' ], data[ 'questionId' ], data[ 'question' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Delete question
      elif event == 'delete question':
        code = database.deleteQuestion( data[ 'token' ], data[ 'questionId' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Edit asnwers
      elif event == 'edit answers':
        print( data )
        code = database.editAnswers( data[ 'token' ], data[ 'questionId' ], data[ 'splitter' ], data[ 'answers' ], data[ 'type' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Get right answer
      elif event == 'get right answer':
        print( data )
        code = database.getRightAnswer( data[ 'token' ], data[ 'questionId' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Add right answer
      elif event == 'add right answer':
        code = database.addRightAnswer( data[ 'token' ], data[ 'questionId' ], data[ 'splitter' ], data[ 'answers' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Get test
      elif event == 'get test':
        code = database.getTest( data[ 'token' ], data[ 'testToken' ] )
        response = getResponse( code[0], code[1] )
      
      # [E] Send answers
      elif event == 'add answers':
        code = database.addAnswers( data[ 'token' ], data[ 'testToken' ], data[ 'answers' ] )
        response = getResponse( code[0], code[1] )
    except:
      response = getResponse( 'error', 'Undefined request' )
    
    self.wfile.write( bytes( json.dumps( response ), 'utf8' ) )
  
  # def do_OPTIONS( self ):
  #   self.send_response( 200 )
    
  #   self.send_header( 'Access-Control-Allow-Origin', self.headers[ 'Origin' ] )
  #   self.send_header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE' )
  #   self.send_header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' )
    
  #   self.end_headers()

print( 'Server started\n  IP: http://{}:{}'.format( IP, PORT ) )

server = HTTPServer( ( IP, PORT ), CRequestHandler )
server.serve_forever()