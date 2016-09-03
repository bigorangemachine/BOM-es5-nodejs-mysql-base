
module.exports = function(process, _, utils, merge){//dependancies
    var GLaDioS=require('../GLaDioS')(_, utils, merge),
        c0re=require('./sub/c0re')(_, utils, merge),
        c0reModel=require('./sub/c0reModel')(_, utils, merge);

    if(typeof(_)!=='object' || typeof(utils)!=='object' || typeof(merge)!=='object'){
        var _=(!_?require('underscore'):_),
            utils=(!utils?require('./jspkg/utils'):utils),
            merge=(!merge?require('merge'):merge);
    }

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
