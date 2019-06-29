var Block = require('./block');
var Blockchain = require('./index');

describe('Blockchain', function(){
	let bc, bc2;

	beforeEach(function(){
		bc = new Blockchain();
		bc2 = new Blockchain();
	});

	it('starts with the genesis block', function(){
		expect(bc.chain[0]).toEqual(Block.genesis());
	});

	it('adds a new block', function(){
		var data = 'foo';
		bc.addBlock(data);

		expect(bc.chain[bc.chain.length - 1].data).toEqual(data);
	});

	it('validates a valid chain', function(){
		bc2.addBlock('foo');

		expect(bc.isValidChain(bc2.chain)).toBe(true);
	});

	it('invalidates a chain with a corrupt genesis block', function(){
		bc2.chain[0].data = 'Bad data';

		expect(bc.isValidChain(bc2.chain)).toBe(false);
	});

	it('invalidates a corrupt chain', function(){
		bc2.addBlock('foo');
		bc2.chain[bc2.chain.length-1].data = 'Not foo';

		expect(bc.isValidChain(bc2.chain)).toBe(false);
	});

	it('replaces the chain with a valid chain', function(){
		bc2.addBlock('foo');
		bc.replaceChain(bc2.chain);

		expect(bc.chain).toEqual(bc2.chain);
	});

	it('it does not replace the chain with one with less or equal length', function(){
		bc.addBlock('foo');
		bc.replaceChain(bc2.chain);

		expect(bc.chain).not.toEqual(bc2.chain);
	});
});