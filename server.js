const { spawn, exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;
const sshdPort = 2200;
const sshdLogFile = path.join(__dirname, 'log', 'sshd.log');
const sshdPIDFile = path.join(__dirname, 'log', 'sshd_pid');
const sshdIO = fs.openSync(sshdLogFile, 'a');
const APPLOG = fs.openSync(path.join(__dirname, 'log', 'app.log'), 'a');
const app = express();
const pubRoot = path.join(__dirname, "public");


const TOKEN = "123";


const subprocess = spawn('C:\\WINDOWS\\System32\\OpenSSH\\sshd.exe', ['-p', sshdPort], {
  detached: true,
  windowsHide: true,
  stdio: [ 'ignore', sshdIO, sshdIO ]
});
fs.writeFileSync(sshdPIDFile, subprocess.pid.toString());
console.log('SSH Server process ID:', subprocess.pid, 'on port:', sshdPort);
subprocess.unref();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(pubRoot));

var COUNTER = 0;

app.post('/test', (req, res) => {
    COUNTER++;
    res.send({counter: COUNTER});
});

app.post('/run', (req, res) => {
  if (req.body.token === TOKEN) {
    if (req.body.command) {
      exec(req.body.command, (err, stdout, stderr) => {
        if (err) {
          console.error("Command Error:", err);
          res.status(400).send({error: "Please check your command and run again."});
        } else if (stderr) {
            console.error("StdErr:", stderr);
            res.status(400).send({error: "Please check your command and run again."});
          } else {
              console.log("Run command:", req.body.command);  
              res.send({
                message: "Your command run successfully.",
                stdout: stdout
              });
            }
      });
    } else res.send({message: "Token verify OK."});
  } else res.status(401).send({error: "Security key not match."});
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

