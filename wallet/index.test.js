var Wallet = require('./index');
var TransactionPool = require('./transaction-pool');
var Blockchain = require('../chain');
var { INITIAL_BALANCE } = require('../config');

describe('Wallet', function(){
	let wallet, tp, bc;

	beforeEach(function(){
		wallet = new Wallet();
		tp = new TransactionPool();
		bc = new Blockchain();	
	});

	describe('creating a transaction', function(){
		let transaction, sendAmount, recipient;

		beforeEach(function(){
			sendAmount = 50;
			recipient = 'r4nd-4ddr355';
			transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
		});
		
		describe('and doing the same transaction', function(){
			beforeEach(function(){
				wallet.createTransaction(recipient, sendAmount, bc, tp);
			});

			it('doubles the sendAmount subtracted from the wallet balance', function(){
				expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - sendAmount * 2);
			});

			it('clowns the sendAmount output for the recipient', function(){
				expect(transaction.outputs.filter(output => output.address === recipient).map(output => output.amount)).toEqual([sendAmount, sendAmount]);
			});
		});
	});

	describe('calculating a balance', function(){
		let addBalance, repeatAdd, senderWallet;

		beforeEach(function(){
			senderWallet = new Wallet();
			addBalance = 100;
			repeatAdd = 3;
			for(var i=0;i<repeatAdd;++i){
				senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
			}

			bc.addBlock(tp.transactions);
		});

		it('calculates the balance for blockchain transactions matching the recipient', function(){
			expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
		});

		it('calculate the balance for blockchain transactions matching the sender', function(){
			expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
		});

		describe('recipient now conducts a transaction', function(){
			let subtractBalance, recipientBalance;

			beforeEach(function(){
				tp.clear();
				subtractBalance = 60;
				recipientBalance = wallet.calculateBalance(bc);
				wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
				bc.addBlock(tp.transactions);
			});

			describe('and the sender sends another transaction to the recipient', function(){
				beforeEach(function(){
					tp.clear();
					senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
					bc.addBlock(tp.transactions);
				});

				it('calculates the recipient balance only using transactions since its most recent ones', function(){
					expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
				});
			});
		});
	});
});