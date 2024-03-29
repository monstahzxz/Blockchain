var ChainUtil = require('../chain-util');
var { DIFFICULTY, mineRate } = require('../config');

class Block {
	constructor(timestamp, lastHash, hash, data, nonce, difficulty){
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty || DIFFICULTY;
	}

	toString(){
		return `Block - 
		Timestamp  : ${this.timestamp}
		Last Hash  : ${this.lastHash.substring(0,10)}
		Hash       : ${this.hash.substring(0,10)}
		Nonce      : ${this.nonce}
		Difficulty : ${this.difficulty}
		Data       : ${this.data}`;
	}

	static genesis(){
		return new this('Genesis time', '----', 'f1r67-h45h', [], 0, DIFFICULTY);
	}

	static mineBlock(lastBlock, data){
		let hash, timestamp;
		let { difficulty } = lastBlock;
		var lastHash = lastBlock.hash;
		let nonce = 0;

		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty(lastBlock, timestamp);
			hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
		} while(hash.substring(0,difficulty) !== '0'.repeat(difficulty));
		
		return new this(timestamp, lastHash, hash, data, nonce, difficulty);
	}

	static hash(timestamp, lastHash, data, nonce, difficulty){
		return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
	}

	static blockHash(block){
		return Block.hash(block.timestamp, block.lastHash, block.data, block.nonce, block.difficulty);
	}

	static adjustDifficulty(lastBlock, currentTime){
		let { difficulty } = lastBlock;
		difficulty = lastBlock.timestamp + mineRate > currentTime ? difficulty + 1 : difficulty - 1;
		return difficulty;
	}
}

module.exports = Block;