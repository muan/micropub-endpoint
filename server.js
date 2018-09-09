const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const micropub = require('./micropub')
const request = require('request')
const busboy = require('express-busboy')

busboy.extend(app, {upload: true})
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html')
})

// Micropub config
app.get('/micropub', function(req, res) {
  if (req.query.q === 'config') {
    res.send({
      'media-endpoint': `https://${req.headers.host}/micropub`
      // syndicate-to
    })
  } else {
    res.sendFile(__dirname + '/views/index.html')
  }
})

// Micropub
app.post('/micropub', async function(req, res) {
  const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.body.access_token
  if (token) {
    console.log(req.body)
    const result = await micropub(token, req.body, req.files && (req.files.photo || req.files.file))
    if (result.error) {
      console.log(result.error)
      res.status(result.error.code).send(result.error.body)
    } else {
      if (result.location) {
        res.header('Location', result.location)
      }
      res.status(result.code).end()
    }
  } else {
    res.status(401).send('Access token not found.')
  }
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Listening on port ' + listener.address().port)
})
