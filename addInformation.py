from databaseModule import CDatabase

login = 'FroZo'
password = '123'
testName = 'My first test'
questions = [
  [ 1, 'Этот вопрос просто показывает варианты ответов', ', ', 'Вариант 1, Вариант 2, Вариант 3, Вариант 4, Вариант 5', 0 ],
  [ 1, 'А этот вопрос показывает, что есть другой тип ответов', ', ', 'Ответ 1, Ответ 2, Ответ 3', 0 ]
]

open( 'database.db', 'w' ).close()

database = CDatabase( 'database.db' )
database.addUser( login, password )
token = database.addToken( login )[1]
tokenId = database.getTokenIdByToken( token )[1]
database.addTest( token, testName )

for question in questions:
  database.addQuestion( token, question[0], question[1], question[2], question[3], question[4] )

#database.addRightAnswer( token, 1, ',', '1' )
database.cur.execute( "insert into rightAnswers( questionId, splitter, answers ) values( '1', ', ', '2' )" )
database.cur.execute( "insert into rightAnswers( questionId, splitter, answers ) values( '2', ', ', '0' )" )
database.conn.commit()