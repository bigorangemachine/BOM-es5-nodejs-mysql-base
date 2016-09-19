
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('./genericDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'repo', 'is_null': false, 'is_base': true, 'size': 255, 'val_type': 'string', 'key_type': 'index'});
        };
    function reposDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'repos':this.table_schema()});
        this.table_index.repos.table_name='JIRAGIT-repos';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    reposDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    reposDB.prototype.constructor=genericDB;

    reposDB.prototype.xxxxxx=function(){
    }
    return reposDB;
};
