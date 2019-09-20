# evectr.api
The official **eVectr™** `API`.

![Sourcegraph for Repo Reference Count](https://img.shields.io/badge/latest-v3.0.6-blue.svg?longCache=true)
![Sourcegraph for Repo Reference Count](https://img.shields.io/badge/node-%3E=v10.16.2-lightgrey.svg?longCache=true)
![Sourcegraph for Repo Reference Count](https://img.shields.io/badge/npm-%3E=v6.9.0-lightgrey.svg?longCache=true)
![Sourcegraph for Repo Reference Count](https://img.shields.io/badge/mysql-%3E=v5.6.0-lightgrey.svg?longCache=true)

## Contents

> 1. [Prequisites](#prequisites)
>    > 1. [Structure](#structure)
> 1. [Setup](#setup)
>    > 1. [Pre-Configuration](#pre-configuration)
>    > 1. [Installing](#installing)
>    > 1. [Post-Configuration](#post-configuration)
>    > 1. [Launching](#launching)
> 1. [Modules](#modules)
>    > 1. [dffrnt.utils](#dffrntutils)
>    > 1. [dffrnt.model](#dffrntmodel)
>    > 1. [dffrnt.route](#dffrntroute)
> 1. [License](#license)

---
## Prequisites
* [NodeJS](https://nodejs.org/en/) (_Latest_)
* [NPM](https://nodejs.org/en/) (_Installed with `NodeJS`_)
* [REDIS](https://redis.io/download) (_See **[Structure](#structure)** below_)
   * _Install this in the same **parent folder** as **this project** under `REDIS/`_
* [MySQL](https://dev.mysql.com/downloads/mysql/) (_v5.6+_)
   * _A `user@%` account is **required** for later configuration_

### Structure

```
Parent_Folder/ (Name NOT important)
   ├── dffrnt.api/ (Project-Root; any no-spaced Name will do)
   │   ├── config/ (Reference only; no need to create these!)
   │   └── ...
   └── REDIS/ (Name important! Don't change this name!!)
```

> In this document, **`./`**, refers to the **project root**; while, **`../`**, refers to the **parent folder**

---
## Setup

### Pre-Configuration
1. Ensure the **[folder structure](#structure)** is setup.
1. Ensure the **[prequisites](#prequisites)** are installed.
   * If the `install method` you chose for `REDIS` installs the files in a default location, be sure to `symlink` that location to the `../REDIS/` directory.
1. In the `MySQL` database, create a `user@%` for yourself.
   * Be sure to give yourself appropriate permissions.
1. Configure the `redis.conf` file in the `../REDIS/` folder:

   ```apacheconf
   # ../REDIS/redis.conf

   ################################## SECURITY ###################################
   # Require clients to issue AUTH <PASSWORD> before processing any other
   # ...
   # use a very strong password otherwise it will be very easy to break.
   #
   requirepass p@ssw0rd_h3r3!
   ```

### Installing
1. [Download](https://github.com/DFFR-NT/dffrnt.api/archive/master.zip) or [`git`](https://github.com/DFFR-NT/dffrnt.api.git) this project into the **parent folder**.
1. In your **command line**, `cd` into the **project root** location.
1. Install some packages at the `global` level:
   1. Run `chmod +x ./.docs/npm_global.sh` to make it **excutable**.
   1. Run `sudo ./.docs/npm_global.sh` to install some important, **global* packages.
      > These can be utilized across ANY or your projects:
       
      | Package | Description |
      | --- | --- |
      | [babel-cli](https://www.npmjs.com/package/babel-cli) | A next-gen (`ES6`) JavaScript compiler. |
      | [bower](https://www.npmjs.com/package/bower) | A package-manager for Browser `plugins`. |
      | [cors](https://www.npmjs.com/package/cors) | A `middleware` for `Cross-Origin Resource Sharing`. |
      | [depcheck](https://www.npmjs.com/package/depcheck) | A tool for analyzing the `dependencies` in a project |
      | [express](https://www.npmjs.com/package/express) | A fast, unopinionated, minimalist web framework for `NodeJS`. |
      | [gulp](https://www.npmjs.com/package/gulp) | A toolkit that helps automate development workflow `tasks`. |
      | [less](https://www.npmjs.com/package/less) | The dynamic `stylesheet` language. |
      | [less-plugin-clean-css](https://www.npmjs.com/package/less-plugin-clean-css) | A `gulp` plugin for `LESS -> CSS` using `clean-css`. |
      | [nodemon](https://www.npmjs.com/package/nodemon) | Will watch for files changes and `restart` your application. |

1. Run `npm link gulp && gulp setup` to:
   * Install the `npm packages`.
   * Install the `bower components`.
   * Initialize the `config files`.
   * Link the `framework modules`.

### Post-Configuration
1. In the `./config/` folder, configure the `settings.js` file:

   ```javascript
   // ./config/settings.js 
   export default {
       Debug: true, // Debug‑Mode will display verbose Logs
       // This is the Server's listening Port
       Port: 3001, 
       // If using as a separate Frontend...
       API:	'http://localhost:3001',
       // Setup Folders for Static Content 
       Folders: 
           Uploads: { 
               Folder:  'storage',
               // Cache‑Age for Browser files
               Age: 365*86400, 
               // ...
           }
       },
       Session: {
           // This should be something hard to guess, like a phrase
           Secret: '¿mYd0GiS!nmYeyE&shEs4yS@uE?',
           Age:    (((3600*1000)*4)*1),  // TTL for User Sessions
           REDIS:  {
               Host: 'localhost', // Or whereever you keep it
               Port: 6379, // Listening Port
               // The password you configured earlier
               Password: 'p@ssw0rd!',
           },
           Auth: { /* ... */ }
       }
   };
   ```
1. Still in the `./config/` folder, configure the `database.js` file:
   
   ```javascript
   // ./config/database.js
   export default {
       Config: {
           user:     'user', // The one you created in MySQL
           database: 'mydatabase', // The DB
           // ...
       },
       Pool: {
           HeadEx1: {
               host: 'XXX.XXX.XXX.XXX', // The eVectr IP
               // The one you created in MySQL 
               password: 'p@ssw0rd_h3r3!' 
           },
       }
   };
   ```

### Launching
1. Lastly, still in the **project root**, type `gulp` and hit <kbd>ENTER</kbd> to run, and watch the `logs` as the `server` starts up:

   > ![Initial Gulp-Tasks being completed](.docs/images/2.4.1_gulp-tasks.png?raw=true)
   > _Initial `gulp` tasks being completed._
   
   > ![Nodemon Monitoring Startup](.docs/images/2.4.2_nmon-start.png?raw=true)
   > _File monitoring, courtesy of `nodemon`._
   
   > ![Node Server Startup](.docs/images/2.4.3_node-start.png?raw=true)
   > _The `node` server starting up._
   
   * If there are no _glaring_ `errors`, you're done!
   * Otherwise... Sh!t..? ¯\\_(ツ)\_/¯
1. In your `browser`, navigate to [localhost:3001/api-explorer](http://localhost:3001/api-explorer) (_or whatever `port` you chose_) and you'll see the **API Exploration UI**. Use this to test your `endpoints` and/or `single sign-on` functionality.
1. Hit <kbd>CTRL</kbd>+<kbd>C</kbd> to `stop` the server.

---
## Modules

### [dffrnt.confs](https://github.com/DFFR-NT/dffrnt.confs#readme)
> _Initial default Configs used within the DFFRNT.API Framework._

### [dffrnt.model](https://github.com/DFFR-NT/dffrnt.model#readme)
> _A collection of SQL Utilities & MySQL connector._

### [dffrnt.route](https://github.com/DFFR-NT/dffrnt.route#readme)
> _An Express/Passport/MySQL-based API Router._

### [dffrnt.utils](https://github.com/DFFR-NT/dffrnt.utils#readme)
> _A collection of useful API Utilities & PolyFills._

---
## License 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

