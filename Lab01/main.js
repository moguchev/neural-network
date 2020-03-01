// ____main____
const form = document.querySelector('.user-form');

if (form) {
    form.addEventListener('submit', this.handler.bind(this), false)
}

/**
 * Обработчик формы
 * @param {Event} event
 */
function handler(event) {
    event.preventDefault();
    let values = getValues();
    console.log(values);
    startLearning(values.FUNCTION, values.LEARNING_RATE, values.ACTIVATION_FUNCTION);
}

// ____UI_____
/**
 * Получение булевой функции, функци активации и нормы обучения от пользователя
 * @returns {Object}
 */
function getValues() {
    let FUNCTION = [];
    let LEARNING_RATE = 0.3;
    let ACTIVATION_FUNCTION = 1;
    // получаем значения функции
    let bits = document.querySelectorAll('[name="bit"]');
    bits.forEach(bit => {
        FUNCTION.push(Number(bit.value));
    });
    console.log(FUNCTION);
    // получаем норму обучения
    LEARNING_RATE =  Number(document.querySelector('[name="learning-rate"]').value);
    console.log(LEARNING_RATE);
    // получаем тип функции активации
    ACTIVATION_FUNCTION = Number(document.querySelector('[name="activation-function"]:checked').value);
    console.log(ACTIVATION_FUNCTION);

    return { FUNCTION, LEARNING_RATE, ACTIVATION_FUNCTION };
}

// ____Logic_____
/**
 * @param {Array} booleanFunc
 * @param {Number} lerningRate
 * @param {Number} activationFunc
 */
function startLearning(booleanFunc, lerningRate, activationFunc) {
    var totalError = 1;
    let numberOfVariables = Math.log2(booleanFunc.length);
    let weightVector = generateZeroWeightVector(numberOfVariables + 1);

    for(let era = 0; totalError != 0; era++) {
        let netVector = calculateNet(weightVector);
        let yVector = calculateY(netVector, activationFunc);
        let errorVector = calculateError(booleanFunc, yVector);

        totalError = 0;
        errorVector.forEach((elem) => { totalError += elem*elem;});

        console.log("Эра: ", era);
        console.log("Вектор весов: ", weightVector);
        console.log("Выходной вектор: ", yVector);
        console.log("Сумарная ошибка: ", totalError);

        if (totalError != 0) {
            vectors = {
                w: weightVector,
                n: lerningRate,
                func: booleanFunc,
                net: netVector,
                af: activationFunc,
            }
            weightVector = correctWeight(vectors);
        }
    }
}


function correctWeight(v) {
    let xVectors = generateXs(v.w.length);
    let count = Math.pow(2, v.w.length-1);

    for (let i = 0; i < count; i++){
        let net = 0;
        for (let j = 0; j < v.w.length; j++) {
            net += xVectors[j][i]*v.w[j]
        };
        
        let delta = v.func[i] - f(v.af, net);

        for (let j = 0; j < v.w.length; j++) {
            v.w[j] += xVectors[j][i] * delta * v.n * df(v.af, net);
        };
        console.log(i, v.w);
    }
    return v.w;
}

/**
 * Вычисление ошибки
 * @param {Array} t
 * @param {Array} y
 * @returns {Array}
 */
function calculateError(t,y) {
    let delta = new Array;
    t.forEach((elem, i) => {
        delta.push(elem-y[i]);
    })
    return delta;
}

/**
 * Вычисление вектора net
 * @param {Array} weightVector
 * @returns {Array}
 */
function calculateNet(weightVector) {
    let xVectors = generateXs(weightVector.length);
    console.log(xVectors);

    let count = Math.pow(2, weightVector.length-1);
    let netVector = new Array(count);
    for (let i = 0; i < count; i++) {
        let net = 0;
        for (let j = 0; j < weightVector.length; j++) {
            net += weightVector[j]*xVectors[j][i];
        }
        netVector[i] = net;
    }
    return netVector;
}

/**
 * Вычисление выходного вектора
 * @param {Array} netVector
 * @param {Number} activationFunc
 * @returns {Array}
 */
function calculateY(netVector, activationFunc) {
    let yVector = new Array(netVector.length);

    netVector.forEach((net, i) => {
        yVector[i] = f(activationFunc, net);
    });

    return yVector;
}

/**
 * функция активации
 * @param {Number} activationFunc
 * @param {Number} net
 * @returns {Number}
 */
function df(activationFunc, net) {
    switch(activationFunc) {
        case 1:
            return 1;
        case 2:
            return 1; // TODO
        case 3:
            return fa3(net)*(1 - fa3(net));
        case 4:
            return 1; // TODO
        default:
            return 1;
    }
}
/**
 * функция активации
 * @param {Number} activationFunc
 * @param {Number} net
 * @returns {Number}
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

function fa1(net) {
    if (net >= 0){
        return 1;
    }
    return 0;
}

function fa2(net) {
    return 0.5*(net/(1+Math.abs(net))+1);
}

function fa3(net) {
    return 1/(1+Math.exp(-net));
}

function fa4(net) {
    return 0.5(Math.tanh(net)+1);
}
/**
 * генерация векторов переменных Х (Х0-еденичный)
 * @param {Number} size
 * @returns {Array}
 */
function generateXs(size) {
    Xs = new Array(size);
    length = Math.pow(2,(size-1));

    for (i = 0; i < size; i++) {
        let x = new Array(length);
        if (i == 0) { 
            x.fill(1, 0, length);
        } else {
            x.fill(0, 0, length);
            let step = Math.pow(2,(size-i-1));
            for (let j = step; j < length; j += 2*step) {
                x.fill(1, j, j+step);
            }
        }
        Xs[i] = x;
    }
    return Xs;
}

/**
 * генерация нулевого вектора весов
 * @param {Number} size
 * @returns {Array}
 */
function generateZeroWeightVector(size) {
    let vector = new Array(size);
    vector.fill(0, 0, size);
    return vector;
}
