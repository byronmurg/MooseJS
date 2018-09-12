'use strict';

class SubTest {

	constructor(){
		this.count = 1;
	}

	result_message(message, result){
		const padTo = 128;
		const messageTag = `${this.count++}:`.padEnd(4)
		const resultText = result ? `\x1b[92m success \x1b[0m` : `\x1b[91m fail \x1b[0m`
		console.log("\t", messageTag, message.padEnd(padTo), resultText)
	}

	check_exception(name, code){
		try {
			code();
		} catch (e){
			this.result_message(name + " successfully threw: "+ e.message, true);
			return;
		}
		this.result_message(name, false);
	}

	check_true(name, code){
		this.result_message(name, (code instanceof Function) ? code() : code);
	}

};

class Test {
	static section(name, code){
		const subtest = new SubTest();
		console.log(`--- ${name} test ---`)
		try {
			code(subtest);
		} catch (e) {
			console.error(`Uncaught exception in test ${subtest.name} no:${subtest.count} => ${e.message}`);
			return;
		}
		console.log(``)
	}
};

module.exports = Test;
