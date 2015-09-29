'use strict';
/* eslint-env node, mocha */

var expect = require( 'must' );
var sinon = require( 'sinon' );

var subject = require( '../accessor-object' );

describe( 'AccessorObject', function(){
    it( 'should be a function', function(){
        expect( subject.create ).to.be.a.function();
    } );
    it( 'should throw when `recipient` is not an object', function(){
        expect( function(){
            subject.create( [] );
        } ).to.throw( /object/i );
    } );
    it( 'should throw when `accessors` is not an object', function(){
        expect( function(){
            subject.create( {}, [] );
        } ).to.throw( /object/i );
    } );
    describe( 'with vanilla objects', function(){
        it( 'should add accessors to the recipient', function(){
            var actual = subject.create( {}, {
                foo: 'value',
                bar: 'value'
            } );
            expect( actual.foo ).to.be.a.function();
            expect( actual.bar ).to.be.a.function();
        } );
        it( 'should allow setting and retrieving a value', function(){
            var value = {};
            var actual = subject.create( {}, {
                foo: 'value'
            } );
            actual.foo( value );
            expect( actual.foo() ).to.equal( value );
        } );
        it( 'should allow setting a boolean value', function(){
            var actual = subject.create( {}, {
                foo: 'value'
            } );
            actual.foo( false );
            expect( actual.foo() ).to.equal( false );
        } );
        it( 'should allow processing a value, before storage', function(){
            var value = {};
            var actual = subject.create( {}, {
                foo: function( value ){
                    value.isProcessed = true;
                    return value;
                }
            } );
            actual.foo( value );
            expect( value.isProcessed ).to.be.true();
        } );
        it( 'should execute processors in the `recipient` context', function(){
            var recipient = {};
            var actual;
            subject.create( recipient, {
                foo: function( value ){
                    actual = this;
                    return value;
                }
            } );
            recipient.foo( 'a value' );
            expect( actual ).to.equal( recipient );
        } );
        it( 'should allow setting an initialization value', function(){
            var value = 'initialized';
            var actual = subject.create( {}, {
                foo: [ 'value', value ]
            } );
            expect( actual.foo() ).to.equal( value );
        } );
        it( 'should allow setting a `null` value', function(){
            var actual = subject.create( {}, {
                foo: [ 'value', 'a value' ]
            } );
            actual.foo( null );
            expect( actual.foo() ).to.equal( null );
        } );
        it( 'should allow setting an `undefined` value', function(){
            var actual = subject.create( {}, {
                foo: [ 'value', 'a value' ]
            } );
            actual.foo( undefined );
            expect( actual.foo() ).to.equal( undefined );
        } );
        it( 'should return the instance when used as a setter', function(){
            var actual = subject.create( {}, {
                foo: 'value'
            } );

            expect( actual.foo( 'whatever value' ) ).to.equal( actual );
        } );
    } );
    describe( 'with prototypes', function(){
        var Class;
        beforeEach( function(){
            Class = function(){
            };
        } );
        it( 'should add accessors to the prototype', function(){
            subject.create( Class.prototype, {
                foo: 'value',
                bar: 'value'
            } );
            var actual = new Class();
            expect( actual.foo ).to.be.a.function();
            expect( actual.bar ).to.be.a.function();
        } );
        it( 'should create instance properties', function(){
            subject.create( Class.prototype, {
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
            subject.create( Class.prototype, {
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
    describe.skip( 'nesting', function(){
        it( '', function(){
            var actual = subject.create( {}, {
                'foo.bar': [
                    'value', 'a value'
                ]
            } );
            expect( actual.foo().bar() ).to.equal( 'a value' );
        } );
    } );
} );
