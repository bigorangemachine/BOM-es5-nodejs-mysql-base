var config={};
config.db = {'type':'mysql','user':'youruser','pass':'yourpass','host':'localhost','db':'yourdb','version':'5.6'
    //,'doc_root':'/your/path/to/project-name'//pm2 no cwd - if you use cwd you might need to specify your root
};

config.API={
    'endpoint':'https://api.website.com/v1/{account_num}/search?{searchkey}={val}',
    'api_key':'YOUR-API-KEY',
    'secret': 'YOUR-API-SECRET',
    'qs':'search',
    'account_num':'88888'
};

module.exports = config;
