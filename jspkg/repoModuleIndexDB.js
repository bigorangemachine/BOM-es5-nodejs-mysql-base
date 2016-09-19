
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('./genericDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    
    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'repo_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
            this.add_schema({'col_name': 'module_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
        };
    function repoModuleIndexDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'repo_module_index':this.table_schema()});
        this.table_index.repo_module_index.table_name='JIRAGIT-repo_module_index';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    repoModuleIndexDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    repoModuleIndexDB.prototype.constructor=genericDB;

    repoModuleIndexDB.prototype.xxxxxx=function(){
    }
    return repoModuleIndexDB;
};
