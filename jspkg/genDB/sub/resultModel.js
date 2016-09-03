
module.exports = function(){//dependancies
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    function genericDBResultStatus(opts){
        if(!opts){opts={};}
        var status_schema={
                'is_success':false,
                'status': 'fail', //has rows/error! Give the rows/error!
                'info': false
            };
        for(var s in status_schema){//set status_schema default
            if(utils.obj_valid_key(status_schema, s)){this[s]=typeof(opts[s])!=='undefined'?opts[s]:status_schema[s];}}
        this.is_success=(this.status.toLowerCase()!=='fail'?true:this.is_success);
        this.status=(this.is_success===true?'success':'fail');
    }
    genericDBResultStatus.prototype.toString=function(){
        var self=this;
        return "[genericDBResultStatus] "+(self.is_success?'TRUE':'FALSE');
    };

    return genericDBResultStatus;
}
