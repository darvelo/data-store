/**
* Mochila
* @module mochila
*/

/**
* Creates a new Mochila container, which holds collections of records, with collections accessed by name.
*
* @class
*/
class Mochila {
    constructor() {
        this._store = {};
        this._factories = {};
    }

    /**
    * Remove all models from each collection. All models, if not referenced elsewhere, are lost. All factories registered will remain.
    */
    clear() {
        for (var name in this._store) {
            if (this._store.hasOwnProperty(name) && typeof this._store[name] === 'object') {
                this._store[name].length = 0;
            }
        }
    }

    /**
    * Add a named collection that you can load models and objects into. It is initialized empty.
    *
    * @param {String} name The name to be used for the collection.
    */
    add(name) {
        if (this._store[name] !== void 0) {
            throw new Error('A Mochila collection named "' + name + '" already exists! Cannot add it again.');
        }

        this._store[name] = [];
    }

    /**
    * Returns whether the mochila has that particular collection.
    *
    * @param {String} name Name of the collection you're checking to see exists.
    * @returns {Boolean} `true` if the collection exists in the mochila, `false` if not.
    */
    has(name) {
        return !!this._store[name];
    }

    /**
    * Returns the names of all the collections that have been added.
    *
    * @returns {String[]} The names of all the collections that have been added.
    */
    allTypes() {
        return Object.keys(this._store);
    }

    /**
    * Remove all factories from each collection. All factories, if not referenced elsewhere, are lost. All models will remain.
    */
    clearFactories() {
        for (var name in this._factories) {
            if (this._factories.hasOwnProperty(name)) {
                delete this._factories[name];
            }
        }
    }

    /**
    *  Remove a factory associated with a collection.
    *
    * @param {String} name The name of the collection whose factory you want to delete from the mochila.
    */
    removeFactory(name) {
        if (this._factories.hasOwnProperty(name)) {
            delete this._factories[name];
        }
    }

    /**
    * Register a factory that the named collection will use to create new models.
    *
    * @param {String} name The name of the collection.
    * @param {Function|Object} factory An existing function, or an object that will create a new object of its type when its `.create()` method is invoked.
    */
    addFactory(name, factory) {
        if (this._store[name] === void 0) {
            throw new Error('There is no collection named "' + name + '" in the mochila!');
        }

        if (this._factories[name] !== void 0) {
            throw new Error ('There is already a registered model factory for the collection named "' + name + '" in the mochila!');
        }

        if (typeof factory !== 'function' || typeof factory.create !== 'function') {
            throw new Error ('The model factory for the mochila collection named "' + name + '" you are trying to register is not of the proper datatype!');
        }

        this._factories[name] = factory;
    }

    /**
    * Create a new model using its factory, passing all arguments, or if a factory doesn't exist, create a plain object that will be extended by a deep copy of all arguments that are objects.
    *
    * @param {String} name The name of the collection.
    * @param {...Object} objs Optional. When a factory exists, these are passed to `factory.create()`. When no factory exists, a deep copy is made of each object into the newly-created model.
    * @return {Model} The new model.
    */
    createModelOfType(name, ...objs) {
        var factory = this._factories[name],
            model;

        if (!factory) {
            model = {};
            this._mergeObject(...[model].concat(objs));
        } else {
            model = factory.create(...objs);
        }

        return model;
    }

    /**
    * Load models or objects/JSON into the named collection. Models are placed into the collection as is. Objects are passed into the previously-registered factory of the named collection to create new models. If the factory doesn't exist, a model is made from a deep copy of the object. The payload can be an object, model, or an array of objects or models. Each object/model *MUST* have a property named 'id' that is a number or a string. An object or model that has the same `id` as a model in the mochila will have its own properties merged using a deep copy.
    *
    * @param {String} name The name of the collection into which the models will be added.
    * @param {Object|Object[]|Model|Model[]} payload An object or array of objects to use for creating new models, or a model or array of models to be placed into the collection as is. An object or model that has the same `id` as a model in the mochila will have its own properties merged using a deep copy.
    */
    load(name, payload) {
        var collection = this._store[name];
        var factoryType = this._factories[name];

        if (collection === void 0) {
            throw new Error('There is no collection named ' + name + ' in the mochila!');
        }

        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch(e) {
                throw new Error('Mochila tried to parse the string you loaded, but it was not JSON!');
            }
        }

        if (typeof payload !== 'object') {
            throw new Error('Payload for the mochila collection named ' + name + ' was not an object!');
        }

        if (!Array.isArray(payload)) {
            payload = [payload];
        }

        if (payload.length === 0) {
            return;
        }

        payload = payload.map(obj => {
            if (factoryType && obj instanceof factoryType) {
                return obj;
            }

            return this.createModelOfType(name, obj);
        });

        this._pushModels(collection, payload);
    }

    /**
    * Update the properties of an object with those of other objects using a deep copy.
    *
    * @private
    * @param {Object} obj The object you want the following arguments' object properties to be merged into.
    * @param {...Object} objs Objects to extend from, using a deep copy.
    */
    _mergeObject(obj, ...objs) {
        function deepCopy (source) {
            var i, prop, ret;

            if (Array.isArray(source)) {
                ret = [];
                for (i = 0; i < source.length; ++i) {
                    ret.push(deepCopy(source[i]));
                }
            } else if (typeof source === 'object') {
                ret = {};
                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        ret[prop] = deepCopy(source[prop]);
                    }
                }
            } else {
                ret = source;
            }

            return ret;
        }

        var i, prop, curr;

        if (typeof obj !== 'object' || Array.isArray(obj)) {
            return;
        }

        for (i = 0; i < objs.length; ++i) {
            curr = objs[i];

            if (typeof curr !== 'object' || Array.isArray(curr)) {
                continue;
            }

            // create a deep copy of an object.
            for (prop in curr) {
                if (curr.hasOwnProperty(prop)) {
                    obj[prop] = deepCopy(curr[prop]);
                }
            }
        }
    }

    /**
    * Insert model(s) into the named collection, such that the collection remains in sorted order by `id`. Models with `id`s of those that already exist in the database will be merged using a deep copy, rather than inserting the model into the collection.
    *
    * @private
    * @param {String|Collection} name The name of the collection, or the collection itself.
    * @param {Model|Model[]} payload A model or models to insert into the collection. Models must already be instances of the factory if a factory exists. The collection will remain in sorted order afterward.
    */
    _pushModels(name, payload) {
        var collection;

        if (typeof payload !== 'object') {
            throw new Error('Model to be pushed into the mochila collection named ' + name + ' was not an object or an array!', payload);
        }

        if (!Array.isArray(payload)) {
            payload = [payload];
        }

        if (typeof type === 'string') {
            collection = this._store[name];
        } else {
            collection = name;
        }

        // we need to check for collisions and update those that exist, and insert those that don't
        payload.forEach(item => {
            var foundItem, insertIdx;
            foundItem = this._binarySearch(collection, item.id);

            if (foundItem) {
                this._mergeObject(foundItem, item);
            } else {
                insertIdx = this._getInsertIndex(collection, item.id);
                collection.splice(insertIdx, 0, item);
            }
        });
    }

    /**
    * Find the rightmost index in an array already sorted by `key`, where an object with `value` in its `key` property can be inserted. To determine whether the object's property is less than `value`, the `<` operator is used.
    *
    * @private
    * @throws {Error} `value` must be of the same type as that held by `key`, since `<` can't meaningfully compare different types.
    * @param {Array} sortedArray An array that has already been sorted by `key`.
    * @param {String|Number|Date} value The value to compare against the objects' `key`s. Anything that can be compared with `<`.
    * @param {String} [key=id] The key to search objects by within sortedArray.
    * @return {Number} The rightmost index where an object (with object[key] === value) can be inserted.
    */
    _getInsertIndex(sortedArray, value, key) {
        key = key || 'id';

        if (value === void 0) {
            throw new Error('Mochila: The value for getting insert index was undefined!');
        }

        if (sortedArray.length === 0) {
            return 0;
        }

        // values of different types can't be meaningfully compared with '<'
        if (typeof sortedArray[0][key] !== typeof value) {
            throw new Error('Mochila: The value for getting insert index, "' + value + '" was not of the same type as that held by object key, "' + key + '"!');
        }

        var beg = 0;
        var end = sortedArray.length - 1;
        var mid;
        var checkedItem;

        while (beg <= end) {
            mid = beg + Math.floor((end - beg) / 2);
            checkedItem = sortedArray[mid];

            if (value < checkedItem[key]) {
                end = mid - 1;
            } else {
                beg = mid + 1;
            }
        }

        return end+1;
    }

    /**
    * Search the given array (already sorted by `key`), for an object with `value` in its `key` property. To determine whether one object's property is less than `value`, the `<` operator is used.
    *
    * @private
    * @param {Array} sortedArray An array that has already been sorted by `key`.
    * @param {String|Number|Date} value The value to compare against the objects' `key`s. Anything that can be compared with `<`.
    * @param {String} [key=id] The key to search objects by within sortedArray.
    * @return {Model|undefined} The found object or `undefined`.
    */
    _binarySearch(sortedArray, value, key) {
        var ret = this._binarySearchIndex(sortedArray, value, key);
        if (ret) {
            ret = ret.sortedArray[ret.idx];
        }
        return ret;
    }

    /**
    * @typedef BinarySearchIndexResult
    * @private
    * @type Object
    * @property {Array} sortedArray The array passed into _binarySearchIndex().
    * @property {Number|undefined} idx The index of the object found by _binarySearchIndex(), or `undefined`.
    */

    /**
    * Search the given array (already sorted by `key`), for an object with `value` in its `key` property. To determine whether one object's property is less than `value`, the `<` operator is used.
    *
    * @private
    * @param {Array} sortedArray An array that has already been sorted by `key`.
    * @param {String|Number|Date} value The value to compare against the objects' `key`s. Anything that can be compared with `<`.
    * @param {String} [key=id] The key to search objects by within sortedArray.
    * @return {BinarySearchIndexResult} An object with the index of the found object as one of its properties, or `undefined`.
    */
    _binarySearchIndex(sortedArray, value, key) {
        key = key || 'id';

        if (value === void 0) {
            throw new Error('Mochila: The value for binary searching (for index) was undefined!');
        }

        // values of different types can't be meaningfully compared with '<'
        if (sortedArray.length === 0 ||
            typeof sortedArray[0][key] !== typeof value)
        {
            return;
        }

        var beg = 0;
        var end = sortedArray.length - 1;
        var mid;
        var checkedItem;

        while (beg <= end) {
            mid = beg + Math.floor((end - beg) / 2);
            checkedItem = sortedArray[mid];

            if (checkedItem[key] < value) {
                beg = mid + 1;
            } else if (value < checkedItem[key]) {
                end = mid - 1;
            } else {
                return {
                    sortedArray: sortedArray,
                    idx: mid,
                };
            }
        }

        return {
            sortedArray: sortedArray,
            idx: void 0,
        };
    }

    /**
    * Sort the given collection by a specified key.
    * Since collections are always sorted by id, searching by id offers a significant speedup.
    * To determine whether one object should come before another in sorted order, the `-` operator is used if `key` holds a Number type, and `<` otherwise.
    *
    * @param {String} name The name of the collection.
    * @param {String} [key=id] A key name to sort by.
    * @return {Array} A copy of the collection, but sorted by `key`.
    */
    sortBy(name, key) {
        var sortedArray;

        key = key || 'id';

        if (typeof name !== 'string') {
            throw new Error('Mochila tried to sort a collection by key "' + key + '" but was not passed the name of the collection!');
        }

        sortedArray = this._store[name].slice();

        // skip if key === 'id' since it's already sorted
        if (sortedArray.length && key !== 'id') {
            if (typeof sortedArray[0][key] === 'number') {
                sortedArray.sort((a, b) => a[key] - b[key]);
            } else {
                sortedArray.sort((a, b) => {
                    var akey = a[key];
                    var bkey = b[key];
                    if (akey < bkey) {
                        return -1;
                    } else if (bkey < akey) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            }
        }

        return sortedArray;
    }

    /**
    * Returns all models in a collection whose `key` === `val`. Returns all models if none of the optional parameters are given.
    *
    * @param {String} name The name of the collection.
    * @param {String} [key=id] The key to search on within models in the collection.
    * @param {Number|String|Date} [val] The value you're looking for in `key`.
    * @return {Array} An array with any models that matched the search parameters, or all models if no search parameters were given.
    */
    all(name, key, val) {
        var collection = this._store[name];
        var ret;

        if (!collection) {
            throw new Error('There is no collection named "' + name + '" in the mochila!');
        }

        if (val === void 0) {
            if (key === void 0) {
                return collection.slice();
            } else {
                // we're searching by id, leverage the fact that it's already sorted
                ret = this._binarySearch(collection, key);
                return ret ? [ret] : [];
            }
        }

        return collection.filter(obj => obj[key] === val);
    }

    /**
    * Finds the first model in the named collection with key === val.
    *
    * @param {String} name The name of the collection you wish to search through.
    * @param {String} [key=id] The key to search on within models in the collection.
    * @param {Number|String|Date} val The value you're looking for in `key`.
    * @return {Model|undefined} The model or undefined if it wasn't found.
    */
    find(name, key, val) {
        var collection = this._store[name];

        if (!collection) {
            throw new Error('There is no collection named "' + name + '" in the mochila!');
        }

        // we're searching by id; leverage the fact that it's already sorted
        if (val === void 0) {
            return this._binarySearch(collection, key);
        }

        return collection.find(obj => obj[key] === val);
    }

    /**
    * Remove a model or models from the named collection. If not referenced elsewhere, they will be lost. Uses the models' `id` to find and remove them.
    *
    * @param {String} name The name of the collection you wish to remove from.
    * @param {Model|Model[]} models A model or array of models you wish to remove.
    * @return {Model[]} An array of the models removed from the collection.
    */
    removeModels(name, models) {
        var collection = this._store[name];
        var deleted = [];
        var i, idx;

        if (!collection) {
            throw new Error('There is no collection named "' + name + '" in the mochila!');
        }

        if (typeof models !== 'object') {
            throw new Error('Mochila: Argument passed to deleteModel() was neither an object nor an array!');
        }

        if (!Array.isArray(models)) {
            models = [models];
        }

        for (i = 0; i < models.length; ++i) {
            idx = this._binarySearchIndex(collection, models[i].id).idx;
            if (idx !== void 0) {
                deleted.push(collection.splice(idx, 1)[0]);
            }
        }

        return deleted;
    }

    /**
    * Remove all models from the named collection that have `key` === `val`. If not referenced elsewhere, they will be lost.
    *
    * @param {String} name The name of the collection you wish to search through.
    * @param {String} [key=id] The key to search on within models in the collection.
    * @param {Number|String|Date} val The value you're looking for in `key`.
    * @return {Model[]} An array of the models removed from the collection.
    */
    removeWhere(name, key, val) {
        if (key === void 0 && val === void 0) {
            throw new Error('Mochila cannot removeWhere() without a value given! If you want to clear all models, use clear() instead.');
        }

        var models = this.all(name, key, val);
        return this.removeModels(name, models);
    }
}

export default Mochila;
// vim tabstop=4
