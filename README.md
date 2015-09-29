# Chainable Object

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


