#!/usr/bin/env node
'use strict';

const MooseJS = require('./Moose.js');

const Base = MooseJS.defineClass({
	has: {
		name: { is:"ro", isa:String, required:true }
	}
})

const Mammal = MooseJS.defineClass({
	extends: Base,
	has: {
		limbs: { is:"rw", isa:Number, required:true, default:4 }
	}
})

class Person extends MooseJS.defineClass({
	extends:Mammal,

})
{
	chopOffLeg(){
		this.limbs--;
	}
};


for (let i = 0 ; i < 500000 ; i++){
	const person = new Person({
		name:"Byron"
	});

	person.chopOffLeg();

	const clone = new Person(person);
}

