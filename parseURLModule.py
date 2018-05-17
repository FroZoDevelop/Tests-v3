def parseURL( URL ):
  response = {
    'filePath' : '',
    'fileName' : '',
    'fileExtension' : '',
    'params' : None
  }
  
  if URL[0] == '/': URL = URL[ 1 : len( URL ) ]
  
  index = URL.find( '?' )
  
  if index != -1:
    response[ 'params' ] = URL[ index + 1 : ]
    URL = URL[ : index ]
  
  index = URL.rfind( '/' )
  
  if index != -1:
    response[ 'filePath' ] = URL[ : index + 1 ]
    URL = URL[ index + 1 : ]
  
  index = URL.rfind( '.' )
  
  if index != -1:
    response[ 'fileExtension' ] = URL[ index + 1 : ]
    URL = URL[ : index ]
  
  response[ 'fileName' ] = URL
  
  params = response[ 'params' ]
  parsedParams = {}
  
  if params != None:
    params = params.split( '&' )
    
    for i in range( len( params ) ):
      index = params[i].find( '=' )
      
      if index != -1:
        parsedParams[ params[i][ : index ] ] = params[i][ index + 1 : ]
    
    response[ 'params' ] = parsedParams
  
  return response