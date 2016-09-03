//
module.exports = function(){//dependancies
    var GLaDioS=require('GLaDioS')(),
        c0reModel=require('./c0reModel')(),
        utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    function c0re(successFunc, failFunc, opts){
        if(!opts){opts={};}
        opts=merge(true,{},opts);//break PBR
        opts.fps=(typeof(opts.fps)==='number' && !isNaN(opts.fps)?Math.abs(Math.ceil(opts.fps)):15);
        opts.fps_readonly=(typeof(opts.fps_readonly)==='boolean'?opts.fps_readonly:true);

        var determinative_whitelist=['all', '~all', 'pos'],
            valid_cycles=['iterator','generator'], //iterator completes the tasts once (auto stoppage) - generator does things again (manual stoppage)
            valid_taskers=['queue','pool','fuzzy'];
        opts.cycle_type=(typeof(opts.cycle_type)==='string'?opts.cycle_type.toLowerCase():valid_cycles[0]);
        opts.tasker_type=(typeof(opts.tasker_type)==='string'?opts.tasker_type.toLowerCase():valid_taskers[0]);
        opts.cycle_type=(_.indexOf(valid_cycles, opts.cycle_type)!==-1?opts.cycle_type:valid_cycles[0]);//verified found!
        opts.tasker_type=(_.indexOf(valid_taskers, opts.tasker_type)!==-1?opts.tasker_type:valid_taskers[0]);

        this.callback_queue=[];
        this.once_queue=[];
        //private variables - need to be objects
        var self=this,
            priv_obj={'once_queue':[],'queue':[],'cycle_type':opts.cycle_type,'tasker_type':opts.tasker_type},
            readonly_opts={'fps_readonly':opts.fps_readonly, 'once_queue':priv_obj.once_queue, 'queue':priv_obj.queue, 'determinative':(typeof(opts.determinative)==='string' && _.indexOf(determinative_whitelist, opts.determinative.toLowerCase())!==-1?opts.determinative.toLowerCase():determinative_whitelist[0])},
            fps_obj={
                'val':opts.fps,
                'fpsgetter':function(){return fps_obj.val;},
                'fpssetter':function(v){
                    if(!self.fps_readonly){
                        var clean_num=v;
                        clean_num=Math.abs(Math.ceil( (typeof(clean_num)!=='number'?parseInt(clean_num):clean_num) ));
                        clean_num=(isNaN(clean_num) || clean_num===null || clean_num<=0?fps_obj.val:clean_num);
                        if(fps_obj.val!==clean_num){//actually changed! - do an async value change
                        	self.stop_large_cycle();
                            fps_obj.val=clean_num;//this sets the new value! self.fps=clean_num;
                            self.small_cycle.init_func(function(){//take the small cycle callback and trigger the large one later ;)
                                self.start_large_cycle();//pickup the new fps value because its async ;)
                            });
                        }
                    }
                }
            },
            silent_obj={'_val':(typeof(opts.silent)==='boolean'?opts.silent:false)},
            small_cycle_obj={
                'del_history':false,
                'use_history':true,
                'history':[],
                'task_id':false,
                'init_func':function(func){//smash the thread safely
                    return (utils.isNode()?setImmediate.bind(self, func):requestAnimationFrame.bind(self, func));
                },
                'cancel_func':function(idIn){
                    return (utils.isNode()?clearImmediate.bind(self, self.large_cycle.id):cancelAnimationFrame.bind(self, self.large_cycle.id));
                }
            },
            large_cycle_obj={
                'del_history':false,
                'use_history':true,
                'history':[],
                'task_id':false,
                'init_func':function(func){
                    var binded=setInterval.bind(self, func, (1000/self.fps));
                    self.large_cycle.id=binded();//auto cancels!
                },
                'cancel_func':function(idIn){
                    clearInterval(self.large_cycle.id);
                }
            },
            cycle_get=function(typeIn){
                return function(){return (typeIn==='large'?large_cycle_obj.task_id:small_cycle_obj.task_id);}
            },
            cycle_set=function(typeIn){
                return function(v){
                    var focal=(typeIn==='large'?large_cycle_obj:small_cycle_obj);
                    if(focal.use_history && typeof(v)==='number' && _.indexOf(focal.history, v)!==-1){
                        if(!self.silent){console.warn("[c0re] has already used this task id "+v+".");}
                        //otherwise do nothing!
                    }else if(v===false || typeof(v)==='number'){
                        if(typeof(focal.cancel_func)==='function' && typeof(focal.task_id)==='number'){//make sure its 100% cancelled
                            var seek_pos=_.indexOf(focal.history, v),
                                do_cancel=true;//assume we always want to cancel unless its not in the history when history is enabled
                            if(focal.use_history && seek_pos!==-1){
                                if(!self.silent){console.warn("[c0re] has stopped task "+focal.task_id+" from being auto-cancelled.");}
                                do_cancel=false;
                            }
                            if(do_cancel){
                                focal.cancel_func();
                                focal.task_id=false;
                                if(focal.use_history && focal.del_history){utils.array_del_at(focal.history, seek_pos);}
                            }
                        }
                        if(typeof(v)==='number' && focal.use_history){focal.history.push(v);}
                        focal.task_id=v;
                    }else{
                        throw new Error("[c0re] Setting '"+focal+"_cycle_obj.id' must be a number or false");
                    }
                };
            },
            pool_size=(typeof(opts.pool_size)!=='undefined'?opts.pool_size:1),
            pool_size_set=function(numIn){
                var clean_num=numIn;
                clean_num=Math.abs(Math.ceil( (typeof(clean_num)!=='number'?parseInt(clean_num):clean_num) ));
                clean_num=(isNaN(clean_num) || clean_num===null || clean_num<=0?1:clean_num);
                pool_size=(opts.tasker_type!=='queue'?clean_num:1);
                if(opts.tasker_type==='queue' && clean_num>1){throw new Error("[c0re] Tasker type '"+opts.tasker_type+"' cannot change pool size.");}
            };
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //readonly!
            this.__defineGetter__('silent', function(){return silent_obj._val;});
            this.__defineGetter__('pool_size', function(){return pool_size;});
            this.__defineGetter__('fps_readonly', function(){return readonly_opts.fps_readonly;});
            this.__defineGetter__('temp_queue', function(){return readonly_opts.once_queue;});
            this.__defineGetter__('queue', function(){return readonly_opts.queue;});
            this.__defineGetter__('determinative', function(){return readonly_opts.determinative;});
            this.__defineGetter__('cycle_type', function(){return readonly_opts.cycle_type;});
            this.__defineGetter__('tasker_type', function(){return readonly_opts.tasker_type;});

            //getters & setters!
            this.__defineGetter__('fps', fps_obj.fpsgetter);
            this.__defineSetter__('fps', fps_obj.fpssetter);

            //custom
            this.__defineGetter__('large_cycle', large_cycle_obj);
            this.__defineGetter__('small_cycle', small_cycle_obj);
                large_cycle_obj.__defineGetter__('id', cycle_get('large'));
                large_cycle_obj.__defineSetter__('id', cycle_set('large'));
                small_cycle_obj.__defineGetter__('id', cycle_get('small'));
                small_cycle_obj.__defineSetter__('id', cycle_set('small'));
        }else{
            //readonly!
            Object.defineProperty(this, 'silent', {'get': function(){return silent_obj._val;}});
            Object.defineProperty(this, 'pool_size', {'get': function(){return pool_size;}});
            Object.defineProperty(this, 'fps_readonly', {'get': function(){return readonly_opts.fps_readonly;}});
            Object.defineProperty(this, 'temp_queue', {'get': function(){return readonly_opts.once_queue;}});
            Object.defineProperty(this, 'queue', {'get': function(){return readonly_opts.queue;}});
            Object.defineProperty(this, 'determinative', {'get': function(){return readonly_opts.determinative;}});
            Object.defineProperty(this, 'cycle_type', {'get': function(){return readonly_opts.cycle_type;}});
            Object.defineProperty(this, 'tasker_type', {'get': function(){return readonly_opts.tasker_type;}});

            //getters & setters!
            Object.defineProperty(this, 'fps', {'get': fps_obj.fpsgetter, 'set': fps_obj.fpssetter});

            //custom
            Object.defineProperty(this, 'large_cycle', {'get': large_cycle_obj});
            Object.defineProperty(this, 'small_cycle', {'get': small_cycle_obj});
                Object.defineProperty(large_cycle_obj, 'id', {'get': cycle_get('large'), 'set': cycle_set('large')});
                Object.defineProperty(small_cycle_obj, 'id', {'get': cycle_get('small'), 'set': cycle_set('small')});
        }
        try{
            pool_size_set(pool_size);//self cleaning ^_^
        }catch(e){
            if(!self.silent){console.warn("[c0re] Pool size initialization threw an error:\n"+e.toString());}
        }

        opts.hook_ins=(typeof(opts.hook_ins)!=='object'?{}:opts.hook_ins);
        this.hook_ins=new GLaDioS({
            'task_result': (typeof(opts.hook_ins.task_result)==='function'?opts.hook_ins.task_result:false),
            'xxxxxxx': (typeof(opts.hook_ins.xxxxxxx)==='function'?opts.hook_ins.xxxxxxx:false)
        });
        self.hook_ins.change_text('xxxxxxx', "[c0re] aaaaaa");

        var enqueue_once=function(func){//super next :D
                var self=this;
                priv_obj.once_queue.push( new c0reModel(func,function(){},function(){}) );
            },
            enqueue=function(func){
                var self=this;
                priv_obj.queue.push( new c0reModel(func,function(){},function(){}) );
            };

        //these need private scope access!
        c0re.prototype.set_pool=function(numIn){//experimental - change the pool size later!
            var self=this;
            if(!self.silent){console.warn("[c0re] pool size changes in an ansyc method");}
            throw new Error("[c0re] enqueue_pool_change not tested");
            var args=[ new c0reModel(callbacks.pos,callbacks.neg,opts) ];
            enqueue_once.apply(self,args);
        };
        c0re.prototype.enqueue_next=function(funcIn,calbacks,optsIn){//everyone else takes the bus when it comes to 'next'
            var self=this;
            return self.enqueue(funcIn,calbacks,merge(true,optsIn,{'priority':Number.MAX_SAFE_INTEGER}));
        };
        c0re.prototype.enqueue=function(funcIn,calbacks,optsIn){
            var self=this;
            calbacks=(typeof(calbacks)==='function'?{'pos':calbacks,'neg':calbacks}:calbacks);
            if(typeof(funcIn)!=='function'){throw new Erorr("[c0re] Could not 'enqueue' because first argument was not a function");return false;}
            callbacks=merge(true,{
                'do':funcIn,
                'idle':(typeof(calbacks)==='object' && typeof(callbacks.idle)==='function'?callbacks.idle:false),
                'pos':(typeof(calbacks)==='object' && typeof(callbacks.pos)==='function'?callbacks.pos:false),
                'neg':(typeof(calbacks)==='object' && typeof(callbacks.neg)==='function'?callbacks.neg:false)
            });

            if(typeof(optsIn.priority)!=='number' || Math.floor(parseFloat(optsIn.priority))<0){optsIn.priority=0;}
            else if(optsIn.priority>=Number.MAX_SAFE_INTEGER){optsIn.priority=Number.MAX_SAFE_INTEGER;}
            else if(typeof(optsIn.priority)==='number' && !isNan(optsIn.priority)){optsIn.priority=Math.abs(Math.floor(optsIn.priority));}
            else{optsIn.priority=0;}

            var ouptut=false;
            if(self.tasker_type==='fuzzy'){
                if(typeof(callbacks.idle)==='function'){throw new Error("[c0re] When tasker type is set to '"+self.tasker_type+"'; 2nd arg must be object with key 'idle'.");}
                ouptut=new c0reModel(callbacks.pos,callbacks.neg,callbacks.do,callbacks.idle,opts);
            }else{
                ouptut=new c0reModel(callbacks.pos,callbacks.neg,callbacks.do,opts);
            }
            return ouptut.unique_id;
        };
        c0re.prototype.remove=function(uniqueIdIn){//remove with unique_id or declared 'do' function
            var self=this,did_del=false;
            if(typeof(uniqueIdIn)==='function'){
                for(var func in priv_obj.queue){if(utils.obj_valid_key(priv_obj.queue,func) && typeof(priv_obj.queue[func])==='function' && priv_obj.queue[func]===uniqueIdIn){delete priv_obj.queue[func];did_del=true;}}}
            else{
                for(var q in priv_obj.queue){if(utils.obj_valid_key(priv_obj.queue,q) && priv_obj.queue[q]===uniqueIdIn){delete priv_obj.queue[func];did_del=true;}}}

        	if(did_del){priv_obj.queue=utils.array_redex(priv_obj.queue);}
            else if(!self.silent){console.error("[c0re] Remove Identifier"+(typeof(uniqueIdIn)==='string'?" '"+uniqueIdIn+"'":'')+" not found.");}
        };
        c0re.prototype.task_result=function(){
            var self=this;

            self.hook_ins.icallback('task_result',{'events':events,'callbacks':callbacks,'res':res,'next':nextFunc,'debug':debugVar},function(nArgs){
                nextFunc=nArgs.next;
                events=nArgs.events;//debugVar=nArgs.debug;
            });
        };
        c0re.prototype.xxxxxx=function(){
            var self=this;
        };



    }

    return c0re;
}

function fpsHandler(fpsIn){
	this.fps=fpsIn;
	this.large_cycle_id=false;
	this.request_animation_id=false;
	this.callback_queue=[];
	this.once_queue=[];
	this.start_large_cycle();
}
fpsHandler.prototype.add_callback=function(func){
	this.callback_queue.push(func);
};
fpsHandler.prototype.add_once_callback=function(func){
	this.once_queue.push(func);
};
fpsHandler.prototype.remove_callback=function(func){
	var did_delete=false;
	for(var r=0;r<this.callback_queue.length;r++){
		if(this.callback_queue[r]===func){
			did_delete=true;
			delete this.callback_queue[r];
			break;
		}
	}
	if(did_delete){this.callback_queue=utils.array_redex(this.callback_queue);}
	return did_delete;
};
fpsHandler.prototype.change_fps=function(fpsIn){
	this.stop_large_cycle();
	this.fps=fpsIn;
	this.start_large_cycle();
};
fpsHandler.prototype.stop_large_cycle=function(){
	if(this.large_cycle_id!==false){clearInterval(this.large_cycle_id);}
	if(this.request_animation_id!==false){cancelAnimationFrame(this.request_animation_id);}
};
fpsHandler.prototype.start_large_cycle=function(){
	var self=this;
	self.large_cycle_id=setInterval(function(){
		try{
			self.request_animation_id=requestAnimationFrame(function(){
                if(self.request_animation_id!==false){cancelAnimationFrame(self.request_animation_id);}
				self.request_animation_id=false;
				if(self.once_queue.length>0){
					for(var z=0;z<self.once_queue.length;z++){
						if(typeof(self.once_queue[z])=='function'){
							var tmp_func=self.once_queue[z].bind(self);
							tmp_func.apply(self);}}
					self.once_queue=[];}
				if(self.callback_queue.length<=0){return;}
				for(var z=0;z<self.callback_queue.length;z++){
					if(typeof(self.callback_queue[z])=='function'){
						var tmp_func=self.callback_queue[z].bind(self);
						tmp_func.apply(self);}}
			});
		}catch(e){
			try{
				console.warn('Could not run request animation frame');
			}catch(eConsole){
			}
		}
	},(1000/self.fps));
};
