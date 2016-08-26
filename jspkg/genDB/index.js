
module.exports = function(mysql, _, utils, merge){
    var md5=require('md5');

    var self_init=function(){
            var self=this;
            self.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            self.add_schema({'col_name': 'date_stamp', 'is_null': false, 'val_type': 'date', 'key_type': 'updatestamp'});

        var where_obj=new whereBase({'hook_ins':{'where_build': self.column_where_hook()}}),
            /*where_obj_set=function(v){//setter
                where_obj=v;},*/
            where_obj_get=function(){//getter
                return where_obj;};
        if(typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function')){//use pre IE9
            //this.__defineSetter__('where_obj', where_obj_set);
            this.__defineGetter__('where_obj', where_obj_get);
        }else{
            Object.defineProperty(this, 'where_obj', {
            //'set': where_obj_set,
            'get': where_obj_get
            });
        }
        };

    //statics
    var column_schema=require('./sub/column')(_, utils, merge),// sub-dependancies
        whereBase=require('./sub/where')(_, utils, merge),
        //\\ sub-dependancies
        GLaDioS=require('../GLaDioS')(_, utils, merge),
        table_schema={
            'table_name':false,
            'schema':[] //populated in self_init()
        };
    function genericDB(opts){
        if(!opts){opts={};}

        //variables/settings
        this.silent=(typeof(opts.silent)==='boolean'?opts.silent:false);
        this.allow_nolimit=true;
        this.sql_default={'limit':{'row_count':(typeof(opts.row_count)==='number'?opts.row_count:10)}};
        this.table_index=merge(true,{},{'sample_tbl':table_schema});
        this.table_index.sample_tbl.table_name='sample_tbl';
        this.exec_valid_query=(typeof(opts.exec_valid_query)==='boolean'?opts.exec_valid_query:false);

        self_init.apply(this);//start! self_init that passes the 'this' context through
    }

    genericDB.prototype.table_schema=function(){
        return merge(true,{},table_schema);
    };
    genericDB.prototype.add_schema=function(schemaObj, tableName){
        var self=this,new_column=self.column_schema_base(schemaObj);
        tableName=(typeof(tableName)!=='string'?self.main_table():tableName);
        if(!self.is_valid_table(tableName)){throw new Error("Table indicated ('"+tableName+"') was not found");return false;}
        if(typeof(self.table_index[tableName].schema)!=='object'){self.table_index[tableName].schema=[];}

        for(var s in schemaObj){//transfer schemaObj values
            if(utils.obj_valid_key(schemaObj, s)){new_column[s]=schemaObj[s];}}

        if(typeof(new_column.col_name)!=='string' || !utils.basic_str(new_column.col_name)){throw new Error("Column name is invalid");return false;}
        else if(utils.array_object_search(self.table_index[tableName].schema, 'col_name', new_column.col_name).length!==0){throw new Error("Column name '"+new_column.col_name+"' is already existing");return false;}
console.log('tableName',tableName,new_column.constructor.name);
        self.table_index[tableName].schema.push(new_column);
        return new_column;
    };
    genericDB.prototype.escape=function(valIn, colObj, tableName){
        var args=[];
        arguments.forEach(function(v,i,arr){args.push(v);});//safer to transfer
        this.escape_val.apply(this,args);
    };
    genericDB.prototype.escape_val=function(valIn, colObj, tableName){
        var self=this,
            output='',
            result=true;
        tableName=(typeof(tableName)!=='string'?self.main_table():tableName);
        try{
            output=self.clean_val(valIn, (typeof(colObj)==='string'?self.get_column(colObj, tableName):colObj));
        }catch(e){
            result=false;
            if(!self.silent){
                console.warn("[GENERICDB] escaping value generated errors. "+e.toString());
            }
        }
        if(result===false && ouput===false){throw new Error("[GENERICDB] could not clean input.");return false;}
        output=(output!==null?mysql.escape(output):'NULL');
        return output;
    };
    genericDB.prototype.is_valid_table=function(tableName){
        var self=this;
        if(!utils.obj_valid_key(self.table_index, tableName)){return false;}
        return true;
    };
    genericDB.prototype.main_table=function(){
        var self=this;
        return utils.array_keys(self.table_index)[0];
    };
    genericDB.prototype.column_schema_base=function(optsIn){
        var self=this;
        var opts=(typeof(optsIn)==='object'?optsIn:{});
        opts.silent=(typeof(opts.silent)==='boolean'?opts.silent:self.silent);
        return new column_schema(opts);
    };

    genericDB.prototype.column_schema_cols=function(typeIn, tableName){
        var self=this,output=[],whitelist=['primary','foreign','base','all','createstamp','updatestamp'];
        //whitelist.forEach(function(v,i,arr){whitelist[i]=v.toLowerCase();});// maybe needed later?!
        tableName=(typeof(tableName)!=='string'?self.main_table():tableName);
        if(!self.is_valid_table(tableName)){throw new Error("Table indicated was not found");return false;}
        if(_.indexOf(whitelist, typeIn.toLowerCase())===-1){typeIn='all';}//set a default
        typeIn=typeIn.toLowerCase();
        for(var k in self.table_index[tableName].schema){
            if(utils.obj_valid_key(self.table_index[tableName].schema, k)){
                if(typeIn==='base' && self.table_index[tableName].schema[k].is_base===true){
                    output.push(self.table_index[tableName].schema[k].col_name);
                }else if(typeIn==='primary' && self.table_index[tableName].schema[k].key_type==='primary'){
                    output.push(self.table_index[tableName].schema[k].col_name);
                }else if(typeIn==='foreign' && self.table_index[tableName].schema[k].key_type==='foreign'){
                    output.push(self.table_index[tableName].schema[k].col_name);
                }else if(typeIn==='createstamp' && self.table_index[tableName].schema[k].key_type==='createstamp'){
                    output.push(self.table_index[tableName].schema[k].col_name);
                }else if(typeIn==='updatestamp' && self.table_index[tableName].schema[k].key_type==='updatestamp'){
                    output.push(self.table_index[tableName].schema[k].col_name);
                }else{//if all
                    output.push(self.table_index[tableName].schema[k].col_name);
                }
            }
        }
        return output;
    };
    genericDB.prototype.get_column=function(colName, tableName){
        var self=this,output=[];

        tableName=(typeof(tableName)!=='string'?self.main_table():tableName);
        if(!self.is_valid_table(tableName)){throw new Error("Table indicated ('"+tableName+"') was not found");return false;}

        output=utils.array_object_search(self.table_index[tableName].schema, 'col_name', colName);

        return (output.length>0?output[0]:false);
    };
    genericDB.prototype.column_schema_select=function(colObj, tableName, dataObj){
        var self=this,output=[];
    };
    genericDB.prototype.column_schema_where=function(colObj, tableName, dataObj){
        var self=this,
            data_obj_schema={'additional_args':[]},
            col_obj=(typeof(colObj)==='string'?self.get_column(colObj, tableName):colObj);
        if(!(col_obj instanceof column_schema)){throw new Error('[GENERICDB] Validating Where scheam: 1st argument is invalid. Column cannot be found or is invalid type.');return false;}
        if(typeof(dataObj)!=='object'){dataObj=data_obj_schema;}
        for(var a=0, dos_keys=utils.array_keys(dataObj);a<dos_keys.length;a++){
            if(!utils.obj_valid_key(data_obj_schema,dos_keys[a])){
                throw new Error('[GENERICDB] Validating Where scheam: 3rd argument contains invalid key \''+dos_keys[a]+'\'.');return false;}
            else if(dataObj[ dos_keys[a] ]!==false && dataObj[ dos_keys[a] ].constructor!==data_obj_schema[ dos_keys[a] ].constructor){
                throw new Error('[GENERICDB] Validating Where scheam: 3rd argument key \''+dos_keys[a]+'\' is invalid. Expected type \''+data_obj_schema[ dos_keys[a] ].constructor.name+'\'.');return false;}
        }
        if(dataObj.additional_args.length>0){
            for(var a=0;a<dataObj.additional_args.length;a++){
                var cleaned={'result':true,'return':false};
                try{
                    cleaned.return=col_obj.clean(dataObj.additional_args[a]);
                }catch(e){
                    cleaned.result=false;
                }
                if(cleaned.result===true){dataObj.additional_args[a]=cleaned.return;}
            }
        }
    };
    genericDB.prototype.column_schema_write=function(colObj, tableName, dataObj){
        var self=this,output=[];
    };
    genericDB.prototype.column_where_hook=function(){//returns a binded function
        var self=this;
        //this is the hook for logic build - we're going to cause a problem if any of the values of the logic don't match type
        return function(pkg){//aka new logic().build() callback
//console.log('where_build callback!'+this.constructor.name);//this is genericDB
                if(pkg.result!==true){return;}//it already failed; we're not overriding
                var has_col_arg=false;
//console.log('genericDB log-build ',pkg);
                for(var a=0;a<pkg.args.length;a++){
                    if(pkg.args[a] instanceof column_schema){
                        has_col_arg=(has_col_arg===false?[]:has_col_arg);
                        has_col_arg.push(pkg.args[a]);
//console.log('has col arg! ',pkg.args[a]);
                    }
                }
//console.log('============ has_col_arg: '+(has_col_arg===false?'FALSE':has_col_arg));

                if(has_col_arg!==false){
                    for(var c=0;c<has_col_arg.length;c++){
                        var schema_result=true;
//console.log('has_col_arg[c].constructor ',has_col_arg[c] instanceof column_schema, 'column_schema ',column_schema);
                        try{
                            self.column_schema_where(has_col_arg[c], self.main_table(), {'additional_args':pkg.args});//colName, tableName, dataObj)
                        }catch(e){
                            schema_result=false;
                            pkg.fail_reason=pkg.fail_reason+(pkg.fail_reason.length>0?"\n":'')+e.toString();
                            throw new Error("[GENERICDB] Where build failed due to bad value type when used with '"+has_col_arg[c].col_name+"'.\nProvided Error: "+e.toString());
                        }
                        if(!schema_result){
                            pkg.result=false;
                            break;
                        }
                    }
                }
                pkg.result=(has_col_arg===false?false:pkg.result);
                pkg.prime_arg=(has_col_arg!==false?has_col_arg[0]:pkg.prime_arg);
                if(has_col_arg===false){
                    pkg.fail_reason=pkg.fail_reason+(pkg.fail_reason.length>0?"\n":'')+"No arguments provided contain a column.  One arg must be of type '"+column_schema.prototype.constructor.name+"'.";
                }
            }.bind(self);
    };

    genericDB.prototype.apply_callback=function(res, callbacks, next, debugVar){// { 'end':function(){},'result':function(row){},'fields':function(fields){},'error':function(err){} }
//console.log("\n\n\n\n++++++++++++++++++=====\n++++++++++++++++++=====apply_callback===++++++++++++++++++\n++++++++++++++++++\n\n\n\n");
        var self=this,
            args=[],
            bool_next=false,
            do_next=function(){
//console.log('NEXT CHECK ',typeof(next),' && ',bool_next);
                if(typeof(next)==='function' && bool_next===false){
                    if(arguments.length>0){
                        for(var i=0;i<arguments.length;i++){args.push(arguments[i]);};}
                    bool_next=true;//WORRIED ABOUT RACE CONDITION
                    next.apply(self,args);
                }
            };
        if(typeof(res)!=='object'){return false;}//no data
        if(typeof(callbacks)==='function'){callbacks={'callback':callbacks};}//if passed lazily
        if(typeof(next)==='function'){for(var i=0;i<arguments.length;i++){if(i!==2){/* ignore next */args.push(arguments[i]);}};}

        for(var k in callbacks){//callback system within
            if(k==='callback'){continue;}
            if(utils.obj_valid_key(callbacks,k) && !utils.obj_valid_key(callbacks,'on'+k)){
                if(k.toLowerCase().indexOf('on')!==0){//doesn't start with 'on'?!
                    callbacks['on'+k]=callbacks[k];
                }
            }
        }

        res.on('error', function(err) {
//console.log("\n\n\n\n++++++++++++++++++=====\n++++++++++++++++++      error      ++++++++++++++++++\n++++++++++++++++++\n\n\n\n");
            // Handle error, an 'end' event will be emitted after this as well
            if(typeof(callbacks)=='object' && (typeof(callbacks.onerror)==='function' || typeof(callbacks.callback)==='function')){
                if(typeof(callbacks.onerror)==='function'){
                    callbacks.onerror.apply(self,[res,err,debugVar]);
                }
                 if(typeof(callbacks.callback)==='function'){
                    callbacks.callback.apply(self,['error',res,err,debugVar]);
                }
            }
            do_next(err);
        })
        .on('fields', function(fields) {
//console.log("\n\n\n\n++++++++++++++++++=====\n++++++++++++++++++      fields      ++++++++++++++++++\n++++++++++++++++++\n\n\n\n");
            // the field packets for the rows to follow
            if(typeof(callbacks)=='object' && (typeof(callbacks.onfields)==='function' || typeof(callbacks.callback)==='function')){
                if(typeof(callbacks.onfields)==='function'){
                    callbacks.onfields.apply(self,[res,fields,debugVar]);
                }
                 if(typeof(callbacks.callback)==='function'){
                    callbacks.callback.apply(self,['fields',res,fields,debugVar]);
                }
            }
            do_next(fields);
    //        var the_args=[fields];
    //        for(var a=0;a<arguments.length;a++){the_args.push(arguments[a]);}
    //        do_next.apply(self,the_args);
        })
        .on('result', function(row) {
//console.log("\n\n\n\n++++++++++++++++++=====\n++++++++++++++++++      result      ++++++++++++++++++\n++++++++++++++++++\n\n\n\n");
    /*
            // Pausing the connnection is useful if your processing involves I/O
            mysql.pause();

            processRow(row, function() {
                mysql.resume();
            });
            */
            if(typeof(callbacks)=='object' && (typeof(callbacks.onresult)==='function' || typeof(callbacks.callback)==='function')){
                if(typeof(callbacks.onresult)==='function'){
                    callbacks.onresult.apply(self,[res,row,debugVar]);
                }
                 if(typeof(callbacks.callback)==='function'){
                    callbacks.callback.apply(self,['result',res,row,debugVar]);
                }
            }
            do_next(row);
        })
        .on('end', function() {
//console.log("\n\n\n\n++++++++++++++++++=====\n++++++++++++++++++      end      ++++++++++++++++++\n++++++++++++++++++\n\n\n\n");
            // all rows have been received
            if(typeof(callbacks)=='object' && (typeof(callbacks.onend)==='function' || typeof(callbacks.callback)==='function')){
                if(typeof(callbacks.onend)==='function'){
                    callbacks.onend.apply(self,[res,debugVar]);
                }
                 if(typeof(callbacks.callback)==='function'){
                    callbacks.callback.apply(self,['end',res,debugVar]);
                }
            }
            do_next();
        });
    };

    genericDB.prototype.find=function(dataObj,callbacks, doDebug){
        var self=this;
//console.log('dataObj',dataObj);
        if(typeof(dataObj)!=='object'){return false;}//no data
        if(typeof(callbacks)==='function'){callbacks={'callback':callbacks};}//if passed lazily
        var sql_select='SELECT ',
            count=0,
            w_count=0,
            select_cols=[];
        for(var c=0;c<self.table_index[tableName].length;c++){
            var key=self.table_index[tableName][c];
            if(utils.obj_valid_key(dataObj,key)){
                if(count!=0){sql_select=sql_select+', ';}
                sql_select=sql_select+'`sample_tbl`.'+ key +' AS '+key;
                select_cols.push(key);
                count++;
            }else if(utils.obj_valid_key(self.version_obj,key)){
                if(count!=0){sql_select=sql_select+', ';}
                sql_select=sql_select+'`sample_tbl`.'+ key +' AS '+key;
                select_cols.push(key);
                count++;
            }
        }
        if(count===0){return false;}
        //count=0;//reuse - do not reset!


        var base_keys=['id', 'version_id', 'response_code', 'url', 'cache_file', 'content_md5', 'get_vars','post_vars','method',
            'date_created', 'date_crawled', 'date_modified'],
            sql_from='FROM `sample_tbl` ',
            sql_where='';

        for(var c=0;c<self.table_index[tableName].length;c++){
            var key=self.table_index[tableName][c];
            if(_.indexOf(base_keys,key)!==-1 && _.indexOf(select_cols,key)===-1){//if base key and unused
                if(count!=0){sql_select=sql_select+', ';}
                sql_select=sql_select+'`sample_tbl`.'+ key +' AS '+key;
                select_cols.push(key);
                count++;
            }
            if(utils.obj_valid_key(dataObj,key) && _.indexOf(self.table_index[tableName],key)!==-1){
                if(typeof(dataObj[key])==='string' || typeof(dataObj[key])==='number'){
                    if(w_count!=0){sql_where=sql_where+'AND ';}
                    sql_where=sql_where+'`sample_tbl`.'+key+' = '+ mysql.escape(dataObj[key]) +' ';
                    w_count++;
                }else if(key==='version_id' && utils.obj_valid_key(self.version_obj,'id')){
                    if(w_count!=0){sql_where=sql_where+'AND ';}
                    sql_where=sql_where+'`sample_tbl`.'+key+' = '+ mysql.escape(self.version_obj[key]) +' ';
                    w_count++;
                }else if(typeof(dataObj[key])==='object' && dataObj[key] instanceof Array && dataObj[key].length>0){
                    if(w_count!=0){sql_where=sql_where+'AND ';}
                    sql_where=sql_where+'(';
                    for(var i=0;i<dataObj[key].length;i++){
                        if(typeof(dataObj[key][i])==='string' || typeof(dataObj[key][i])==='number'){
                            if(i!=0){sql_where=sql_where+' OR ';}
                            sql_where=sql_where+'`sample_tbl`.'+key+' = '+ mysql.escape(dataObj[key][i]);
                        }
                    }
                    sql_where=sql_where+') ';
                    w_count++;
                }else if(dataObj[key]===null){
                    w_count++;
                    continue;
                }
            }
        }
        if(w_count===0 || count===0){
console.log('====== sample_tbl ||| cont ZERO: w_count: '+w_count+'  count: '+count+'  =======');
            return false;}

        var row_count=(utils.obj_valid_key(dataObj,'limit') && typeof(dataObj.limit)==='object' && utils.obj_valid_key(dataObj.limit,'row_count')?dataObj.limit.row_count:self.sql_default.limit.row_count),
            sql_limit=self.build_limit(dataObj),
            sql_order_by=(utils.obj_valid_key(dataObj,'order_by')?'ORDER BY '+dataObj.order_by:'');// && _.indexOf(self.table_index[tableName], dataObj.order_by)!==-1 //utils.check_strip_last(utils.check_strip_last(dataObj.order_by,' DESC'),' ASC')
        sql_order_by=(utils.obj_valid_key(dataObj,'group_by')?'GROUP BY '+dataObj.group_by + ' ' + sql_order_by:sql_order_by);// && _.indexOf(self.table_index[tableName], dataObj.group_by)!==-1

        var sql_full=sql_select + ' ' + sql_from + (utils.basic_str(sql_where)?'WHERE '+ sql_where:'') + sql_order_by + (utils.basic_str(sql_limit)?' ' + sql_limit:'') + ';',
            result=mysql.query(sql_full);
    if(doDebug){console.log('===================================',"\n\t",'SQL: ',sql_full,"\n");}
        self.apply_callback(result,callbacks,function(res,cbs,arg){//res,cbs,arg - arguments supplied from apply_callback()
            for(var _args=[],a=0;a<arguments.length;a++){_args.push(arguments[a]);}
            if(typeof(callbacks.last)==='function'){callbacks.last.apply(self,_args);}//callbacks.last(this_arguments[0], ... ,this_arguments[ this_arguments.length-1 ]

            for(var _args=['last'],a=0;a<arguments.length;a++){_args.push(arguments[a]);}
            if(typeof(callbacks.callback)==='function'){callbacks.callback.apply(self,_args);}//callbacks.callback('last',this_arguments[0], ... ,this_arguments[ this_arguments.length-1 ]

        });
    };
    genericDB.prototype.validate_write=function(dataObj,errArr,doDebug){
        var self=this,
            valid_keys={//minimum requirements
                'version_id':undefined,
                'response_code':undefined,
                'url':undefined,
                'url_ident':undefined,
                'referer_header':undefined,//can be empty string -> ''
                'referer_stamp':undefined,
                'user_agent':undefined,//can be empty string -> ''
                //'cache_file':undefined,
                //'content_md5':undefined,
                'method':undefined
            };
        if(utils.obj_valid_key(dataObj,'id')){
            valid_keys=merge(true, {}, valid_keys, {'id':undefined});
        }
        var valid_key_count=0,
            valid_key_max=utils.array_keys(valid_keys).length;//count 'valid_keys'
        //cleaning up and processing values
        if(utils.obj_valid_key(valid_keys,'id')){
            if(parseInt(dataObj.id)>0 && !isNaN(parseInt(dataObj.id))){
                valid_key_count++;
                valid_keys.id=parseInt(dataObj.id);
            }else{
                errArr.push('[GENERICDB]id');}
        }
        if(utils.obj_valid_key(dataObj,'version_id') && parseInt(dataObj.version_id)>0 && !isNaN(parseInt(dataObj.version_id))){
            valid_key_count++;
            valid_keys.version_id=parseInt(dataObj.version_id);
        }else if(utils.obj_valid_key(self.version_obj,'id') && parseInt(self.version_obj.id)>0 && !isNaN(parseInt(self.version_obj.id))){//false is parseInt as NaN
            valid_key_count++;
            valid_keys.version_id=parseInt(self.version_obj.id);
        }else{
            errArr.push('[GENERICDB]version_id');
        }
        if(utils.obj_valid_key(dataObj,'response_code') && utils.basic_str(dataObj.response_code)){
            valid_key_count++;
            valid_keys.response_code=(typeof(dataObj.response_code)==='string'?dataObj.response_code:dataObj.response_code.toString());}
        else{
            valid_key_count++;
            valid_keys.response_code=self.response_codes['null'].code;}
        if(utils.obj_valid_key(dataObj,'url') && utils.basic_str(dataObj.url)){
            valid_key_count++;
            valid_keys.url=(typeof(dataObj.url)==='string'?dataObj.url:dataObj.url.toString());

            if(utils.obj_valid_key(dataObj,'url_ident') && utils.basic_str(dataObj.url_ident)){
                valid_key_count++;
                valid_keys.url_ident=(typeof(dataObj.url_ident)==='string'?dataObj.url_ident:dataObj.url_ident.toString());
            }else{
                valid_key_count++;
                valid_keys=merge(true,{},valid_keys,{'url_ident':'.'});
            }
    //		var tmp_url=url.parse((valid_keys.url_ident.substr(0,2)==='//'?'http://'+valid_keys.url_ident:valid_keys.url_ident));
//console.log('==== UNTESTED ===== ');
//console.log('========= tmp_url(from: '+(valid_keys.url_ident.substr(0,2)==='//'?'http://'+valid_keys.url_ident:valid_keys.url_ident)+') ',tmp_url);
//console.log('==== UNTESTED ===== ');
            valid_keys.url_ident=utils.url_chomp(valid_keys.url_ident);
        }else{
            errArr.push('[GENERICDB]url');
        }
        if(utils.obj_valid_key(dataObj,'referer_header') && (utils.basic_str(dataObj.referer_header) || dataObj.referer_header==='')){
            valid_key_count++;
            valid_keys.referer_header=(typeof(dataObj.referer_header)==='string'?dataObj.referer_header:dataObj.referer_header.toString());

            if(utils.obj_valid_key(dataObj,'referer_stamp') && utils.basic_str(dataObj.referer_stamp)){
                valid_key_count++;
                valid_keys.referer_stamp=(typeof(dataObj.referer_stamp)==='string'?dataObj.referer_stamp:dataObj.referer_stamp.toString());
            }else{
                valid_key_count++;
                valid_keys=merge(true,{},valid_keys,{'referer_stamp':md5(valid_keys.referer_header)});
            }
        }else{
            errArr.push('[GENERICDB]referer_header');
        }/*
        if(utils.obj_valid_key(dataObj,'cache_file') && utils.basic_str(dataObj.cache_file)){
            valid_key_count++;
            valid_keys.cache_file=(typeof(dataObj.cache_file)==='string'?dataObj.cache_file:dataObj.cache_file.toString());}
        if(utils.obj_valid_key(dataObj,'content_md5') && utils.basic_str(dataObj.content_md5)){
            valid_key_count++;
            valid_keys.content_md5=(typeof(dataObj.content_md5)==='string'?dataObj.content_md5:dataObj.content_md5.toString());}*/

        if(utils.obj_valid_key(dataObj,'user_agent') && (utils.basic_str(dataObj.user_agent) || dataObj.user_agent==='')){
            valid_key_count++;
            valid_keys.user_agent=(typeof(dataObj.user_agent)==='string'?dataObj.user_agent:dataObj.user_agent.toString());
        }else{
            errArr.push('[GENERICDB]user_agent');}
        if(utils.obj_valid_key(dataObj,'method') && utils.basic_str(dataObj.method)){
            valid_key_count++;
            valid_keys.method=(typeof(dataObj.method)==='string'?dataObj.method:dataObj.method.toString());
        }else{
            errArr.push('[GENERICDB]method');}

        if(!(valid_key_count>=valid_key_max)){//no validation keys found (white list)
            return false;}

        if(utils.obj_valid_key(dataObj,'cookie_vars')){
            if(utils.basic_str(dataObj.cookie_vars)){
                valid_keys.cookie_vars=dataObj.cookie_vars;}
            else{delete dataObj.cookie_vars;}
        }


        //transfer the values here so it doesn't get 'passed up' (pass by reference) accidentally
        for(var k in valid_keys){
            if(utils.obj_valid_key(valid_keys,k)){//valid object key (non-prototype)
                if(typeof(valid_keys[k])==='undefined'){continue;}
                dataObj[k]=valid_keys[k];//cleaned up
            }
        }
        // \\cleaning up and processing values
        return {'valid_key_count':valid_key_count, 'valid_keys':valid_keys, 'valid_key_max':valid_key_max};

    };
    genericDB.prototype.append=function(dataObj,callbacks,errArr,doDebug){
        var self=this,
            sql_insert='INSERT INTO `sample_tbl`(',
            sql_insert_vals=') VALUES (',
            sql_insert_end=');',
            sql_insert_safe='INSERT INTO `sample_tbl` SET ?',
            found=0;
        errArr=(typeof(errArr)!=='object'?[]:errArr);
        if(typeof(dataObj)!=='object'){return false;}//no data
        if(typeof(callbacks)==='function'){callbacks={'callback':callbacks};}//if passed lazily

        var valid_res=self.validate_write(dataObj,errArr,doDebug);
        if(valid_res===false){return false;}

        var has_modified=false,
            has_event=false;
        for(var k in dataObj){
            if(utils.obj_valid_key(dataObj,k)){//valid object key (non-prototype)
//if(k==='cookie_vars'){if(doDebug){console.log("K: ",k);}}
                if(_.indexOf(self.table_index[tableName],k)!==-1){//valid db table column name
//if(k==='cookie_vars'){if(doDebug){console.log("\tK: ",k, dataObj[k]);}}
                    var sql_val=dataObj[k];
                    has_modified=(k.toLowerCase()==='date_modified'?true:has_modified);
                    has_event=(k.toLowerCase()==='date_event'?true:has_event);
                    if(k.indexOf('date_')===0 && sql_val==='CURRENT_TIMESTAMP' && !self.mysql_55_hack(sql_val)){//5.6 likes current timestamp
                        sql_val=sql_val;}
                    else if(k.indexOf('date_')===0 && sql_val==='CURRENT_TIMESTAMP' && self.mysql_55_hack(sql_val)){//5.5 likes NOW()
                        sql_val='NOW()';}
                    else{
                        sql_val=mysql.escape(dataObj[k]);}
                    sql_insert=sql_insert+'`'+k+'`,';
                    sql_insert_vals=sql_insert_vals + sql_val+',';
                    found++;
                }
            }
        }

        if(found>0 && !has_modified && self.mysql_55_hack('CURRENT_TIMESTAMP')){//5.5 doesn'ts auto-update
            sql_insert=sql_insert+'`date_modified`,';
            sql_insert_vals=sql_insert_vals + 'NOW(),';
        }
        if(found>0 && !has_event && self.mysql_55_hack('CURRENT_TIMESTAMP')){//5.5 doesn'ts auto-update
console.log('append dataObj.url - has_event is true: ',dataObj.url);
            sql_insert=sql_insert+'`date_event`,';
            sql_insert_vals=sql_insert_vals + 'NOW(),';
        }else{
console.log('append dataObj.url - has_event is false: ',dataObj.url);
        }


        if(found>0){//valid keys found (white list)
            sql_insert=utils.check_strip_last(sql_insert,',') + utils.check_strip_last(sql_insert_vals,',') + sql_insert_end;
        }else{//no valid keys found (white list)
            errArr.push('[GENERICDB]write_found_0');
            return false;}
if(doDebug){console.log("SQL: ",sql_insert);}
        var result=mysql.query(sql_insert);

        self.apply_callback(result,callbacks,function(res,cbs,arg){//res,cbs,arg - arguments supplied from apply_callback()
            for(var _args=[],a=0;a<arguments.length;a++){_args.push(arguments[a]);}
            if(typeof(callbacks.last)==='function'){callbacks.last.apply(self,_args);}//callbacks.last(this_arguments[0], ... ,this_arguments[ this_arguments.length-1 ]

            for(var _args=['last'],a=0;a<arguments.length;a++){_args.push(arguments[a]);}
            if(typeof(callbacks.callback)==='function'){callbacks.callback.apply(self,_args);}//callbacks.callback('last',this_arguments[0], ... ,this_arguments[ this_arguments.length-1 ]

        });
    };
    genericDB.prototype.update=function(dataObj,callbacks,tableName,errArr,doDebug){
        var self=this;
        tableName=(typeof(tableName)!=='string'?self.main_table():tableName);
        if(!self.is_valid_table(tableName)){throw new Error("Table indicated ('"+tableName+"') was not found");return false;}
        var sql_update='UPDATE `'+tableName+'` SET ',
            sql_update_vals='',
            found=0;
        if(typeof(dataObj)!=='object'){return false;}//no data
        if(typeof(callbacks)==='function'){callbacks={'callback':callbacks};}//if passed lazily
console.log("\n\n========= genericDB.prototype.update =========\n\n");
        var valid_res=self.validate_write(dataObj,errArr,true);
        if(valid_res===false){return false;}

        var primary_keys=self.column_schema_cols('primary', tableName),
            foreign_keys=self.column_schema_cols('foreign', tableName);
        if(primary_keys!==false){
            for(var i=0;i<primary_keys.length;i++){
                if(!utils.obj_valid_key(dataObj, primary_keys[i].col_name)){
                    throw new Error("UPDATE must pass primary key such as '"+primary_keys[i].col_name+"'"+(primary_keys.length>1?" (or "+utils.check_strip_last(primary_keys.join(", "), ", ")+")":"")+".");
                    errArr.push('[GENERICDB]no_primary_keys');
                    return false;
                }
            }
        }else if(primary_keys===false && foreign_keys!==false){
            for(var i=0;i<foreign_keys.length;i++){
                if(!utils.obj_valid_key(dataObj, foreign_keys[i].col_name)){
                    throw new Error("UPDATE must pass foreign key such as '"+foreign_keys[i].col_name+"'"+(foreign_keys.length>1?" (or "+utils.check_strip_last(foreign_keys.join(", "), ", ")+")":"")+" if table has no primary key.");
                    errArr.push('[GENERICDB]no_foreign_keys');
                    return false;
                }
            }
        }

        var update_sep=', ',
            has_modified=false,
            update_cols=[],
            modify_dates=self.column_schema_cols('updatestamp', tableName);
        for(var k in dataObj){
            if(utils.obj_valid_key(dataObj,k)){//valid object key (non-prototype)
                var col_data=self.get_column(k, tableName);
                if(col_data===false || col_data.key_type==='primary' || col_data.key_type==='foreign'){continue;}

                if(utils.array_object_search(self.column_schema_cols('all', tableName), 'col_name', k).length>0){//valid db table column name
                    var sql_val=dataObj[k],
                        is_date=(self.table_index[tableName][k].val_type==='date'?true:false);
                    has_modified=(self.table_index[tableName][k].key_type==='updatestamp'?true:has_modified);

                    if(is_date===true && sql_val.toUpperCase()==='CURRENT_TIMESTAMP'){
                        sql_val=(self.mysql_55_hack(sql_val)?'CURRENT_TIMESTAMP':'NOW()');}
                    else{
                        sql_val=mysql.escape(dataObj[k]);}

                    sql_update_vals=sql_update_vals + '`'+k+'`=' + sql_val+update_sep;
                    update_cols.push(k);
                    found++;
                }
            }
        }
        if(found>0 && !has_modified && self.mysql_55_hack('CURRENT_TIMESTAMP')){//5.5 doesn'ts auto-update
            for(var i=0;i<modify_dates.length;i++){
                if(_.indexOf(update_cols, modify_dates[i].col_name)!==-1){continue;}
                sql_update_vals=sql_update_vals + '`'+modify_dates[i].col_name+'`=NOW()'+update_sep;
            }
        }

        if(found===0){//no valid keys found (white list)
            throw new Error("UPDATE data is invalid");errArr.push('[GENERICDB]update_found_0');return false;}
        //valid keys found (white list)
        var where_found=0,
            sql_where='WHERE ',
            where_sep=' AND ';//id=' + mysql.escape(dataObj.id)
        if(primary_keys!==false){
            for(var i=0;i<primary_keys.length;i++){
                if(i!==0){sql_where=sql_where+where_sep;}
                var this_col=primary_keys[i].col_name,
                    col_data=self.get_column(this_col, tableName);
                sql_where=sql_where+'`'+this_col+'`=' + self.escape_val(dataObj[this_col], this_col, tableName);
                where_found++;
            }
        }else if(primary_keys===false && foreign_keys!==false){
            for(var i=0;i<foreign_keys.length;i++){
                if(i!==0){sql_where=sql_where+where_sep;}
                var this_col=foreign_keys[i].col_name,
                    col_data=self.get_column(this_col, tableName);
                sql_where=sql_where+'`'+this_col+'`=' + self.escape_val(dataObj[this_col], this_col, tableName);
                where_found++;
            }
        }

        if(where_found===0){//no where keys found
            throw new Error("UPDATE data is invalid for WHERE statement");errArr.push('[GENERICDB]update_where_found_0');return false;}
        sql_update=sql_update + utils.check_strip_last(sql_update_vals,update_sep)+' '+sql_where + ';';

        if(doDebug){console.log("\n\n\t========= ========= genericDB.prototype.update \n\t",'sql_update ',sql_update,"\n\n");}

        //var final_func=self.apply_callback(mysql.query(sql_update), callbacks, self.query_last_result(callbacks,doDebug));
        var final_func=self.apply_callback.bind(self, mysql.query(sql_update), callbacks, self.query_last_result(callbacks,doDebug));
        if(self.exec_valid_query){
            final_func();
            return true;
        }else{
            return final_func;
        }
    };

    genericDB.prototype.query_last_result=function(callbacks,doDebug){
        var self=this;
        return function(res,cbs,arg){//res,cbs,arg - arguments supplied from apply_callback()
            for(var _args=[],a=0;a<arguments.length;a++){_args.push(arguments[a]);}
            if(typeof(callbacks.last)==='function'){callbacks.last.apply(self,_args);}//callbacks.last(this_arguments[0], ... ,this_arguments[ this_arguments.length-1 ]

            for(var _args=['last'],a=0;a<arguments.length;a++){_args.push(arguments[a]);}
            if(typeof(callbacks.callback)==='function'){callbacks.callback.apply(self,_args);}//callbacks.callback('last',this_arguments[0], ... ,this_arguments[ this_arguments.length-1 ]
        };
    };

    genericDB.prototype.build_limit=function(dataObj){
        var self=this,
            row_count=(utils.obj_valid_key(dataObj,'limit') && typeof(dataObj.limit)==='object' && utils.obj_valid_key(dataObj.limit,'row_count')?dataObj.limit.row_count:self.sql_default.limit.row_count),
            sql_limit=(utils.obj_valid_key(dataObj,'limit') && typeof(dataObj.limit)==='object'?'LIMIT ' + dataObj.limit.pos + ', ' + dataObj.limit.row_count:'');
        sql_limit=(utils.basic_str(sql_limit)?sql_limit:'LIMIT '+row_count);
        sql_limit=(utils.obj_valid_key(dataObj,'nolimit') && dataObj.nolimit===true && self.allow_nolimit?'':sql_limit);
        return sql_limit;
    };

    genericDB.prototype.mysql_55_hack=function(dateIn){//incomplete but basically a manual switch for now
        var self=this;
        return (mysql.version=='5.5' && dateIn.toUpperCase()==='CURRENT_TIMESTAMP'?true:false);
    };
    genericDB.prototype.validate_write=function(){
        var self=this;
    };
    genericDB.prototype.terminate=function(){
        var self=this;
    };
    return genericDB;
};
