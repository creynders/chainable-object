# Chainable Object

[![Build Status](https://travis-ci.org/creynders/chainable-object.svg)](https://travis-ci.org/creynders/chainable-object)
[![npm version](https://badge.fury.io/js/chainable-object.svg)](http://npmjs.org/packages/chainable-object)

> Create objects with chainable properties

Allows the creation of D3-style chainable objects.

## Usage

### Creating chainable objects

```js
var chainable = require('chainable-object');

// create chainable object
var instance = chainable( {
    foo: {
        bar: {
            qux: 'a value for qux' //initial value for `foo().bar().qux()`
        },
        baz: 'a value for baz' //initial value for `foo().baz()`
    }
} );

// now use it

//retrieve a value
console.log(instance.foo().bar().qux()); //outputs: "a value for qux"

//set a value directly
instance.foo().bar().qux('other value'); //sets the value of `qux` to "other value"
console.log(instance.foo().bar().qux()); //outputs: "other value"

//set a nested value through the use of an object
instance.foo().bar({qux: 'yet another value'}); //sets the value of `qux` to "yet another value"
console.log(instance.foo().bar().qux()); //outputs: "yet another value"
```

### Processing of values

If you need to process the value before it's set, you can provide a processor function:

```js
// create chainable object
var instance = chainable( {
    foo: {
        bar: function processBar(value){
            return value.toUpperCase() + '!!!';
        }
    }
} );

instance.foo().bar('burn motherfucker, burn');
console.log(instance.foo().bar()); //outputs: "BURN MOTHERFUCKER, BURN !!!"
```

**v1.2.0 and up**

Processors receive the name of the property as a second argument:

```js
var instance = chainable({
  foo: function(value, name){
    console.log('name:', name);
    return value;
  }
});
instance.foo('a value for foo'); //output: 'name: foo'
```

## Combining processors and initial values

Just wrap 'm in an Array. The processor _always_ goes first!

```js
// create chainable object
var instance = chainable( {
    foo: {
        bar: [ 
            function processBar(value){
                return value.toUpperCase() + '!!!';
            }, 
            "initial value"
        ]
    }
} );

console.log(instance.foo().bar()); //outputs: "initial value"
instance.foo().bar('burn motherfucker, burn');
console.log(instance.foo().bar()); //outputs: "BURN MOTHERFUCKER, BURN !!!"
```

**CAVEAT**: if you want to set _a function or an object as an initial value_, you **HAVE TO** use the Array syntax:

```js
// create chainable object
var instance = chainable( {
    foo: {
        bar: [
            'value',  // tells `chainable-object` no processing is necessary, `falsy` values will have the same effect
            function(){ // initial value of `foo().bar()`
                return 10;
            }
        ]
    }
} );

console.log(instance.foo().bar()); //outputs: "[Function]"
console.log(instance.foo().bar()()); //outputs: "10"
```

## Existing objects and prototypes

You can mix chainable properties into an already existing object:

```js
var instance = {
    output: function(){
        console.log('Heads will roll!');
    }
}

// mixin
chainable( instance, {
    foo: {
        bar: 'bar'
    }
} );

console.log(instance.foo().bar()); //outputs: "bar"
console.log(instance.output()); //outputs: "Heads will roll!"
```

The same applies to prototypes:

```js
function AwesomeClass(){
}

// mixin
chainable( AwesomeClass.prototype, {
    foo: {
        bar: 'Too drunk to fuck'
    }
} );

var instance = new AwesomeClass();
console.log(instance.foo().bar()); //outputs: "Too drunk to fuck"
```

## Setting multiple root values at once

**v1.1.0 and up**

Nested objects can be updated by passing a vanilla object to the setters:

```js
instance = chainable({
    foo:{
        bar: 'a value for bar'
    },
    qux: 'a value for qux',
    baz: 'a value for baz'
});

//set a nested value through the use of an object
instance.foo({bar: 'yet another value'}); //sets the value of `bar` to "yet another value"
console.log(instance.foo().bar()); //outputs: "yet another value"
```

However, what if you'd want to set the value of `foo` and the other root properties `qux` and `baz`? `chainable-object` adds a `values` accessor especially for this purpose:

```js
instance.values({
    foo: {
        bar: 'a'
    },
    qux: 'b',
    baz: 'c'
});
console.log(instance.qux()); //outputs: 'b'
```

You can use it to retrieve a vanilla object with all the values too (aliased to `toObject`, since that's what it really does):

```js
console.log(instance.values());
//outputs:
{
    foo: {
        bar: 'a'
    },
    qux: 'b',
    baz: 'c'
}
```

## `get` and `set`

**v1.2.0 and up**

Another way to access the properties (with a bit more leeway) is to use `get` and `set`:

```js
var instance = chainable(); 
instance.set('foo', 900); // creates a 'foo' method
console.log(instance.foo()); // output: 900
console.log(instance.get('foo')); // output: 900
```

`get` allows you to pass default values, in case the property has not been set yet:

```js
var instance = chainable(); 
var value = instance.get('foo', 'a default value for foo');
console.log(value); // outputs: 'a default value for foo'
```

`get` will **not** create a property, i.e. this will throw:

```js
var instance = chainable();
instance.get('foo', 'a default value for foo');
instance.foo(); // throws: TypeError: instance.foo is not a function
```

## Installation and other shizzle

Use [`bower`](http://www.bower.io) or [`npm`](npmjs.org) to install `chainable-object`. You can use it on the front- and backend, but for clientside you'll need [`webpack`](https://webpack.github.io/) or [browserify](http://browserify.org/) to get it going. We'll have none of that global variable shizzle.

Dependencies: [lodash](https://lodash.com/)

If you don't want to pull in `lodash` entirely or you prefer [`underscore`](http://underscorejs.org/) you can configure webpack to swap `lodash` with Your Preference (TM). 

```js
//file: webpack.config.js or some such
resolve: {
    alias: {
        "lodash": "underscore/underscore.min"
    }
}
```

ATM `chainable-object` uses the following lodash functions: `isObject`, `isArray`, `isFunction` and `each`, i.e. just replace "underscore/underscore.min" in the above example with the location of your file where you provide those functions.

## License

MIT