const express = require('express');
const app = express()

var http = require('http'),
      fs = require('fs'),
    path = require('path');




app.use('/img',       express.static(__dirname + '/img'));
app.use('/lib',       express.static(__dirname + '/lib'));


app.get('/', function(req, res) {
  // const filename = "index.2020_12_05.html";
  const filename = "index.html";

  res.sendFile(__dirname + '/' + filename, {}, function(err) {
      if(err) {
          res.status(err.status).end()
      }
  });
});




const port = process.env.PORT || 3000;

const options = {};
const httpServer = http.createServer(options, app);
httpServer.listen(port, '0.0.0.0', (err) => {
// httpsServer.listen(port, '127.0.0.1', (err) => {
  if (err) {
    //console.log('something bad happened', err)
    return -1;
  }

  console.log(`server is listening on ${port}`)
})
