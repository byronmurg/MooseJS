#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("Array with maximum", (test) => {
	const MaxArray = new MooseJS.TypedArray({ isa:Number, maximum:3, is:"rw" });

	test.check_safe("Shouldn't throw an error if under the limit", () => new MaxArray([ 1,2,3 ]));

	test.check_exception("Should throw an error if initialized over the limit", "Array length greater than maximum 3", () => new MaxArray([ 1,2,3,4,5 ]));

	test.check_exception("Should throw an error if increased over the limit", "Array length greater than maximum 3", () => {
		const ar = new MaxArray([ 1,2,3 ])
		ar.push(4)
	});
})

Test.section("Array with minimum", (test) => {
	const minArray = new MooseJS.TypedArray({ isa:Number, minimum:3, is:"rw" });

	test.check_safe("Shouldn't throw an error if over the limit", () => new minArray([ 1,2,3 ]));

	test.check_exception("Should throw an error if initialized under the limit", "Array length fewer than minimum 3", () => new minArray([ 1,2 ]));

	test.check_exception("Should throw an error if decreased under the limit", "Array length fewer than minimum 3", () => {
		const ar = new minArray([ 1,2,3 ])
		ar.shift()
	});
})
