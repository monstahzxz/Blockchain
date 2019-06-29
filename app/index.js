var express = require('express');
var Blockchain = require('../chain');
var bodyParser = require('body-parser');
var P2pServer = require('./p2p-server');
var Wallet = require('../wallet');
var TransactionPool = require('../wallet/transaction-pool');
var Miner = require('./miner');

var httpPort = process.env.httpPort || 3001;
var app = express();
var bc = new Blockchain();
var wallet = new Wallet();
var tp = new TransactionPool();
var p2pServer = new P2pServer(bc, tp);
var miner = new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParser.json());

app.get('/blocks', function(req,res){
	res.json(bc.chain);
});

app.post('/mine', function(req,res){
	var block = bc.addBlock(req.body.data);
	console.log('New block added: ' + block.toString());

	p2pServer.syncChains();
	
	res.redirect('/blocks');
});

app.get('/transactions', function(req, res){
	res.json(tp.transactions);
});

app.post('/transact', function(req, res){
	var { recipient, amount } = req.body;
	var transaction = wallet.createTransaction(recipient, amount, bc, tp);

	p2pServer.broadcastTransaction(transaction);

	res.redirect('/transactions');
});

app.get('/public-key', function(req, res){
	res.json({ publicKey : wallet.publicKey });
});

app.get('/mine-transactions', function(req, res){
	var block = miner.mine();
	console.log('New block added: ' + block.toString());
	res.redirect('/blocks');
});

app.listen(httpPort, function(){
	console.log("Listening on port " + httpPort);
});

p2pServer.listen();