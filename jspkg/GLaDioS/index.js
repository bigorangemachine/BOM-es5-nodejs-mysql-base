

/*
 * this needs to be injected whenever you want to handled the returned code
    (function(){
    	///////\\\\\\\\\\PLUGIN HOOK init\\\\\\\\/////////
    	var _args={},//index keys mimic scope variables that should be passed
    		key_list=utils.array_keys(_args);//security reasons do it here because eval() below
    	self.icallback('init',_args, function(){
            for(var kl=0;kl<key_list.length;kl++){var _vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}//populate into above scope -> LAZY! DANGEROUS!
        });
    	///////\\\\\\\\\\END PLUGIN HOOK init\\\\\\\\/////////
    })();

 * Sample Callback 'move_item'
    // prototype require module aka NodeJS ES5
    var GLaDioS=require('./jspkg/GLaDioS')(_, utils, merge);
    function charSprite(opts){
        this.callbacks=new GLaDioS({'move_item':opts.callbacks.move_item});
    }
    charSprite.prototype.move_item=function(keyIn, xInc, yInc){
        var self=this,
            is_collided=false,//do a look up!
            item_pos={'x_pos':0,'y_pos':0},//some defaults
            unique_id=self.find_sprite(keyIn);

        // do lookup, path finding, agility rules and processing stuff!!!
        // throw error or return false if something goes wrong?
        // ....

        //now provide filter interface -> Rewritten to be safer
       (function(){//scope safe for linter
            ///////\\\\\\\\\\PLUGIN HOOK move_item\\\\\\\\/////////
            var _args={'is_collided':is_collided, 'item_pos':item_pos, 'unique_id':unique_id};//object for 'pass by reference' (PbR)
            self.callbacks.icallback('move_item',_args,function(){
                is_collided=_args.is_collided;//transfer the values
                item_pos=_args.item_pos;
                unique_id=_args.unique_id;
            });
            ///////\\\\\\\\\\END PLUGIN HOOK move_item\\\\\\\\/////////
       })();

       return true;
    };
    //\\ prototype require module aka NodeJS ES5

    // somewhere else -> Unit spawned
    Game.Sprites.push(new charSprite({'model':StealthPlane,'type':'aircraft','callbacks':{
            'move_item':function(pkgObj){//single argument!
                if(this.canFly(pkgObj.item_pos.x_pos, pkgObj.item_pos.y_pos)){
                    this.flyTo(pkgObj.item_pos.x_pos, pkgObj.item_pos.y_pos);}
                if(this.isStealth){
                    Game.Sprites.findRelated(unique_id).flyTo(pkgObj.item_pos.x_pos, pkgObj.item_pos.y_pos);//move ghost sprite
                    pkgObj.is_collided=false;//can't collide when stealthy
                }
            }
        }
    }));
    //\\ somewhere else -> Unit spawned

    // somewhere else -> Unit debuffed by special power
    var debuffed=Game.Sprites.find({'is_debuffed':true,'type':'aircraft','debuff_start':Game.thisFrameStamp});
    debuffed.forEach(function(v,i,arr){,
        var debuffed_aircraft_func=function(pkgObj){
            v.flyTo(pkgObj.item_pos.x_pos+rand(-10,10), pkgObj.item_pos.y_pos+rand(-10,10));//random movement!
        };
        v.callbacks.add('move_item',debuffed_aircraft_func);
        if(v.isStealth===true){
            v.isStealth=false;
            setTimeout(function(){
                v.setStealth(v.stealthRemaining);
                v.callbacks.remove('move_item',debuffed_aircraft_func);
            }, Game.frameIncrement * 12);
        }
    });
    //\\ somewhere else -> Unit debuffed by special power
*/

module.exports = function(_, utils, merge){//dependancies
    var self_init=function(opts){//private init method
        for(var k in opts){
            if(utils.obj_valid_key(opts, k)){
                this.register(k, 'Default Function Set (Set at object constructor)');
                if(typeof(opts[k])==='function'){//passed as single
                    this.add(k,opts[k]);
                }else if(opts[k] instanceof Array && opts[k].length>0){//passed as array
                    for(var p=0;p<opts[k].length;p++){
                        if(typeof(opts[k][p])==='function'){
                            this.add(k,opts[k][p]);}}
                }
            }
        }
    };

    //statics
    var schema={'tasks':[],'desc_text':''};//each register creates a new schema

    function GLaDioS(opts){
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
            };
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            this.__defineSetter__('plugin', fplug_set);
            this.__defineGetter__('plugin', plug_get);
        }else{
            Object.defineProperty(this, 'plugin', {'set': plug_set, 'get': plug_get});
        }

        var icallback=function(keyIn,argsIn,nextFunc){//internal callback - pluginable hooks
            	var self=this,
                    results=[],
            		has_callback=self.has_callback(keyIn);
                if(typeof(nextFunc)!=='function'){throw new Error('[GLaDioS] Calling icallback for \''+keyIn+'\' third argument is not a function.');}

            	if(has_callback){
                    for(var c=0;c<self.plugin[keyIn].tasks.length;c++){
                		var args=[argsIn];//wrap in array for func.apply() but we use a variable so we can take advantage of PbR
                		results.push(self.plugin[keyIn].tasks[c].apply(self, args));
                		argsIn=args[0];//push values up
                    }
            	}
                if(typeof(nextFunc)==='function'){nextFunc(argsIn, results);}
            	return has_callback;
            },/*
            icallback_set=function(v){//setter
                //plugin=merge(true,{}, plugin, v);icallback=v;
            },*/
            icallback_get=function(){//getter
                return icallback;
            };

        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('icallback', icallback_set);
            this.__defineGetter__('icallback', icallback_get);
        }else{
            Object.defineProperty(this, 'icallback', {/*'set': icallback_set, */'get': icallback_get});
        }

		self_init.apply(this, [opts]);//start! self_init that passes the 'this' context through
	};

    //public methods
    GLaDioS.prototype.has_callback=function(keyIn){//has functions?
        var self=this;
        if(!self.has(keyIn)){return false;}
        return (self.plugin[keyIn].tasks.length>0?true:false);
    };
    GLaDioS.prototype.has=function(keyIn){//valid key?!
        var self=this,
            plugin_keys=utils.array_keys(self.plugin);
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

    return GLaDioS;
}
