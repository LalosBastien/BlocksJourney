
# Description

*Game with Angular5, Electron and Phaser*

Stack :
- Angular v5.2.9
- Angular-CLI v1.7.4
- Electron v1.8.4
- Electron Builder v20.8.1
- Phaser v

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

