# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].


## Steps to follow

1. Clone the repository to your local computer.
2. Open the terminal and install the packages: `npm install`.
3. Run your application `node app.js`
4. Server will start listening in port: 8000. 


## Endpoint documentation

### Get Block By Index
*URL* : `http://localhost/block/:index`
*Method* : `GET`
*URL Params* : `**Required** : index=[integer]`
*Success Response* : `{
    "status": 200,
    "response": {
        "body": "Testing block with test string data",
        "height": 9,
        "previousBlockHash": "d8941e8ca88ad11ed555302a7eb65c8dcbeed91559ac769786f017f8517a2950",
        "time": "1542658139",
        "hash": "4ccfe103c3c67aa3985ac7318a1a32e8defd4ef6696ecf7fd49b0fcc77e15589"
    }
}`


### Post Block 
*URL* : `http://localhost/block/`
*Method* : `POST`
*Data Params* : `*{"body": "Testing block with test string data"}`
*Success Response* : `{
    "body": "Testing block with test string data",
    "height": 9,
    "previousBlockHash": "d8941e8ca88ad11ed555302a7eb65c8dcbeed91559ac769786f017f8517a2950",
    "time": "1542658139",
    "hash": "4ccfe103c3c67aa3985ac7318a1a32e8defd4ef6696ecf7fd49b0fcc77e15589"
}`


## Authors
* **Fahad Al-Osaimi** - *Senior Technical Consultant* - [FahadOs](https://github.com/FahadOs)
