#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("TypedArray(String)", (test) => {
	class Person extends MooseJS.defineClass({
		final: true,
		has: {
			name: { is:"rw", isa:String, required:true },
			dob:  { is:"ro", isa:Date, required:true, default:() => new Date() },
			grades: { is:"ro", isa:[Number] },
		},
	}) {}

	test.check_safe("Serialize does not throw an exception", () => MooseJS.serialize(Person))
})
