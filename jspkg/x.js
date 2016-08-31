
module.exports = function(parentOOPmodule, _, utils, merge){//dependancies and parentOOP protoptype/classes
    var self_init=function(){//private methods
    };

    //statics
    var schema={'some':'thing','foo':'bar'};

    function OOPmodule(opts){
        if(!opts){opts={};}

        //private variables - need to be objects
        var private_obj={'private':'thing','baz':'foo'};
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            this.__defineSetter__('private_obj', function(v){private_obj=merge(true,{}, private_obj, v);});
            this.__defineGetter__('private_obj', function(){return private_obj;});
        }else{
            Object.defineProperty(this, 'private_obj', {
                'set': function(v){private_obj=merge(true,{}, private_obj, v);},//setter
                'get': function(){return private_obj;}//getter
            });
        }

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
