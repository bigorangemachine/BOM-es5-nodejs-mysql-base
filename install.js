/*
 * This should be a safe & non-desctructive install script!
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
    Pourtals = require('Pourtals')(),
    Paranoia = require('Pourtals/sub/c0re/Paranoia')(),
    utils = require('bom-utils'),
    vars = require('bom-utils/vars');
//custom modules - for WIP
var statics=statics=require('./static');
//     vars = require('./jspkg/vars');
//varaibles
var doc_root='',
    root_params={
        'silent':false,//actual settings
        'rootmodule':'',
        'config':'./config',
        'found_params':[]
    };
try{
    root_params.config=root_params.config;
    var config=require('./jspkg/configurator')(process, fs, root_params);
    doc_root=root_params.doc_root;
}catch(e){

    if(e.toString().toLowerCase().indexOf(('Invalid config filepath').toLowerCase())!==-1){
        console.log("Manual Steps Required: ");
            console.log("\t"+"1) Duplicate config.sample.js into config.js (config.dev.js and config.test.js for running dev.js and test.js) to use your API keys and Database credientals.");
            console.log("\t"+"2) Duplicate static.sample.js into static.js (static.dev.js and static.test.js for running dev.js and test.js) and populate your repo list.");
            console.log("\t"+"3) Take contents from '_dev/db.sql' and create the database");
            console.log("\t"+"4) Then run 'npm install'.");
    }else{
        throw new Error(e);
    }
    process.exit();
}

var c0redP=require('Pourtals')(),
    rootThread=new c0redP(function(){
        process.exit();//nothing happens after this - except the event hadler
    }),
    ExitManager=require('./jspkg/exitManager')(root_params),
    exit_manager=new ExitManager(rootThread.do_exit.bind(rootThread));
;
var mysql_conn={},
    modulesDB={},
    repoModuleIndexDB={},
    repoTicketIndexDB={},
    statusesDB={},
    teamDB={},
    ticketPrefixIndexDB={},
    ticketsDB={},
    reposDB={},
    modulesDB={},
    repoModuleIndexDB={},
    repoTicketIndexDB={},
    statusesDB={},
    teamDB={},
    ticketPrefixIndexDB={},
    ticketsDB={},
    reposDB={},
    dbList={};
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
});
// \\ INIT CALLBACKS!



rootThread.on('ready',function(pkg,flagPosFunc,flagNegFunc){

    modulesDB=require('./jspkg/modulesDB')(mysql_conn);
    repoModuleIndexDB=require('./jspkg/repoModuleIndexDB')(mysql_conn);
    repoTicketIndexDB=require('./jspkg/repoTicketIndexDB')(mysql_conn);
    statusesDB=require('./jspkg/statusesDB')(mysql_conn);
    teamDB=require('./jspkg/teamDB')(mysql_conn);
    ticketPrefixIndexDB=require('./jspkg/ticketPrefixIndexDB')(mysql_conn);
    ticketsDB=require('./jspkg/ticketsDB')(mysql_conn);
    reposDB=require('./jspkg/reposDB')(mysql_conn);
    dbList={
        'modules_db': new modulesDB({'silent':true}),
        'repo_module_index_db': new repoModuleIndexDB(),
        'repo_ticket_index_db': new repoTicketIndexDB(),
        'statuses_db': new statusesDB(),
        'team_db': new teamDB(),
        'ticket_prefix_index_db': new ticketPrefixIndexDB(),
        'tickets_db': new ticketsDB(),
        'repos_db': new reposDB()
    };

    flagPosFunc();

});

rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
    if(!root_params.silent){console.log("Installing....");}
    flagPosFunc();
});
rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
    if(typeof(statics)!=='object'){
        if(!root_params.silent){console.log("No statics var!");}
        flagNegFunc();
    }else{
        var ParanoiaTask=new Paranoia(flagPosFunc, {'pool_size':50}),
            agg_func=function(v,i,arr){
                var reponame=v.repo;
                if(!root_params.silent){console.log("Looking for '"+reponame+"'.");}
                ParanoiaTask.enqueue(function(p,pos,neg){
                    if(!root_params.silent){console.log("Looking for '"+reponame+"'.");}
                    var do_find=dbList.modules_db.find({'module':reponame},function(resObj, statusModel){//is it there?
                        var identifyresult=statusModel.identify();//store for optimization (function sorts through arrays)
                        if(identifyresult.status==='norows'){//not there!
                            if(!root_params.silent){console.log("\t'"+reponame+"' was not found. Attempting to write.");}
                            var do_append=dbList.modules_db.append({'module':reponame},function(appResObj, appStatusModel){
                                if(appStatusModel.identify().status==='write'){
                                    if(!root_params.silent){console.log("\t'"+reponame+"' ADDED.\n");}
                                    pos();}//promise callback
                                else{
                                    if(!root_params.silent){console.log("Repo '"+reponame+"' could not be written.");}
                                    neg();}//promise callback
                            });
                            do_append();
                        }else if(identifyresult.status==='error'){
                            neg();}//promise callback
                        else {
                            pos();}//promise callback
                    });
                    do_find();
                });
            };
        for(var k in statics.repos){
            if(utils.obj_valid_key(statics.repos,k)){
                statics.repos[k]['modules'].forEach(agg_func);
                statics.repos[k]['css_libraries'].forEach(agg_func);
            }
        }
        ParanoiaTask.execute();
    }
});
rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
    if(!root_params.silent){console.log("Completed Installation.");}
    flagPosFunc();
});



// EXIT CALLBACKS!
rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
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
