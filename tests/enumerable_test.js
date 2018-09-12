#!/usr/bin/env node

let o = {
	a:1,
	b:2,
}

Object.defineProperty(o, 'c', {
	value:3,
	enumerable:false,
});

for ( const key in o ){
	console.log(key, " = ", o[key])
}

console.log("and c = ", o.c)

console.log(JSON.stringify(o));
