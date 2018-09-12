#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Basic interface tests", (test) => {

	const CanWalk = MooseJS.defineInterface({
		members:['walk']
	});

	const CanTalk = MooseJS.defineInterface({
		extends: CanWalk,
		members:['speak']
	});

	class Person extends CanTalk {
		walk(){
			return "Where are we going?";
		}

		speak(){
			return "Hello";
		}
	};

	class Dog extends CanWalk {};

	const byron = new Person();
	const lucy  = new Person();
	const john  = new Person();
	
	test.check_exception("Should not be able to instanciate Interface", () => new CanWalk());
	test.check_exception("Should not be able to instanciate Dog without CanTalk", () => new Dog());
});

Test.section("Moose interface tests", (test) => {
	
	const Account = MooseJS.defineInterface({
		members: ['withdraw'],
		properties:{
			name:String,
		},
	});


	class CheckingAccount extends MooseJS.defineClass({
		extends: Account,
		has: {
			name:    { is:"rw", isa:String, required:true },
			balance: { is:"rw", isa:Number, required:true, default:0 },
		}
	})
	{
		withdraw(amount){
			this.balance -= amount;
		}
	}

	const myAccount = new CheckingAccount({ name:"myAccount" });

});

