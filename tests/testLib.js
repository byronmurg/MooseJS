'use strict';

const green = 92, red = 91, blue = 93

function colourText(text, colour){
	return `\x1b[${colour}m${text}\x1b[0m`;
}

const greenSuccess = colourText("success", green),
	  redFail = colourText("fail", red);

const padTo = Math.min(process.stdout.columns - 18, 128);

class SubTest {

	constructor(){
		this.count = 1;
	}

	result_message(message, result){
		const messageTag = `${this.count++}:`.padEnd(4)
		message = message.padEnd(padTo)
		const resultText = result ? greenSuccess : redFail
		console.log("    ", messageTag, message, resultText)
	}

	check_exception(name, expected_message, code){
		try {
			code();
		} catch (e){
			if (e.message == expected_message){
				this.result_message(name, true);
			} else {
				this.result_message(name + " actually threw: "+ e.message, false);
				console.error(e)
			};
			return;
		}
		this.result_message(name +" : didn't throw an error", false);
	}

	check_safe(name, code){
		try {
			code();
			this.result_message(name, true);
		} catch (e){
			this.result_message(name, false);
			throw e;
		}
	}

	check_true(name, code){
		this.result_message(name, (code instanceof Function) ? code() : code);
	}

};

class Test {
	static section(name, code){
		const subtest = new SubTest();
		console.log(`--- ${name} test ---`)
		code(subtest);
		console.log(``)
	}
};

module.exports = Test;
