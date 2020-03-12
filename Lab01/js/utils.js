/**
 * все сочетания наборов без повторений С из n по k
 * @param {Number} n
 * @param {Number} n
 * @returns {Array}
 */
function getAllCombinations(n, k) {
    let combinations = [];
    if (k > n) {
        return combinations;
    }

    let set = { sample : [] };
    for (let i = 0; i < k; i++) {
        set.sample.push(i);
    }

    combinations.push(set.sample.slice());
    while (nextCombination(set, n)) {
        combinations.push(set.sample.slice());
    }
    return combinations;
}

/**
 * генерация следующей выборки
 * @param {Object} set
 * @param {Number} n
 * @returns {Boolean}
 */
function nextCombination(set, n) {
    let k = set.sample.length;
    for (let i = k - 1; i >= 0; --i) {
        if (set.sample[i] < n-k+i) {
            ++set.sample[i];
            for (let j = i + 1; j < k; ++j) {
                set.sample[j] = set.sample[j-1]+1;
            }
            return true;
        }
    }
    return false;
}