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
    sayHi(){
        return `Hello I'm ${this.name}`;
    }
}

```
