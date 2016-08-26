//delete after confirming migration
module.exports = function(mysql, _, utils, merge){
    return require('./genDB')(mysql, _, utils, merge);
};
