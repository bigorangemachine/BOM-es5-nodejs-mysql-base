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



// READY CALLBACKS!
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
        'repos_db': new reposDB({'silent':true}),
        'repo_module_index_db': new repoModuleIndexDB({'silent':true}),
        'repo_ticket_index_db': new repoTicketIndexDB(),
        'statuses_db': new statusesDB(),
        'team_db': new teamDB(),
        'ticket_prefix_index_db': new ticketPrefixIndexDB(),
        'tickets_db': new ticketsDB()
    };

    flagPosFunc();

});
// \\ READY CALLBACKS!


// START CALLBACKS!
var repo_module_index=[];
rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
    if(!root_params.silent){console.log("Installing....");}
    if(typeof(statics)!=='object'){
        if(!root_params.silent){console.log("No statics var!");}
        rootThread.do_exit();
        flagNegFunc();
    }else{
        flagPosFunc();
    }
});
rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
    var ParanoiaTask=new Paranoia(flagPosFunc, {'pool_size':50}),
        task_func=function(indexId,typeStr,inputStr,genDBObj,p,pos,neg){
            var data_obj={};
            data_obj[typeStr]=inputStr;
            if(!root_params.silent){console.log("Looking for "+typeStr+" '"+inputStr+"'.");}
            var do_find=genDBObj.find(data_obj,function(resObj, statusModel){//is it there?
                    var seek=false,
                        populate_result_index=function(seekKey,idIn){
                            if(typeStr==='module'){repo_module_index[seekKey].module.id=idIn;}
                            else if(typeStr==='repo'){repo_module_index[seekKey].repo.id=idIn;}
                        },
                        identifyresult=statusModel.identify();
                    for(var rkey=0;rkey<repo_module_index.length;rkey++){if(repo_module_index[rkey].ident===indexId){seek=rkey;break;}}
                    if(seek===false){throw new Error("repo_module_index could not find its unique id.");}
                    if(identifyresult.status==='norows'){//not there!
                        if(!root_params.silent){console.log("\tThe "+typeStr+" ''"+inputStr+"' was not found. Attempting to write.");}
                        var do_append=genDBObj.append(data_obj,function(appResObj, appStatusModel){
                            if(appStatusModel.identify().status==='write'){
                                if(!root_params.silent){console.log("\tThe "+typeStr+" '"+inputStr+"' ADDED.\n");}
//console.log("identifyresult: ",appStatusModel.identify());
                                populate_result_index(seek,appStatusModel.identify().inserted_id);
                                pos();}//promise callback
                            else{
                                if(!root_params.silent){console.log("The "+typeStr+" ''"+inputStr+"' could not be written.");}
                                neg();}//promise callback
                        });
                        do_append();
                    }else if(identifyresult.status==='dataset'){
//console.log("identifyresult: ",identifyresult);
                        populate_result_index(seek,identifyresult.rows[0].id);
                        pos();//promise callback
                    }
                    else{neg();}// promise callback

                });
            do_find();

        },
        module_func=function(uniID, modulename){
            ParanoiaTask.enqueue(function(p,pos,neg){
                task_func(uniID, 'module', modulename, dbList.modules_db, p, pos, neg);
            });
        },
        repo_func=function(uniID, reponame){
            ParanoiaTask.enqueue(function(p,pos,neg){
                task_func(uniID, 'repo', reponame, dbList.repos_db, p, pos, neg);
            });
        },
        agg_func=function(v,i,arr){
            var unique_str=md5(v.repo+'-'+v.name+'-'+i+new Date().toString()+'-'+utils.getRandomInt(100000, 999999));
            repo_module_index.push({'repo':{'name':v.repo,'id':false}, 'module':{'name':v.name,'id':false}, 'ident':unique_str});
            module_func(unique_str, v.name);
            repo_func(unique_str, v.repo);
        };
    for(var k in statics.repos){
        if(utils.obj_valid_key(statics.repos,k)){
            statics.repos[k]['modules'].forEach(agg_func);
            statics.repos[k]['css_libraries'].forEach(agg_func);
        }
    }
    ParanoiaTask.execute();
});
rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
//console.log("repo_module_index: ",repo_module_index);
    var ParanoiaTask=new Paranoia(flagPosFunc, {'pool_size':50}),
        task_func=function(dataObj,genDBObj,p,pos,neg){
            var typeStr='repo_module_index';
            if(!root_params.silent){console.log("Looking for "+typeStr+" '"+JSON.stringify(dataObj)+"'.");}
            var do_find=genDBObj.find(dataObj,function(resObj, statusModel){//is it there?
                    var identifyresult=statusModel.identify();
                    if(identifyresult.status==='norows'){//not there!
                        if(!root_params.silent){console.log("\tThe "+typeStr+" '"+JSON.stringify(dataObj)+"' was not found. Attempting to write.");}
                        var do_append=genDBObj.append(dataObj,function(appResObj, appStatusModel){
                            if(appStatusModel.identify().status==='write'){
                                if(!root_params.silent){console.log("\tThe "+typeStr+" '"+JSON.stringify(dataObj)+"' ADDED.\n");}
                                pos();}//promise callback
                            else{
                                if(!root_params.silent){console.log("The "+typeStr+" ''"+JSON.stringify(dataObj)+"' could not be written.");}
                                neg();}//promise callback
                        });
                        do_append();
                    }else if(identifyresult.status==='dataset'){
                        pos();//promise callback
                    }
                    else{neg();}// promise callback
                });
            do_find();

        };
    repo_module_index.forEach(function(v,i,arr){
        (function(val){
            var module_id=val.module.id,repo_id=val.repo.id;
            if(repo_id!==false && module_id!==false && repo_id===module_id){
                ParanoiaTask.enqueue(function(p,pos,neg){task_func({'repo_id':repo_id,'module_id':module_id}, dbList.repo_module_index_db, p, pos, neg);});}
        })(v);
        // v.ident;//{'repo':{'name':v.repo,'id':false}, 'module':{'name':v.name,'id':false}, 'ident':unique_str}
        // v.repo.name;
        // v.module.name;
    });
    ParanoiaTask.execute();
});
rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){//START THE EXIT!
    if(!root_params.silent){console.log("Completed Installation.");}
    flagPosFunc();
});

// \\ START CALLBACKS!


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
