#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Defaults test", (test) => {

	class Foo extends MooseJS.defineClass({
		final: true,
		has: {
			literal:  { is:"ro", isa:Number,   required:true, default:7 },
			resultant:{ is:"ro", isa:Number,   required:true, default:() => 13 },
			pimpl:    { is:"ro", isa:Function, required:true, default:() => function(){ return 11 } },
		}
	})
	{};

	const foo = new Foo();

	test.check_true("Literal default has been applied", foo.literal == 7)
	test.check_true("Resultant default has been applied", foo.resultant == 13)
	test.check_true("Function default is a function", foo.pimpl() == 11)
});
