"use strict";

const { spawn, exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const multer = require('multer');

const PORT = process.env.PORT || 3000;
const sshdPort = 2200;
//const sshdLogFile = path.join(__dirname, 'log', 'sshd.log');
//const sshdPIDFile = path.join(__dirname, 'log', 'sshd.pid');
//const sshdIO = fs.openSync(sshdLogFile, 'a');
//const APPLOG = fs.openSync(path.join(__dirname, 'log', 'app.log'), 'a');
const app = express();
const pubRoot = path.join(__dirname, "public");
const APPSETTING = {
    ssh: {},
    vscode: {},
    sql: {}
};

const TOKEN = "b3282a2f2a28757b3a18ab833de16a9c54518c0b0cf493e3f0a7cf09386f326a";
APPSETTING.startTime = new Date().toString();
console.log(APPSETTING.startTime);

//crypto.randomBytes(256).toString('base64');
process.env.PATH = process.env.PATH + ':' + path.join(__dirname, 'bin');
process.env.CURL_CA_BUNDLE = path.join(__dirname, 'certs', 'ca-certificates.crt');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), function (req, res, next) {
  // req.file is the `file` file
  // req.body will hold the text fields, if there were any
});


/*
const sshdExec = os.platform() === 'win32' ? "C:\\WINDOWS\\System32\\OpenSSH\\sshd.exe" : "sshd";
const subprocess = spawn(sshdExec, ['-p', sshdPort], {
  detached: true,
  windowsHide: true,
  stdio: [ 'ignore', sshdIO, sshdIO ]
});
fs.writeFileSync(sshdPIDFile, subprocess.pid.toString());
console.log('SSH Server process ID:', subprocess.pid, 'on port:', sshdPort);
subprocess.unref();
*/

app.use(express.json());
app.use(express.static(pubRoot));

var COUNTER = 0;

function startServer(server, option) {
  switch (server) {
    case 'ssh':
      option = {pid: 1234, port: 5678};
      APPSETTING.ssh.upTime = 0;
      APPSETTING.ssh.startTime = new Date().toString();
      setInterval(() => {
        APPSETTING.ssh.upTime++;
      }, 1000);
      console.log('SSH Server process ID:', option.pid, 'on port:', option.port);  
      break;
  
    default:
      break;
  }
}

startServer('ssh');

app.post('/', (req, res) => {
    res.send([APPSETTING.ssh]);
});

app.post('/run', (req, res) => {
  if (req.body.token === TOKEN) {
    if (req.body.command) {
      exec(req.body.command, (err, stdout, stderr) => {
        if (err) {
          console.error("Command Error:", err);
          res.status(400).send({
            message: "Please check your command and run again.",
            error: err
          });
        } else if (stderr) {
            console.error("StdErr:", stderr);
            res.status(400).send({
              message: "Please check your command and run again.",
              error: stderr
            });
          } else {
              let result = stdout ? stdout : "";
              console.log("Run command:", req.body.command);  
              res.send({
                message: "Your command run successfully.",
                stdout: result
              });
            }
      });
    } else if (!req.body.reqLogin) {
        console.error("Someone trying to request by token with no command.");
        res.status(400).send({error: "Don't try to send wrong request."});
    } else {
      APPSETTING.session = new Date().toString();
      console.log("User login success.");
      console.log("Session:", APPSETTING.session);
      res.send({message: "Identity verify OK."});
    }
  } else {
      console.error("User attempt to login failed.");
      res.status(401).send({error: "Security key not match."});
  }
});

app.post('/reset', (req, res) => {
  COUNTER = 0;
  res.send({message: "Total time reset success."});
  console.log(`Request command \*\*${req.body.cmd}\*\* process success.`);
});

app.post('*', (req, res) => {
  res.status(404).send({error: "Request not found."});
  console.log(`Request command \*\*${req.body.cmd}\*\* can't process.`);
});

app.listen(PORT, () => {
  console.log(`Web Server listening on http://localhost:${PORT}`);
});

