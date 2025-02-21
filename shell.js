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
    case 'help':
      console.log(`
        Available commands:
        - exit: Exit the shell
        - help: Show this help message
        - source <file>: Execute commands from a file
        - cd <directory>: Change directory
        - cd-: Change to the previous directory
        - cd..: Change to the parent directory
        - cd~: Change to the home directory
        - ls: List files in the current directory
        - pwd: Print the current working directory
        - mkdir <directory>: Create a directory
        - rmdir <directory>: Remove a directory
        - touch <file>: Create a file
        - rm <file>: Remove a file
        - cp <source> <destination>: Copy a file
        - mv <source> <destination>: Move a file
        - echo <text>: Print text to the console
        - ping <hostname> [port]: Ping a host
        - whoami: Print the current user
        - uname [-a | -s | -n]: Print system information
        - date [-u | -r <file>]: Print the current date or file modification date
        - df [-h | -i]: Print disk space usage
        - du [-h | -a]: Print directory size
        - ps [-a | -u]: Print process status
        - kill <pid>: Kill a process
        - id [-u | -g | -G]: Print user and group IDs
        - env: Print environment variables
        - history: Print command history
        - savehistory <command>: Save command to history
        - chmod <permissions> <file>: Change file permissions
        - chown <owner> <file>: Change file owner
        - grep <pattern> <file>: Search for a pattern in a file
        - find <directory> <name>: Find files in a directory
        - cd <directory>: Change directory
        - cat <file>: Print file contents
        - wget <url> <destination>: Download a file from a URL
        - curl <url> <destination>: Download a file from a URL
        - capsh -p [PID]: Enumerate capabilities of Node process to chart path to possible container escape
        - clear: Clear the console
        `
      );
      prompt();
      
    case 'source':
      const sourceFile = args[0];
      if (sourceFile) {
        fs.readFile(sourceFile, 'utf-8', (err, data) => {
          if (err) {
            console.error(`Error reading file: ${err.message}`);
          } else {
            const commands = data.split('\n');
            commands.forEach((cmd) => {
              runCommand(cmd);
            });
          }
          prompt();
        });
      }
      else {
        console.log('Usage: source <file>');
        prompt();
      }

    case 'cd':
      const dir = args[0];
      if (dir) {
        try {
          process.chdir(dir);
        } catch (err) {
          console.error(`Error: ${err.message}`);
        }
      } else {
        process.chdir(os.homedir());
      }
      prompt();

    case 'cd-':
      const previousDir = process.env.PREVIOUS_DIR;
      if (previousDir) {
        process.chdir(previousDir);
        console.log(`Changed directory to ${previousDir}`);
      } else {
        console.log('No previous directory found.');
      }

      prompt();
    case 'cd..':
      process.chdir('..');
      prompt();

    case 'cd~':
      process.chdir(os.homedir());
      prompt();

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
      
    case 'pwd':
      console.log(process.cwd());
      prompt();
    
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

    case 'rm':
      const rmOption = args[0];
      if (rmOption === '-rf') {
        const rmDir = args[1];
        if (rmDir) {
          fs.rmdir(rmDir, { recursive: true }, (err) => {
            if (err) {
              console.error(`Error removing directory: ${err.message}`);
            } else {
              console.log(`Directory ${rmDir} removed`);
            }
            prompt();
          });
        } else {
          console.log('Usage: rm -rf <directory_name>');
          prompt();
        }
      }
      else {
        const rmFile = rmOption;
        if (rmFile) {
          fs.unlink(rmFile, (err) => {
            if (err) {
              console.error(`Error removing file: ${err.message}`);
            } else {
              console.log(`File ${rmFile} removed`);
            }
            prompt();
          });
        } else {
          console.log('Usage: rm <file_name>');
          prompt();
        }
      }

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

    case 'echo':
      const echoText = args.join(' ');
      if (echoText) {
        console.log(echoText);
      } else {
        console.log('Usage: echo <text>');
      }
      prompt();

    case 'ping':
      const host = args[0];
      const port = args[1] || 80;
      if (host) {
        const client = net.createConnection(port, host, () => {
          console.log(`Ping to ${host}:${port} successful`);
          client.end();
          prompt();
        });
        client.on('error', (err) => {
          console.error(`Ping to ${host}:${port} failed: ${err.message}`);
          prompt();
        });
      } else {
        console.log('Usage: ping <hostname> [port]');
        prompt();
      }
      
    case 'whoami':
      console.log(process.env.USER || process.env.USERNAME);
      prompt();
    case 'uname':
      const unameOption = args[0];
      switch (unameOption) {
        case '-a':
          console.log(`System: ${os.type()} ${os.release()} ${os.platform()}`);
          prompt();
          
        case '-s':
          console.log(os.type());
          prompt();
          
        case '-n':
          console.log(os.hostname());
          prompt();
          
        default:
          console.log('Usage: uname [-a | -s | -n]');
      }
      prompt();
    case 'date':
      const dateOption = args[0];
      switch (dateOption) {
        case '-u':
          console.log(new Date().toUTCString());
          prompt();
          
        case '-r':
          const fileDate = fs.statSync(args[1]).mtime;
          console.log(fileDate);
          prompt();
        default:
          console.log(new Date().toString());
          prompt();
      }
      prompt();
    case 'df':
      const dfOption = args[0];
      switch (dfOption) {
        case '-h':
          const { size, free } = fs.statvfsSync('/');
          console.log(`Size: ${size}, Free: ${free}`);
          prompt();
        case '-i':
          const { files, freeFiles } = fs.statvfsSync('/');
          console.log(`Files: ${files}, Free Files: ${freeFiles}`);
          prompt();
          
        default:
          console.log('Usage: df [-h | -i]');
          prompt();
      }
      prompt();
      
    case 'du':
      const duOption = args[0];
      switch (duOption) {
        case '-h':
          const { size: dirSize } = fs.statSync(args[1]);
          console.log(`Directory size: ${dirSize}`);
          prompt();
          
        case '-a':
          const files = fs.readdirSync(args[1]);
          files.forEach((file) => {
            const { size } = fs.statSync(`${args[1]}/${file}`);
            console.log(`${file}: ${size}`);
          });
          prompt();
          
        default:
          console.log('Usage: du [-h | -a]');
          prompt();
      }
      prompt();
      
    case 'ps':
      const psOption = args[0];
      switch (psOption) {
        case '-a':
          const processes = cp.execSync('ps -a').toString();
          console.log(processes);
          prompt();
          
        case '-u':
          const userProcesses = cp.execSync('ps -u').toString();
          console.log(userProcesses);
          prompt();
          
        default:
          console.log('Usage: ps [-a | -u]');
          prompt();
      }
      prompt();
      
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
      
    case 'id':
      const idOption = args[0];
      switch (idOption) {
        case '-u':
          console.log(process.getuid());
          prompt();
          
        case '-g':
          console.log(process.getgid());
          prompt();
          
        case '-G':
          console.log(process.getgroups());
          prompt();
          
        default:
          console.log('Usage: id [-u | -g | -G]');
          prompt();
      }
      prompt();

    case 'env':
      console
        .log('Environment Variables:');
      console.log('------------------------');
      for (const [key, value] of Object.entries(process.env)) {
        console.log(`${key}: ${value}`);
      }
      console.log('------------------------');
      prompt();
      
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

    case 'clear':
      console.clear();
      
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
      
    case 'capsh':
      const capshOpt = args[0];
      switch (capshOpt) {
        // Add functionality for decoding capabilities flags retrieved from /proc/self/status
        case '-p':
          const pid = args[1] || "self";
          const status = fs.readFileSync(`/proc/${pid}/status`, 'utf-8');
          const capabilities = status.match(/Cap(.*?)\n/);
          for (var i = 0; i < capabilities.length; i++) {
            // Match each capability flag and convert to the human readable form
            const capInt = parseInt(capabilities[i].split(':')[1], 16);
            
            const cap_dac_override = (capInt & 0x1) ? 'cap_dac_override' : '';
            const cap_dac_read_search = (capInt & 0x2) ? 'cap_dac_read_search' : '';
            const cap_fowner = (capInt & 0x4) ? 'cap_fowner' : '';
            const cap_fsetid = (capInt & 0x8) ? 'cap_fsetid' : '';
            const cap_kill = (capInt & 0x10) ? 'cap_kill' : '';
            const cap_setgid = (capInt & 0x20) ? 'cap_setgid' : '';
            const cap_setuid = (capInt & 0x40) ? 'cap_setuid' : '';
            const cap_setpcap = (capInt & 0x80) ? 'cap_setpcap' : '';
            const cap_linux_immutable = (capInt & 0x100) ? 'cap_linux_immutable' : '';
            const cap_net_bind_service = (capInt & 0x200) ? 'cap_net_bind_service' : '';
            const cap_net_broadcast = (capInt & 0x400) ? 'cap_net_broadcast' : '';
            const cap_net_admin = (capInt & 0x800) ? 'cap_net_admin' : '';
            const cap_net_raw = (capInt & 0x1000) ? 'cap_net_raw' : '';
            const cap_ipc_lock = (capInt & 0x2000) ? 'cap_ipc_lock' : '';
            const cap_ipc_owner = (capInt & 0x4000) ? 'cap_ipc_owner' : '';
            const cap_sys_module = (capInt & 0x8000) ? 'cap_sys_module' : '';
            const cap_sys_rawio = (capInt & 0x10000) ? 'cap_sys_rawio' : '';
            const cap_sys_chroot = (capInt & 0x20000) ? 'cap_sys_chroot' : '';
            const cap_sys_ptrace = (capInt & 0x40000) ? 'cap_sys_ptrace' : '';
            const cap_sys_pacct = (capInt & 0x80000) ? 'cap_sys_pacct' : '';
            const cap_sys_admin = (capInt & 0x100000) ? 'cap_sys_admin' : '';
            const cap_sys_boot = (capInt & 0x200000) ? 'cap_sys_boot' : '';
            const cap_sys_nice = (capInt & 0x400000) ? 'cap_sys_nice' : '';
            const cap_sys_resource = (capInt & 0x800000) ? 'cap_sys_resource' : '';
            const cap_sys_time = (capInt & 0x1000000) ? 'cap_sys_time' : '';
            const cap_sys_tty_config = (capInt & 0x2000000) ? 'cap_sys_tty_config' : '';
            const cap_mknod = (capInt & 0x4000000) ? 'cap_mknod' : '';
            const cap_lease = (capInt & 0x8000000) ? 'cap_lease' : '';
            console.log(`Capabilities: ${cap_dac_override} ${cap_dac_read_search} ${cap_fowner} ${cap_fsetid} ${cap_kill} ${cap_setgid} ${cap_setuid} ${cap_setpcap} ${cap_linux_immutable} ${cap_net_bind_service} ${cap_net_broadcast} ${cap_net_admin} ${cap_net_raw} ${cap_ipc_lock} ${cap_ipc_owner} ${cap_sys_module} ${cap_sys_rawio} ${cap_sys_chroot} ${cap_sys_ptrace} ${cap_sys_pacct} ${cap_sys_admin} ${cap_sys_boot} ${cap_sys_nice} ${cap_sys_resource} ${cap_sys_time} ${cap_sys_tty_config} ${cap_mknod} ${cap_lease}`);
          }
          prompt();

        default:
          console.log('Usage: capsh -p [PID]');
          prompt();
      }

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
