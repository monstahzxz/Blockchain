var Websocket = require('ws');

var p2pPort = process.env.p2pPort || 5001;
var peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
var MESSAGE_TYPES = {
	chain : 'CHAIN',
	transaction : 'TRANSACTION',
	clear_transactions : 'CLEAR_TRANSACTIONS'
};


// $ set httpPort = 3002	&& set p2pPort = 5003	&& set PEERS = ws://localhost:5001,ws://localhost:5002 && npm run dev

class P2pServer {
	constructor(blockchain, transactionPool){
		this.blockchain = blockchain;
		this.sockets = [];
		this.transactionPool = transactionPool;
	}

	listen(){
		var server = new Websocket.Server({port : p2pPort});
		server.on('connection', socket => this.connectSocket(socket));

		this.connectoToPeers();
		
		console.log('Listening for peer-to-peer connection on ' + p2pPort);
	}

	connectoToPeers(){
		peers.forEach(peer => {
			var socket = new Websocket(peer);

			socket.on('open', () => this.connectSocket(socket));
		});
	}

	connectSocket(socket){
		this.sockets.push(socket);
		console.log('Socket connected');

		this.messageHandler(socket);

		this.sendChain(socket);
	}

	messageHandler(socket){
		socket.on('message', message => {
			var data = JSON.parse(message);

			switch(data.type){
				case MESSAGE_TYPES.chain :
					this.blockchain.replaceChain(data.chain);
					break;
				
				case MESSAGE_TYPES.transaction :
					this.transactionPool.updateOrAddTransaction(data.transaction);
					break;

				case MESSAGE_TYPES.clear_transactions :
					this.transactionPool.clear();
					break;			
			}
		});
	}

	sendChain(socket){
		socket.send(JSON.stringify({
			type : MESSAGE_TYPES.chain,
			chain : this.blockchain.chain
		}));
	}

	syncChains(){
		this.sockets.forEach(socket => {
			this.sendChain(socket);
		});
	}

	sendTransaction(socket, transaction){
		socket.send(JSON.stringify({
			type : MESSAGE_TYPES.transaction,
			transaction
		}));
	}

	broadcastTransaction(transaction){
		this.sockets.forEach(socket => {
			this.sendTransaction(socket, transaction);
		});
	}

	broadcastClearTransactions(){
		this.sockets.forEach(socket => socket.send(JSON.stringify({
			type : MESSAGE_TYPES.clear_transactions,
		})));
	}
}

module.exports = P2pServer;