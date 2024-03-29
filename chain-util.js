var SHA256 = require('crypto-js/sha256');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
var uuidV1 = require('uuid/v1');

class ChainUtil {
	static genKeyPair(){
		return ec.genKeyPair();
	}

	static id(){
		return uuidV1();
	}

	static hash(data){
		return SHA256(JSON.stringify(data)).toString();
	}

	static verifySignature(publicKey, signature, dataHash){
		return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
	}
}

module.exports = ChainUtil;