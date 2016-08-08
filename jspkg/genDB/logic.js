
module.exports = function( _, utils, merge){//dependancies
    //private dependancies
    var GLaDioS=require('../GLaDioS')(_, utils, merge);

    function logic(opts){
        if(!opts){opts={};}

        var schema={
                'prime_arg': false,// mixed|xxx - first argument
                'is_alias': false, //true|false - will flag to ignore col_name cross reference
                'is_bypass': false, //true|false - will flag to just inject a where
                'where_logical_op': false, //refer validate_logic_op function
                'where_val': false //refer validate_logic_op function
            };

        //private variables - need to be objects
        var operator_index={
            'like':{'base':'LIKE','not':'NOT LIKE','args':false}, //LIKE, NOT LIKE
            'like_binary':{'base':'LIKE BINARY','not':'NOT LIKE BINARY','args':false}, // LIKE BINARY, NOT LIKE BINARY
            'between':{'base':'BETWEEN','not':'NOT BETWEEN','args': 2}, // BETWEEN, NOT BETWEEN //arg1 AND arg2 wrap in ()'s recommended
            'equal':{'base':'=','args':false}, // equal to
            'not_equal':{'base':'!=','alts':['<>'],'args':false}, // not equal
            'null_safe_equal':{'base':'<=>','args':false}, // NULL-safe equal to operator
            'greaterthan':{'base':'>','args':false}, // greater than
            'greaterthan_equal':{'base':'>=','args':false}, // greater or equal than
            'lesserthan':{'base':'<','args':false}, // lesser than
            'lesserthan_equal':{'base':'<=','args':false}, // lesser or equal than
            'is':{'base':'IS','not':'IS NOT','args':false}, // IS
            'is_null':{'base':'IS NULL','not':'IS NOT NULL','alts':['ISNULL()'],'args':false}, // IS NULL
            'least':{'base':'LEAST()','args':'*'}, //get minimum - multi args (maximum is in MB)
            'greatest':{'base':'GREATEST()','args':'*'}, //get maximum - multi args (maximum is in MB)
            'interval':{'base':'INTERVAL()','args':'*'}, // INTERVAL() multi args (maximum is in MB) - first arg is 'base' - finds the next lowest number from the base
            'in':{'base':'IN()','not':'NOT IN()','args':'*'}, // IN()
            'strcmp':{'base':'STRCMP()','args':2} //STRCMP() 2 args, 3rd optional for character encoding
        };
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('operator_index', function(v){operator_index=merge(true,{}, operator_index, v);});
            this.__defineGetter__('operator_index', function(){return operator_index;});
        }else{
            Object.defineProperty(this, 'operator_index', {
            //'set': function(v){operator_index=merge(true,{}, operator_index, v);},//setter
            'get': function(){return operator_index;}//getter
            });
        }

        for(var s in schema){//set schema default
            if(utils.obj_valid_key(schema, s)){this[s]=schema[s];}}

        this.hook_ins=new GLaDioS(opts.hook_ins);
        if(!this.hook_ins.has('validate_args')){
            this.hook_ins.register('validate_args', '[LOGICBASE] When args require extra validation');}
    }
    logic.prototype.validate=function(logicObj, args){
        var self=this,
            result_data={};
        if(self.validate_logic_op(logicObj, result_data)){
            if(arguments.length<2 || (typeof(args)==='object' && !args.length>1)){
                throw new Error('[LOGICBASE] Raw String Injection is currently not allwed. Use second argument to pass an array.');
            }else if(!utils.obj_valid_key(result_data, 'index')){
                throw new Error('[LOGICBASE] Operator is not part of whitelist.');
            }else{
                return self.validate_logic_args(args, result_data.flat.key);
            }
        }
        return false;
    };


    logic.prototype.validate_logic_args=function(argsIn, logKey){
        var self=this,
            operator_index=self.operator_index;
        if(typeof(argsIn)!=='object'|| !(argsIn instanceof Array) || argsIn.length===0){throw new Error('[LOGICBASE] First argument must be an array.');return false;}
        else if(!utils.obj_valid_key(operator_index, logKey)){throw new Error('[LOGICBASE] Key \''+logKey+'\' not found in Operations List.');return false;}
        else if(operator_index[logKey].args===false && argsIn.length>1){throw new Error('[LOGICBASE] Operator \''+logKey+'\' only allows for single argument; recieved \''+argsIn.length+'\'.');return false;}

        var result=true;
        self.hook_ins.icallback('validate_args', {'logic_key':logKey,'result':result,'args':argsIn}, function(newArgs){
            result=newArgs.result;
            argsIn=newArgs.args;
        });

        return result;
    };

    logic.prototype.validate_logic_op=function(compIn, resultsObj){
        var self=this,
            result=false,
            clean_data={},
            clean_comp=self.clean_comp(compIn, clean_data),
            operator_index=self.operator_index,
            flat_index=self.flatten_operators();
        //iniate the debug var
        resultsObj=(typeof(resultsObj)==='undefined'?{}:resultsObj);
        resultsObj.cleaned_input=merge(true, {}, clean_data);

        for(var i in flat_index){
            if(utils.obj_valid_key(flat_index, i)){
                var focal_operator=merge(true, {}, self.operator_index[flat_index[i].key]);
                if(flat_index[i].comp_str===clean_comp){
                    result=true;
                    resultsObj.flat=merge(true, {}, flat_index[i]);
                    resultsObj.index=merge(true, {}, focal_operator);
                    break;
                }
                /*
                    flat_index[i];  flat_index[i].key;  flat_index[i].is_not;
                    flat_index[i].args;     flat_index[i].comp_str;*/
            }
        }

        return result;
    };
    logic.prototype.clean_comp=function(compIn,resultsObj){
        var self=this,
            not_regexp=new RegExp('^!(\\((.*)\\)$){0,1}'),
            not_word_regexp=new RegExp('^NOT(\\((.*)\\)$){0,1}'),// NOT|NOT()
            func_regexp=new RegExp('^[a-z0-9\-_]+\\((.*)\\)$','i'),
            is_not=false,
            is_func=false,
            output=compIn.replace(' ','');//.replace('/^!/','') utils.check_strip_last(, '()')
        resultsObj=(typeof(resultsObj)==='undefined'?{}:resultsObj);

        if(output.match(not_regexp)!==null){
            is_not=true;
            output=utils.check_strip_first(output,'!');
        }else if(output.match(not_word_regexp)!==null){
            is_not=true;
            output=utils.check_strip_first(output,'NOT');
        }
        if(output.indexOf('(')===0 && output.lastIndexOf(')')===output.length-1){//is wrapped? - unwrap!
            output=utils.check_strip_last(utils.check_strip_first(output,'('),')');}

        if(output.match(func_regexp)!==null){//matches function pattern
            is_func=true;
            output=output.substr(0, output.indexOf('('));//get
        }

        //populate details obj
        resultsObj.is_not=is_not;
        resultsObj.is_func=is_func;
        // \\populate details obj

        return output;
    };

    logic.prototype.flatten_operators=function(){
        var self=this,
            operator_index=self.operator_index,
            flat_schema={'key':false,'is_alt':false,'is_not':false,'args':false,'comp_str':false,'comp_data':false},
            output=[];
        for(var o in operator_index){
            if(utils.obj_valid_key(operator_index, o)){
                var default_op=merge(true,{},flat_schema),
                    clean_data={};

                default_op.key=o;
                default_op.comp_str=self.clean_comp(operator_index[o].base, clean_data);
                default_op.args=operator_index[o].args;
                default_op.comp_data=merge(true,{},clean_data);
                output.push(default_op);//push.output(merge(true,{},flat_schema));

                if(utils.obj_valid_key(operator_index[o], 'not')){//has negative version
                    var not_op=merge(true,{},default_op),
                        not_data={};
                    not_op.comp_str=self.clean_comp(operator_index[o].not, not_data);
                    not_op.is_not=true;
                    not_op.comp_data=merge(true,{},not_data);
                    output.push(not_op);
                }
                if(utils.obj_valid_key(operator_index[o], 'alts') && operator_index[o].alts.length>0){
                    for(var a=0;a<operator_index[o].alts.length;a++){
                        var alt_op=merge(true,{},default_op),
                            alt_data={};
                        alt_op.comp_str=self.clean_comp(operator_index[o].alts[a], alt_data);
                        alt_op.is_alt=true;
                        alt_op.comp_data=merge(true,{},alt_data);
                        output.push(alt_op);

                    }
                }
                // operator_index[o].base;
                // operator_index[o].not;
                // operator_index[o].args;
            }
        }
//console.log('output',output);
        return (output.length===0?false:output);
    };

    return logic;
}
