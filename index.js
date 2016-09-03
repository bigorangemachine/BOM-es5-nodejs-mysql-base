//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    mysql = require('mysql'),//https://github.com/felixge/node-mysql/
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    md5 = require('md5'),
    repeat = require('string.prototype.repeat'),//FOR EASY DEBUGGING :D
    JSON = require('JSON'),
    utils=require('bom-nodejs-utils'),
    vars=require('bom-nodejs-utils/vars');
//custom modules
// var utils = require('./jspkg/utils'),vars = require('./jspkg/vars');
//varaibles
var doc_root='',
    root_params={
        'silent':false,//actual settings
        'config':'./config',
        'found_params':[]
    };

var config=require('./jspkg/configurator')(process, fs, root_params);
doc_root=root_params.doc_root;

config.API.endpoint=utils.parse_subtext(config.API.endpoint, {'account_num':config.API.account_num, 'searchkey':config.API.qs});
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
            console.log('Start APP! MySQL Dependent connection methods can now be called');
            do_terminate(false);
        });
	};

do_init();
