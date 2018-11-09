/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const logPrefix = 'blockchain :: ';
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const Block = require('./simpleChain');

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
     this.getBlockHeight().then((height) => {
if (height < 0){
                this.addBlock(new Block.Block("First block in the chain - Genesis block"));
}})
  }
    
  // Get block height
 getBlockHeight(){
     return new Promise((resolve, reject) => {

        let i = 0;
        db.createReadStream().on('data', function(data) {
            //console.log('key=', data);
            i++;
        }).on('error', function(err) {
                return console.log(logPrefix + 'Unable to read data stream!! :: ', err)
        }).on('end', function() {
                //console.log(logPrefix + 'Block Height == ' + i);
                resolve(i-1);
        })
        
    })}

    
  // Add new block
  addBlock(newBlock){
     let self = this; 
     return new Promise((resolve, reject) => {
    // Block height
     this.getBlockHeight().then((height) => {
        //console.log(logPrefix + 'Block Heigh  t == ' + height );
        newBlock.height = height + 1;
        
        if (height >= 0 ){
                            
            this.getBlock(height).then((block) => {
                //console.log(block);
                block = JSON.parse(block);
                // previous block hash
                newBlock.previousBlockHash = block.hash;
                // UTC timestamp
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                // Sending this new block to the persistent method
                self.addDataToLevelDB(JSON.stringify(newBlock).toString());
                //console.log(logPrefix + 'Block  == ' + JSON.stringify(newBlock).toString());
            }).catch(e => console.error(logPrefix + 'error getBlock ======= ' + e));
        }else{
                // UTC timestamp
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                // Sending this new block to the persistent method
                self.addDataToLevelDB(JSON.stringify(newBlock).toString());
                //console.log(logPrefix + 'Block  == ' + JSON.stringify(newBlock).toString());
         
        }
     }).catch(e => console.error(logPrefix + 'error getBlockHeight ======= ' + e));
                    resolve(true);
        })
  }
// Add data to levelDB with key/value pair
addLevelDBData(key,value){
        return new Promise((resolve, reject) => {

  db.put(key, value, function(err) {
    if (err) reject(err);//console.log('Block ' + key + ' submission failed', err);
  })
})}

// Get data from levelDB with key
getLevelDBData(key){
        return new Promise((resolve, reject) => {

            db.get(key, function(err, value) {
                if (err) return console.log('Not found!', err);
                resolve(value);
            });})
}

// Add data to levelDB with value
addDataToLevelDB(value) {
    let self = this;
    return new Promise((resolve, reject) => {
    db.createReadStream().on('data', function(data) {
        }).on('error', function(err) {
            reject(err)//return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + (JSON.parse(value)).height);
          self.addLevelDBData((JSON.parse(value)).height, value);
        });
    })
        
}

    // get block
    getBlock(blockHeight){
      // return object as a single string
      //return JSON.parse(JSON.stringify(this.chain[blockHeight]));
      return this.getLevelDBData(blockHeight); 
    }

    // validate block
    validateBlock(blockHeight){
        let self = this ; 
        return new Promise ((resolve, reject)=>{

      // get block object
      self.getBlock(blockHeight).then((block) => {    
      // get block hash
      block = JSON.parse(block)
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          //console.log(logPrefix + 'Compare ======= true' ); 
            resolve(true);
        } else {
          //console.log(logPrefix + 'Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            resolve(false);
        }
    }).catch(e => console.error(logPrefix + 'error getBlock ======= ' + e))
    });
    }

   // Validate blockchain
    validateChain(){
        let self = this;
        return new Promise((resolve, reject) => {
            let promises = [];
            let errorLog = [];
            this.getBlockHeight().then((height) => {
            
                for (let i = 0; i < height ; i++) {
                        // validate block
                        promises.push(self.validateBlock(i));

                }
   
                Promise.all(promises).then(results => {
                    //console.log(results);
                    if (results.length > 1) {
                        //console.log(logPrefix + 'Block errors = ' + results.length );
                        for (let j = 0; j < results.length; j++) {
                            this.getBlock(j).then((block) => {
                            block = JSON.parse(block);  
                            let blockHash = block.hash;
                            this.getBlock(j+1).then((nextBlock) => {
                                nextBlock = JSON.parse(nextBlock);  
                                let previousHash = (nextBlock) ? nextBlock.previousBlockHash : null;
                            //console.log(logPrefix + ' :: j == ' + j + '  :: blockHash  ======= ' + blockHash + ' ///  previousHash  /// '+ previousHash ); 

                                if (blockHash !== previousHash && previousHash !== null) {
                                      console.log(logPrefix + 'Not equal'); 
                                      errorLog.push(j);
                                }

                                //console.log(logPrefix +' :::: ' + errorLog.length + '  ::: ' + errorLog );
                                if (errorLog.length>0) {
                                    console.log(logPrefix + 'Block errors = ' + errorLog.length);
                                    console.log(logPrefix + 'Blocks: '+errorLog);
                                      resolve(false);
                                } else {
                                    console.log('No errors detected');
                                      resolve(true);
                                }
                            }).catch(e => console.error(logPrefix + 'error ======= ' + e))
                        }).catch(e => console.error(logPrefix + 'error ======= ' + e))
                    }}}).catch(e => console.error(logPrefix + 'error ======= ' + e))
            }).catch(e => console.error(logPrefix + 'error ======= ' + e))
        });

    }
}

let blockchain = new Blockchain();

(function theLoop (i) {
    setTimeout(function () {
        let blockTest = new Block.Block("Test Block - " + (i + 1));
        blockchain.addBlock(blockTest).then((result) => {
            console.log(result);
            i++;
            if (i < 10) theLoop(i);
        });
    }, 10000);
  })(0);

