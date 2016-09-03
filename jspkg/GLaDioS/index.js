/*
 * GLaDioS.js
 * This is a 'blocking' javascript plugin/filter/hook feature to easily expand code features
 * to improve seperator of concerns without a seperation of features
 *
*/

module.exports = function(){//dependancies - underscore currently unused
    var utils=require('bom-nodejs-utils'),merge=require('merge'),_=require('underscore');
    function ecapsulateTask(func,alt){this._func=func;this._this=alt;}
    var self_init=function(opts){//private init method
            var self=this;
            for(var k in opts){
                if(!utils.obj_valid_key(opts, k)){continue;}//this is just cleaner
                self.register(k, 'Default Function Set (Set at object constructor)');
                var nfunc=(self.valid_callback(opts[k])?[opts[k]]:opts[k]);//passed as single -> wrap into an array
                if(!(nfunc instanceof Array && nfunc.length>0)){continue;}//this is just cleaner
                for(var p=0;p<nfunc.length;p++){//passed as array (or converted ;) )
                    if(!self.valid_callback(nfunc[p])){continue;}//this is just cleaner
                    self.add(k,nfunc[p]);
                }
            }

            var ecapsulate_task=function(func, altThis){//internal callback - pluginable hooks
                    if(typeof(func)!=='function'){return false;}
                    var use_self=(typeof(altThis)!=='undefined'?altThis:self);
                    return new ecapsulateTask(func,altThis);
                },
                ecapsulate_task_get=function(){//getter
                    return ecapsulate_task;
                };
            if(typeof(Object.defineProperty)!=='function' && (typeof(self.__defineGetter__)==='function' || typeof(self.__defineSetter__)==='function')){//use pre IE9
                self.__defineGetter__('ecapsulate_task', ecapsulate_task_get);
            }else{
                Object.defineProperty(self, 'ecapsulate_task', {'get': ecapsulate_task_get});
            }
        };

    //statics
    var schema={'tasks':[],'desc_text':''};//each register creates a new schema

    function GLaDioS(opts, root){
        if(!opts){opts={};}

        //private variables - need to be objects
        var plugin={//populated later - unique key-index-list of functions
                //'index_key': [ function, function, ..., function ]
            },
            plug_set=function(v){//setter
                //should probably ensure registered keys aren't removed -> compare new against current
                //plugin=merge(true,{}, plugin, v);
                plugin=v;
            },
            plug_get=function(){//getter
                return plugin;
            },
            icallback=function(keyIn,argsIn,nextFunc){//internal callback - pluginable hooks
            	var self=this,
                    results=[],
            		has_callback=self.has_callback(keyIn);
                if(typeof(nextFunc)!=='undefined' && typeof(nextFunc)!=='function'){throw new Error('[GLaDioS] Calling icallback for \''+keyIn+'\' third argument is not a function (or empty/undefined).');}
                if(!has_callback && !self.has(keyIn)){throw new Error("[GLaDioS] icallback called an invalid callback '"+keyIn+"'.");}

            	if(has_callback){
                    for(var c=0;c<self.plugin[keyIn].tasks.length;c++){
                		var args=[argsIn],//wrap in array for func.apply() but we use a variable so we can take advantage of PbR
                            as_this=self.root,
                            func=self.plugin[keyIn].tasks[c];
                        if(self.plugin[keyIn].tasks[c] instanceof ecapsulateTask){
                            as_this=self.plugin[keyIn].tasks[c]._this;
                            func=self.plugin[keyIn].tasks[c]._func;
                        }
                        results.push(func.apply(as_this, args));
                		argsIn=args[0];//push values up
                    }
            	}
                if(typeof(nextFunc)==='function'){nextFunc(argsIn, results);}
                root_obj.root_var=(typeof(root)==='object'?root:self);//overrided by reroot()? Reset it! aka self.root=root (the original passed in);
            	return has_callback;
            },/*
            icallback_set=function(v){//setter
                //plugin=merge(true,{}, plugin, v);icallback=v;
            },*/
            icallback_get=function(){//getter
                return icallback;
            },
            valid_callback=function(funcIn){
                if(typeof(funcIn)==='function'){return true;}
                if(funcIn instanceof ecapsulateTask){return true;}
                return false;
            },
            valid_callback_get=function(){//getter
                return valid_callback;
            },
            root_obj={
                'root_var': (typeof(root)==='object'?root:this)//aka self.root / this.root
            },
            root_callback_get=function(){//getter
                return root_obj.root_var;},
            silent_obj={'_val':(typeof(opts.silent)==='boolean'?opts.silent:false)};
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            this.__defineSetter__('plugin', plug_set);
            this.__defineGetter__('plugin', plug_get);
            //read only!
            this.__defineGetter__('icallback', icallback_get);
            this.__defineGetter__('valid_callback', valid_callback_get);
            this.__defineGetter__('root', root_callback_get);
            this.__defineGetter__('silent', function(){return silent_obj._val;});
        }else{
            Object.defineProperty(this, 'plugin', {'set': plug_set, 'get': plug_get});
            //read only!
            Object.defineProperty(this, 'icallback', {'get': icallback_get});
            Object.defineProperty(this, 'valid_callback', {'get': valid_callback_get});
            Object.defineProperty(this, 'root', {'get': root_callback_get});
            Object.defineProperty(this, 'silent', {'get': function(){return silent_obj._val;}});
        }

        GLaDioS.prototype.reroot=function(newRootObjIn){//this sets a temporary bypass
            var self=this;
            if(typeof(newRootObjIn)==='object'){
                if(!self.silent){console.warn("[GLaDioS] Warning - default 'this' reference (aka root) has temporarily rerooted until the next 'icallback' as completed.");}
                root_obj.root_var=newRootObjIn;// aka self.root=newRootObjIn;
            }
        };

		self_init.apply(this, [opts]);//start! self_init that passes the 'this' context through
	};

    //public methods
    GLaDioS.prototype.has_callback=function(keyIn){//has functions?
        var self=this;
        if(!self.has(keyIn)){return false;}
        return (self.plugin[keyIn].tasks.length>0?true:false);
    };
    GLaDioS.prototype.has=function(keyIn){//valid key?!
        var self=this;
        if(!utils.obj_valid_key(self.plugin, keyIn)){return false;}
        return true;
    };
    GLaDioS.prototype.register=function(keyIn, descTextIn){//register once!
        var self=this;
        if(typeof(descTextIn)!=='string' || descTextIn.length===0){throw new Error('[GLaDioS] Description text is not a string or is empty.');return false;}
        if(self.has(keyIn)){throw new Error('[GLaDioS] Registering key \''+keyIn+'\' is already registered.');return false;}
        self.plugin[keyIn]=merge(true, {}, schema);//break pass by reference
        self.plugin[keyIn].desc_text=descTextIn;
        return true;
    };
    GLaDioS.prototype.deregister=function(keyIn, force){//deregister -> we really don't want it anymore!
        var self=this;
        if(typeof(force)!=='boolean'){force=false;}
        if(!self.has(keyIn)){throw new Error('[GLaDioS] Deregistering key \''+keyIn+'\' is not registered.');return false;}
        else if(self.has(keyIn) && self.has_callback(keyIn) && !force){throw new Error('[GLaDioS] Deregistering \''+keyIn+'\' failed because it has tasks that need to be removed (or use force argument).');return false;}
        delete self.plugin[keyIn];
        //self.plugin[keyIn]=undefined;
        return true;
    };
    GLaDioS.prototype.add=function(keyIn, funcIn){//add a callback for a task
        var self=this;
        if(!self.has(keyIn)){throw new Error('[GLaDioS] Adding \''+keyIn+'\' failed because is not registered.');return false;}
        else if(typeof(funcIn)!=='function'){throw new Error('[GLaDioS] Adding \''+keyIn+'\' was not passed with a function.');return false;}
        self.plugin[keyIn].tasks.push(funcIn);//should this be bind()?
        return true;
    };
    GLaDioS.prototype.remove=function(keyIn, funcIn){//remove a callback for a task
        var self=this;
        if(!self.has(keyIn) || !self.has_callback(keyIn)){throw new Error('[GLaDioS] Removing \''+keyIn+'\' failed because is not registered or has nothing to remove.');return false;}
        else if(typeof(funcIn)!=='function'){throw new Error('[GLaDioS] Removing \''+keyIn+'\' was not passed with a function.');return false;}
        var del_key=false;
        for(var c=0;c<self.plugin[keyIn].tasks.length;c++){
            if(self.plugin[keyIn].tasks[c]===funcIn){//this if might need to be expanded... I think I need to comparision with bind on both arguments (bind() on self.add()? )
                del_key=c;
                break;
            }
        }
        var new_set=self.plugin[keyIn].tasks.splice(del_key, 1);
        self.plugin[keyIn].tasks=new_set;
        return true;
    };
    GLaDioS.prototype.change_text=function(keyIn, descText){//change the text
        var self=this;
        if(!self.has(keyIn)){throw new Error('[GLaDioS] Changing the description text for \''+keyIn+'\' failed because is not registered.');return false;}
        else if(typeof(descText)!=='string' || descText.toString().trim().length===0){throw new Error('[GLaDioS] Changing the description text for \''+keyIn+'\' failed because is not a string or is empty.');return false;}
        self.plugin[keyIn].desc_text=descText;
        return true;
    };
    GLaDioS.prototype.list=function(){//all the keys!
        var self=this,
            output=utils.array_keys(self.plugin);
        output.forEach(function(v,i,arr){
            arr[i]={'key':v,'num_callbacks':(self.plugin[v] instanceof Array?self.plugin[v].length:0)};
        });
        return output;
    };
    return GLaDioS;
}
