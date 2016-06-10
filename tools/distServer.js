import express from 'express';
import expresssession from 'express-session';
import path from 'path';
import colors from 'colors';
import compression from 'compression';
import bodyParser from 'body-parser';
import {APP_SECRET} from '../outCalls/config';
const passport = require('../outCalls/auth');

/* eslint-disable no-console */

const port = 3000;
const app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const process = require('process');
const spawn = require('child_process').spawn;

app.use(compression());
app.use(express.static('dist'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(expresssession({ secret: APP_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/github', passport.authenticate('github',
  {scope: ['user', 'repo']}
));

app.get('/auth/github/callback', passport.authenticate('github',
  {failureRedirect: '/login?status=failed' }), function(req, res) {
  res.redirect('/login?status=passed&token='+req.user.accessToken+'&username='+req.user.username);
});

app.get('/logout', function(req, res){
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

app.get('/user', function(req, res) {
  res.redirect('/');
});

app.get('*', function(req, res) {
  res.sendFile(path.resolve( __dirname, '../src/index.html'));
});

//Socket

io.on('connection', function(socket){

  socket.on('startDeployment', function (data) {

    const clone_url = data.split(',')[0];
    const username = data.split(',')[1];
    const reponame = data.split(',')[2];

    const clone_dir = '/tmp/'+username+'/'+Date.now()+'/'+reponame;

    const clone = spawn('git', ['clone', clone_url, clone_dir]);
    clone.stderr.on('data', (data) => {
      socket.emit('sendDataToTerminalError', filterStrings(data));
    });
    clone.stdout.on('data', (data) => {
      socket.emit('sendDataToTerminal', filterStrings(data));
    });
    clone.on('close', (code) => {
      socket.emit('completedCloning', code);
      if (code == '0') {
        process.chdir(clone_dir);
        const docker = spawn('docker-compose', ['up']);
        docker.stderr.on('data', (data) => {
          socket.emit('sendDataToTerminalError', filterStrings(data));
        });
        docker.stdout.on('data', (data) => {
          socket.emit('sendDataToTerminal', filterStrings(data));
        });
        docker.on('close', (code) => {
          socket.emit('completedDeployment', code);
        });


      }
    });


  });

});

function filterStrings(data) {
  const ascii = String.fromCharCode.apply(null, new Uint8Array(data));
  return ascii.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

http.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`visit http://localhost:${port}`.yellow);
  }
});
