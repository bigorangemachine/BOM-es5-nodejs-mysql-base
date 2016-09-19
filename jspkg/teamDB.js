
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('./genericDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'teamname', 'is_null': false, 'is_base': true, 'size': 255, 'val_type': 'string'});
        };
    function teamDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'team':this.table_schema()});
        this.table_index.team.table_name='JIRAGIT-team';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    teamDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    teamDB.prototype.constructor=genericDB;

    teamDB.prototype.xxxxxx=function(){
    }
    return teamDB;
};
