


module.exports = function(_, utils, merge){//dependancies and parentOOP protoptype/classes
    var genericDBResultStatus=require('./resultModel')(_, utils, merge);


    function genericDBThrowResultStatus(resObj, statusModel, events, debug){
        /*
            new genericDBThrowResultStatus(
                    resObj, //arg0 'queryObj' -> mysql query object expected - indicate a failure with false
                    statusModel, //arg1 'status'
                    events, //arg2 'events'
                    debug //arg3 'debugBool'
            )
        */

        var expected_constructor='Query';
        this._res=(typeof(resObj)==='object' && resObj.constructor.name.toLowerCase()===expected_constructor.toLowerCase()?resObj:false);
        this.status=(statusModel instanceof genericDBResultStatus?statusModel:new genericDBResultStatus());
        this.events=(events instanceof Array?events:[]);
        this.do_debug=(debug===true?true:false);
        if(this._res===false && typeof(resObj)==='object'){throw new Error("[genericDBThrowResultStatus] 1st argument must be 'false' (boolean) or of constructor type '"+expected_constructor+"'.");}
    }
    genericDBThrowResultStatus.prototype.toString=function(){
        var self=this,types='';
        self.events.forEach(function(v,i,arr){types=types+(types.length>0?', ':'')+v.type;});
        return "[genericDBThrowResultStatus] EVENTS: [ "+types+" ]"+"\n\t"+self.status.toString();
    };
    genericDBThrowResultStatus.prototype.asApply=function(){
        var self=this;
        return [self._res, self.status, self.events, self.do_debug];
    };

    return genericDBThrowResultStatus;
}
