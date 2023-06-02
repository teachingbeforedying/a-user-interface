/**
 * Creates a new `CircularBuffer` with the specified `capacity`,
 * which must strictly be a positive integer.
 *
 * We here use the term "zero element", which refers to exactly `null` if the
 * `CircularBuffer` is backed by an `Array`, and refers to exactly `0` if it is
 * backed by a `TypedArray`. Note that using this constructor will always yield
 * a `CircularBuffer` backed by an `Array`. Use the
 * `CircularBuffer.fromArray()` function any time a `TypedArray` backing is
 * required.
 *
 * The `head` and `tail` both start at `0`. The `inhabited` property is a count
 * of how many non-zero elements there are in the buffer at the time that it is
 * read.
 *
 * @template T - The type of object that the `CircularBuffer` will store.
 * @param {number} capacity
 * @return {CircularBuffer<T>}
 */
function CircularBuffer(capacity) {
    //"use strict";
    if (typeof capacity !== "number" || capacity < 1 || capacity % 1 !== 0) {
        throw new Error(
            "CircularBuffer: capacity must be a positive integer. " +
                `Got: ${capacity}`
        );
    }
    this._buffer = Array(capacity).fill(null);
    this.capacity = capacity;
    this.head = 0;
    this.tail = 0;
    this.inhabited = 0;
    this.isArray = true;
}

/**
 * Creates a new `CircularBuffer` from the given `Array` or `TypedArray`. The
 * array cannot be empty. Note that `TypedArray`s will always have an
 * `inhabited` property equal to the number of values that they hold that
 * aren't `0`, since `TypedArray`s store primitives and thus cannot be
 * `null`ed.
 *
 * @template T - The type of object that the `CircularBuffer` will store.
 * @param {T[]} array - The array to make the `CircularBuffer` from.
 * @return {CircularBuffer<T>}
 */
CircularBuffer.fromArray = function(array) {
    //"use strict";
    const isArray = Array.isArray(array);
    if (isArray && array.length < 1) {
        throw new Error("CircularBuffer.fromArray: array cannot be empty.");
    }
    if (
        !isArray && !(
            ArrayBuffer.isView(array) && !(array instanceof DataView)
        )
    ) {
        throw new Error(
            "CircularBuffer.fromArray: array must be an Array or a Typed" +
                `Array. Got: ${array}`
        );
    }
    const cb = new CircularBuffer(array.length);
    cb._buffer = array;
    cb.inhabited =
        isArray ?
            array.reduce((count, val) => val === null ? count : count + 1, 0) :
            array.reduce((count, val) => val === 0    ? count : count + 1, 0);
    cb.isArray = isArray;
};

/**
 * Returns a `string` representation of the `CircularBuffer`, in the form
 * "[object CircularBuffer(`capacity`) capacity `capacity` head `head` tail
 * `tail` inhabited `inhabited` isArray `isArray`]"
 *
 * @return {string} - A `string` representation of the `CircularBuffer`.
 */
CircularBuffer.prototype.toString = function() {
    //"use strict";
    return `[object CircularBuffer(${this.capacity}) capacity ` +
           `${this.capacity} head ${this.head} tail ${this.tail} inhabited ` +
           `${this.inhabited} isArray ${this.isArray}]`;
};

/**
 * "Cons"es the given element at the `head` of the `CircularBuffer`, thus
 * placing this new element in the old `head`'s position and moving the `head`
 * cursor up by one. The old value at the overwritten position is returned
 * (the zero element if it was uninhabited).
 *
 * Since the buffer is circular, if the old `head` was overlapping the `tail`,
 * then the `tail` is shifted forward by one as well, and that tail value would
 * be overwritten.
 *
 * @template T
 * @param {T} val - The value to "cons" onto the `CircularBuffer`.
 * @return {T} - The old value that was at the "cons"ed position, the zero
 *               element if it was uninhabited.
 */
CircularBuffer.prototype.cons = function(val) {
    //"use strict";
    const oldVal = this._buffer[this.head];
    this._buffer[this.head] = val;
    if (this.head === this.tail) {
        this._increment_tail();
    }
    this._increment_head();
    return oldVal;
};

/**
 * Alias for the `CircularBuffer.cons()` method.
 */
CircularBuffer.prototype.push = CircularBuffer.prototype.cons;

/**
 * Acts as the inverse of `CircularBuffer.cons()`, removing and returning the
 * element at the `head` of the buffer (minus one), pushing the `head` cursor
 * back by 1.
 *
 * If the `head` and `tail` were originally at the same spot, the `tail` cursor
 * is also pushed back by 1.
 *
 * **Note** that this will function even if the "element" being unconsed is
 * actually uninhabited (i.e. it is the zero element).
 *
 * @template T
 * @return {T} - The "uncons"ed value, the zero element if it was uninhabited.
 */
CircularBuffer.prototype.uncons = function() {
    //"use strict";
    if (this.head === this.tail) {
        this._decrement_tail();
    }
    this._decrement_head();
    const oldVal = this._buffer[this.head];
    const zeroElement = this.isArray ? null : 0;
    this._buffer[this.head] = zeroElement;
    return oldVal;
};

/**
 * Alias for the `CircularBuffer.uncons()` method.
 */
CircularBuffer.prototype.pop = CircularBuffer.prototype.cons;

/**
 * Acts like `CircularBuffer.cons()`, but puts an element onto the `tail` of
 * the buffer instead of the `head`, pushing back `tail` by 1.
 *
 * If `tail` pointed to the same spot as `head` before the "snoc", then `head`
 * is also pushed back by 1.
 *
 * @template T
 * @param {T} val - The value to "snoc" onto the `CircularBuffer`.
 * @return {T} - The old value that was at the "snoc"ed position, the zero
 *               element if it was uninhabited.
 */
CircularBuffer.prototype.snoc = function(val) {
    //"use strict";
    if (this.tail === this.head) {
        this._decrement_head();
    }
    this._decrement_tail();
    const oldVal = this._buffer[this.tail];
    this._buffer[this.tail] = val;
    return oldVal;
};

/**
 * Alias for the `CircularBuffer.snoc()` method.
 */
CircularBuffer.prototype.shift = CircularBuffer.prototype.snoc;

/**
 * Acts as the inverse of `CircularBuffer.snoc()`, removing and returning the
 * element at the `tail` of the buffer, advancing the `tail` cursor by 1.
 *
 * If `tail` and `head` pointed to the same spot before the "unsnoc", then the
 * `head` cursor is also advanced by 1.
 *
 * @template T
 * @return {T} - The "unsnoc"ed value, the zero element if it was uninhabited.
 */
CircularBuffer.prototype.unsnoc = function() {
    //"use strict";
    if (this.tail === this.head) {
        this._increment_head();
    }
    const oldVal = this._buffer[this.tail];
    const zeroElement = this.isArray ? null : 0;
    this._buffer[this.tail] = zeroElement;
    this._increment_tail();
    return oldVal;
};

/**
 * Alias for the `CircularBuffer.unsnoc()` method.
 */
CircularBuffer.prototype.unshift = CircularBuffer.prototype.unsnoc;

/**
 * Gets the value at a specified index in the `CircularBuffer`'s stack.
 * The index supplied (`i`) must be an integer, and this method **interprets
 * the index relative to the current `head` cursor position** (minus one,
 * actually). This represents the element last inserted, i.e. LIFO behavior.
 *
 * To get an element relative to the `tail` cursor position (FIFO), use
 * `CircularBuffer.peek()`. To get an element via its position in the
 * underlying buffer, use `CircularBuffer.bufferGet()`.
 *
 * `i = 0` is the default value of `i`, and gets the element at the current
 * `head` cursor position minus one (i.e. the last element inserted into the
 * `CircularBuffer`). Positive values of `i` walk from the last inserted
 * element to the second-to-last inserted element, and so on.
 *
 * Negative indices walk backward, and going off the end of the buffer wraps
 * circularly as expected.
 *
 * @template T
 * @param {number=} i - The index to get from.
 * @return {T} - An element gotten from the `CircularBuffer`.
 */
CircularBuffer.prototype.get = function(i=0) {
    //"use strict";
    if (typeof i !== "number" || i % 1 !== 0) {
        throw new Error(
            `CircularBuffer.get(): i must be an integer. Got: ${i}`
        );
    }
    return this._buffer[this._clamp_index(this.head - 1 - i)];
};

/**
 * Gets the value at a specified index in the `CircularBuffer`'s queue.
 * The index supplied (`i`) must be an integer, and this method **interprets
 * the index relative to the current `tail` cursor position**. This represents
 * the oldest element inserted, i.e. FIFO behavior.
 *
 * To get an element relative to the `head` cursor position (LIFO), use
 * `CircularBuffer.get()`. To get an element via its position in the
 * underlying buffer, use `CircularBuffer.bufferGet()`.
 *
 * `i = 0` is the default value of `i`, and gets the element at the current
 * `tail` cursor position (i.e. the oldest element inserted into the
 * `CircularBuffer`). Positive values of `i` walk from the oldest inserted
 * element to the second-oldest inserted element, and so on.
 *
 * Negative indices walk backward, and going off the end of the buffer wraps
 * circularly as expected.
 *
 * @template T
 * @param {number=} i - The index to get from.
 * @return {T} - An element peeked from the `CircularBuffer`.
 */
CircularBuffer.prototype.peek = function(i=0) {
    //"use strict";
    if (typeof i !== "number" || i % 1 !== 0) {
        throw new Error(
            `CircularBuffer.peek(): i must be an integer. Got: ${i}`
        );
    }
    return this._buffer[this._clamp_index(this.tail + i)];
};

/**
 * Gets the value at a specified index in the `CircularBuffer`'s buffer.
 * The index supplied (`i`) must be an integer, and this method does **NOT**
 * interpret the index relative to any cursor position (`head` or `tail`); for
 * that, use `CircularBuffer.get()` or `CircularBuffer.peek()`, respectively.
 * Instead, this index indexes directly into the underlying buffer array.
 *
 * Negative indices walk backward, and going off the end of the buffer wraps
 * circularly as expected.
 *
 * @template T
 * @param {number} i - The index to get from.
 * @return {T} - An element gotten from the `CircularBuffer`.
 */
CircularBuffer.prototype.bufferGet = function(i) {
    //"use strict";
    if (typeof i !== "number" || i % 1 !== 0) {
        throw new Error(
            `CircularBuffer.bufferGet(): i must be an integer. Got: ${i}`
        );
    };
    return this._buffer[this._clamp_index(i)];
};

/**
 * Behaves like `CircularBuffer.get()`, but sets the value at that position
 * and then returns the old value. Also, `i` is not optional for this method.
 *
 * @template T
 * @param {number} i - The index at which to set the value.
 * @param {T} val - The new value to put at the specified index.
 * @return {T} - The old element that was at that index.
 */
CircularBuffer.prototype.set = function(i, val) {
    //"use strict";
    if (typeof i !== "number" || i % 1 !== 0) {
        throw new Error(
            `CircularBuffer.set(): i must be an integer. Got: ${i}`
        );
    }
    const i_ = this._clamp_index(this.head - 1 - i);
    const oldVal = this._buffer[i_];
    const zeroElement = this.isArray ? null : 0;
    if (oldVal === zeroElement && val !== zeroElement) {
        this.inhabited++;
    }
    this._buffer[i_] = val;
    return oldVal;
};

/**
 * Behaves like `CircularBuffer.bufferGet()`, but sets the value at that
 * position and then returns the old value.
 *
 * @template T
 * @param {number} i - The index at which to set the value.
 * @param {T} val - The new value to put at the specified index.
 * @return {T} - The old element that was at that index.
 */
CircularBuffer.prototype.bufferSet = function(i, val) {
    //"use strict";
    if (typeof i !== "number" || i % 1 !== 0) {
        throw new Error(
            `CircularBuffer.bufferSet(): i must be an integer. Got: ${i}`
        );
    }
    const i_ = this._clamp_index(i);
    const oldVal = this._buffer[i_];
    const zeroElement = this.isArray ? null : 0;
    if (oldVal === zeroElement && val !== zeroElement) {
        this.inhabited++;
    }
    this._buffer[i_] = val;
    return oldVal;
};

/**
 * Behaves like `CircularBuffer.set()`, but sets the value to the zero element,
 * which represents an uninhabited spot for a `CircularBuffer`.
 *
 * @template T
 * @param {number} i - The index to delete the value at.
 * @return {T} - The old element that was at that index.
 */
CircularBuffer.prototype.delete = function(i) {
    //"use strict";
    const zeroElement = this.isArray ? null : 0;
    return this.set(i, zeroElement);
};

/**
 * Behaves like `CircularBuffer.bufferSet()`, but sets the value to the zero
 * element, which represents an uninhabited spot for a `CircularBuffer`.
 *
 * @template T
 * @param {number} i - The index to delete the value at.
 * @return {T} - The old element that was at that index.
 */
CircularBuffer.prototype.bufferDelete = function(i) {
    //"use strict";
    const zeroElement = this.isArray ? null : 0;
    return this.bufferSet(i, zeroElement);
};

/**
 * Clears the entire underlying buffer of all its values.
 *
 * This is equivalent to `delete`ing all elements.
 *
 * @return {void}
 */
CircularBuffer.prototype.clear = function() {
    //"use strict";
    const zeroElement = this.isArray ? null : 0;
    for (let i = 0; i < this.capacity; ++i) {
        this._buffer[i] = zeroElement;
    }
};

/**
 * Gets a shallow copy of all elements in the buffer from `tail` up to but not
 * including the head element (said element being at `head - 1`).
 *
 * The kind of array that is returned is the same as the kind of the underlying
 * buffer (`this.isArray?`).
 *
 * @template T
 * @return {T[]}
 */
CircularBuffer.prototype.getTail = function() {
    //"use strict";
    const tailSize =
        this.tail < this.head ?
            this.head - this.tail - 1 :
            this.capacity - 1 - this.tail + this.head;
    const arr = this.isArray ? [] : new this._buffer.constructor(tailSize);
    let i = this.tail;
    let j = 0;
    for (; i !== this.head - 1; i = (i + 1) % this.capacity) {
        arr[j] = this._buffer[i];
        j++;
    }
    return arr;
};

/**
 * Gets a shallow copy of all elements in the buffer from the head element
 * (at `head - 1`) down to but not including `tail`.
 *
 * The kind of array that is returned is the same as the kind of the underlying
 * buffer (`this.isArray?`).
 *
 * @template T
 * @return {T[]}
 */
CircularBuffer.prototype.getInit = function() {
    //"use strict";
    const initSize =
        this.tail < this.head ?
            this.head - this.tail - 1 :
            this.capacity - 1 - this.tail + this.head;
    const arr = this.isArray ? [] : new this._buffer.constructor(initSize);
    let i = this.head - 1;
    let j = initSize - 1;
    for (; i !== this.tail; i = i < 1 ? this.capacity - 1 : i - 1) {
        arr[i] = this._buffer[i];
        j--;
    }
    return arr;
};

/**
 * Gets a shallow copy of the contents of the buffer, as an `Array`.
 *
 * @template T
 * @return {T[]}
 */
CircularBuffer.prototype.asArray = function() {
    //"use strict";
    if (this.isArray) {
        return this._buffer.slice();
    }
    const arr = [];
    for (let i = 0; i < this.capacity; ++i) {
        arr.push(this._buffer[i]);
    }
    return arr;
};

/**
 * Gets a shallow copy of the contents of the buffer, as a `TypedArray`.
 *
 * When `this.isArray === true`, the type of `TypedArray` to be returned can be
 * specified as an argument to this method (A constructor, like `Int32Array`);
 * the default is `Float64Array`. Otherwise, the type of the underlying buffer
 * is always what is returned.
 *
 * If the elements of this `CircularBuffer` don't "fit" (read: can't be
 * coerced) into the type specified or implied, there will likely be unexpected
 * results and possibly errors. This method makes **no guarantees** about such
 * cases.
 *
 * @param {{new(number): TypedArray}=} type
 * @return {TypedArray<?>}
 */
CircularBuffer.prototype.asTypedArray = function(type=Float64Array) {
    //"use strict";
    if (this.isArray) {
        const typedArr = new type(this.capacity);
        for (let i = 0; i < this.capacity; ++i) {
            typedArr[i] = this._buffer[i];
        }
        return typedArr;
    }
    return this._buffer.slice();
};


/* ====================| Internal functions below |==================== */


/**
 * **_Internal use only._**
 */
CircularBuffer.prototype._increment_head = function() {
    //"use strict";
    this.head = (this.head + 1) % this.capacity;
};

/**
 * **_Internal use only._**
 */
CircularBuffer.prototype._increment_tail = function() {
    //"use strict";
    this.tail = (this.tail + 1) % this.capacity;
};

/**
 * **_Internal use only._**
 */
CircularBuffer.prototype._decrement_head = function() {
    //"use strict";
    this.head = this.head === 0 ? this.capacity - 1 : this.head - 1;
};

/**
 * **_Internal use only._**
 */
CircularBuffer.prototype._decrement_tail = function() {
    //"use strict";
    this.tail = this.tail === 0 ? this.capacity - 1 : this.tail - 1;
};

/**
 * **_Internal use only._**
 */
CircularBuffer.prototype._clamp_index = function(i) {
    //"use strict";
    const i_ = i % this.capacity;
    if (i_ < 0) {
        return i_ + this.capacity;
    }
    return i_;
};
