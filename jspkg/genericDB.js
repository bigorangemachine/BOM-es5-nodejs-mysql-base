//delete after confirming migration
module.exports = function(mysql){
    return require('./genDB')(mysql);
};
