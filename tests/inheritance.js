#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("Inheritance", (test) => {

	class Parent extends MooseJS.defineClass({
		has: {
			permissive:{ is:"rw", isa:Number },
			strict:    { is:"ro", isa:Number, required:true },
			requiredWithDefault: { is:"ro", isa:Number, required:true, default:5 },
		}
	})
	{}

	class Child extends MooseJS.defineClass({
		final:true,
		extends:Parent,
		has:{}
	})
	{}

	const child = new Child({ permissive:7, strict:11 });

	test.check_exception(`'strict' cannot be deleted`, `Cannot delete required property "strict" of class "Child"`, () => {delete child.strict});
	test.check_safe(`'permissive' can be deleted`, () => {delete child.permissive});
	test.check_true(`'requiredWithDefault' has been set correctly`, () => child.requiredWithDefault == 5)
})

