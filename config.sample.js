var config={};
config.db = {'type':'mysql','user':'youruser','pass':'yourpass','host':'localhost','db':'yourdb','version':'5.6'
    //,'doc_root':'/your/path/to/project-name'//pm2 no cwd - if you use cwd you might need to specify your root
};

config.API={
    'githuboauth':'90909090909090909090909090909090',
    'jiraendpoint':'https://yourmainhost.atlassian.net/rest/api/2/{query}/',
    'api_key':'YOUR-API-KEY',
    'secret': 'YOUR-API-SECRET',
    'qs':'search',
    'account_num':'88888'
};
//https://yourmainhost.atlassian.net/rest/api/2/project
config.modulestatic=require('./static');

module.exports = config;
