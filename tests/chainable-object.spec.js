'use strict';
/* eslint-env node, mocha */

var expect = require( 'must' );

var subject = require( '../chainable-object' );

describe( 'AccessorObject', function(){
    describe( 'module', function(){
        it( 'should be a function', function(){
            expect( subject ).to.be.a.function();
        } );
    } );
    describe( 'general functionality', function(){
        it( 'should throw when `recipient` is provided, but not an object', function(){
            expect( function(){
                subject( [], {} );
            } ).to.throw( /object/i );
        } );
        it( 'should throw when `accessors` is not an object', function(){
            expect( function(){
                subject( {}, [] );
            } ).to.throw( /object/i );
        } );
        it( 'should allow setting and retrieving a value', function(){
            var value = {};
            var actual = subject( {
                foo: 'value'
            } );
            actual.foo( value );
            expect( actual.foo() ).to.equal( value );
        } );
        it( 'should allow setting a boolean value', function(){
            var actual = subject( {
                foo: 'value'
            } );
            actual.foo( false );
            expect( actual.foo() ).to.equal( false );
        } );
        it( 'should allow processing a value, before storage', function(){
            var value = {};
            var actual = subject( {
                foo: function( value ){
                    value.isProcessed = true;
                    return value;
                }
            } );
            actual.foo( value );
            expect( value.isProcessed ).to.be.true();
        } );
        it( 'should allow setting an initialization value', function(){
            var value = 'initialized';
            var actual = subject( {
                foo: value
            } );
            expect( actual.foo() ).to.equal( value );
        } );
        it( 'should allow setting a processor _and_ an initialization value', function(){
            var value = 'initialized';
            var actual = subject( {
                foo: [ 'value', value ]
            } );
            expect( actual.foo() ).to.equal( value );
        } );
        it( 'should allow setting a `null` value', function(){
            var actual = subject( {
                foo: [ 'value', 'a value' ]
            } );
            actual.foo( null );
            expect( actual.foo() ).to.equal( null );
        } );
        it( 'should allow setting an `undefined` value', function(){
            var actual = subject( {
                foo: [ 'value', 'a value' ]
            } );
            actual.foo( undefined );
            expect( actual.foo() ).to.equal( undefined );
        } );
        it( 'should return the instance when used as a setter', function(){
            var actual = subject( {
                foo: 'value'
            } );

            expect( actual.foo( 'whatever value' ) ).to.equal( actual );
        } );
        it( 'should pass the key to the processor when set', function(){
            var actual;
            var instance = subject( {
                foo: function( value,
                               key ){
                    actual = key;
                    return value;
                }
            } );
            instance.foo('');
            expect( actual ).to.equal( 'foo' );
        } );
    } );
    describe( 'without recipient', function(){
        it( 'should create an object with accessors', function(){
            var actual = subject( {
                foo: 'value',
                bar: 'value'
            } );
            expect( actual.foo ).to.be.a.function();
            expect( actual.bar ).to.be.a.function();
        } );
    } );
    describe( 'with vanilla objects', function(){
        it( 'should add accessors to the recipient', function(){
            var actual = {};
            subject( actual, {
                foo: 'value',
                bar: 'value'
            } );
            expect( actual.foo ).to.be.a.function();
            expect( actual.bar ).to.be.a.function();
        } );
        it( 'should execute processors in the `recipient` context', function(){
            var recipient = {};
            var actual;
            subject( recipient, {
                foo: function( value ){
                    actual = this;
                    return value;
                }
            } );
            recipient.foo( 'a value' );
            expect( actual ).to.equal( recipient );
        } );
    } );
    describe( 'with prototypes', function(){
        var Class;
        beforeEach( function(){
            Class = function(){
            };
        } );
        it( 'should add accessors to the prototype', function(){
            subject( Class.prototype, {
                foo: 'value',
                bar: 'value'
            } );
            var actual = new Class();
            expect( actual.foo ).to.be.a.function();
            expect( actual.bar ).to.be.a.function();
        } );
        it( 'should create instance properties', function(){
            subject( Class.prototype, {
                foo: 'value'
            } );
            var actual1 = new Class();
            var actual2 = new Class();
            actual1.foo( 0 );
            actual2.foo( 1 );
            expect( actual1.foo() ).to.not.equal( actual2.foo() );
        } );
        it( 'should execute processors in the instance context', function(){
            var actual;
            subject( Class.prototype, {
                foo: function( value ){
                    actual = this;
                    return value;
                }
            } );
            var instance = new Class();
            instance.foo( 'a value' );
            expect( actual ).to.equal( instance );
        } );
    } );
    describe( 'nesting', function(){
        it( 'should set up nested accessor objects', function(){
            var actual = subject( {
                foo: {
                    bar: {
                        qux: [ 'value', 'qux' ]
                    },
                    baz: [ 'value', 'baz' ]
                }
            } );
            expect( actual.foo().bar().qux() ).to.equal( 'qux' );
            expect( actual.foo().baz() ).to.equal( 'baz' );
        } );
        it( 'should allow setting values through an object middle of the path', function(){
            var actual = subject( {
                foo: {
                    bar: {
                        qux: [ 'value', 'qux' ],
                        whatever: [ 'value', 'whatever' ]
                    },
                    baz: [ 'value', 'baz' ]
                }
            } );
            actual.foo( {
                bar: {
                    qux: 'changed qux'
                },
                baz: 'changed baz'
            } );
            expect( actual.foo().bar().qux() ).to.equal( 'changed qux' );
            expect( actual.foo().bar().whatever() ).to.equal( 'whatever' );
            expect( actual.foo().baz() ).to.equal( 'changed baz' );
        } );
    } );
} );
