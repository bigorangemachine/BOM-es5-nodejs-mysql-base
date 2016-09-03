/*
### Implement names of these characters ^_^

[ ] Wheatley (iterator-queue) - Narrator

[ ] Cake (generator-queue) - Create the cake, queue for the cake

[ ] Paranoia (iterator-pool) - someone who is paranoid would work like this (Poker Night 2 <3)

[ ] Anger (generator-pool) - someone who is angry works like this

[ ] Curiosity (iterator-fuzzy) - someone who is curious would do this - examine things then move on

[ ] Morality (generator-fuzzy) - someone who is morale would work like this - checkin but always mulling

### Names of other portal sphere/AI characters

* Space
* Adventure
* Fact
* Bomb
* Final Hours
* Unused
* Party
* Turrets
* Atlas & P-body
* Companion Cube

*/
//module.exports = function(process){//dependancies
module.exports = function(){//dependancies
    var GLaDioS=require('../GLaDioS')(),
        c0re=require('./sub/c0re')(),
        c0reModel=require('./sub/c0reModel')(),
        utils=require('bom-nodejs-utils'),merge=require('merge'),_=require('underscore');

    var self_init=function(){//private methods
            var self=this;
            process.on('exit', function(){
                self.do_exit();
            });
        };


    function c0redP(opts){
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

		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};

    //public methods
    c0redP.prototype.on=function(typeIn,funcIn){
        var self=this;
    };
    c0redP.prototype.do_ready=function(){
        var self=this;
    };
    c0redP.prototype.do_start=function(){
        var self=this;
    };
    c0redP.prototype.do_exit=function(){
        var self=this;
    };
    return c0redP;
}
