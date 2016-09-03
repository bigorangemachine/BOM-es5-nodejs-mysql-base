//
module.exports=function(){//dependancies
    var GLaDioS=require('../../GLaDioS')(),utils=require('bom-nodejs-utils'),merge=require('merge'),_=require('underscore');
    var self_init=function(opts){//private methods
            var self=this;
            self.hook_ins.change_text('do', "[GENERICDB] When action is started or when the status is changed to 'busy'.");
            self.hook_ins.change_text('idle', "[GENERICDB] When action is flagged as idle (WIP).");
            self.hook_ins.change_text('pos', "[GENERICDB] When there has been a positive assertion.");
            self.hook_ins.change_text('neg', "[GENERICDB] When there has been a negative assertion.");
        };
    //statics
    var schema={'unique_id':false, 'status':false, 'data':{}},//is_next, result_args, severity & priority are readonly! - data is developer's storage
        severity_whitelist=['none','critical'],//first is the default!
        status_whitelist=['ready','next','busy','idle','pos','neg','completed'],//first is the default!
        resolved_whitelist=['pos','neg','completed'];
    /*
     * c0reModel(doFunc,opts)
     * c0reModel(posFunc,negFunc,doFunc,opts)
     * c0reModel(posFunc,negFunc,doFunc,idleFunc,opts)
     */
    function c0reModel(posFunc,negFunc,doFunc,idleFunc,opts){//the last arg is opts! as long as its an object!
        if(arguments.length>=2 && (typeof(posFunc)!=='function' && typeof(negFunc)!=='function')){throw new Error("[c0reModel] First & Second argument must be a function.");return {};}
        else if(typeof(arguments[0])!=='function'){var doFunc=arguments[0];}
        else if(arguments.length<=2){throw new Error("[c0reModel] Invalid arguments.");return {};}
        if(typeof(arguments[arguments.length-1])==='object'){opts=arguments[arguments.length-1];}//last object found is opts!
        if(!opts){opts={};}//100% sure
        if(typeof(doFunc)!=='function'){throw new Error("[c0reModel] Was not passed a valid 'do' function.");return {};}

        var inital_opts=utils.clone( (typeof(opts)!=='undefined'?opts:schema) );//intensive! - break pass by reference
        this.reset();//transfers the schema

        //private variables - need to be objects
        var priv_obj={
                'result_args':[],
                'priority':(typeof(opts.priority)==='number' && !isNaN(opts.priority) && opts.priority>0?Math.abs(Math.ceil(opts.priority)):0),
                'severity':(typeof(opts.severity)==='string' && _.indexOf(severity_whitelist, opts.severity.toLowerCase())!==-1?opts.severity:severity_whitelist[0]),
                'status': status_whitelist[0],
                'stamp': new Date()
            },
            is_next=function(){return (this.status==='next'?true:false);},
            is_completed=function(){return ( _.indexOf(['pos','neg','completed'], this.status)===-1 ?true:false);},
            result_args_get=function(){return priv_obj.result_args;},
            priority_get=function(){return priv_obj.priority;},
            severity_get=function(){return priv_obj.severity;},
            status_get=function(){return priv_obj.status;},
            status_set=function(v){
                if(typeof(v)!=='string' || _.indexOf(status_whitelist, v.toLowerCase())===-1){
                    throw new Error("[c0reModel] Invalid value fors status; a string with a value of '"+status_whitelist.join(', ')+"' expected.");}
                else{
                    priv_obj.status=v.toLowerCase();}
            },
            callbacks=new GLaDioS({
                'do': (typeof(doFunc)==='function'?doFunc:function(){}),
                'idle': (typeof(idleFunc)==='function'?idleFunc:function(){}),
                'pos': posFunc,
                'neg': negFunc
            }, this),
            update_stamp=function(){priv_obj.stamp=new Date();};
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            this.__defineSetter__('status', status_set);
            this.__defineGetter__('status', status_get);
            this.__defineGetter__('is_next', is_next);
            this.__defineGetter__('is_completed', is_completed);
            this.__defineGetter__('result_args', result_args_get);
            this.__defineGetter__('severity', severity_get);
            this.__defineGetter__('priority', priority_get);
        }else{
            Object.defineProperty(this, 'status', {
                'set': status_set,//setter
                'get': status_get//getter
            });
            Object.defineProperty(this, 'is_next', {'get': is_next});
            Object.defineProperty(this, 'is_completed', {'get': is_completed});
            Object.defineProperty(this, 'result_args', {'get': result_args_get});
            Object.defineProperty(this, 'severity', {'get': severity_get});
            Object.defineProperty(this, 'priority', {'get': priority_get});
        }

		self_init.apply(this, [opts]);//start! self_init that passes the 'this' context through

        //these need private scope access!
        c0reModel.prototype.action=function(key, args, func, rootObj){
            if(typeof(key)==='string' && callbacks.has_callback(key) && callbacks.has(key)){
                if(typeof(rootObj)==='object'){callbacks.reroot(rootObj);}
                callbacks.icallback(key, (typeof(args)==='object'?args:{}), func);
            }
        };
        c0reModel.prototype.reset=function(){
            var self=this;
            self.unique_id=(typeof(inital_opts.unique_id)!=='string'?new Date().getTime().toString()+'-'+utils.getRandomInt(1000,9999):inital_opts.unique_id);
            //model setter!
            for(var s in schema){//set schema default
                if(utils.obj_valid_key(inital_opts, s)){this[s]=utils.clone(inital_opts[s]);}}

            self.status=status_whitelist[0];
            self.result_args=[];
            update_stamp.apply(this);
            priv_obj.stamp=new Date();
        };
        (function(self){
            var get_marker=function(curr,focalItem){
                    return function(){
                        var valid_previous=focalItem.prev_list,
                            call_action=(typeof(focalItem.action)!=='undefined' && focalItem.action!==false?focalItem.action:false);
                        if(_.indexOf(valid_previous, self.status)===-1){throw new Error("[c0reModel] Cannot mark as "+focalItem.readable+". Current status must be '"+valid_previous.join(', ')+"'; currently '"+self.status+"'.");return;}
                        priv_obj.status=curr;
                        update_stamp();
                        if(!call_action){self.action(call_action);}
                    };
                },
                pos_neg=['busy','idle'],
                mapper={
                  //'ready':[], <- not used!
                    'next':{'prev_list': ['ready'],'readable': 'next'},
                    'busy':{'prev_list': ['next'],'action': 'do','readable': 'busy'},
                    'idle':{'prev_list': ['busy'],'action': 'idle','readable': 'idle'},
                    'completed':{'prev_list': ['idle'],'readable': 'completed (timedout)'},
                    'pos':{'prev_list': pos_neg,'action': 'pos','readable': 'positive (successfully completed)'},
                    'neg':{'prev_list': pos_neg,'action': 'neg','readable': 'negative (unsuccessfully completed)'}
                };
            status_whitelist.forEach(function(v,i,arr){
                var func_str='mark_'+v;
                if(utils.obj_valid_key(mapper, v) && typeof(c0reModel.prototype[func_str])==='undefined'){//intentionally skips 'ready'
                    c0reModel.prototype[func_str]=get_marker(v,mapper[v]);}
            });
            /* DECALRED ABOVE DYNAMICALLY!
             *    c0reModel.prototype.mark_next=function(){}
             *    c0reModel.prototype.mark_busy=function(){}
             *    c0reModel.prototype.mark_idle=function(){}
             *    c0reModel.prototype.mark_completed=function(){}
             *    c0reModel.prototype.mark_pos=function(){}
             *    c0reModel.prototype.mark_neg=function(){}
            */
        })(this);
console.log('c0reModel',c0reModel);
	};

    //public methods
    // c0reModel.prototype.xxxx=function(){
    // };

    return c0reModel;


};
