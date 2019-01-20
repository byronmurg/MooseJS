#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

class Mammal extends MooseJS.defineClass({
	has: {
		name:  { is:'rw', isa:String, required:true },
		limbs: { is:'rw', isa:Number, required:true, default: 4 }
	}
})
{}

class Cat extends MooseJS.defineClass({
	extends: Mammal,
	final: true,
})
{}

class Doggo extends MooseJS.defineClass({
	extends: Mammal,
	final: true,
})
{}

class Person extends MooseJS.defineClass({
	extends: Mammal,
	final:true,
	has: {
		alive: { is:'rw', isa:Boolean, required:true, default:true       },
		dob:   { is:'ro', isa:Date,    required:true, default:new Date() },
		dogs:  { is:'rw', isa:[Doggo], required:true, default:[]         },
		cats:  { is:'rw', isa:[Cat],   required:true, default:[]         },
	}
})
{
	constructor(...args){
		super(...args);
	}

	get pets(){
		return [].concat(this.dogs, this.cats);
	}
}


Test.section("Property Types", (test) => {

	const byron = new Person({
		name:"Byron",
		dob: new Date('1991-02-20'),
		dogs: [
			{ name:"Marley" }
		],
		cats: [
			{ name:"Titus" }
		],
	});

	test.check_true("Person inherited from mammal has 4 legs", byron.limbs == 4)
	test.check_true("dogs member is of class Doggo", byron.dogs[0].constructor == Doggo);

	byron.alive = false;
	test.check_true("Read write property has changed after setting", byron.alive == false);

	byron.name += " Murgatroyd";
	test.check_true("Name is extended after usage of += operator on property", byron.name == "Byron Murgatroyd");

})


Test.section("Invalid operations", (test) => {
	const testina = new Person({ name:"Testina", dob:"1987-06-28" }) ;
	testina.name += " McTesterson";

	test.check_exception(
		"Pushing invalid Doggo",
		'Unknown paramater "type" passed to "Doggo"',
		() => testina.dogs.push({ name:"Mable", type:"rabbit" })
	);

	test.check_exception(
		"Setting invalid property",
		'No such property "cuteness" of "Person"',
		() => testina.cuteness = 10
	);

	test.check_exception(
		"Unsetting required name",
		'Property "name" of "Person" required',
		() => testina.name = undefined
	);

	test.check_exception(
		"Deleting required name",
		'Cannot delete required property "name" of class "Person"',
		() => delete testina.name
	);

	test.check_exception(
		"Setting ro date",
		'Property "dob" of "Person" is read only',
		() => testina.dob = new Date()
	);
})


Test.section("Serialization", (test) => {
	const testyMcTesterson = new Person({
		name:"Testy McTesterson",
		limbs: 3,
	});
	
	const testyMcTesterson2 = new Person(JSON.parse(JSON.stringify(testyMcTesterson)));

	test.check_true("Copied person is identical to original person", JSON.stringify(testyMcTesterson) == JSON.stringify(testyMcTesterson2));
})

