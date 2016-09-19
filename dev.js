/*
    Any piece work should be written here.
*/

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
root_params.config=root_params.config+'.dev';
var config=require('./jspkg/configurator')(process, fs, root_params);
doc_root=root_params.doc_root;

var c0redP=require('Pourtals')(),
    rootThread=new c0redP(function(){
        process.exit();//nothing happens after this - except the event hadler
    }),
    ExitManager=require('./jspkg/exitManager')(root_params),
    exit_manager=new ExitManager(rootThread.do_exit.bind(rootThread));

var mysql_conn={},
    modulesDB={},
    repoModuleIndexDB={},
    repoTicketIndexDB={},
    statusesDB={},
    teamDB={},
    ticketPrefixIndexDB={},
    ticketsDB={},
    reposDB={};
// INIT CALLBACKS!
rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
    if(!config || config.db.type.toLowerCase()!=='mysql'){console.error('ONLY DEVELOPED FOR MYSQL');rootThread.do_exit();flagNegFunc();}
    if(!root_params.silent){console.log('rootThread DB SETTINGS: ',merge(true,{},config.db,{'user':vars.const_str.omitted,'pass':vars.const_str.omitted}));}
    mysql_conn = mysql.createConnection({
            //'debug':true,
            'database':config.db.db,
            'host': config.db.host,
            'user': config.db.user,
            'password': config.db.pass
        });
    mysql_conn.version=config.db.version;
    flagPosFunc();
});
rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
    console.log("[rootThread] MYSQL CONNECTION ATTEMPT");
    var connect_result=mysql_conn.connect(function(err){
        if(err){
            if(!root_params.silent){console.log("[rootThread] MYSQL CONNECTION ERROR ",err);}
            return flagNegFunc.apply(null,utils.convert_args(arguments));
        }
        return flagPosFunc.apply(null,utils.convert_args(arguments));
    });
    return connect_result;
});//,function(){console.log("POS!");},function(){console.log("NEG!");}
rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
    console.log("rootThread.on('init') 9000 priority");
    flagPosFunc();//flagNegFunc();
},{'priority':9000});
// \\ INIT CALLBACKS!



rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
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

    flagPosFunc();

});
//},{'priority':9000});



// EXIT CALLBACKS!
rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
    console.log("rootThread.on('exit') 9000 priority");
    mysql_conn.end(function(err){//The connection is terminated now
        if(err){
            if(!root_params.silent){console.log('===mysql_conn.end===',arguments);}
            flagNegFunc();
        }else{
            flagPosFunc();
        }
    });

},{'priority':9000});

rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
    if(!root_params.silent){
        console.log("\n\n\n================= do_terminate PID: "+process.pid+" =================","\n");}
    process.on('exit', function(code){
        if(!root_params.silent){
            console.log('===PROCESS process.on(\'exit\') EVENT===');
console.log("[rootThread] \n================= \\\\do_terminate PID: "+process.pid+" =================","\n\n");
        }
    });
    flagPosFunc();
},{'priority':1});
// \\ EXIT CALLBACKS!



rootThread.do_init();
