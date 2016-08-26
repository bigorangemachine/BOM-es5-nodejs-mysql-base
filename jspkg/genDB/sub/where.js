//logic().and().sub().logic().and().logic() <- one day
module.exports = function(_, utils, merge){
    var md5=require('md5');

    //private dependancies
    var comparisonOp=require('./comparison')(_, utils, merge),
        where_schema=require('./logic')(_, utils, merge),
        GLaDioS=require('../../GLaDioS')(_, utils, merge);

    function whereChain(opts){
        opts=(typeof(opts)!=='undefined'?opts:{});
        var unique_id=(typeof(opts.unique_id)!=='undefined'?opts.unique_id:undefined),
            chain_schema={
                'schema_type': false,//string comp|where
                'sibling_id': false,//unique_id previous sibling id
                'unique_id': unique_id,// string - name your where segments
                'child_keys': [], //[ unique_id ]
                'schema': false //where_schema/comparisonOp
            };
        if(typeof(unique_id)!=='string' || (typeof(unique_id)==='string' && !utils.basic_str(unique_id))){
            throw new Error("[WHERECHAIN] Invalid 'unique_id' provided.");
        }else{
            for(var s in chain_schema){//transfer opts values
                if(utils.obj_valid_key(opts, s)){chain_schema[s]=opts[s];}}
        }
    }

    //statics
    var self_init=function(){
        };

    function whereBase(opts){
        opts=(typeof(opts)!=='undefined'?opts:{});
        var where_inst=where_schema,//private
            comparison_op_inst=comparisonOp,//private
            where_list=[],//private
            instance_validate=function(varIn, textName, whiteList){
                for(var w=0;w<whiteList.length;w++){
                    if(typeof( varIn.prototype[ whiteList[w] ] )!=='function'){
                        throw new Error("[WHEREBASE] Constructor: "+textName+" '"+varIn.prototype.constructor.name+"' is missing '"+whiteList[w]+"()'.");break;
                    }
                }
            };
        //transfer/validate
        where_inst=(typeof(opts.where_schema_instance)==='function'?opts.where_schema_instance:where_inst);
        comparison_op_inst=(typeof(opts.comparison_op_instance)==='function'?opts.comparison_op_instance:comparison_op_inst);
        instance_validate(where_inst, 'where_schema_instance', ['validate','build']);
        instance_validate(comparison_op_inst, 'comparison_op_instance', ['validate','build']);

        //private variables - need to be objects
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('where_inst', function(v){where_inst=merge(true,{}, where_inst, v);});
            this.__defineGetter__('where_inst', function(){return where_inst;});
        }else{
            Object.defineProperty(this, 'where_inst', {
                //'set': function(v){where_inst=merge(true,{}, where_inst, v);},//setter
                'get': function(){return where_inst;}//getter
            });
        }
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('comparison_op_inst', function(v){comparison_op_inst=merge(true,{}, comparison_op_inst, v);});
            this.__defineGetter__('comparison_op_inst', function(){return comparison_op_inst;});
        }else{
            Object.defineProperty(this, 'comparison_op_inst', {
                //'set': function(v){comparison_op_inst=merge(true,{}, comparison_op_inst, v);}//setter
                'get': function(){return comparison_op_inst;}//getter
            });
        }

        where_list.push=function(v){
            if(v instanceof whereChain){Array.prototype.push.apply(where_list,[v]);}
            else{throw new Error("[WHEREBASE] Pushing to where_list contains invalid value.");}
        };
        var where_list_unset=function(){
            where_list=[];
        };
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('where_list', function(v){where_list=v;});
            this.__defineGetter__('where_list', function(){return where_list;});
            this.__defineGetter__('where_list_unset', function(){return where_list_unset;});
        }else{
            Object.defineProperty(this, 'where_list', {
                'get': function(){return where_list;}//getter - break pass by reference
            });
            Object.defineProperty(this, 'where_list_unset', {
                'get': function(){return where_list_unset;}//getter - break pass by reference
            });
        }
//console.log('opts.hook_ins',opts.hook_ins);
        opts.hook_ins=(typeof(opts.hook_ins)!=='object'?{}:opts.hook_ins);
        this.hook_ins=new GLaDioS({
            'where_build': (typeof(opts.hook_ins.where_build)==='function'?opts.hook_ins.where_build:false)
        }, this);
//console.log('this.hook_ins',this.hook_ins.list(),'typeof(opts.hook_ins.where_build)',typeof(opts.hook_ins.where_build));
        this.hook_ins.change_text('where_build', '[WHEREBASE] When building a where statement');
    }
    whereBase.prototype.push=function(pushArg,uniqueId,childIds){//comparisonOp,whereObj
        var self=this,
            unique_id=(typeof(uniqueId)!=='string'?uniqueId:false);
//console.log('PUSH() ',arguments);
        if(arguments.length>1 && typeof(unique_id)!=='string'){throw new Error("[WHEREBASE] Push() 'uniqueId' must be a string.");return false;}//provided ID is invalid
        else if(arguments.length===1){//no unique id provided
            if(pushArg instanceof self.where_inst){unique_id='where-'+(self.where_list.length-1)+'-'+utils.getRandomInt(1, 9999);}
            else if(pushArg instanceof self.comparison_op_inst && arguments.length===1){unique_id='comparison-'+(self.where_list.length-1)+'-'+utils.getRandomInt(1, 9999);}
        }
        //deep validate pushArg
        var generic_msg="Push() 'pushArg' is not valid",
            output=new whereChain({'unique_id': unique_id}),
            focal_instance=false;
        output.schema=pushArg;//mergeing breaks typing - keep this!

        try{
            if(output.schema instanceof self.where_inst){
                focal_instance=self.where_inst;
                output.schema_type='where';
            }else if(output.schema instanceof self.comparison_op_inst){
                focal_instance=self.comparison_op_inst;
                output.schema_type='comp';
            }
            if(focal_instance===false){
                throw new Error(generic_msg);
                return false;
            }else{
                if(!output.schema.validate.apply(output.schema,[output.schema])){
                    throw new Error("[WHEREBASE] 'schema.validate()' returned invalid (false).");
                    return false;
                }
            }
        }catch(catchErr){
            focal_instance=false;//110% sure :D
            throw new Error("[WHEREBASE] "+generic_msg+'.'+(catchErr.toString().length>0?"\nReason:\n\'"+catchErr.toString()+'\'':''));
            return false;
        }

        var list_mod=self.where_list.length%2;//odd/even check
        if(focal_instance===false){//finally but gotta return false ^_^
            throw new Error("[WHEREBASE] Push() 'pushArg' is incorrect object. Must be '" +
                            self.comparison_op_inst.name+"' or "+"'"+self.where_inst.name+"'.\n" +
                            catchErr.toString());
            return false;
        }else if(!(output.schema instanceof self.where_inst) && list_mod===0){//even length!
            throw new Error("[WHEREBASE] Push() 'pushArg' is incorrect object. Must be " +"'"+self.where_inst.name+"' the next link in the logic chain. Provided '"+output.schema.constructor.name+"'.");
            return false;
        }else if(!(output.schema instanceof self.comparison_op_inst) && list_mod===1){//odd length!
            throw new Error("[WHEREBASE] Push() 'pushArg' is incorrect object. Must be " +"'"+self.comparison_op_inst.name+"' the next link in the logic chain. Provided '"+output.schema.constructor.name+"'.");
            return false;
        }

        //validate childIds
        if(typeof(childIds)==='object' && childIds.length>0){
            var existing_index=[];//build searchable list
            self.where_list.forEach(function(v, k, arr){if(typeof(self.where_list[k].unique_id)==='string'){existing_index.push(self.where_list[k].unique_id);}});
            for(var c=0;c<childIds.length;c++){
                if(_.indexOf(existing_index, childIds[c])===-1){throw new Error("[WHEREBASE] Push() 'childId': '"+childIds[c]+"' is not previously declared.");return false;}
                else{output.child_keys.push(childIds[c]);}
            }
        }
        //we're good!
        self.where_list.push(output);
        return output;
    };
    whereBase.prototype.schema=function(typeIn){
        var self=this,
            output={};
        if(typeof(typeIn)!=='string'){typeIn='where';}
        if(typeIn==='where'){ // new where_schema() aka new logic()
            output=new self.where_inst();

            if(typeof(output.hook_ins)==='object'){//has GLaDioS! (or similar API I would assume)
                output.hook_ins.add('validate',function(pkg){
                    if(pkg.result===false){return;}//we're not reverting failures
                    if(!(pkg.data_model instanceof self.where_inst)){
                        throw new Error('[WHEREBASE] Validating schema\' data model is not of type \''+self.where_inst.prototype.constructor.name+'\'.');
                        pkg.result=false;
                        return;}
                });
                output.hook_ins.add('build',function(pkg){
                    self.hook_ins.icallback('where_build',pkg);
                });
            }
        }else{ // new comparisonOp() aka new comparison()
            output=new self.comparison_op_inst();
        }
        return output;
    };
    return whereBase;
};
