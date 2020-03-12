/**
 * функция активации
 * @param {Number} activationFunc тип функции активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение ФА(net)
 */
function f(activationFunc, net) {
    switch(activationFunc) {
        case 1:
            return fa1(net);
        case 2:
            return fa2(net);
        case 3:
            return fa3(net);
        case 4:
            return fa4(net);
        default:
            return fa1(net);
    }
}

/**
 * производная функция активации
 * @param {Number} activationFunc тип функции активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение производной ФА(net)
 */
function df(activationFunc, net) {
    switch(activationFunc) {
        case 1:
            return dfa1(net);
        case 2:
            return dfa2(net); 
        case 3:
            return dfa3(net);
        case 4:
            return dfa4(net);
        default:
            return 1;
    }
}

/**
 * Пороговая функция активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение ФА(net)
 */
function fa1(net) {
    if (net >= 0){
        return 1;
    }
    return 0;
}

/**
 * Производная пороговой функции активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение производной ФА(net)
 */
function dfa1(net) {
    return 1;
}

/**
 * Логистическая модульная функция активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение ФА(net)
 */
function fa2(net) {
    let out = 0.5 * (1 + (net / (1 + Math.abs(net))));
    if (out >= 0.5){
        return 1;
    }
    return 0;
}

/**
 * Производная пороговой функции активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение производной ФА(net)
 */
function dfa2(net) {
    return 0.5 / Math.pow(Math.abs(net) + 1, 2);
}

/**
 * Логистическая сигмоидальная функция активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение ФА(net)
 */
function fa3(net) {
    let out = 1/(1 + Math.exp(-net));
    if (out >= 0.5){
        return 1;
    }
    return 0;
}

/**
 * Производная пороговой функции активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение производной ФА(net)
 */
function dfa3(net) {
    return (1/(1 + Math.exp(-net)))*(1 - (1/(1 + Math.exp(-net))));
}

/**
 * Логистическая тангенсальная функция активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение ФА(net)
 */
function fa4(net) {
    let out = 0.5 * (Math.tanh(net)+1);
    if (out >= 0.5){
        return 1;
    }
    return 0;
}

/**
 * Производная пороговой функции активации
 * @param {Number} net вектор сетового входа
 * @returns {Number} значение производной ФА(net)
 */
function dfa4(net) {
    return (0.5 / Math.pow(Math.cos(net), 2));
}