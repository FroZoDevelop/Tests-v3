import sqlite3
from random import randint
import hashlib

class CDatabase:
  def __init__( self, databasePath = '' ):
    self.isConnected = False
    self.conn = None
    self.cur = None
    self.lang = 'ru'
    self.errors = {
      # Problems With Database
      'PWD' : {
        'en' : 'Some problems with database',
        'ru' : 'Проблемы с базой данных'
      },
      # Invalid login or password
      'ILOP' : {
        'en' : 'Invalid login or password',
        'ru' : 'Неверный логин или пароль'
      },
      # User doesn't exist
      'UDE' : {
        'en' : 'User doesn\'t exist',
        'ru' : 'Пользователь не существует'
      },
      # User already exist
      'UAE' : {
        'en' : 'User already exist',
        'ru' : 'Пользователь уже существует'
      },
      # Invalid token
      'IT' : {
        'en' : 'Invalid token',
        'ru' : 'Неверный токен'
      },
      # Test doesn't exist
      'TDE' : {
        'en' : 'Test doesn\'t exist',
        'ru' : 'Тест не существует'
      },
      # Changing someone else's test
      'CSET' : {
        'en' : 'Changing someone else\'s test',
        'ru' : 'Изменение чужого теста'
      }
    }
    self.successes = {
      # Success
      'S' : {
        'en' : 'Success',
        'ru' : 'Успешно'
      }
    }
    
    self.connect( databasePath )
    self.prepare()
  
  def connect( self, databasePath ):
    if self.isConnected or databasePath == '': return False
    
    self.conn = sqlite3.connect( databasePath )
    self.cur = self.conn.cursor()
    
    self.isConnected = True
  
  def prepare( self ):
    if not self.isConnected: return False
    
    self.cur.execute( '''create table if not exists randomSeed(
      randomSeed integer not null
    )''' )
    
    self.cur.execute( '''create table if not exists users(
      id integer primary key autoincrement not null,
      login text not null,
      password text not null
    )''' )
    
    self.cur.execute( '''create table if not exists tokens(
      id integer primary key autoincrement not null,
      userId integer not null,
      token text not null
    )''' )
    
    self.cur.execute( '''create table if not exists tests(
      id integer primary key autoincrement not null,
      tokenId integer not null,
      name text not null,
      token text not null
    )''' )
    
    self.cur.execute( '''create table if not exists questions(
      id integer primary key autoincrement not null,
      testId integer not null,
      question text not null,
      splitter text not null,
      answers text not null,
      type integer not null
    )''' )
    
    self.cur.execute( '''create table if not exists rightAnswers(
      id integer primary key autoincrement not null,
      questionId integer not null,
      splitter text not null,
      answers text not null
    )''' )
    
    self.cur.execute( 'select randomSeed from randomSeed' )
    
    if len( self.cur.fetchall() ) == 0: self.cur.execute( 'insert into randomSeed( randomSeed ) values( ? )', ( randint( 500, 10000 ), ) )
    
    self.conn.commit()
    
    return True
  
  def unconnect( self ):
    if not self.isConnected: return False
    
    self.conn.close()
    self.conn = None
    self.cur = None
    
    self.isConnected = False
    
    return True
  
  def getError( self, shortErrorName ):
    return [ 'error', self.errors[ shortErrorName ][ self.lang ] ]
  
  def getSuccess( self, shortSuccessName, custom = '' ):
    if shortSuccessName == 'custom': return [ 'success', custom ]
    
    return [ 'success', self.successes[ shortSuccessName ][ self.lang ] ]
  
  def checkUser( self, login, password ):
    if not self.isConnected: return self.getError( 'PWD' )
    
    self.cur.execute( 'select password from users where login = ?', ( login, ) )
    passwordFromUsers = self.cur.fetchall()
    
    if len( passwordFromUsers ) == 0: return self.getError( 'ILOP' )
    if passwordFromUsers[0][0] != password: return self.getError( 'ILOP' )
    
    return self.getSuccess( 'S' )
  
  def addToken( self, login = '' ):
    if not self.isConnected: return self.getError( 'PWD' )
    
    if login == '':
      self.cur.execute( 'select randomSeed from randomSeed' )
      randomSeed = self.cur.fetchall()[0][0]
      id = -1
      token = hashlib.md5( bytes( 'unnamedUser' + str( randomSeed ), 'utf8' ) ).hexdigest()
      newRandomSeed = randomSeed + randint( 1, 3 )
      self.cur.execute( 'update randomSeed set randomSeed = ? where randomSeed = ?', ( newRandomSeed, randomSeed ) )
      self.conn.commit()
    else:
      self.cur.execute( 'select id from users where login = ?', ( login, ) )
      id = self.cur.fetchall()
      
      if len( id ) == 0: return self.getError( 'UDE' )
      
      id = id[0][0]
      self.cur.execute( 'select token from tokens where userId = ?', ( id, ) )
      token = self.cur.fetchall()
      
      if len( token ) != 0: return self.getSuccess( 'custom', token[0][0] )
      
      token = hashlib.md5( bytes( login + str( id ), 'utf8' ) ).hexdigest()
    
    self.cur.execute( 'insert into tokens( userId, token ) values( ?, ? )', ( id, token, ) )
    self.conn.commit()
    
    return self.getSuccess( 'custom', token )
  
  def addUser( self, login, password ):
    if not self.isConnected: return self.getError( 'PWD' )
    
    self.cur.execute( 'select id from users where login = ?', ( login, ) )
    data = self.cur.fetchall()
    
    if len( data ) != 0: return self.getError( 'UAE' )
    
    self.cur.execute( 'insert into users( login, password ) values( ?, ? )', ( login, password ) )
    self.conn.commit()
    
    return self.getSuccess( 'S' )
  
  def getTokenIdByToken( self, token ):
    if not self.isConnected: return self.getError( 'PWD' )
    
    self.cur.execute( 'select id from tokens where token = ?', ( token, ) )
    tokenId = self.cur.fetchall()
    
    if len( tokenId ) == 0: return self.getError( 'IT' )
    
    return self.getSuccess( 'custom', tokenId[0][0] )
  
  def getUserTests( self, token, lastTestId ):
    tokenInfo = self.getTokenIdByToken( token )
    
    if tokenInfo[0] == 'error': return [ tokenInfo[0], tokenInfo[1] ]
    
    self.cur.execute( 'select * from tests where tokenId = ? and id > ?', ( tokenInfo[1], lastTestId ) )
    
    return self.getSuccess( 'custom', self.cur.fetchall() )
  
  def addTest( self, token, name ):
    tokenInfo = self.getTokenIdByToken( token )
    
    if tokenInfo[0] == 'error': return [ tokenInfo[0], tokenInfo[1] ]
    
    self.cur.execute( 'insert into tests( tokenId, name, token ) values( ?, ?, ? )', ( tokenInfo[1], name, '' ) )
    self.cur.execute( 'select max( id ) from tests' )
    id = self.cur.fetchall()[0][0]
    
    token = hashlib.md5( bytes( name + str( id ), 'utf8' ) ).hexdigest()
    self.cur.execute( 'update tests set token = ? where id = ?', ( token, id ) )
    self.conn.commit()
    
    return self.getSuccess( 'custom', id )
  
  def checkValidTest( self, token, testId ):
    tokenInfo = self.getTokenIdByToken( token )
    
    if tokenInfo[0] == 'error': return [ tokenInfo[0], tokenInfo[1] ]
    
    self.cur.execute( 'select tokenId from tests where id = ?', ( testId, ) )
    tokenIdFromTests = self.cur.fetchall()
    
    if len( tokenIdFromTests ) == 0: return self.getError( 'TDE' )
    if tokenInfo[1] != tokenIdFromTests[0][0]: return self.getError( 'CSET' )
    
    return self.getSuccess( 'S' )
  
  def editTestName( self, token, testId, name ):
    testValidInfo = self.checkValidTest( token, testId )
    
    if testValidInfo[0] == 'error': return [ testValidInfo[0], testValidInfo[1] ]
    
    self.cur.execute( 'update tests set name = ? where id = ?', ( name, testId ) )
    self.conn.commit()
    
    return self.getSuccess( 'S' )
  
  def deleteTest( self, token, testId ):
    testValidInfo = self.checkValidTest( token, testId )
    
    if testValidInfo[0] == 'error': return [ testValidInfo[0], testValidInfo[1] ]
    
    self.cur.execute( 'delete from tests where id = ?', ( testId, ) )
    self.conn.commit()
    
    return self.getSuccess( 'S' )
  
  def getQuestions( self, token, testId ):
    testValidInfo = self.checkValidTest( token, testId )
    
    if testValidInfo[0] == 'error': return [ testValidInfo[0], testValidInfo[1] ]
    
    self.cur.execute( 'select * from questions where testId = ?', ( testId, ) )
    
    return self.getSuccess( 'custom', self.cur.fetchall() )
  
  def addQuestion( self, token, testId, question, splitter, answers, type ):
    testValidInfo = self.checkValidTest( token, testId )
    
    if testValidInfo[0] == 'error': return [ testValidInfo[0], testValidInfo[1] ]
    
    self.cur.execute( 'insert into questions( testId, question, splitter, answers, type ) values( ?, ?, ?, ?, ? )', ( testId, question, splitter, answers, type ) )
    self.cur.execute( 'select max( id ) from questions' )
    self.conn.commit()
    
    return self.getSuccess( 'custom', self.cur.fetchall()[0][0] )
  
  def editQuestionName( self, token, questionId, question ):
    self.cur.execute( 'select testId from questions where id = ?', ( questionId, ) )
    testId = self.cur.fetchall()
    
    if len( testId ) == 0: return self.getError( 'TDE' )
    
    testValidInfo = self.checkValidTest( token, testId[0][0] )
    
    if testValidInfo[0] == 'error': return [ testValidInfo[0], testValidInfo[1] ]
    
    self.cur.execute( 'update questions set question = ? where id = ?', ( question, questionId ) )
    self.conn.commit()
    
    return self.getSuccess( 'S' )
  
  def deleteQuestion( self, token, questionId ):
    self.cur.execute( 'select testId from questions where id = ?', ( questionId, ) )
    testId = self.cur.fetchall()
    
    if len( testId ) == 0: return self.getError( 'TDE' )
    
    testValidInfo = self.checkValidTest( token, testId[0][0] )
    
    if testValidInfo[0] == 'error': return [ testValidInfo[0], testValidInfo[1] ]
    
    self.cur.execute( 'delete from questions where id = ?', ( questionId, ) )
    self.conn.commit()
    
    return self.getSuccess( 'S' )