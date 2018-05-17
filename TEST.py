import sqlite3

with sqlite3.connect( 'database.db' ) as conn:
  cur = conn.cursor()
  
  cur.execute( 'select randomSeed from randomSeed' )
  randomSeedTable = cur.fetchall()
  
  cur.execute( 'select * from users' )
  usersTable = cur.fetchall()
  
  cur.execute( 'select * from tokens' )
  tokensTable = cur.fetchall()
  
  cur.execute( 'select * from tests' )
  testsTable = cur.fetchall()
  
  cur.execute( 'select * from questions' )
  questionsTable = cur.fetchall()
  
  cur.execute( 'select * from rightAnswers' )
  rightAnswersTable = cur.fetchall()
  
  print( 'randomSeedTable:\n  ', randomSeedTable, end = '\n\n' )
  print( 'usersTable:\n  ', usersTable, end = '\n\n' )
  print( 'tokensTable:\n  ', tokensTable, end = '\n\n' )
  print( 'testsTable:\n  ', testsTable, end = '\n\n' )
  print( 'questionsTable:\n  ', questionsTable, end = '\n\n' )
  print( 'rightAnswersTable:\n  ', rightAnswersTable, end = '\n\n' )