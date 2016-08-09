
module.exports = function(_, utils, merge, md5){

    //private dependancies
    var comparisonOp=require('./comparison')(_, utils, merge),
        where_schema=require('./logic')(_, utils, merge);

    //statics
    var self_init=function(){
        };

    function whereBase(opts){
        opts=(typeof(opts)!=='undefined'?opts:{});
        var where_inst=where_schema,//private
            comparison_op_inst=comparisonOp,//private
            where_list=[],//private
            instance_validate=function(varIn, textName, whiteList){
                for(var w=0;w<whiteList.lengh;w++){
                    if(typeof(varIn[whiteList[w]])!=='function'){
                        throw new Error("[WHEREBASE] Constructor: "+textName+" '"+varIn.constructor.name+"' is missing '"+whiteList[w]+"(schema)'.");break;
                    }
                }

            };
        if(typeof(opts)!=='undefined'){
            where_inst=(typeof(opts.where_schema_instance)==='function'?opts.where_schema_instance:where_inst);
            comparison_op_inst=(typeof(opts.comparison_op_instance)==='function'?opts.comparison_op_instance:comparison_op_inst);
            instance_validate(where_inst, 'where_schema_instance', ['validate']);
            instance_validate(comparison_op_inst, 'comparison_op_instance', ['validate']);
        }

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

        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('where_list', function(v){where_list=v.concat([]);});
            this.__defineGetter__('where_list', function(){return where_list.concat([]);});
        }else{
            Object.defineProperty(this, 'where_list', {
                //'set': function(v){where_list=v.concat([]);}//setter
                'get': function(){return where_list.concat([]);}//getter - break pass by reference
            });
        }
    }
    whereBase.prototype.push=function(pushArg,uniqueId,childIds){//comparisonOp,whereObj
        var self=this,
            unique_id=(typeof(uniqueId)!=='string'?uniqueId:false),
            append_schema={
                'schema_type': false,//string comp|where
                'sibling_id': false,//unique_id previous sibling id
                'unique_id': unique_id,// string - name your where segments
                'child_keys': [], //[ unique_id ]
                'schema': false //where_schema/comparisonOp
            };
        if(arguments.length>1 && typeof(unique_id)!=='string'){throw new Error("[WHEREBASE] Push() 'uniqueId' must be a string.");return false;}//provided ID is invalid
        else if(arguments.length===1){//no unique id provided
            if(pushArg instanceof self.where_inst){unique_id='where-'+(self.where_list.length-1)+'-'+utils.getRandomInt(1, 9999);}
            else if(pushArg instanceof self.comparison_op_inst && arguments.length===1){unique_id='comparison-'+(self.where_list.length-1)+'-'+utils.getRandomInt(1, 9999);}
        }
        //deep validate pushArg
        var generic_msg="Push() 'pushArg' is not valid",
            output=merge(true,{}, append_schema),
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

        if(focal_instance===false){//finally but gotta return false ^_^
            throw new Error("[WHEREBASE] Push() 'pushArg' is incorrect object. Must be '" +
                            self.comparison_op_inst.name+"' or "+"'"+self.where_inst.name+"'.\n" +
                            catchErr.toString());
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
console.log('wherebase Schema() - test');
            output=new self.where_inst();

            if(typeof(output.hook_ins)==='object'){//has GLaDioS! (or similar API I would assume)
                output.hook_ins.add('validate_args',function(pkg){
console.log('- output.hook_ins(validate_args)');
                    var arr=pkg.args,found=false;
                    for(var a=0;a<arr.length;a++){
                        if(arr[a] instanceof self.where_inst){
                            found=true;break;}}
                    pkg.result=found;
                    if(found===false){
                        throw new Error('[WHEREBASE] Validating Arguments for key \''+logKey+'\' does not contain a valid column.');
                    }
                });
            }
        }else{ // new comparisonOp() aka new comparison()
            output=new self.comparison_op_inst();
        }
        return output;
    };
    return whereBase;
};
