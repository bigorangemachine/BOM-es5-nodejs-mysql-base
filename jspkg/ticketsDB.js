
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('./genericDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'ticket_prefix_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
            this.add_schema({'col_name': 'ticket_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'unique'});
            this.add_schema({'col_name': 'status_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'foreign'});
            this.add_schema({'col_name': 'date_created', 'is_null': false, 'val_type': 'date', 'key_type': 'updatestamp'});
            this.add_schema({'col_name': 'date_modified', 'is_null': false, 'val_type': 'date', 'key_type': 'updatestamp'});
        };
    function ticketsDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'tickets':this.table_schema()});
        this.table_index.tickets.table_name='JIRAGIT-tickets';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    ticketsDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    ticketsDB.prototype.constructor=genericDB;

    ticketsDB.prototype.xxxxxx=function(){
    }
    return ticketsDB;
};
