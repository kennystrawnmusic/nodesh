const fs = require('fs');
const os = require('os');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const http = require('http');
const https = require('https');
const { URL } = require('url');
const net = require("net");
const cp = require("child_process");

const runCommand = (command) => {
  const [cmd, ...args] = command.trim().split(' ');

  switch (cmd) {
    case 'exit':
      process.exit(0);
      break;
      
    case 'ls':
      const lsdir = args[0];
      if(lsdir) {
        fs.readdir(lsdir, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            files.forEach(file => console.log(file));
          }
          prompt();
        });
      } else {
        fs.readdir('.', (err, files) => {
          if (err) {
            console.log(err);
          } else {
            files.forEach(file => console.log(file));
          }
          prompt();
        });
      }
      break;
      
    case 'pwd':
      console.log(process.cwd());
      prompt();
      break;
      
    case 'cd':
      const dir = args[0];
      if (dir) {
        try {
          process.chdir(dir);
        } catch (err) {
          console.error(`Error: ${err.message}`);
        }
      } else {
        console.log(os.homedir());
        process.chdir(os.homedir());
      }
      prompt();
      break;
      
    case 'cat':
      const file = args[0];
      if (file) {
        fs.readFile(file, 'utf-8', (err, data) => {
          if (err) {
            console.error(`Error reading file: ${err.message}`);
          } else {
            console.log(data);
          }
          prompt();
        });
      } else {
        console.log('Usage: cat <filename>');
        prompt();
      }
      break;
      
    case 'wget':
      const url = args[0];
      const dest = args[1];
      
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          console.log(`Download failed with status code ${response.statusCode}`);
        }

        const file = fs.createWriteStream(dest);
        response.pipe(file);

        file.on('finish', () => {
          console.log(`Successfully downloaded ${dest}`);
          file.close();
        });

        file.on('error', (err) => {
          fs.unlink(dest, () => console.log(`Error writing file: ${err}`));
        });
      });
      break;
      
    case 'clear':
      console.clear();
      break;
      
    default:
      const child = cp.spawn(cmd, args);
      
      child.on('error', (err) => {
         console.log(`${cmd}: command not found`);
      });

      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        // already handle the "Not Found" case with the onerror event
        if (code === 0 || code !== -2 || code !== 127) {
          console.log(`Command exited with code ${code}`);
          prompt();
        }
      });
      prompt();
  }
};

const prompt = () => {
  readline.question(`${process.cwd()} $ `, (command) => {
    runCommand(command);
  });
};

prompt();
