
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    //var parentc0reJob=require('parentc0reJob')(); <- expected
    var self_init=function(opts){//private methods
            var self=this;
        };

    //statics
    var schema={'actions':{
            'do':false,
            'pos':false,
            'neg':false,
            'idle':false
        }};

    function c0reJob(opts){
        if(!opts){opts={};}

(function(opts){
    var self=this;
    opts.actions={
        'do':(typeof(opts.do)==='function'?opts.pos:false),
        'pos':(typeof(opts.pos)==='function'?opts.pos:false),
        'neg':(typeof(opts.neg)==='function'?opts.neg:false),
        'idle':(typeof(opts.idle)==='function'?opts.idle:false)
    };
    //private variables - need to be objects
    var protected_obj={'private':'thing'},
        protected_getter=function(keyIn){return function(){return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);}},
        protected_setter=function(keyIn){return function(v){protected_obj[keyIn]=v;}},
        readonly_obj={'testitem':opts.testitem},
        readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
    if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
        //protected
        this.__defineSetter__('private', protected_getter('private'));
        this.__defineGetter__('private', protected_setter('private'));

        //readonly
        this.__defineGetter__('testitem', readonly_getter('testitem'));
    }else{
        //protected
        Object.defineProperty(this, 'private', {'set': protected_setter('private'),'get': protected_getter('private')});

        //readonly
        Object.defineProperty(this, 'testitem', {'get': readonly_getter('testitem')});
    }

    //model setter!
    for(var s in schema){//set schema default
        if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

}).apply(this,[opts]);
		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};

    //public methods
    c0reJob.prototype.encapsulate=function(){
        var self=this,
            encap_pos=self.actions.pos,
            ecnap_neg=self.actions.neg,
            ecnap_idle=self.actions.idle,
            encap_do=self.actions.do.bind(null,function(){
                encap_pos();
            },
            function(){
                encap_neg();

            });
        return encap_do.bind(null,function(){},function(){});
    };

    return c0reJob;
}
