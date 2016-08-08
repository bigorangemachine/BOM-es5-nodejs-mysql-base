
module.exports = function(_, utils, merge){

    function comparision_schema(){
        var schema={
            'comparison_op': false //AND|OR|!AND|AND NOT|!OR|OR NOT|XOR defaults to AND
        };
        for(var s in schema){
            if(utils.obj_valid_key(schema, s)){this[s]=schema[s];}}
    }
    comparision_schema.prototype.validate=function(compIn){//AND|OR|!AND|AND NOT|!OR|OR NOT|XOR defaults to AND
        var self=this,
            whitelist=['AND','!AND','AND NOT','OR','!OR','OR NOT','XOR'],
            negs_list=['!AND','AND NOT','!OR','OR NOT'];
        if(!compIn){compIn='AND';}
        else if(typeof(compIn)==='string'){compIn=compIn.toUpperCase().trim();}
        if(typeof(compIn)!=='string' || (typeof(compIn)==='string' && _.indexOf(whitelist, compIn)===-1)){throw new Error("[COMPARISION:comparision_schema] Invalid comparision operator. Expected values are '"+utils.check_strip_last(whitelist.join(', '), ', ')+"'.");return false;}

        return (_.indexOf(negs_list, compIn)!==-1 && compIn.indexOf('!')===0?utils.check_strip_first(compIn,'!')+' NOT':compIn);
    };


    var self_init=function(){//private scope

    };

    //statics
    //var schema={'some':'thing','foo':'bar'};

    function comparision(opts){
        if(!opts){opts={};}

        //this.xxxxx={'limit':{'row_count':(typeof(opts)!=='undefined' && typeof(opts.xxxxx)==='number'?opts.xxxxx:9000)}};
		self_init.apply(this);//start! self_init that passes the 'this' context through
	};
    comparision.prototype.validate_comparison_op=function(compIn){
        var self=this;
    };
    comparision.prototype.schema=function(){
        return new comparision_schema();
    };

    return comparision;
}
