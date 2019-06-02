# MooseJS
A postmodern object system for JavaScript

## Install
```sh
$ npm install moosejs
```

## Features
* Statically typed classes
  * Quick type and consistency checking
  * Trigger system provides event based logic
  * Serialize and de-serialize object structures quickly
  * Property type casting
* Typed arrays and maps
  * Ensure value and key type
* Enumerators
  * Simple system for ensuring string content
* No dependancies.

## Description

MooseJS is inspired by the Perl library 'Moose'. The project started
as a way to parse large, complex config structures without having to
repeat basic type checking and quickly incorporated type validation.

## Feedback

If you find any bugs in MooseJS please let me know at: [bugs.moosejs@omanom.com](mailto:bugs.moosejs@omanom.com)
Or to let me know what you think and suggest features: [feedback.moosejs@omanom.com](mailto:feedback.moosejs@omanom.com)

Alternatively you can post issues on the [GitHub repo](https://github.com/byronmurg/MooseJS)

## Wiki

The complete documentation can be found on the [MooseJS Wiki](https://github.com/byronmurg/MooseJS/wiki)

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
const DateArray = new MooseJS.TypedArray(Date)

const birthdays = new DateArray(['1982-05-20'])           // Converted.
birthdays.push('2011-09-12T21:25:41')                     // Yep this too.
birthdays[2] = 'Wed Sep 12 2018 21:25:41 GMT+0100 (BST)') // And this!

// Or for something more advanced

const GradeArray = new MooseJS.TypedArray({
	is: "ro", // Can't be changed after initialization
    isa: Number, // Must contain only numbers
    trigger: (array, newValue, oldValue, i) => {
		if (array.length > 50){
			throw Error("You can't have more than 50 grades")
		}
	}
})

const myGrades = new GradeArray([ 1.2, 4.2 ]) // Okay up to 50

myGrades.push(0.1) // Err. Read-only

// TypedArrays can also be specified as properties with shorthand syntax
// just place a valid constructor in an array of 1.
// 'is' property (but not triggers) will be delegated to the TypedArray

const Foo = MooseJS.defineClass({
	has: {
		bar: { is:"rw", isa:[Number] }, // Equivelent to TypedArray({ is:"rw", isa:Number })
		baz: { is:"ro", isa:[Number] }, // Equivelent to TypedArray({ is:"ro", isa:Number })
	}
})

const foo = new Foo({
	bar: [1,2,3],
	baz: [4,5,6],
})

foo.bar.push("4") // Okay !
foo.baz.push(7) // Err. Read-only

```

### TypedMaps
```js
const NumberMap = new MooseJS.TypedMap({ key:String, value:Number })

const numbers = new NumberMap({ one:1, two:"2" }) // Converted
numbers.set("three", "3.0")                       // Also converted

// Copy constructable
const copyNumbers = new NumberMap(numbers)

// And initialize from pairs
const japaneseNumbers = new NumberMap([ ["一",1], ["二",2], ["三",3] ])

// Or something a bit smarter

const FriendScores = new MooseJS.TypedMap({
	is: "rw",      // Can be changed after initialization
    value: Number, // Values must be numbers
	key: String,   // Keys must be strings
    trigger: (map, newValue, oldValue, key) => {
		if (map.values().reduce((l,r) => l+r) > 20){
			throw Error("That's too many friends")
		}
	}
})

```

### Enumerators

```js
const TextEditor = MooseJS.defineEnum([ "vim", "atom", "nano" ])

new TextEditor("vim") // Fine
new TextEditor("emacs") // Err. Invalid input
```

### Serialize
MooseJS objects can be desribed with the serialize function.

This is designed for creating self-describing interfaces.

Note that this will check `required` if either `required: true`
is set or the property has a default.
```js

MooseJS.serialize(Student)

# Outputs:
{
  type: 'class',
  name: 'Student',
  properties: {
    name: { isa: 'String', required: true },
    dob: { isa: 'Date', required: true },
    grades: {
      isa: {
        type: 'array',
        name: 'TypedArray<Number>',
        data_type: 'Number'
      },
      required: false
    }
  }
}

```
