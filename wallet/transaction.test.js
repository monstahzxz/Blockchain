var Transaction = require('./transaction');
var Wallet = require('./index');
var { MINING_REWARD } = require('../config');

describe('Transaction', function(){
	let transaction, wallet, recipient, amount;

	beforeEach(function(){
		wallet = new Wallet();
		amount = 50;
		recipient = 'r3c1p13nt';
		transaction = Transaction.newTransaction(wallet, recipient, amount);
	});

	it('outputs the amount subtracted from the wallet balance', function(){
		expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount);
	});

	it('outputs the amount added to the recipient', function(){
		expect(transaction.outputs.find(output => output.address === recipient).amount).toEqual(amount);
	});

	it('inputs the balance of the wallet', function(){
		expect(transaction.input.amount).toEqual(wallet.balance);
	});

	it('validates a valid transaction', function(){
		expect(Transaction.verifyTransaction(transaction)).toBe(true);
	});

	it('invalidates a corrupt transaction', function(){
		transaction.outputs[0] = 50000;
		expect(Transaction.verifyTransaction(transaction)).toBe(false);
	});

	describe('transacting with an amount that exceeds the balance', function(){
		beforeEach(function(){
			amount = 5000;
			transaction = Transaction.newTransaction(wallet, recipient, amount);
		});

		it('does not create the transaction', function(){
			expect(transaction).toEqual(undefined);
		});
	});

	describe('and updating a transaction', function(){
		let nextAmount, nextRecipient;

		beforeEach(function(){
			nextAmount = 20;
			nextRecipient = 'n3xt-4ddr355';
			transaction = transaction.update(wallet, nextRecipient, nextAmount);
		});

		it(`subtracts the next amount from the sender's output`, function(){
			expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount - nextAmount);
		});

		it('outputs an amount for the next recipient', function(){
			expect(transaction.outputs.find(output => output.address === nextRecipient).amount).toEqual(nextAmount);
		});
	});

	describe('creating a reward transaction', function(){
		beforeEach(function(){
			transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
		});

		it(`reward the miner's wallet`, function(){
			expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(MINING_REWARD);
		});
	});
});