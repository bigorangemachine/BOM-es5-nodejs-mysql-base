
module.exports = function(http, url, querystring, JSON, config){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    var NEW_RELIC_MAX_HTTP_LEN=8177,
        find_result_data_schema={'session_count':false,'load_time':false,'timewindowkey':false},
        find_result_schema={'success':false,'data':false,'response_json':false},
        self_init=function(){//private scope
        };
    function NRQL(opts){
        this.xxxxx={'limit':{'row_count':(typeof(opts)!=='undefined' && typeof(opts.xxxxx)==='number'?opts.xxxxx:9000)}};

        //private variables - need to be objects
        var NR_url_obj=opts.NR_url_obj;
        if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
            this.__defineGetter__('NR_url_obj', function(){return NR_url_obj;});
            this.__defineSetter__('NR_url_obj', function(v){NR_url_obj=merge(true,{}, NR_url_obj, v);});
        }else{
            Object.defineProperty(this, 'NR_url_obj', {
                'get': function(){return NR_url_obj;},//getter
                'set': function(v){NR_url_obj=merge(true,{}, NR_url_obj, v);}//setter
            });
        }

		self_init.apply(this);//start! self_init that passes the 'this' context through
	};
    //NRQL.prototype=Object.create(parentNRQL.prototype);
    //NRQL.prototype.parent=parentNRQL.prototype; // <- if you want to make super/parent class
    //this.parent.parent_function.call(this); <- then call it when you want to
    NRQL.prototype.find=function(dataObj,do_next){
        var uri_pattern=dataObj.URI_pattern;
var prez_hack='';
if(dataObj.properties_id===1){
    prez_hack=this.NR_url_obj.parse('{mytelusdomain} ');
}else if(dataObj.properties_id===2){
    prez_hack=this.NR_url_obj.parse('{telusdomain} ');
}else if(dataObj.properties_id===3){
    prez_hack=this.NR_url_obj.parse('{businessdomain} ');
}else if(dataObj.properties_id===4){
    prez_hack=this.NR_url_obj.parse('{telusmyaccount} ');
}
        var NRQL_query={
                'select':'SELECT average(duration) AS load_time, count(session) AS count_session FROM PageView ',
                'where':'WHERE appName=\''+ dataObj.NR_app_id +'\' AND ('+prez_hack+') ',// AND '+this.NR_url_obj.parse(uri_pattern)+'
                'since':'SINCE '
            };

        var insight_url_obj=url.parse(config.NR_API.insight_endpoint);
        if(config.NR_API.insight_endpoint.indexOf('?')!==-1){
            insight_url_obj.query=config.NR_API.insight_endpoint.split('?')[1];//don't parse my stuff!
        }
        var this_nrql=NRQL_query.select+NRQL_query.where+NRQL_query.since+dataObj.timewindow.NR_query,
            path_with_querystring=utils.parse_subtext(insight_url_obj.pathname+'?'+insight_url_obj.query, {'qsval':querystring.escape(this_nrql)});
//console.log('this_nrql ',this_nrql);
        if(path_with_querystring.length>NEW_RELIC_MAX_HTTP_LEN){
            throw new Error("NRQL exceeds length allowed by server. Proceeding will generate 414 http error");
            do_next(false);
            return;
        }
        var options = {
            headers: {
                'X-Query-Key': config.NR_API.insight_key
            },
            host: insight_url_obj.host,
            path: path_with_querystring,
            //port: (insight_url_obj.protocol.indexOf('https')===0?443:80),
            method: 'GET'
        };
//console.log('options',options);
        var req = http.request(options, function(res){
            var success=false,
                full_response='';
            res.setEncoding('utf8');
            res.on('data', function(chunk){
                full_response=full_response+chunk;
                success=true;
            });
            res.on('end', function(){
                if(success){
                    var response_data=JSON.parse(full_response),
                        found_count=false,
                        found_average=false;
console.log("\n==============\n",'this_nrql ',this_nrql,"\n\n");
                    for(var c=0;c<response_data.results.length;c++){//New relic gives the data back weird :P
console.log('c ',c,"\n",response_data.results[c]);
                        if(typeof(response_data.results[c].count)!=='undefined'){found_count=response_data.results[c].count;}
                        else if(typeof(response_data.results[c].average)!=='undefined'){found_average=response_data.results[c].average;}
                    }

                    do_next(merge(true,{},find_result_schema,{
                        'success':true,
                        'data':merge(true,{},find_result_data_schema,{'session_count':found_count,'load_time':found_average,'timewindowkey':dataObj.timewindow.keyname}),
                        'response_json':response_data
                    }));
                }else{
                    do_next(false);
                }
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message,"\n",e);
            do_next(false);
        });
        req.end();//close request

    };
    return NRQL;
}
