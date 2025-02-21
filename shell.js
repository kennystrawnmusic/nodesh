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
    
    case 'mkdir':
      const dirName = args[0];
      if (dirName) {
        fs.mkdir(dirName, { recursive: true }, (err) => {
          if (err) {
            console.error(`Error creating directory: ${err.message}`);
          } else {
            console.log(`Directory ${dirName} created`);
          }
          prompt();
        });
      } else {
        console.log('Usage: mkdir <directory_name>');
        prompt();
      }
      break;

    case 'rmdir':
      const rmDirName = args[0];
      if (rmDirName) {
        fs.rmdir(rmDirName, { recursive: true }, (err) => {
          if (err) {
            console.error(`Error removing directory: ${err.message}`);
          } else {
            console.log(`Directory ${rmDirName} removed`);
          }
          prompt();
        });
      } else {
        console.log('Usage: rmdir <directory_name>');
        prompt();
      }
      break;
    
    case 'touch':
      const fileName = args[0];
      if (fileName) {
        fs.writeFile(fileName, '', (err) => {
          if (err) {
            console.error(`Error creating file: ${err.message}`);
          } else {
            console.log(`File ${fileName} created`);
          }
          prompt();
        });
      }
      else {
        console.log('Usage: touch <file_name>');
        prompt();
      }
      break;

    case 'rm':
      const rmFileName = args[0];
      if (rmFileName) {
        fs.unlink(rmFileName, (err) => {
          if (err) {
            console.error(`Error removing file: ${err.message}`);
          } else {
            console.log(`File ${rmFileName} removed`);
          }
          prompt();
        });
      } else {
        console.log('Usage: rm <file_name>');
        prompt();
      }
      break;

    case 'cp':
      const source = args[0];
      const cpdest = args[1];
      if (source && cpdest) {
        fs.copyFile(source, cpdest, (err) => {
          if (err) {
            console.error(`Error copying file: ${err.message}`);
          } else {
            console.log(`File copied from ${source} to ${cpdest}`);
          }
          prompt();
        });
      } else {
        console.log('Usage: cp <source_file> <destination_file>');
        prompt();
      }
      break;
    case 'mv':
      const mvSource = args[0];
      const mvDest = args[1];
      if (mvSource && mvDest) {
        fs.rename(mvSource, mvDest, (err) => {
          if (err) {
            console.error(`Error moving file: ${err.message}`);
          } else {
            console.log(`File moved from ${mvSource} to ${mvDest}`);
          }
          prompt();
        });
      } else {
        console.log('Usage: mv <source_file> <destination_file>');
        prompt();
      }
      break;
    case 'echo':
      const echoText = args.join(' ');
      if (echoText) {
        console.log(echoText);
      } else {
        console.log('Usage: echo <text>');
      }
      prompt();
      break;
    case 'ping':
      const host = args[0];
      const port = args[1] || 80;
      if (host) {
        const client = net.createConnection(port, host, () => {
          console.log(`Ping to ${host}:${port} successful`);
          client.end();
        });

        client.on('error', (err) => {
          console.error(`Ping to ${host}:${port} failed: ${err.message}`);
        });
      } else {
        console.log('Usage: ping <hostname> [port]');
      }
      break;
    case 'whoami':
      console.log(process.env.USER || process.env.USERNAME);
      prompt();
      break;

    case 'uname':
      const unameOption = args[0];
      switch (unameOption) {
        case '-a':
          console.log(`System: ${os.type()} ${os.release()} ${os.platform()}`);
          break;
        case '-s':
          console.log(os.type());
          break;
        case '-n':
          console.log(os.hostname());
          break;
        default:
          console.log('Usage: uname [-a | -s | -n]');
      }
      prompt();
      break;
    case 'date':
      const dateOption = args[0];
      switch (dateOption) {
        case '-u':
          console.log(new Date().toUTCString());
          break;
        case '-r':
          const fileDate = fs.statSync(args[1]).mtime;
          console.log(fileDate);
          break;
        default:
          console.log(new Date().toString());
      }
      prompt();
      break;
    case 'df':
      const dfOption = args[0];
      switch (dfOption) {
        case '-h':
          const { size, free } = fs.statvfsSync('/');
          console.log(`Size: ${size}, Free: ${free}`);
          break;
        case '-i':
          const { files, freeFiles } = fs.statvfsSync('/');
          console.log(`Files: ${files}, Free Files: ${freeFiles}`);
          break;
        default:
          console.log('Usage: df [-h | -i]');
      }
      prompt();
      break;
    case 'du':
      const duOption = args[0];
      switch (duOption) {
        case '-h':
          const { size: dirSize } = fs.statSync(args[1]);
          console.log(`Directory size: ${dirSize}`);
          break;
        case '-a':
          const files = fs.readdirSync(args[1]);
          files.forEach((file) => {
            const { size } = fs.statSync(`${args[1]}/${file}`);
            console.log(`${file}: ${size}`);
          });
          break;
        default:
          console.log('Usage: du [-h | -a]');
      }
      prompt();
      break;
    case 'ps':
      const psOption = args[0];
      switch (psOption) {
        case '-a':
          const processes = cp.execSync('ps -a').toString();
          console.log(processes);
          break;
        case '-u':
          const userProcesses = cp.execSync('ps -u').toString();
          console.log(userProcesses);
          break;
        default:
          console.log('Usage: ps [-a | -u]');
      }
      prompt();
      break;
    case 'kill':
      const pid = args[0];
      if (pid) {
        try {
          process.kill(pid);
          console.log(`Process ${pid} killed`);
        } catch (err) {
          console.error(`Error killing process: ${err.message}`);
        }
      } else {
        console.log('Usage: kill <pid>');
      }
      prompt();
      break;
    case 'id':
      const idOption = args[0];
      switch (idOption) {
        case '-u':
          console.log(process.getuid());
          break;
        case '-g':
          console.log(process.getgid());
          break;
        case '-G':
          console.log(process.getgroups());
          break;
        default:
          console.log('Usage: id [-u | -g | -G]');
      }
      prompt();
      break;
    case 'env':
      console
        .log('Environment Variables:');
      console.log('------------------------');
      for (const [key, value] of Object.entries(process.env)) {
        console.log(`${key}: ${value}`);
      }
      console.log('------------------------');
      prompt();
      break;
    case 'history':
      console.log('Command History:');
      console.log('----------------');
      if (fs.existsSync('.history')) {
        const history = fs.readFileSync('.history', 'utf-8');
        console.log(history);
      } else {
        console.log('No command history found.');
      }
      prompt();
      break;
    case 'savehistory':
      const historyCommand = args.join(' ');
      if (historyCommand) {
        fs.appendFile('.history', `${historyCommand}\n`, (err) => {
          if (err) {
            console.error(`Error saving command to history: ${err.message}`);
          } else {
            console.log(`Command saved to history: ${historyCommand}`);
          }
          prompt();
        });
      } else {
        console.log('Usage: savehistory <command>');
        prompt();
      }
      break;
    case 'chmod':
      const permissions = args[0];
      const chmodFile = args[1];
      if (permissions && chmodFile) {
        fs.chmod(chmodFile, permissions, (err) => {
          if (err) {
            console.error(`Error changing file permissions: ${err.message}`);
          } else {
            console.log(`Permissions changed for ${chmodFile}`);
          }
          prompt();
        });
      } else {
        console.log('Usage: chmod <permissions> <file>');
        prompt();
      }
      break;
    case 'chown':
      const owner = args[0];
      const chownFile = args[1];
      if (owner && chownFile) {
        fs.chown(chownFile, owner, (err) => {
          if (err) {
            console.error(`Error changing file owner: ${err.message}`);
          } else {
            console.log(`Owner changed for ${chownFile}`);
          }
          prompt();
        });
      } else {
        console.log('Usage: chown <owner> <file>');
        prompt();
      }
      break;
    case 'grep':
      const grepPattern = args[0];
      const grepFile = args[1];
      if (grepPattern && grepFile) {
        fs.readFile(grepFile, 'utf-8', (err, data) => {
          if (err) {
            console.error(`Error reading file: ${err.message}`);
          } else {
            const lines = data.split('\n');
            lines.forEach((line) => {
              if (line.includes(grepPattern)) {
                console.log(line);
              }
            });
          }
          prompt();
        });
      } else {
        console.log('Usage: grep <pattern> <file>');
        prompt();
      }
      break;
    case 'find':
      const findDir = args[0];
      const findName = args[1];
      if (findDir && findName) {
        fs.readdir(findDir, { withFileTypes: true }, (err, files) => {
          if (err) {
            console.error(`Error reading directory: ${err.message}`);
          } else {
            files.forEach((file) => {
              if (file.name.includes(findName)) {
                console.log(file.name);
              }
            });
          }
          prompt();
        });
      } else {
        console.log('Usage: find <directory> <name>');
        prompt();
      }
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

    case 'curl':
      const curlUrl = args[0];
      const curlDest = args[1];
      
      const curlParsedUrl = new URL(curlUrl);
      const curlProtocol = curlParsedUrl.protocol === 'https:' ? https : http;
      
      curlProtocol.get(curlUrl, (response) => {
        if (response.statusCode !== 200) {
          console.log(`Download failed with status code ${response.statusCode}`);
        }

        const file = fs.createWriteStream(curlDest);
        response.pipe(file);

        file.on('finish', () => {
          console.log(`Successfully downloaded ${curlDest}`);
          file.close();
        });

        file.on('error', (err) => {
          fs.unlink(curlDest, () => console.log(`Error writing file: ${err}`));
        });
      });
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
