var TransactionPool = require('./transaction-pool');
var Transaction = require('./transaction');
var Wallet = require('./index');
var Blockchain = require('../chain');

describe('TransactionPool', function(){
	let tp, wallet, transaction, bc;

	beforeEach(function(){
		tp = new TransactionPool();
		wallet = new Wallet();
		bc = new Blockchain();
		transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp);
	});

	it('adds a transaction to the pool', function(){
		expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
	});

	it('updates a transaction in the pool', function(){
		var oldTransaction = JSON.stringify(transaction);
		var newTransaction = transaction.update(wallet, 'foo-4ddr355', 40);
		tp.updateOrAddTransaction(newTransaction);
		
		expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction);
	});

	it('clears transactions', function(){
		tp.clear();
		expect(tp.transactions).toEqual([]);
	});

	describe('mixing valid and corrupt transactions', function(){
		let validTransactions;

		beforeEach(function(){
			validTransactions = [...tp.transactions];
			for(var i=0;i<6;++i){
				wallet = new Wallet();
				transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);

				if(i % 2 == 0){
					transaction.input.amount = 99999;
				}
				else {
					validTransactions.push(transaction);
				}
			}
		});

		it('shows a difference between valid and corrupt transactions', function(){
			expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
		});

		it('grabs valid transactions', function(){
			expect(tp.validTransactions()).toEqual(validTransactions);
		});
	});
});