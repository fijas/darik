# Darik

An over-engineered personal expense manager.

<img src="https://travis-ci.org/fijas/darik.svg?branch=master" alt="Travis CI" />

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Docker
docker-compose
```

### Installing

A step by step series of examples that tell you have to get a development env running

Clone the repository

```
git clone git@github.com:fijas/darik.git
```

Install `npm` packages

```
cd server
npm install
cd ../client
npm install
```

Bring up the docker instance

```
docker-compose up
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Run tests using the following command

```
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Deployment

...

## Built With

* [Node.js](https://nodejs.org/) - The runtime & dependency management used
* [Express](https://expressjs.com/) - The backend framework used
* [React](https://reactjs.org/) - The frontend framework used
* [MariaDB](https://mariadb.org/) - Data store used
* [Docker](https://www.docker.com/) - Container platform

## Contributing

Please read [CONTRIBUTING.md](https://github.com/fijas/darik/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Fijas Pocker** - *Initial work*

See also the list of [CONTRIBUTORS](https://github.com/fijas/darik/CONTRIBUTORS.md) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
