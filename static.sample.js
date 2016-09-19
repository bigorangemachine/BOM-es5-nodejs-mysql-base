
var mystatic={
    'myaccount':{
  "name": "TELUS My Account",
  "context": "/my-account",
  "css_libraries": [
    {
      "name": "library-ident",
      "repo": "git@github.com:username/library-ident.git",
      "branch": "master",
      "version": "1.0"
    }
  ],
  "release": {
    "repo": "git@github.com:username/library-release.git",
    "branches": {
      "staging": "staging",
      "production": "master"
    }
  },
  "modules": [
    {
      "name": "library-module-a",
      "repo": "git@github.com:username/library-module-a.git",
      "branch": "develop"
    },
    {
      "name": "library-module-b",
      "repo": "git@github.com:username/library-module-b.git",
      "branch": "develop"
    }
  ]
}
};


module.exports = mystatic;
