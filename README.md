# peeper

Proof of concept proctored coding assessments for detecting cheating & the use of Generative AI

### code-server container
- VSCode web for development environment, server file system + terminal access
- Default config & workspace to load instructions, test files, extensions, bash config, etc

### The spying part
- All traffic to the code server goes through a proxy server which injects `peeper.js` into the first HTML request to execute arbitrary JavaScript code in the browser
- The server enables a monitor on the file system, recording versions between saves of test files


With the ability to run code in the browser and snoop on requests to the code server, you could;
- add event listeners for keystrokes & pasted code, record time outside of tab
- verify IPs & user agents through access logs

After processing the file versions for diffs, you could;
- check for large diffs between saves and see if it looked like code from a generative AI
- check thought processes & iterations on difficult questions

### Other benefits
- consistent environment ready to go; avoid local env problems when downloading tests
- auto-submit code since it's already on the server; avoid pressure to zip & submit file, avoid issues with submission corrupting or not compiling


## Next
- create processing script for file versions to generate diffs & some easier way to look for clues - I had diffs generated in file-peeper.js at first but it'd make more sense in a production env to just send that data elsewhere for processing
- auto-authenticate candidate into env from token in URL