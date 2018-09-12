#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("TypedArray(String)", (test) => {
	const StringArray = new MooseJS.TypedArray(String);
	const strings = new StringArray(["Hello", "20", new Date(), true]);
	test.check_true("All elements are of type string.", ! strings.find((s) => !s instanceof String));
})

Test.section("TypedArray(Date)", (test) => {
	const DateArray = new MooseJS.TypedArray(Date);
	const dates = new DateArray([ '1991-02-20', 'Mon Sep 10 2018 19:15:45 GMT+0100 (BST)' ]);
	test.check_true("2nd element of dates array is a Date", dates[1].constructor == Date);
})



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
	const lucy = new Person({ name:"Lucy", dob:"1987-06-28" }) ;
	lucy.name += " Pickford";

	test.check_exception("Pushing invalid Doggo", () => lucy.dogs.push({ name:"Mable", type:"rabbit" }));
	test.check_exception("Setting invalid property", () => lucy.cuteness = 10)

	test.check_exception("Unsetting required name", () => lucy.name = undefined);
	test.check_exception("Deleting required name", () => delete lucy.name);

	test.check_exception("Setting ro date", () => lucy.dob = new Date());
})


Test.section("Serialization", (test) => {
	const testyMcTesterson = new Person({
		name:"Testy McTesterson",
		limbs: 3,
	});
	
	const testyMcTesterson2 = new Person(JSON.parse(JSON.stringify(testyMcTesterson)));

	test.check_true("Copied person is identical to original person", JSON.stringify(testyMcTesterson) == JSON.stringify(testyMcTesterson2));
})


//dumpPerson(byron);
//dumpPerson(lucy);

function dumpProperties(classObject){
	const props = classObject.__class_properties;
	for ( const prop in props ){
		console.log(" prop ", props[prop].name)
	}
}

function dumpPerson(person){
	console.log(`\x1b[92m--- Dumping person '${person.name}' ---\x1b[0m\n`)

	console.log("--- start loop ---")
	for ( const key in person ){
		console.log(key.padEnd(6), " = ", person[key])
	}
	console.log("--- end loop ---\n")

	console.log("As String = ", person, "\n")
	console.log("As JSON   = ", JSON.stringify(person, null, 4), "\n")
}


