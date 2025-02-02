# peeper

Proof of concept proctored coding assessments for detecting cheating & the use of Generative AI

![image](https://github.com/user-attachments/assets/451f3776-964f-4e2f-9f1e-daa02b814e17)

Unless it's very blatant, cheating or using generative AI in a coding assessment is basically undetectable if all that's submitted is the end product. Test takers know that a company or school saying "your code will be scanned for the use of generative AI" is a lie, and before submitting the smart ones would remove evidence of cheating anyways; changed variable names, removed comments from the model, code restructuring, etc.

A step towards being able to actually detect these kinds of things involves control over the development environment & gathered data during the development process, which is what this POC lays the groundwork for.

### code-server container
- VSCode web for development environment, server file system + terminal access
- Default config & workspace to load instructions, test files, extensions, bash config, etc

### The spying part
- All traffic to the code server goes through a proxy server which injects `peeper.js` into the first HTML request to execute arbitrary JavaScript code in the browser

![image](https://github.com/user-attachments/assets/0acf4c2f-bdb8-4d68-8c60-7eb0bac4fb48)

  
- The server enables a monitor on the file system, recording versions between saves of test files

![image](https://github.com/user-attachments/assets/ae869c9e-dfc4-44ff-9fc9-bc2a017734c0)






With the ability to run code in the browser and snoop on requests to the code server, you could;
- add event listeners for keystrokes & pasted code, record time outside of tab
- verify IPs & user agents through access logs

After processing the file versions for diffs, you could;
- check for large diffs between saves and see if it looked like code from a generative AI
- check thought processes & iterations on difficult questions



### Other benefits
- consistent environment ready to go; avoid local env problems when downloading tests
- auto-submit code since it's already on the server; avoid pressure to zip & submit file, avoid issues with submission corrupting or not compiling
- coding in a remote environment itself should be enough of a deterrent to make a test taker careful to not cheat or use Gen AI


## Next
- create processing script for file versions to generate diffs & some easier way to look for clues - I had diffs generated in file-peeper.js at first but it'd make more sense in a production env to just send that data elsewhere for processing
- auto-authenticate candidate into env from token in URL
