'use strict';

var _ = require( 'lodash' );

function isChainableObject( obj ){
    return !!obj.__chainable;
}

function createAccessor( recipient,
                         name,
                         processor ){
    recipient[ name ] = function accessor( value ){
        if( arguments.length ){ // setter
            this[ '_' + name ] = (!processor || processor === 'value')
                ? value
                : processor.call( this, value, name );
            return this;
        }
        // getter
        return this[ '_' + name ];
    };
    recipient.__chainable.push( name );
}

function createOrMixin( recipient,
                        accessors ){
    switch( arguments.length ){
        case 1:
            accessors = recipient;
        // falls through
        case 0:
            recipient = {};
            break;
    }
    if( typeof recipient !== 'undefined' && !_.isObject( recipient ) ){
        throw new Error( 'Accessor Object: "recipient" must be of type "Object"' );
    }
    if( typeof accessors !== 'undefined' && !_.isObject( accessors ) && !_.isArray( accessors ) ){
        throw new Error( 'Accessor Object: "accessors" must be of type "Object" or "Array"' );
    }
    recipient.__chainable = [];
    recipient.set = function( key,
                              value ){
        if( typeof this[ key ] === 'undefined' ){
            createAccessor( this, key, 'value' );
        }
        return this[ key ]( value );
    };
    recipient.get = function( key, defaultValue ){
        if( typeof this[ key ] === 'undefined' ){
            return defaultValue;
        }
        return this[ key ]();
    };
    _.each( accessors, function( mixed,
                                 name ){
        var processor;
        if( _.isArray( mixed ) ){ // leaf with processor and initial value
            processor = mixed[ 0 ];
            recipient[ '_' + name ] = mixed[ 1 ];
        } else if( _.isFunction( mixed ) ){ // leaf with processor
            processor = mixed;
        } else if( _.isObject( mixed ) ){// composite
            recipient[ '_' + name ] = createOrMixin( mixed );
            processor = function( value ){
                if( !_.isObject( value ) || _.isArray( value ) ){
                    throw new Error( 'Accessor Object: nested objects require parameters of type "Object"' );
                }
                _.each( value, function( mixed,
                                         name ){
                    this[ name ]( mixed );
                }, recipient[ '_' + name ] );
                return recipient[ '_' + name ];
            }
        } else { // leaf with initial value, falls through: boolean, string, number
            recipient[ '_' + name ] = mixed;
            processor = 'value';
        }
        createAccessor( recipient, name, processor );
    } );

    recipient.toObject = recipient.values = function( values ){
        if( values ){
            Object.keys( values ).forEach( function( key ){
                this[ key ]( values[ key ] );
            }, this );
            return this;
        }
        var output = {};
        this.__chainable.forEach( function( accessor ){
            var value = this[ accessor ]();
            output[ accessor ] = (isChainableObject( value ))
                ? value.values()
                : value;
        }, this );
        return output;
    };
    return recipient;
}

module.exports = createOrMixin;
module.exports.isChainable = isChainableObject;