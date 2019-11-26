# BlocksJourney

**<!> This was a school project and it is not maintained <!>**

## Description

BlocksJourney is a video game that aim to educates young generations about computers: a fun approach allows to learn fundamental algorithmic concepts and a final pedagogical monitoring interface to teachers allows evaluation in a school setting.

Stack :
- Angular v5.2.9
- Electron v1.8.4
- Electron Builder v20.8.1
- Phaser v2.10.6
- Blockly v1.0.0

Can :
- Run in a local development/production environment with Electron & Hot reload
- Package app into an executable file for Linux, Windows & Mac

## Getting Started

Install dependencies :

``` bash
> make install
```

Run application :

``` bash
> make start
```

## Available commands

|Command|Description|
|--|--|
|`make install`| Install all dependencies |
|`make start`| Execute the app in the browser and start electron |
|`make browser`| Execute the app in the browser |
|`make build-dev`| Build the app in the /dist folder. |
|`make build-prod`| Build the app with Angular aot for production mode |
|`make electron`| Build the app and start electron
|`make package`| Build the app and generate an executable (handle UNIX/Windows/OSX) |
|`make clean`| Delete all generated dir and files |
|`make all`| Clean, Install and Start |

**=> to package on a specific OS please update the OS variable in Makefile (Default Linux)**

## Manage environment variables

On Window :
- Using development variables :  `cross-env ENV=dev`
- Using production variables  :  `cross-env ENV=prod`

On UNIX :
- Using development variables :  `export ENV=dev`
- Using production variables  :  `export ENV=prod`

And `make start`

