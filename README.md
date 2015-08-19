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

mochila.addCollection('monster');
mochila.load('monster', monsters);

found = mochila.find('monster', 'abc-222-xu985');
found.name === 'Mothra' // true

found = mochila.find('monster', 'xyz-333-pk254');
found.name === 'Godzilla' // true
typeof found.stats // 'object'
found.stats === monsters[1].stats // false -- `load` does a deep clone if no factory
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

mochila.addCollection('widget');
mochila.addFactory('widget', Widget);
mochila.load('widget', cube);

found = mochila.find('widget', 0);

found instanceof Widget // true
found.title // undefined
found.name // 'Cube'
found.isCube // undefined
found.countId // 1
typeof found.dimensions // 'object'
found.dimensions === cube.dimensions // true -- factory did a shallow copy
```

**Note:** Make sure your data records each have an `id` property. It's used to store and search records efficiently. `id` can be a number or a string.

# API Reference

Mochila


* [mochila](#module_mochila)
  * [~Mochila](#module_mochila..Mochila)
    * [.clearCollections()](#module_mochila..Mochila+clearCollections)
    * [.addCollection(name)](#module_mochila..Mochila+addCollection)
    * [.hasCollection(name)](#module_mochila..Mochila+hasCollection) ⇒ <code>Boolean</code>
    * [.collectionNames()](#module_mochila..Mochila+collectionNames) ⇒ <code>Array.&lt;String&gt;</code>
    * [.clearFactories()](#module_mochila..Mochila+clearFactories)
    * [.removeFactory(name)](#module_mochila..Mochila+removeFactory)
    * [.addFactory(name, factory)](#module_mochila..Mochila+addFactory)
    * [.createModelOfType(name, ...objs)](#module_mochila..Mochila+createModelOfType) ⇒ <code>Model</code>
    * [.load(name, payload)](#module_mochila..Mochila+load)
    * [.sortBy(name, [key])](#module_mochila..Mochila+sortBy) ⇒ <code>Array</code>
    * [.all(name, [key], [val])](#module_mochila..Mochila+all) ⇒ <code>Array</code>
    * [.find(name, [key], val)](#module_mochila..Mochila+find) ⇒ <code>Model</code> &#124; <code>undefined</code>
    * [.removeModels(name, models)](#module_mochila..Mochila+removeModels) ⇒ <code>Array.&lt;Model&gt;</code>
    * [.removeWhere(name, [key], val)](#module_mochila..Mochila+removeWhere) ⇒ <code>Array.&lt;Model&gt;</code>

<a name="module_mochila..Mochila"></a>
### mochila~Mochila
Creates a new Mochila container, which holds collections of records, with collections accessed by name.

**Kind**: inner class of <code>[mochila](#module_mochila)</code>  

* [~Mochila](#module_mochila..Mochila)
  * [.clearCollections()](#module_mochila..Mochila+clearCollections)
  * [.addCollection(name)](#module_mochila..Mochila+addCollection)
  * [.hasCollection(name)](#module_mochila..Mochila+hasCollection) ⇒ <code>Boolean</code>
  * [.collectionNames()](#module_mochila..Mochila+collectionNames) ⇒ <code>Array.&lt;String&gt;</code>
  * [.clearFactories()](#module_mochila..Mochila+clearFactories)
  * [.removeFactory(name)](#module_mochila..Mochila+removeFactory)
  * [.addFactory(name, factory)](#module_mochila..Mochila+addFactory)
  * [.createModelOfType(name, ...objs)](#module_mochila..Mochila+createModelOfType) ⇒ <code>Model</code>
  * [.load(name, payload)](#module_mochila..Mochila+load)
  * [.sortBy(name, [key])](#module_mochila..Mochila+sortBy) ⇒ <code>Array</code>
  * [.all(name, [key], [val])](#module_mochila..Mochila+all) ⇒ <code>Array</code>
  * [.find(name, [key], val)](#module_mochila..Mochila+find) ⇒ <code>Model</code> &#124; <code>undefined</code>
  * [.removeModels(name, models)](#module_mochila..Mochila+removeModels) ⇒ <code>Array.&lt;Model&gt;</code>
  * [.removeWhere(name, [key], val)](#module_mochila..Mochila+removeWhere) ⇒ <code>Array.&lt;Model&gt;</code>

<a name="module_mochila..Mochila+clearCollections"></a>
#### mochila.clearCollections()
Remove all models from each collection. All models, if not referenced elsewhere, are lost. All factories registered will remain.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
<a name="module_mochila..Mochila+addCollection"></a>
#### mochila.addCollection(name)
Add a named collection that you can load models and objects into. It is initialized empty.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name to be used for the collection. |

<a name="module_mochila..Mochila+hasCollection"></a>
#### mochila.hasCollection(name) ⇒ <code>Boolean</code>
Returns whether the mochila has that particular collection.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Boolean</code> - `true` if the collection exists in the mochila, `false` if not.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the collection you're checking to see exists. |

<a name="module_mochila..Mochila+collectionNames"></a>
#### mochila.collectionNames() ⇒ <code>Array.&lt;String&gt;</code>
Returns the names of all the collections that have been added.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Array.&lt;String&gt;</code> - The names of all the collections that have been added.  
<a name="module_mochila..Mochila+clearFactories"></a>
#### mochila.clearFactories()
Remove all factories from each collection. All factories, if not referenced elsewhere, are lost. All models will remain.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
<a name="module_mochila..Mochila+removeFactory"></a>
#### mochila.removeFactory(name)
Remove a factory associated with a collection.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the collection whose factory you want to delete from the mochila. |

<a name="module_mochila..Mochila+addFactory"></a>
#### mochila.addFactory(name, factory)
Register a factory that the named collection will use to create new models.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the collection. |
| factory | <code>function</code> &#124; <code>Object</code> | An existing function, or an object that will create a new object of its type when its `.create()` method is invoked. |

<a name="module_mochila..Mochila+createModelOfType"></a>
#### mochila.createModelOfType(name, ...objs) ⇒ <code>Model</code>
Create a new model using its factory, passing all arguments, or if a factory doesn't exist, create a plain object that will be extended by a deep copy of all arguments that are objects.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Model</code> - The new model.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the collection. |
| ...objs | <code>Object</code> | Optional. When a factory exists, these are passed to `factory.create()`. When no factory exists, a deep copy is made of each object into the newly-created model. |

<a name="module_mochila..Mochila+load"></a>
#### mochila.load(name, payload)
Load models or objects/JSON into the named collection. Models are placed into the collection as is. Objects are passed into the previously-registered factory of the named collection to create new models. If the factory doesn't exist, a model is made from a deep copy of the object. The payload can be an object, model, or an array of objects or models. Each object/model *MUST* have a property named 'id' that is a number or a string. An object or model that has the same `id` as a model in the mochila will have its own properties merged using a deep copy.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the collection into which the models will be added. |
| payload | <code>Object</code> &#124; <code>Array.&lt;Object&gt;</code> &#124; <code>Model</code> &#124; <code>Array.&lt;Model&gt;</code> | An object or array of objects to use for creating new models, or a model or array of models to be placed into the collection as is. An object or model that has the same `id` as a model in the mochila will have its own properties merged using a deep copy. |

<a name="module_mochila..Mochila+sortBy"></a>
#### mochila.sortBy(name, [key]) ⇒ <code>Array</code>
Sort the given collection by a specified key.
Since collections are always sorted by id, searching by id offers a significant speedup.
To determine whether one object should come before another in sorted order, the `-` operator is used if `key` holds a Number type, and `<` otherwise.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Array</code> - A copy of the collection, but sorted by `key`.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | The name of the collection. |
| [key] | <code>String</code> | <code>id</code> | A key name to sort by. |

<a name="module_mochila..Mochila+all"></a>
#### mochila.all(name, [key], [val]) ⇒ <code>Array</code>
Returns all models in a collection whose `key` === `val`. Returns all models if none of the optional parameters are given.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Array</code> - An array with any models that matched the search parameters, or all models if no search parameters were given.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | The name of the collection. |
| [key] | <code>String</code> | <code>id</code> | The key to search on within models in the collection. |
| [val] | <code>Number</code> &#124; <code>String</code> &#124; <code>Date</code> |  | The value you're looking for in `key`. |

<a name="module_mochila..Mochila+find"></a>
#### mochila.find(name, [key], val) ⇒ <code>Model</code> &#124; <code>undefined</code>
Finds the first model in the named collection with key === val.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Model</code> &#124; <code>undefined</code> - The model or undefined if it wasn't found.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | The name of the collection you wish to search through. |
| [key] | <code>String</code> | <code>id</code> | The key to search on within models in the collection. |
| val | <code>Number</code> &#124; <code>String</code> &#124; <code>Date</code> |  | The value you're looking for in `key`. |

<a name="module_mochila..Mochila+removeModels"></a>
#### mochila.removeModels(name, models) ⇒ <code>Array.&lt;Model&gt;</code>
Remove a model or models from the named collection. If not referenced elsewhere, they will be lost. Uses the models' `id` to find and remove them.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Array.&lt;Model&gt;</code> - An array of the models removed from the collection.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the collection you wish to remove from. |
| models | <code>Model</code> &#124; <code>Array.&lt;Model&gt;</code> | A model or array of models you wish to remove. |

<a name="module_mochila..Mochila+removeWhere"></a>
#### mochila.removeWhere(name, [key], val) ⇒ <code>Array.&lt;Model&gt;</code>
Remove all models from the named collection that have `key` === `val`. If not referenced elsewhere, they will be lost.

**Kind**: instance method of <code>[Mochila](#module_mochila..Mochila)</code>  
**Returns**: <code>Array.&lt;Model&gt;</code> - An array of the models removed from the collection.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | The name of the collection you wish to search through. |
| [key] | <code>String</code> | <code>id</code> | The key to search on within models in the collection. |
| val | <code>Number</code> &#124; <code>String</code> &#124; <code>Date</code> |  | The value you're looking for in `key`. |


* * *

# License

MIT
