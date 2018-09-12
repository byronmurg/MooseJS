#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Does MooseJS play nice", (test) => {

	class NormalBase {
		constructor(initData){
			this.foo = initData.foo;
		}
	};

	class MooseClass extends MooseJS.defineClass({
		extends: NormalBase,
		has: {
			bar: { is:"ro", isa:Number, required:true }
		}
	})
	{}

	class NormalChild extends MooseClass {
		constructor(initData){
			super(initData);
			this.baz = initData.baz;
		}
	}


	const instance = new NormalChild({
		foo: 1,
		bar: 2,
		baz: 3,
	});

	test.check_true("Is the class inherited from base", instance instanceof NormalBase);
	test.check_true("Was base member set correctly", instance.foo == 1);
	test.check_true("Was child member set correctly", instance.baz == 3);
	test.check_exception("Cannot set Moose class member", () => { instance.bar = 22 });
})

