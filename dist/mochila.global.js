/**
* Mochila
* @module mochila
*/

/**
* Creates a new Mochila container, which holds tables of records, accessed by name.
*
* @class
*/
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Mochila = (function () {
    function Mochila() {
        _classCallCheck(this, Mochila);

        this._store = {};
        this._factories = {};
    }

    /**
    * Empty out all data records from each internal model store. All models (but not their factories) are lost.
    */

    _createClass(Mochila, [{
        key: 'clear',
        value: function clear() {
            for (var type in this._store) {
                if (this._store.hasOwnProperty(type) && typeof this._store[type] === 'object') {
                    this._store[type].length = 0;
                }
            }
        }

        /**
        * Add a storage unit that will contain models of a given named type. It is initialized empty.
        *
        * @param {String} type A string name of the internal array representation of model data of a certain type.
        */
    }, {
        key: 'addType',
        value: function addType(type) {
            if (this._store[type] !== void 0) {
                throw new Error('A model type of type "' + type + '" already exists! Cannot add it again.');
            }

            this._store[type] = [];
        }

        /**
        * Returns whether the mochila has that particular type name.
        *
        * @param {String} name Name of the type you're checking to see exists.
        * @returns {Boolean} `true` if the type name exists in the mochila, `false` if not.
        */
    }, {
        key: 'hasType',
        value: function hasType(type) {
            return !!this._store[type];
        }

        /**
        * Returns the names of all the types the mochila currently holds.
        *
        * @returns {Boolean} `true` if the type name exists in the mochila, `false` if not.
        */
    }, {
        key: 'allTypes',
        value: function allTypes() {
            return Object.keys(this._store);
        }

        /**
        * Keeps a reference of the given model factory internally under the given named type. New models with that named type created from JSON or extended from an existing object-type will be created from this factory.
        *
        * @param {String} type A string name representing the model type and its factory type.
        * @param {Function|Object} factory An existing function, or an object that will create a new object of its type when its `.create()` method is invoked.
        */
    }, {
        key: 'registerModelFactory',
        value: function registerModelFactory(type, factory) {
            if (this._store[type] === void 0) {
                throw new Error('There is no model type "' + type + '" in the mochila!');
            }

            if (this._factories[type] !== void 0) {
                throw new Error('There is already a registered model factory of type "' + type + '" in the mochila!');
            }

            if (typeof factory !== 'function' || typeof factory.create !== 'function') {
                throw new Error('The model factory of type "' + type + '" you are trying to register is not of the proper datatype!');
            }

            this._factories[type] = factory;
        }

        /**
        * Create a new model using its factory, or if one doesn't exist, creates a plain object that can be extended by a deep clone of arguments that are objects.
        *
        * @param {String} type A string name representing the model type and its factory type.
        * @param {...Object} model Optional. When a factory exists, these are passed to `factory.create()`. When no factory exists, a deep clone is made of each object into the newly-created model.
        * @return {Object} The new object.
        */
    }, {
        key: 'createModelOfType',
        value: function createModelOfType(type) {
            var factory = this._factories[type],
                model;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            if (!factory) {
                model = {};
                this._mergeObject.apply(this, _toConsumableArray([model].concat(args)));
            } else {
                model = factory.create.apply(factory, args);
            }

            return model;
        }

        /**
        * Load new models into the internal data storage unit of the named model type. New models will be created using a previously-registered factory of that type as the base if it exists. If the factory doesn't exist, a plain object is used as the base. The payload can be an object or an array of objects. Each object *MUST* have a property named 'id' that is a Number.
        *
        * @param {String} type A string name representing the model type, and if its factory was registered, its factory type.
        * @param {Object|Array} payload An object or array of objects to load into internal model storage.
        */
    }, {
        key: 'load',
        value: function load(type, payload) {
            var _this = this;

            var modelType = this._store[type];

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

            payload = payload.map(function (obj) {
                return _this.createModelOfType(type, obj);
            });

            this._pushModels(modelType, payload);
        }

        /**
        * Use the containing array to update the properties of an object it contains and notify observers.
        *
        * @private
        * @param {Object} obj The object you want the following arguments' object properties to be merged into.
        * @param {...Object} model Optional existing objects to extend from, using a deep clone.
        */
    }, {
        key: '_mergeObject',
        value: function _mergeObject(obj) {
            function deepClone(source) {
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

            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            for (i = 0; i < args.length; ++i) {
                curr = args[i];

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
        * Push new object(s) into the `modelType` data storage unit, such that all elements remain in sorted order by `id`. Objects with ids of those that already exist in the database will be merged, rather than creating a new record.
        *
        * @private
        * @param {String|modelType} type A string name of the internal array representation of model data of a certain type, or the array itself.
        * @param {Model[]|Model} payload A model or models to insert into the storage unit. Models must already be instances of the proper factory type. The storage unit will remain in sorted order afterward.
        */
    }, {
        key: '_pushModels',
        value: function _pushModels(type, payload) {
            var _this2 = this;

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
            payload.forEach(function (item) {
                var foundItem, insertIdx;
                foundItem = _this2._binarySearch(modelType, item.id);

                if (foundItem) {
                    _this2._mergeObject(foundItem, item);
                } else {
                    insertIdx = _this2._getInsertIndex(modelType, item.id);
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
    }, {
        key: '_getInsertIndex',
        value: function _getInsertIndex(sortedArray, value, key) {
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

            return end + 1;
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
    }, {
        key: '_binarySearch',
        value: function _binarySearch(sortedArray, value, key) {
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
    }, {
        key: '_binarySearchIndex',
        value: function _binarySearchIndex(sortedArray, value, key) {
            key = key || 'id';

            if (value === void 0) {
                throw new Error('The value for binary searching (for index) was undefined!');
            }

            // values of different types can't be meaningfully compared with '<'
            if (sortedArray.length === 0 || typeof sortedArray[0][key] !== typeof value) {
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
                        idx: mid
                    };
                }
            }

            return {
                sortedArray: sortedArray,
                idx: void 0
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
    }, {
        key: '_sortBy',
        value: function _sortBy(type, key) {
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
                    sortedArray.sort(function (a, b) {
                        return a[key] - b[key];
                    });
                } else {
                    sortedArray.sort(function (a, b) {
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
        * @param {Number|String|Date} val Optional value you're looking for in `key`.
        * @return {Array} An array with any objects that matched.
        */
    }, {
        key: 'all',
        value: function all(type, key, val) {
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

            return modelType.filter(function (obj) {
                return obj[key] === val;
            });
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
    }, {
        key: 'find',
        value: function find(type, key, val) {
            var modelType = this._store[type];

            if (!modelType) {
                throw new Error('There is no model of type ' + type + ' in the mochila!');
            }

            // we're searching by id; leverage the fact that it's already sorted
            if (val === void 0) {
                return this._binarySearch(modelType, key);
            }

            return modelType.find(function (obj) {
                return obj[key] === val;
            });
        }

        /**
        * Remove a model or models of the given type from internal storage. Uses the models' `id` to find and remove it from the mochila.
        *
        * @param {String} type The name of the modelType you wish to remove from.
        * @param {Model[]|Model} models A model or array of models you want to remove.
        */
    }, {
        key: 'deleteModels',
        value: function deleteModels(type, models) {
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
        * Delete all models of the given type from internal storage that have `key` === `val`.
        *
        * @param {String} type The name of the modelType you wish to remove models from.
        * @param {String} key The key to search on all models for a particular value.
        * @param {Number|String|Date} val The value the key should have in order for the model to be removed.
        */
    }, {
        key: 'seekAndDestroy',
        value: function seekAndDestroy(type, key, val) {
            var models = this.all(type, key, val);
            this.deleteModels(type, models);
        }
    }]);

    return Mochila;
})();

// vim tabstop=4