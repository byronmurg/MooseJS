#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("Paramater isa 'undefined'", (test) => {

	class Thingy extends MooseJS.defineClass({
		has: {
			stuff: { is:"rw", isa:undefined },
		}
	})
	{}

	const thing = new Thingy();

	test.check_true("Object is set", thing);

	const obj = { a:1 };
	thing.has = obj;

	test.check_true("Member has not been copied", thing.has == obj);

	thing.has = 3;

	test.check_true("Memeber is now a Number", thing.has == 3);
})

