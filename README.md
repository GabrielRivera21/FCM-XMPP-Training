### Requirements

For this project you need Node JS version >= 6.9.1 with npm. You can download the installer
[here](https://nodejs.org/en/)

#### Installing Dependencies

To set up the project open up the command line and go into the where the `package.json` file
is and run the following to install the dependencies:

```
$ npm install
```

#### Virtual Environment

This project uses environmental variables and is able to read them from a `config.json` file,
so lets set that up. Execute the following command in the root directory of the project.

```
$ cp ./config/files/config-example.json ./config/files/config.json
```

Afterwards set your values for the Server Key and Sender ID inside the `config.json`.

#### Running the Project

To run the project on the directory go into the directory where the `package.json` file is in the
command line and run the following:

```
$ npm start
```

Enjoy!
