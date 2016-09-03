# GLaDioS.js

This is a 'blocking' javascript plugin/filter/hook feature to easily expand code features to improve separator of concerns without a separation of features.

Its recommended to take advantage of JavaScripts 'Pass by Reference' (or 'Copy of a Reference') of Objects (it'd be the same as using JavaScripts pub/sub functionality).  One way is highlight below in 'Argumentless callback' and 'Argumentful callback'.

## API
-----------
* `GLaDioS(` **options** *(object)*, **root** *(object)* `)`: *returns* `GLaDioS instance`

  **Constructor Function**

  `options` contains index keys of the initial set of callbacks. All `options` callbacks are both pass through `GLaDioS.register()` and `GLaDioS.add()`

  `root` *(optional)* the default 'this' when using ES5 `function.apply(this,[]);` (first argument in `function.apply`) when used in `GLaDioS.icallback()`.

  **Example**: `myGLaDioS = new GLaDioS({'init':function(argIn){}, 'destroy':function(argIn){}}, this);`

* `GLaDioS.has(` **key** *(string)* `)`: *returns* `boolean [true|false]`

  **Check for provided key**

  Useful if you want to register a new callback.

  **Example**: `myGLaDioS.has('init');`

* `GLaDioS.has_callback(` **key** *(string)* `)`: *returns* `boolean [true|false]`

  **Check for callback of provided key**

  Useful if you want to know if there is an existing function.

  **Example**: `myGLaDioS.has_callback('init');`

* `GLaDioS.register(` **key** *(string)*, **description** *(string)* `)`: *returns* `boolean [true|false]`

  **Register callback of key**

  Declare the callback.  Provide a description rather than a comment!

  **Example**: `myGLaDioS.register('loaded','When the element is finished loading media.');`

* `GLaDioS.deregister(` **key** *(string)* `)`: *returns* `boolean [true|false]`

  **Unregister callback of key**

  Remove the callback group.

  **Example**: `myGLaDioS.deregister('loaded');`

* `GLaDioS.change_text(` **key** *(string)*, **description** *(string)* `)`: *returns* `boolean [true|false]`

  **Change description of key**

  Change the description text. Useful if you want to change the text from a constructor declared callback.

  **Example**: `myGLaDioS.change_text('loaded','When the ajax is finished loading successfully.');`

* `GLaDioS.add(` **key** *(string)*, **callback** *( function(arg) )* `)`: *returns* `boolean [true|false]`

  **Add callback for registered key**

  Similar principle to bind/unbind (specifically bind). `callback` is repassed into `GLaDioS.icallback()`'s 3rd argument function.

  **Example**:
    ```
    var loaded_function=function(arg){arg.data.user_message = "Good day! " + arg.data.user_message;};

    myGLaDioS.add('loaded', loaded_function);
    ```

* `GLaDioS.remove(` **key** *(string)*, **callback** *( function(arg) )* `)`: *returns* `boolean [true|false]` key

  **Remove callback for registered key**

  Similar principle to bind/unbind (specifically unbind)

  **Example**:
    ```
    var loaded_function=function(arg){arg.data.user_message = "Good day! " + arg.data.user_message;};

    myGLaDioS.add('loaded', loaded_function);
    setTimeout(function(){
        myGLaDioS.remove('loaded', loaded_function);    
    }, 5000)
    ```

* `GLaDioS.icallback(` **key** *(string)*, **argPackage** *(object)*, **callback** *( function(arg) )* `)` (readonly): *returns* `boolean [true|false]`

  **Execute callback set for registered key**

  Trigger all the callbacks specified for this group.  `callback` is provided a single argument which is `argPackage`.

  **Example**:
    ```
    var foo='foo',
        baz='baz';
    myGLaDioS.icallback('loaded', {'foo':foo, 'baz': baz}, function(arg){
        foo=arg.foo;//safely transfer back into scope
        baz=arg.baz;    
    });
    //foo & baz are changed by whatever was added through myGLaDioS.add() after here because above is blocking
    ```

* `GLaDioS.reroot(` **newRootObj** *(object)* `)`: *returns* `void`

  **Reroot (Not Tested - WIP)**

  For the next `GLaDioS.icallback()` using this method will change the default binding `this` (when using `func.apply(thisObj, [arg1, arg2])`) in `GLaDioS.icallback()`.  Once executed switches back to the one passed as the second argument `root` in the constructor  (`new GLaDioS({}, root)`).

  This is intended to help automated tests & prototypes; thus it shouldn't be used as a feature.

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
var GLaDioS=require('./jspkg/GLaDioS')();

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
