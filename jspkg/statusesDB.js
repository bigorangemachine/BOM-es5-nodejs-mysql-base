
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('GenDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'status', 'is_null': false, 'is_base': true, 'size': 255, 'val_type': 'string', 'key_type': 'index'});
        };
    function statusesDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'statuses':this.table_schema()});
        this.table_index.statuses.table_name='JIRAGIT-statuses';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    statusesDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    statusesDB.prototype.constructor=genericDB;

    statusesDB.prototype.xxxxxx=function(){
    }
    return statusesDB;
};
