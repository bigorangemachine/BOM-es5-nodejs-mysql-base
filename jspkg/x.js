
module.exports = function(parentOOPmodule){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    var self_init=function(){//private methods
    };

    //statics
    var schema={'some':'thing','foo':'bar'};

    function OOPmodule(opts){
        if(!opts){opts={};}

        //private variables - need to be objects
        var protected_obj={'private':'thing'},
            protected_getter=function(keyIn){return function(){return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);}},
            protected_setter=function(keyIn){return function(v){protected_obj[keyIn]=v;}},
            readonly_obj={'readonlyitem':'publickey'},
            readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //protected
            this.__defineSetter__('private', protected_getter('private'));
            this.__defineGetter__('private', protected_setter('private'));

            //readonly
            this.__defineGetter__('readonlyitem', readonly_getter('readonlyitem'));
        }else{
            //protected
            Object.defineProperty(this, 'private', {'set': protected_setter('private'),'get': protected_getter('private')});

            //readonly
            Object.defineProperty(this, 'readonlyitem', {'get': readonly_getter('readonlyitem')});
        }

        //model setter!
        for(var s in schema){//set schema default
            if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

        this.xxxxx={'limit':{'row_count':(typeof(opts)!=='undefined' && typeof(opts.xxxxx)==='number'?opts.xxxxx:9000)}};
		self_init.apply(this);//start! self_init that passes the 'this' context through
	};
    OOPmodule.prototype=Object.create(parentOOPmodule.prototype);//extend parent
    //OOPmodule.prototype.parent=parentOOPmodule.prototype; // <- if you want to make super/parent class
    //this.parent.parent_function.call(this); <- then call it when you want to

    //public methods
    OOPmodule.prototype.method_defined=function(){
        var self=this;
    };

    return OOPmodule;
}
