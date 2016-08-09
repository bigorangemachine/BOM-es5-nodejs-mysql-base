# GLaDioS.js

This is a 'blocking' javascript plugin/filter/hook feature to easily expand code features to improve seperator of concerns without a seperation of features.

Its recommended to take advantage of JavaScripts 'Pass by Reference' (or 'Copy of a Reference') of Objects (it'd be the same as using JavaScripts pub/sub functionality).  One way is highlight below in 'Argumentless callback' and 'Argumentful callback'.

## API
-----------
* `GLaDioS(` **options** *(object)* `)`: **Constructor Function**

*returns GLaDioS instance*: `options` contains index keys of the inital set of callbacks. All `options` callbacks are both pass through `GLaDios.register()` and `GLaDios.add()`

**Sample**: `myGLaDioS = new GLaDios({'init':function(argIn){}, 'destroy':function(argIn){});`

* `GLaDios.has(` **key** *(string)* `)`: **Check for provided key**

*returns boolean [true|false]*:  useful if you want to register a new callback.

* `GLaDios.has_callback(` **key** *(string)* `)`: **Check for callback of provided key**

*returns boolean [true|false]*:  useful if you want to know if there is an exisiting function.

* `GLaDios.register(` **key** *(string)*, **description** *(string)* `)`: **Register callback of key**

*returns boolean [true|false]*: Declare the callback.  Provide a description rather than a comment!

* `GLaDios.deregister(` **key** *(string)* `)`: **Unregister callback of key**

*returns boolean [true|false]*: Remove the callback group.

* `GLaDios.change_text(` **key** *(string)*, **description** *(string)* `)`: **Change description of key**

*returns boolean [true|false]*: Change the description text. Useful if you want to change the text from a constructor declared callback.

* `GLaDios.add(` *key** *(string)*, **callback** *( function(arg) )* `)`: **Add callback for registered key**

*returns boolean [true|false]*: Similar principle to bind/unbind (specifically bind). `callback` is repassed into `GLaDios.icallback()`'s 3rd argument function.

* `GLaDios.remove(` *key** *(string)*, **callback** *( function(arg) )* `)`: **Remove callback for registered key**

*returns boolean [true|false]*: Similar principle to bind/unbind (specifically unbind)

* `GLaDios.icallback(` *key** *(string)*, **argPackage** *(object), **callback** *( function(arg) )* `)` (readonly): **Execute callback set for registered key**

*returns boolean [true|false]*: Trigger all the callbacks specified for this group.  `callback` is provided a single argument which is `argPackage`.


## Notes on providing a callback
-----------
The single argument that is returned is intended to be changed by the other functions & callbacks.  If you are only passing a single object you own't need a callback at all (aka you want to keep your 'changeable variables' inside of one object or there is a single object that you may want changed) since they'll be changed through the intended process.
### Argumentful callback
Recommended usage; but highlights how 'pass by reference' is used.
```
var _args={'foo':foo, 'baz': baz};//index keys mimic scope variables that should be passed
myGLaDioS.icallback('init', _args, function(newArgs){
    //foo=newArgs.foo;//safely transfer back into scope - or don't!
    baz=newArgs.baz;
});
```

### Argumentless callback
Not recommended usage; but highlights how 'pass by scope' can be used.
```
var _args={'foo':foo, 'baz': baz},//index keys mimic scope variables that should be passed
    key_list=utils.array_keys(_args);//array_keys() captures array of object keys - security reasons do it here because eval() below
myGLaDioS.icallback('init', _args, function(){
    //_args is passed so it could contain new values - Convert them back into scope
    for(var kl=0;kl<key_list.length;kl++){var _vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}//populate into above scope -> LAZY! DANGEROUS!
});
```



## Sample Implementation
Sample Callback 'move_item': Establishing a hook within OOP Prototype Object
```
// prototype require module aka NodeJS ES5
var GLaDioS=require('./jspkg/GLaDioS')(_, utils, merge);

// prototype constructor
function charSprite(opts){
    opts.callbacks=(typeof(opts.callbacks)!=='object'?{}:opts.callbacks);
    this.callbacks=new GLaDioS({
        'move_item': (typeof(opts.callbacks.move_item)==='function'?opts.callbacks.move_item:false) // pass the object so it is registered or you will have to register yourself later
    });
}
//\\ prototype constructor
```
Implement icallback within Prototype
```
// In the prototype later
charSprite.prototype.move_item=function(keyIn, xInc, yInc){
    var self=this,
        is_collided=false,//do a look up!
        item_pos={'x_pos':0,'y_pos':0},//some defaults
        unique_id=self.find_sprite(keyIn);

    // do lookup, path finding, agility rules and processing stuff!!!
    // throw error or return false if something goes wrong?
    // ....

    //now provide filter interface
    ///////\\\\\\\\\\PLUGIN HOOK move_item\\\\\\\\/////////

    self.callbacks.icallback('move_item', {'is_collided':is_collided, 'item_pos':item_pos, 'unique_id':unique_id},  function(){
       is_collided=_args.is_collided;//transfer the values
       item_pos=_args.item_pos;
       unique_id=_args.unique_id;
    });
    ///////\\\\\\\\\\END PLUGIN HOOK move_item\\\\\\\\/////////

    return true;
};
//\\ In the prototype later
//\\ prototype require module aka NodeJS ES5
```

Sample Implementation 'move_item': hook into constructor creation of callback.
```
   // somewhere else -> Unit spawned
   Game.Sprites.push(new charSprite({'model':StealthPlane,'type':'aircraft','callbacks':{
           'move_item':function(pkgObj){//single argument!
               if(this.canFly(pkgObj.item_pos.x_pos, pkgObj.item_pos.y_pos)){
                   this.flyTo(pkgObj.item_pos.x_pos, pkgObj.item_pos.y_pos);}
               if(this.isStealth){
                   Game.Sprites.findRelated(unique_id).flyTo(pkgObj.item_pos.x_pos, pkgObj.item_pos.y_pos);//move ghost sprite
                   pkgObj.is_collided=false;//can't collide when stealthy
               }
           }
       }
   }));
   //\\ somewhere else -> Unit spawned
```

You can implement a temporary callback.
```
   // somewhere else -> Unit debuffed by special power
   var debuffed=Game.Sprites.find({'is_debuffed':true,'type':'aircraft','debuff_start':Game.thisFrameStamp});
   debuffed.forEach(function(v,i,arr){,
       var debuffed_aircraft_func=function(pkgObj){
           v.flyTo(pkgObj.item_pos.x_pos+rand(-10,10), pkgObj.item_pos.y_pos+rand(-10,10));//random movement!
       };
       v.callbacks.add('move_item',debuffed_aircraft_func);
       if(v.isStealth===true){
           v.isStealth=false;
           setTimeout(function(){
               v.setStealth(v.stealthRemaining);
               v.callbacks.remove('move_item',debuffed_aircraft_func);
           }, Game.frameIncrement * 12);
       }
   });
   //\\ somewhere else -> Unit debuffed by special power
```
