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
    * Create a new model using its factory, or if one doesn't exist, creates a plain object that can be extended by a deep clone of arguments that are objects.
    *
    * @param {String} type The name of the collection.
    * @param {...Object} objs Optional. When a factory exists, these are passed to `factory.create()`. When no factory exists, a deep clone is made of each object into the newly-created model.
    * @return {Model} The new model.
    */
    createModelOfType(type, ...objs) {
        var factory = this._factories[type],
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
    * Load new models into the named collection. New models will be created using a previously-registered factory of that type as the base if it exists. If the factory doesn't exist, a plain object is used as the base. The payload can be an object or an array of objects. Each object *MUST* have a property named 'id' that is a number or string.
    *
    * @param {String} type The name of the collection.
    * @param {Object|Array} payload An object or array of objects to load into the collection.
    */
    load(type, payload) {
        var modelType = this._store[type];
        var factoryType = this._factories[type];

        if (modelType === void 0) {
            throw new Error('There is no model of type ' + type + ' in the mochila!');
        }

        if (typeof payload !== 'object') {
            throw new Error('Payload for type ' + type + ' was not an object!', payload);
        }

        if (!Array.isArray(payload)) {
            payload = [payload];
        }

        if (payload.length === 0) {
            return;
        }

        payload = payload.map(obj => {
            // !! WRITE A TEST FOR THIS !!
            // i think this is necessary because there's no way to load a model into the store if it's not json
            // if the user wants to use createModelOfType() and push it into the store, another copy has to be made...
            // if they registered a factory, creating a copy might not even work as expected
            if (factoryType && obj instanceof factoryType) {
                return obj;
            }

            return this.createModelOfType(type, obj);
        });

        this._pushModels(modelType, payload);
    }

    /**
    * Update the properties of an object with those of other objects using a deep clone.
    *
    * @private
    * @param {Object} obj The object you want the following arguments' object properties to be merged into.
    * @param {...Object} objs Objects to extend from, using a deep clone.
    */
    _mergeObject(obj, ...objs) {
        function deepClone (source) {
            var i, prop, ret;

            if (Array.isArray(source)) {
                ret = [];
                for (i = 0; i < source.length; ++i) {
                    ret.push(deepClone(source[i]));
                }
            } else if (typeof source === 'object') {
                ret = {};
                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        ret[prop] = deepClone(source[prop]);
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

            // create a deep clone of an object.
            for (prop in curr) {
                if (curr.hasOwnProperty(prop)) {
                    obj[prop] = deepClone(curr[prop]);
                }
            }
        }
    }

    /**
    * Push new object(s) into the named collection, such that all elements remain in sorted order by `id`. Objects with ids of those that already exist in the database will be merged, rather than creating a new record.
    *
    * @private
    * @param {String|modelType} type A string name of the internal array representation of model data of a certain type, or the array itself.
    * @param {Model[]|Model} payload A model or models to insert into the collection. Models must already be instances of the proper factory type. The collection will remain in sorted order afterward.
    */
    _pushModels(type, payload) {
        var modelType;

        if (typeof payload !== 'object') {
            throw new Error('Object to be pushed into the mochila for type ' + type + ' was not an object or an array!', payload);
        }

        if (!Array.isArray(payload)) {
            payload = [payload];
        }

        if (typeof type === 'string') {
            modelType = this._store[type];
        } else {
            modelType = type;
        }

        // we need to check for collisions and update those that exist, and insert those that don't.
        // we also need to be extremely careful not to modify the array while we're searching it.
        payload.forEach(item => {
            var foundItem, insertIdx;
            foundItem = this._binarySearch(modelType, item.id);

            if (foundItem) {
                this._mergeObject(foundItem, item);
            } else {
                insertIdx = this._getInsertIndex(modelType, item.id);
                modelType.splice(insertIdx, 0, item);
            }
        });
    }

    /**
    * Find the rightmost index in an array (already sorted by `key`), where an object with `value` in its `key` property can be inserted. To determine whether the object's property is less than `value`, the `<` operator is used.
    *
    * @private
    * @throws {Error} `value` must be of the same type as that held by `key`, since `<` can't meaningfully compare different types.
    * @param {Array} sortedArray An array that has already been sorted by `key`.
    * @param {String|Number|Date} value The value to compare against the objects' `key`s. Anything that can be compared with `<`.
    * @param {String} [key=id] The key to search objects by within sortedArray. Defaults to 'id'.
    * @return {Number} The index where an object (with object[key] === value) can be inserted.
    */
    _getInsertIndex(sortedArray, value, key) {
        key = key || 'id';

        if (value === void 0) {
            throw new Error('The value for getting insert index was undefined!');
        }

        if (sortedArray.length === 0) {
            return 0;
        }

        // values of different types can't be meaningfully compared with '<'
        if (typeof sortedArray[0][key] !== typeof value) {
            throw new Error('The value for getting insert index, "' + value + '" was not of the same type as that held by object key, "' + key + '"!');
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
    * Search the internal model array (already sorted by `key`), for an object with `value` in its `key` property. To determine whether one object's property is less than `value`, the `<` operator is used.
    *
    * @private
    * @param {Array} sortedArray An array that has already been sorted by `key`.
    * @param {String|Number|Date} value The value to compare against the objects' `key`s. Anything that can be compared with `<`.
    * @param {String} [key=id] The key to search objects by within sortedArray. Defaults to 'id'.
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
    * @property {Number|undefined} idx The index of the object found by _binarySearchIndex, or `undefined`.
    */

    /**
    * Search the internal model array (already sorted by `key`), for an object with `value` in its `key` property and return its index. To determine whether one object's property is less than `value`, the `<` operator is used.
    *
    * @private
    * @param {Array} sortedArray An array that has already been sorted by `key`.
    * @param {String|Number|Date} value The value to compare against the objects' `key`s. Anything that can be compared with `<`.
    * @param {String} [key=id] The key to search objects by within sortedArray. Defaults to 'id'.
    * @return {BinarySearchIndexResult} An object with the index of the found object or `undefined`.
    */
    _binarySearchIndex(sortedArray, value, key) {
        key = key || 'id';

        if (value === void 0) {
            throw new Error('The value for binary searching (for index) was undefined!');
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
    * Sort the internal model array by a specified key.
    * Since the arrays are always sorted by id, searching by id offers significant speedup.
    * To determine whether one object's property is before another, the `-` operator is used if the `key` holds a Number type, and `<` otherwise.
    *
    * @private
    * @param {String|modelType} type A string name of the internal array representation of model data of a certain type, or the array itself.
    * @param {String} [key=id] A key name to sort by. Defaults to 'id'.
    * @return {Array} A copy of the array, but sorted by `key`.
    */
    _sortBy(type, key) {
        var sortedArray;
        var modelType = this._store[type];

        key = key || 'id';

        if (typeof type === 'string') {
            sortedArray = modelType;
        } else {
            sortedArray = type;
        }

        sortedArray = sortedArray.slice();

        // skip if type === modelType && key === 'id' since it should already be sorted
        if (sortedArray.length && (type !== modelType || key !== 'id')) {
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
    * Finds all models in modelType with key === val.
    * `key` is optional; searches `id` key by default if given two arguments.
    * `val` is optional; returns all models if not given.
    *
    * @param {String} type The name of the modelType you wish to search through.
    * @param {String} [key=id] Optional key to search modelType. Defaults to `id` if not given.
    * @param {Number|String|Date} val The value you're looking for in `key`.
    * @return {Array} An array with any objects that matched.
    */
    all(type, key, val) {
        var modelType = this._store[type];
        var ret;

        if (!modelType) {
            throw new Error('There is no model of type ' + type + ' in the mochila!');
        }

        if (val === void 0) {
            if (key === void 0) {
                return modelType.slice();
            } else {
                // we're searching by id, leverage the fact that it's already sorted
                ret = this._binarySearch(modelType, key);
                return ret ? [ret] : [];
            }
        }

        return modelType.filter(obj => obj[key] === val);
    }

    /**
    * Finds the first model in modelType with key === val.
    * `key` is optional; searches `id` key by default if given two arguments.
    *
    * @param {String} type The name of the modelType you wish to search through.
    * @param {String} [key=id] Optional key to search modelType. Defaults to `id` if not given.
    * @param {Number|String|Date} val The value you're looking for in `key`.
    * @return {Model|Undefined} The object or undefined if it wasn't found.
    */
    find(type, key, val) {
        var modelType = this._store[type];

        if (!modelType) {
            throw new Error('There is no model of type ' + type + ' in the mochila!');
        }

        // we're searching by id; leverage the fact that it's already sorted
        if (val === void 0) {
            return this._binarySearch(modelType, key);
        }

        return modelType.find(obj => obj[key] === val);
    }

    /**
    * Remove a model or models of the given type from the named collection. Uses the models' `id` to find and remove them.
    *
    * @param {String} type The name of the collection you wish to remove from.
    * @param {Model[]|Model} models A model or array of models you want to remove.
    */
    deleteModels(type, models) {
        var modelType = this._store[type];
        var i, idx;

        if (!modelType) {
            throw new Error('There is no model of type ' + type + ' in the mochila!');
        }

        if (typeof models !== 'object') {
            throw new Error('Models passed to deleteModel was neither an object nor an array!');
        }

        if (!Array.isArray(models)) {
            models = [models];
        }

        for (i = 0; i < models.length; ++i) {
            idx = this._binarySearchIndex(modelType, models[i].id).idx;
            if (idx !== void 0) {
                modelType.splice(idx, 1);
            }
        }
    }

    /**
    * Delete all models from the named collection that have `key` === `val`.
    *
    * @param {String} type The name of the collection you wish to search through.
    * @param {String} [key=id] Optional key to search for in the collection's models. Defaults to `id` if not given.
    * @param {Number|String|Date} val The value you're looking for in `key`.
    */
    seekAndDestroy(type, key, val) {
        if (key === void 0 && val === void 0) {
            throw new Error('Mochila cannot seekAndDestroy without a value given! If you want to clear all models, use clear() instead.');
        }

        var models = this.all(type, key, val);
        this.deleteModels(type, models);
    }
}

export default Mochila;
// vim tabstop=4
