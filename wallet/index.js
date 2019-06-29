const { INITIAL_BALANCE } = require('../config');
var ChainUtil = require('../chain-util');
var Transaction = require('./transaction');

class Wallet {
	constructor(){
		this.balance = INITIAL_BALANCE;
		this.keyPair = ChainUtil.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}

	toString(){
		return `Wallet - 
		publicKey : ${this.publicKey.toString()}
		balance   : ${this.balance}`
	}

	sign(dataHash){
		return this.keyPair.sign(dataHash);
	}

	createTransaction(recipient, amount, blockchain, transactionPool){
		this.balance = this.calculateBalance(blockchain);

		if(amount > this.balance){
			console.log('Amount ' + amount + ' exceeds current balance ' + this.balance);
			return;
		}

		var transaction = transactionPool.existingTransaction(this.publicKey);

		if(transaction){
			transaction.update(this, recipient, amount);
		}
		else {
			transaction = Transaction.newTransaction(this, recipient, amount);
			transactionPool.updateOrAddTransaction(transaction);
		}

		return transaction;
	}

	calculateBalance(blockchain){
		let balance = this.balance;
		let transactions = [];

		blockchain.chain.forEach(block =>
			block.data.forEach(transaction => {
				transactions.push(transaction);
			}));

		var walletInputTs = transactions.filter(transaction => transaction.input.address === this.publicKey);
		var startTime = 0;

		if(walletInputTs.length > 0){
			var recentInputT = walletInputTs.reduce(
				(prev, curr) => prev.input.timestamp > curr.input.timestamp ? prev : curr
			);

			balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
			startTime = recentInputT.input.timestamp;
		}

		transactions.forEach(transaction => {
			if(transaction.input.timestamp > startTime){
				transaction.outputs.find(output => {
					if(output.address === this.publicKey){
						balance += output.amount;
					}
				})
			}
		})

		return balance;
	}

	static blockchainWallet(){
		var blockchainWallet = new this();
		blockchainWallet.address = 'blockchain-wallet';
		return blockchainWallet;
	}
}


module.exports = Wallet;