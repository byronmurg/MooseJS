#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Interface sanity", (test) => {
	test.check_safe("Can define interface", () => 
		MooseJS.defineInterface({ members:["test"] })
	)

	test.check_safe("Can inherit interface", () => {
		const TestInterface = MooseJS.defineInterface({ members:["somemember"] });

		class SanityClass extends TestInterface {}
	})
})

Test.section("Basic interface", (test) => {

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
	
	test.check_exception(
		"Should not be able to instanciate Interface",
		'Interface cannot be directly invoked',
		() => new CanWalk()
	);

	test.check_exception(
		"Should not be able to instanciate Dog without CanTalk",
		'Interface member "walk" not defined in "Dog"',
		() => new Dog()
	);
});

Test.section("Moose interface", (test) => {
	
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

	class InvalidAccount extends MooseJS.defineClass({
		extends: Account,
		has: {
			name: { is:"rw", isa:Number, required:true },
		}
	})
	{
		withdraw(){
			
		}
	}

	test.check_safe("Valid class instanciates", () =>  new CheckingAccount({ name:"myAccount" }));

	test.check_exception(
		"Invalid class fails",
		'Property "name" of "InvalidAccount" must be type "String" to conform to interface',
		() =>  new InvalidAccount({ name:"myAccount" })
	);

});

Test.section("Requirement satisfied by inherited classes", (test) => {
	
	class Person extends MooseJS.defineClass({
		has:{
			name:{ is:"ro", isa:String, required:true }
		}
	}){};

	class Student extends MooseJS.defineClass({
		final:true,
		extends: Person
	}){};

	const Pet = MooseJS.defineInterface({
		properties: {
			humanFriend: Person,
		}
	});

	class Doggo extends MooseJS.defineClass({
		final: true,
		extends: Pet,
		has: {
			humanFriend: { is:"ro", isa:Student, required:true },
		}
	}){};

	test.check_safe("", () => new Doggo({ humanFriend: new Student({ name:"Byron" }) }));

});

Test.section("Async method", (test) => {
	
	const StorageInt = MooseJS.defineInterface({
		members: [ "save" ],
	});

	class Bucket extends StorageInt {
		async save(obj){
			console.log("Would save the object")
		}
	}

	test.check_safe("Can instantiate class", () => new Bucket())
})
