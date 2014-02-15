var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 2310);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/common/', express.static(path.join(__dirname, 'data')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



app.post('/common/upload', function (req, res) {
  var upload = req.files.upload;
  if (upload.originalFilename !== '') {
    var body = [
      '<!DOCTYPE html>',
      '<title>Done</title>',
      '<script>parent.onUploadDone()</script>',
      '<body>lorem ipsum dolor sit amet</body>'
    ].join('');
    res.send(200, body);
  } else {
    res.send(200);
  }
});

app.get('/common/page/:number', function (req, res) {
    var pageNumber = req.params.number;
    var body = [
      '<!DOCTYPE html>',
      '<title>Page', pageNumber, '</title>',
      'Page number <span id="pageNumber">', pageNumber, '</span>',
      '<p><a href="../xhtmlTest.html" target="_top">top</a>'
    ].join('');
    res.send(200, body);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
