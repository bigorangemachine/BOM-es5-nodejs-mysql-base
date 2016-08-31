
//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    mysql = require('mysql'),//https://github.com/felixge/node-mysql/
    fs = require('fs');
//custom modules
var utils = require('../utils'),
    vars = require('../vars');
//varaibles
var doc_root='',
    root_params={
        'silent':false,//actual settings
        'rootmodule':'',
        'config':'./config',
        'found_params':[]
    };
var config=require('../configurator')(process, fs, _, utils, root_params);
doc_root=root_params.doc_root;

if(!config || config.db.type.toLowerCase()!=='mysql'){console.error('ONLY DEVELOPED FOR MYSQL');process.exit();}
if(!root_params.silent){console.log('DB SETTINGS: ',merge(true,{},config.db,{'user':vars.const_str.omitted,'pass':vars.const_str.omitted}));}
var mysql_conn = mysql.createConnection({
        //'debug':true,
        'database':config.db.db,
        'host': config.db.host,
        'user': config.db.user,
        'password': config.db.pass
    });
mysql_conn.version=config.db.version;

var terminate_manifest=[], // {'obj_this': obj, 'func': 'func_name', 'args': [] } -> might need , 'sync_next': function(){}, 'next_arg': [null, null,{'next':true}, null]
    do_terminate=function(reportTrace){
        if(terminate_manifest.length>0){
            for(var t=0;t<terminate_manifest.length;t++){
                var task=terminate_manifest[t],
                    args=(typeof(task.args)==='object' && task.args.length>0?task.args:[]),
                    new_func=false,
                    valid_obj_prop=(utils.obj_valid_key(task,'obj_this') && typeof(task.obj_this)==='object'?true:false);

                if(valid_obj_prop && utils.obj_valid_key(task,'func') && typeof(task.func)==='string' && typeof(task.obj_this[task.func])==='function'){
                    new_func=task.obj_this[task.func].bind(task.obj_this);
                }else if(valid_obj_prop && (utils.obj_valid_key(task,'func') && typeof(task.func)==='function')){
                    new_func=task.func.bind(task.obj_this);
                }else if(typeof(task.func)==='function'){
                    new_func=task.func.bind(null);
                }
                if(new_func!==false){
                    new_func.apply(null,args);
                }
            }
        }
        if(!root_params.silent){
            if(reportTrace){console.trace();}
            console.log("\n\n\n================= do_terminate PID: "+process.pid+" =================","\n");
        }
		mysql_conn.end(function(err){/*The connection is terminated now*/
//console.log('===mysql_conn.end===',arguments);
            process.on('exit', function(code){
                if(!root_params.silent){
                    console.log('===PROCESS process.on(\'exit\') EVENT===');
                    console.log("\n================= \\\\do_terminate PID: "+process.pid+" =================","\n\n");
                }
            });
            process.exit();//nothing happens after this - except the event hadler
		});
    },
    do_init=function(){//initalize
        /*
            - start mysql
        */
		mysql_conn.connect(function(err) {
			if(err){
                console.error('MYSQL ERROR CONNECTING: ' + err.toString());//was err.stack - more detailed
                do_terminate(false);
                return;
            }

            //custom modules -  mysql dependent
            var genDB=require('../genDB')(mysql_conn, _, utils, merge),
                do_sets=[
                    function(){
                        try{tests.test_build_least(true);}
                        catch(e){throw new Error(e.toString());}

                        try{tests.test_build_least(false);}
                        catch(e){throw new Error(e.toString());}

                        try{tests.test_build_fail(true);}
                        catch(e){throw new Error(e.toString());}

                        try{tests.test_build_fail(false);}
                        catch(e){throw new Error(e.toString());}
                    },
                    function(){
                        try{tests.test_build_with_comp_op();}
                        catch(e){throw new Error(e.toString());}

                        try{tests.test_build_with_comp_op_fail();}
                        catch(e){throw new Error(e.toString());}
                    },
                    function(){
                        try{genDB_obj.find({'id':1},function(queryObj, status, eventsIn, debugVar){/*something?*/});}
                        catch(e){throw new Error(e.toString());}
                    }/*,
                    function(){
                        try{xxxxxxxxx}
                        catch(e){throw new Error(e.toString());}
                    }*/
                ];

            for(var d=0;d<do_sets.length;d++){

                var genDB_obj=new genDB(),
                    where_obj=genDB_obj.where_obj,
                    tests=require('./sub/tests')(genDB_obj, where_obj, _, utils, merge);
                (function(genericDB){
                    do_sets[d].apply();
                })(genDB);
            }

            do_terminate(false);//do this if blocking!
        });
	};

do_init();
