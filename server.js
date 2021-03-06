var http = require('http')

var fs = require('fs')

var path = require('path')

var mime = require('mime')

var cache = {}

function send404(response) {
  response.writeHead(404, {'content-type': 'text/plain'})
  response.write('ERROR 404: resource not found')
  response.end()
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {'content-type': mime.getType(path.basename(filePath))}
  )
  response.end(fileContents)
}

function serverStatic(response, cache, absPath) {
  if(cache[absPath]){
    sendFile(response,absPath, cache[absPath])
  }else{
    fs.exists(absPath, function(exists){
      if(exists){
        fs.readFile(absPath, function(err, data){
          if(err){
            send404(response)
          }else{
            cache[absPath] = data
            sendFile(response, absPath, data)
          }
        })
      }else{
        send404(response)
      }
    })
  }
}

var server = http.createServer(function(request, response){
  var filePath = false

  if(request.url == '/'){
    filePath = 'public/index.html'
  }else{
    filePath = 'public' + request.url
  }

  var absPath = './' + filePath

  serverStatic(response, cache, absPath)

})

server.listen(8080, function(){
  console.log('server listening on port 8080.')
})

var chatServer = require('./lib/chat_server')

chatServer.listen(server)