
module.exports = function(mysql){
    
    //private dependancies
    var genericDB=require('./genericDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'team_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
            this.add_schema({'col_name': 'ticket_prefix', 'is_null': false, 'is_base': true, 'size': 6, 'val_type': 'string'});
        };
    function ticketPrefixIndexDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'ticket_prefix_index':this.table_schema()});
        this.table_index.ticket_prefix_index.table_name='JIRAGIT-ticket_prefix_index';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    ticketPrefixIndexDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    ticketPrefixIndexDB.prototype.constructor=genericDB;

    ticketPrefixIndexDB.prototype.xxxxxx=function(){
    }
    return ticketPrefixIndexDB;
};
