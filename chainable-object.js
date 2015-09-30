'use strict';

var _ = require( 'lodash' );

function isChainableObject( obj ){
    return !!obj.__chainable;
}

function createOrMixin( recipient,
                        accessors ){
    if( arguments.length === 1 ){
        accessors = recipient;
        recipient = {};
    }
    if( !_.isObject( recipient ) || _.isArray( recipient ) ){
        throw new Error( 'Accessor Object: "recipient" must be of type "Object"' );
    }
    if( !_.isObject( accessors ) || _.isArray( accessors ) ){
        throw new Error( 'Accessor Object: "accessors" must be of type "Object"' );
    }
    recipient.__chainable = [];
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
        recipient[ name ] = function accessor( value ){
            if( arguments.length ){ // setter
                this[ '_' + name ] = (!processor || processor === 'value')
                    ? value
                    : processor.call( this, value );
                return this;
            }
            return this[ '_' + name ];
        };
        recipient.__chainable.push( name );
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