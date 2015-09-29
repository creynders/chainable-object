'use strict';

var _ = require( 'lodash' );

module.exports.create = function mixinAccessors( recipient,
                                          accessors ){
    if( !_.isObject( recipient ) || _.isArray( recipient ) ){
        throw new Error( 'Accessor Object: "recipient" must be of type "Object"' );
    }
    if( !_.isObject( accessors ) || _.isArray( accessors ) ){
        throw new Error( 'Accessor Object: "accessors" must be of type "Object"' );
    }
    _.each( accessors, function( mixed,
                                 name ){
        var processor;
        if( _.isArray( mixed ) ){
            processor = mixed[ 0 ];
            recipient[ '_' + name ] = mixed[ 1 ]; // init value
        } else {
            processor = mixed;
        }
        recipient[ name ] = function accessor( value ){
            if( arguments.length === 1 ){ // setter
                this[ '_' + name ] = (!processor || processor === 'value')
                    ? value
                    : processor.call( this, value );
                return this;
            }
            return this[ '_' + name ];
        };
    } );
    return recipient;
};