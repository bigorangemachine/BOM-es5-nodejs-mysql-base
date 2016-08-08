
module.exports = function(_, utils, merge){
    //private dependancies
    var GLaDioS=require('../GLaDioS')(_, utils, merge);

    var self_init=function(schemaIn){//private scope
        var schema=this.schema();
        for(var s in schema){
            if(utils.obj_valid_key(schema, s)){this[s]=schema[s];}}
    };
    //statics
    var column_schema={
            'is_null': true,//boolean
            'is_base': false,//boolean
            'col_name': false,//string
            'size': 1,//number | [ number ] | [ list ]
            'val_type': 'boolean',// boolean|int|float|enum|string|date -> enum needs whitelist: this.size=[ list ];
            'key_type': false,//primary|foreign|unique|index|createstamp|updatestamp|false -> createstamp & updatestamp is for date only
            'convert':{
                'select': false, //adding to a select part of the query
                'where': false, //adding to the where part of the query
                'write': false //validating a write data set
            }
        };
    function columnSchema(opts){
        //this.xxxxx={'limit':{'row_count':(typeof(opts)!=='undefined' && typeof(opts.xxxxx)==='number'?opts.xxxxx:9000)}};
        var clean_schema=this.schema();
        for(var s in clean_schema){
            if(utils.obj_valid_key(clean_schema, s)){clean_schema[s]=(typeof(opts[s])!=='undefined' && utils.obj_valid_key(opts, s)?opts[s]:clean_schema[s]);}}

        if(!this.validate(clean_schema)){
            throw new Error("[COLUMNSCHEMA] Bad inital schema.");
        }else{
            self_init.apply(this, [clean_schema]);//start! self_int(opts) that passes the 'this' context through
        }
	};

    columnSchema.prototype.schema=function(){
        return merge(true, {}, column_schema);//break pass by reference
    };


    columnSchema.prototype.validate=function(schemaObj, errArr){
        var self=this,new_column={};
        if(typeof(errArr)!=='object'){errArr=[];}
        new_column=merge(true, {}, self.schema(), schemaObj);
        new_column.key_type=(typeof(new_column.key_type)==='string'?new_column.key_type.toLowerCase():new_column.key_type);
        new_column.val_type=(typeof(new_column.val_type)==='string'?new_column.val_type.toLowerCase():new_column.val_type);


        if(new_column.val_type==='boolean'){
            new_column.size=1;
        }else if(new_column.val_type==='int'){//-9223372036854775808 to 9223372036854775807 or 0 to 18446744073709551615 (max length of 20)
            new_column.size=(typeof(new_column.size)==='number'?new_column.size:20);
            if(typeof(new_column.size)!=='number'){errArr.push('int_size');throw new Error("[COLUMNSCHEMA] Table column type is int but size is not a number");return false;}
        }else if(new_column.val_type==='float'){//1 to 65 - decimal 0 to 30
            new_column.size=(typeof(new_column.size)==='number' || typeof(new_column.size)==='object'?new_column.size:[65,30]);
            if(typeof(new_column.size)!=='number' && typeof(new_column.size)!=='object'){errArr.push('float_size');throw new Error("[COLUMNSCHEMA] Table '"+new_column.col_name+"' column type is float but size is not a number or array");return false;}
            else if(typeof(new_column.size)==='object' && (new_column.size.length!=2 || typeof(new_column.size[0])!=='number' || typeof(new_column.size[1])!=='number')){errArr.push('float_size_type');throw new Error("[COLUMNSCHEMA] Table '"+new_column.col_name+"' column type is float but size is not a pair of numbers");return false;}
        }else if(new_column.val_type==='enum'){//I hate enums.... will do if necessary
            errArr.push('enums_dev');throw new Error("[COLUMNSCHEMA] Enums currently not built");return false;
        }else if(new_column.val_type!=='date' && _.indexOf(['createstamp', 'updatestamp'], new_column.key_type)!==-1){//date key type special conditions
            errArr.push('datestamp_type');throw new Error("[COLUMNSCHEMA] Key type '"+new_column.key_type+"' must be date. The val type '"+new_column.val_type+"' was provided for column '"+new_column.col_name+"'.");return false;
        }

        var key_type_whitelist=['primary', 'foreign', 'unique', 'index', 'createstamp', 'updatestamp'];
        new_column.key_type=(typeof(new_column.key_type)==='string' && _.indexOf(key_type_whitelist, new_column.key_type)===-1?false:new_column.key_type);
        return new_column;
    };
    return columnSchema;
}
