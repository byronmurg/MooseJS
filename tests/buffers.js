#!/usr/bin/env node

const Test = require('./testLib.js');
const MooseJS = require('../Moose.js');

Test.section("Casting to Buffers", (test) => {

	class File extends MooseJS.defineClass({
		final: true,
		has:{
			data: { is:"ro", isa:Buffer, required:true },
		}
	}) {}

	const myFile = new File({ data:"Hello" })

	test.check_true("File.data is of type buffer", () => myFile.data instanceof Buffer);

	test.check_true(
		'File.data can be cast to string',
		() => myFile.data.toString() == "Hello"
	);

})
