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
        // var subTests=require('./sub/tests')(),
        //     theModel=require('./sub/theModel')();

        var do_sets=[
            function(doNext){
                modulesDB=require('./jspkg/modulesDB')(mysql_conn);
                repoModuleIndexDB=require('./jspkg/repoModuleIndexDB')(mysql_conn);
                repoTicketIndexDB=require('./jspkg/repoTicketIndexDB')(mysql_conn);
                statusesDB=require('./jspkg/statusesDB')(mysql_conn);
                teamDB=require('./jspkg/teamDB')(mysql_conn);
                ticketPrefixIndexDB=require('./jspkg/ticketPrefixIndexDB')(mysql_conn);
                ticketsDB=require('./jspkg/ticketsDB')(mysql_conn);
                reposDB=require('./jspkg/reposDB')(mysql_conn);

                var modules_db=new modulesDB(),
                    repo_module_index_db=new repoModuleIndexDB(),
                    repo_ticket_index_db=new repoTicketIndexDB(),
                    statuses_db=new statusesDB(),
                    team_db=new teamDB(),
                    ticket_prefix_index_db=new ticketPrefixIndexDB(),
                    tickets_db=new ticketsDB(),
                    repos_db=new reposDB();

                var find_func=repos_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] repos_db DONE",statusModel.identify());
                        tickets_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] tickets_db DONE",statusModel.identify());
                            ticket_prefix_index_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] ticket_prefix_index_db DONE",statusModel.identify());
                                team_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] team_db DONE",statusModel.identify());
                                    statuses_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] statuses_db DONE",statusModel.identify());
                                        repo_ticket_index_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] repo_ticket_index_db DONE",statusModel.identify());
                                            repo_module_index_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] repo_module_index DONE",statusModel.identify());
                                                modules_db.find({'id':1},function(resObj, statusModel, events){
console.log("[rootThread] modules DONE",statusModel.identify());
console.log("\n\n===================== -=ALL DONE-= =====================\n\n")
                                                    doNext();
                                                })();
                                            })();
                                        })();
                                    })();
                                })();
                            })();
                        })();
                    });
                find_func();
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
