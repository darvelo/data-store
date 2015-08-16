# Intro

Give your data a place to rest its head. Easy data storage and retrieval, with the ability to use factories.

# Install

**Using bower:**

```bash
$ bower install mochila --save
```

Use your favorite flavor in the `dist/` directory. Under AMD it registers the module name: `mochila`. As a global, use: `Mochila`.

**Using npm:**

```bash
$ npm install mochila --save
```

Use `var x = require('mochila')` in your code.

# Simple usage examples

```js
var mochila = new Mochila();
var monsters = [
    {
        id: 'abc-222-xu985',
        name: 'Mothra'
    },
    {
        id: 'xyz-333-pk254',
        name: 'Godzilla',
        stats: {
            heightFt: 330,
            weightTons: 60000,
            fistSizeFt: 36,
            shoeSizeFt: 74
        }
    }
];

var found;

mochila.addType('monster');
mochila.load('monster', monsters);

found = mochila.find('monster', 'abc-222-xu985');
found.name === 'Mothra' // true

found = mochila.find('monster', 'xyz-333-pk254');
found.name === 'Godzilla' // true
typeof found.stats // 'object'
found.stats === monsters[1].stats // false -- `load` does a deep clone when there's no factory
found.kingOfMonsters // undefined

// loading an object with the id of one already in the database merges the two
mochila.load('monster', {
    id: 'xyz-333-pk254',
    name: 'Gojira',
    kingOfMonsters: true
});

found.name === 'Gojira' // true
found.kingOfMonsters // true
```

Using factories:

```js
function Widget(opts) {
    this.id = opts.id;
    this.name = opts.title;
    this.dimensions = opts.dimensions;
    this.countId = ++count;
}

// when a factory is registered, its `create` property is passed the object from `load`
Widget.create = function(opts) {
    return new this(opts);
};

var mochila = new Mochila();
var count = 0;
var cube = {
    id: 0,
    title: 'Cube',
    isCube: true,
    dimensions: {
        width: 10,
        height: 10,
        depth: 10,
    },
};

var found;

mochila.addType('widget');
mochila.registerModelFactory('widget', Widget);
mochila.load('widget', cube);

found = mochila.find('widget', 0);

found instanceof Widget // true
found.title // undefined
found.name // 'Cube'
found.isCube // 'undefined'
found.countId // 1
typeof found.dimensions // 'object'
found.dimensions === cube.dimensions // true -- factory did a shallow copy
```

**Note:** Make sure your data records each have an `id` property. It's used to store and search records efficiently. `id` can be a number or a string.

# API Reference

Mochila


* [mochila](#module_mochila)
  * [~Mochila](#module_mochila..Mochila)
    * [.clear()](#module_mochila..Mochila+clear)
    * [.addType(type)](#module_mochila..Mochila+addType)
    * [.hasType(name)](#module_mochila..Mochila+hasType) ⇒ <code>Boolean</code>
    * [.allTypes()](#module_mochila..Mochila+allTypes) ⇒ <code>Boolean</code>
    * [.registerModelFactory(type, factory)](#module_mochila..Mochila+registerModelFactory)
    * [.createModelOfType(type, ...model)](#module_mochila..Mochila+createModelOfType) ⇒ <code>Object</code>
    * [.load(type, payload)](#module_mochila..Mochila+load)
    * [.all(type, [key], val)](#module_mochila..Mochila+all) ⇒ <code>Array</code>
    * [.find(type, [key], val)](#module_mochila..Mochila+find) ⇒ <code>Model</code> &#124; <code>Undefined</code>
    * [.deleteModels(type, models)](#module_mochila..Mochila+deleteModels)
    * [.seekAndDestroy(type, key, val)](#module_mochila..Mochila+seekAndDestroy)

<a name="module_mochila..Mochila"></a>
### mochila~Mochila
Creates a new Mochila container, which holds tables of records, accessed by name.

**Kind**: inner class of <code>[mochila](#module_mochila)</code>  

* [~Mochila](#module_mochila..Mochila)
  * [.clear()](#module_mochila..Mochila+clear)
  * [.addType(type)](#module_mochila..Mochila+addType)
  * [.hasType(name)](#module_mochila..Mochila+hasType) ⇒ <code>Boolean</code>
  * [.allTypes()](#module_mochila..Mochila+allTypes) ⇒ <code>Boolean</code>
  * [.registerModelFactory(type, factory)](#module_mochila..Mochila+registerModelFactory)
  * [.createModelOfType(type, ...model)](#module_mochila..Mochila+createModelOfType) ⇒ <code>Object</code>
  * [.load(type, payload)](#module_mochila..Mochila+load)
  * [.all(type, [key], val)](#module_mochila..Mochila+all) ⇒ <code>Array</code>
  * [.find(type, [key], val)](#module_mochila..Mochila+find) ⇒ <code>Model</code> &#124; <code>Undefined</code>
  * [.deleteModels(type, models)](#module_mochila..Mochila+deleteModels)
  * [.seekAndDestroy(type, key, val)](#module_mochila..Mochila+seekAndDestroy)

<a name="module_mochila..Mochila+clear"></a>
#### mochila.clear()
Empty out all data records from each internal model store. All models (but not their factories) are lost.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
<a name="module_mochila..Mochila+addType"></a>
#### mochila.addType(type)
Add a storage unit that will contain models of a given named type. It is initialized empty.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | A string name of the internal array representation of model data of a certain type. |

<a name="module_mochila..Mochila+hasType"></a>
#### mochila.hasType(name) ⇒ <code>Boolean</code>
Returns whether the mochila has that particular type name.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Boolean</code> - `true` if the type name exists in the mochila, `false` if not.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the type you're checking to see exists. |

<a name="module_mochila..Mochila+allTypes"></a>
#### mochila.allTypes() ⇒ <code>Boolean</code>
Returns the names of all the types the mochila currently holds.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Boolean</code> - `true` if the type name exists in the mochila, `false` if not.  
<a name="module_mochila..Mochila+registerModelFactory"></a>
#### mochila.registerModelFactory(type, factory)
Keeps a reference of the given model factory internally under the given named type. New models with that named type created from JSON or extended from an existing object-type will be created from this factory.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | A string name representing the model type and its factory type. |
| factory | <code>function</code> &#124; <code>Object</code> | An existing function, or an object that will create a new object of its type when its `.create()` method is invoked. |

<a name="module_mochila..Mochila+createModelOfType"></a>
#### mochila.createModelOfType(type, ...model) ⇒ <code>Object</code>
Create a new model using its factory, or if one doesn't exist, creates a plain object that can be extended by a deep clone of arguments that are objects.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Object</code> - The new object.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | A string name representing the model type and its factory type. |
| ...model | <code>Object</code> | Optional. When a factory exists, these are passed to `factory.create()`. When no factory exists, a deep clone is made of each object into the newly-created model. |

<a name="module_mochila..Mochila+load"></a>
#### mochila.load(type, payload)
Load new models into the internal data storage unit of the named model type. New models will be created using a previously-registered factory of that type as the base if it exists. If the factory doesn't exist, a plain object is used as the base. The payload can be an object or an array of objects. Each object *MUST* have a property named 'id' that is a Number.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | A string name representing the model type, and if its factory was registered, its factory type. |
| payload | <code>Object</code> &#124; <code>Array</code> | An object or array of objects to load into internal model storage. |

<a name="module_mochila..Mochila+all"></a>
#### mochila.all(type, [key], val) ⇒ <code>Array</code>
Finds all models in modelType with key === val.
`key` is optional; searches `id` key by default if given two arguments.
`val` is optional; returns all models if not given.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Array</code> - An array with any objects that matched.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>String</code> |  | The name of the modelType you wish to search through. |
| [key] | <code>String</code> | <code>id</code> | Optional key to search modelType. Defaults to `id` if not given. |
| val | <code>Number</code> &#124; <code>String</code> &#124; <code>Date</code> |  | Optional value you're looking for in `key`. |

<a name="module_mochila..Mochila+find"></a>
#### mochila.find(type, [key], val) ⇒ <code>Model</code> &#124; <code>Undefined</code>
Finds the first model in modelType with key === val.
`key` is optional; searches `id` key by default if given two arguments.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Model</code> &#124; <code>Undefined</code> - The object or undefined if it wasn't found.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>String</code> |  | The name of the modelType you wish to search through. |
| [key] | <code>String</code> | <code>id</code> | Optional key to search modelType. Defaults to `id` if not given. |
| val | <code>Number</code> &#124; <code>String</code> &#124; <code>Date</code> |  | The value you're looking for in `key`. |

<a name="module_mochila..Mochila+deleteModels"></a>
#### mochila.deleteModels(type, models)
Remove a model or models of the given type from internal storage. Uses the models' `id` to find and remove it from the mochila.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The name of the modelType you wish to remove from. |
| models | <code>Array.&lt;Model&gt;</code> &#124; <code>Model</code> | A model or array of models you want to remove. |

<a name="module_mochila..Mochila+seekAndDestroy"></a>
#### mochila.seekAndDestroy(type, key, val)
Delete all models of the given type from internal storage that have `key` === `val`.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The name of the modelType you wish to remove models from. |
| key | <code>String</code> | The key to search on all models for a particular value. |
| val | <code>Number</code> &#124; <code>String</code> &#124; <code>Date</code> | The value the key should have in order for the model to be removed. |


* * *

# License

MIT
