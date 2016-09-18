//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    md5 = require('md5'),
    repeat = require('string.prototype.repeat'),//FOR EASY DEBUGGING :D
    JSON = require('JSON'),
    utils = require('bom-utils'),
    vars = require('bom-utils/vars');
//custom modules - for WIP
// var utils = require('./jspkg/utils'),
//     vars = require('./jspkg/vars');
//varaibles
var doc_root='',
    root_params={
        'silent':false,//actual settings
        'rootmodule':'',
        'config':'./config',
        'found_params':[]
    };
root_params.config=root_params.config+'.test';
var config=require('../configurator')(process, fs, root_params);
doc_root=root_params.doc_root;


var do_terminate=function(reportTrace){
        if(!root_params.silent){
            if(reportTrace){console.trace();}
            console.log("\n\n\n================= do_terminate PID: "+process.pid+" =================","\n");
        }
//console.log('===mysql_conn.end===',arguments);
        process.on('exit', function(code){
            if(!root_params.silent){
                console.log('===PROCESS process.on(\'exit\') EVENT===');
                console.log("\n================= \\\\do_terminate PID: "+process.pid+" =================","\n\n");
            }
        });
        process.exit();//nothing happens after this - except the event hadler
    },
    do_init=function(){//initalize
        //custom modules
        var subTests=require('./sub/tests')(),
            theModel=require('./sub/theModel')();

        var do_sets=[
            function(doNext){
                /*
                * !!!!!!!!!!!!!!!!!!!!!!!!!! TESTING THESE!!!!
                * theModel(doFunc)
                * theModel(doFunc,opts)
                * theModel(posFunc,negFunc,doFunc,opts)
                * theModel(posFunc,negFunc,doFunc,idleFunc,opts)
                */
                try{test1=new theModel(function(){});}
                catch(e){do_err("[theModel TEST] Could not build 'SINGLE ARG'\n"+e.toString());}

                doNext();
            },
            function(doNext){
                subTests.typical(doNext);
            }
        ];
        var binded_dos=[];
        for(var d=0;d<do_sets.length;d++){
            binded_dos.push((function(index){
                return function(){
                    do_sets[index]((binded_dos.length-1>index && typeof(binded_dos[index+1])==='function'?binded_dos[index+1]:do_terminate));//do_terminate(false);
                };
            })(d));
        }
        binded_dos[0]();
	};

do_init();
