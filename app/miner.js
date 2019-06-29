var Transaction = require('../wallet/transaction');
var Wallet = require('../wallet');

class Miner {
	constructor(blockchain, transactionPool, wallet, p2pServer){
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.p2pServer = p2pServer;
	}

	mine(){
		var validTransactions = this.transactionPool.validTransactions();

		// include a reward for the miner
		validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
		
		// create a block consisting of the valid transactions
		var block = this.blockchain.addBlock(validTransactions);

		// synchronize the chains in the peer-to-peer server
		this.p2pServer.syncChains();

		// clear the transaction poo
		this.transactionPool.clear();

		// broadcast to every miner to clear their transaction pools
		this.p2pServer.broadcastClearTransactions();

		return block;
	}
}


module.exports = Miner;