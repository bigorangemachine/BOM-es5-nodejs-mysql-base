
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('./genericDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'ticket_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
            this.add_schema({'col_name': 'repo_module_index_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
        };
    function repoTicketIndexDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'repo_ticket_index':this.table_schema()});
        this.table_index.repo_ticket_index.table_name='JIRAGIT-repo_ticket_index';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    repoTicketIndexDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    repoTicketIndexDB.prototype.constructor=genericDB;

    repoTicketIndexDB.prototype.xxxxxx=function(){
    }
    return repoTicketIndexDB;
};
