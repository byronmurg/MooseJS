# MooseJS
A postmodern object system for JavaScript

## Install
```sh
$ npm install moosejs
```

## Features
* Statically typed classes
  * Quick type and consistency checking
  * Trigger system provides
  * Serialize and de-serialize object structures quickly
  * Property type casting
* Typed arrays
  * Ensure content type
* Interfaces
  * Fast and efficient interface system
  * Usable with moosejs and basic js classes
* No external dependancies.

## Overview

### Classes

```js

const MooseJS = require('moosejs')

class Student extends MooseJS.defineClass({
	final: true,
	has: {
		name:   { is:"ro", isa:String,   required:true },
		grades: { is:"rw", isa:[Number], required:true, default:[] },
		school: { is:"rw", isa:School,   enumerable:false },
	}
})
{
	get grade_average(){
		return grades.reduce((a, b) => a + b) / grades.length
	}
}

const bob = new Student({
	name:"Bob McBobson",
	grades: [1.0, 1.2, 0.8]
})

bob.grades.push({ a:1 }) // Err. Exception thrown!
bob.grades.push("1.2")   // string converted to Number.

delete bob.grades // Err. Required property!
bob.grades = undefined // Err. Nope still required!

bob.name += " the 3rd" // Err. Read-only property.

const evilBob = new Student( JSON.parse( JSON.stringify( bob ) ) ) // Fully copied class

```

### Typed Arrays

```js

const DateArray = new MooseJS.TypedArray(String)

const birthdays = new DateArray(['1982-05-20']) // Automatically converted.
birthdays.push('1971-05-05') // Yep this too.
birthdays[2] = '1997-01-04') // And this!

```

### Interfaces

```js

const Account = MooseJS.defineInterface({
	members: ["withdraw"]
})

class DummyAccount extends Account {
	withdraw(amount){
		console.debug("I'm just a dummy :(")
	}
};


const dummy  = new DummyAccount() // OK passes interface
const dummy2 = new DummyAccount() // Class doesn't need to be checked twice thanks to caching.


const Person = MooseJS.defineInterface({
	members: ['sayHi'],
	properties: {
		dateOfBirth: Date,
	}
})

const Employee extends MooseJS.defineClass({
	extends: Person,
	final:true,
	has: {
		name:        { is:"rw", isa:String, required:true },
		 // This fulfills Person dateOfBirth requirement due to being a required Date of the correct name.
		dateOfBirth: { is:"ro", isa:Date,   required:true },
	}
})
{
	sahHi(){
		return `Hello I'm ${this.name}`;
	}
}

```

