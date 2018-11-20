const SHA256 = require('crypto-js/sha256');
const Blockchain = require('./blockchain.js');
let blockchain = new Blockchain.Blockchain ;

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", (req, res) => {
            let height = req.params.index; 
            console.log(' Get block requested for index = ' + height );
            blockchain.getBlock(height).then((block) => {
                console.log(' Selected block for index == ' + height + ' ==== ' + block);
                res.send({"response": JSON.parse(block)});
            }).catch(e => res.status(400).send({ "response":"No Data Availble For Index : "+height}));

        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            let body = req.body.body;
            console.log(body);
            if (body == undefined){
                res.status(400).send({ "response":"Block Needs Data In The Body!"});

            }else{
                let blockchain = new Blockchain.Blockchain ;
                body = {"body": body};
                blockchain.addBlock(body).then((result) => {
                console.log(result);
                res.json(result);
                });
   
  
            }

        });
    }



}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}