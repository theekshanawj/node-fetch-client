/**
 * Take a promise and return [error, result] format.
 * If promise success -> [null, result]
 * If promise fail -> [error, null]
 * For a non-promise argument -> [error, null]
 * @param promise
 * @return {Error[]|Promise<[null, unknown] | [any, null]>}
 */
const to = (promise) => {
    if (promise instanceof Promise) {
        return promise.then((value) => [null, value])
            .catch((error) => [error, null]);
    }
    return [new Error('A Promise is expected'), null];
};

module.exports = { to };






