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

## Description

MooseJS is inspired by the Perl library 'Moose'. The project started
as a way to parse large, complex config structures without having to
repeat basic type checking and quickly incorporated type validation.

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

// Object can be fully serialized and parsed.
const evilBob = new Student( JSON.parse( JSON.stringify( bob ) ) ) 

```

### Typed Arrays

```js

const DateArray = new MooseJS.TypedArray(String)

const birthdays = new DateArray(['1982-05-20'])           // Converted.
birthdays.push('2011-09-12T21:25:41')                     // Yep this too.
birthdays[2] = 'Wed Sep 12 2018 21:25:41 GMT+0100 (BST)') // And this!

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
// Class doesn't need to be checked twice thanks to caching.
const dummy2 = new DummyAccount()


const Person = MooseJS.defineInterface({
    members: ['sayHi'],
    properties: {
        dateOfBirth: Date,
    }
})

class Employee extends MooseJS.defineClass({
    extends: Person,
    final:true,
    has: {
        name:        { is:"rw", isa:String, required:true },
         // This fulfills Person dateOfBirth requirement due
         // to being a required Date of the correct name.
        dateOfBirth: { is:"ro", isa:Date,   required:true },
    }
})
{
    sahHi(){
        return `Hello I'm ${this.name}`;
    }
}

```

## Documentation

### Defining classes

```js

const Foo = MooseJS.defineClass({
    // "inherits" sets the parent class.
	inherits: Bar,

    // "final" Ensures that no extra properies are set.
    // see Finality
	final: true,

    // The "has" object defines properties.
	has: {
		baz: {
			// "is" sets the access type. Can be either "ro" or "rw"
            // for read-only or read-write.
			is: "ro",

            // "isa" sets the type of the property. The set value
            // must either be an 'instanceof' this type or be
            // copy-constructable, with the exception of some in-built
            // types. See 'casting'.
            isa: String,

            // "required" declares that the property must be set at
            // all times. The value may not be either deleted or set
            // to "undefined" or "null".
            required: true,

            // "default" set the value in initialization if none
            // other is set. The default must pass the type check and
            // any trigger checks.
            default: "baz",

            // "trigger" is a function reference which will be called
            // whenever the property is set. If the trigger throws an
            // exception, the value will be reverted to it's former
            // state. At initialization the trigger is called after
            // all other properies have been set.
            trigger: (object, newValue, oldValue, propName)
                   => console.log(`baz changed to ${newValue}`),

            // "enumerable" sets whether or not the property is
            // included in for loops and serialization functions.
            // This is typically used for 'parent' properties which
            // would othersize cause circular references.
            enumerable: true,
		},
	},
})

```

Note that MooseJS has no construct for setting methods or a
constructor. Thus I would typically recommend that classes are
defined like so:

```js

class Foo extends MooseJS.defineClass({
	// options...
})
{
	constructor(initData){
        super(initData);
    }

    // member functions...
};

```

