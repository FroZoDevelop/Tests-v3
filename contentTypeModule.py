def getContentType( fileType ):
  fileTypes = {
    '' : 'text/html',
    'html' : 'text/html',
    'htm' : 'text/html',
    'js' : 'text/javascript',
    'css' : 'text/css'
  }
  
  try:
    contentType = fileTypes[ fileType ]
  except:
    contentType = 'text/html'
  
  return contentType