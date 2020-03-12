// ____main____
const RANK = 4;
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

    let wrapper = document.querySelector('.wrapper');
    initTable(wrapper);
    wrapper.innerHTML += '<center><h4>График сумарной ошибки НС по эпохам обучения</h4></center><div id="myfirstchart" style="height: 450px;"></div>'
    startLearning(values.FUNCTION, values.LEARNING_RATE, values.ACTIVATION_FUNCTION);

    let pt = document.querySelector('.partial-training');
    initTable(pt);
    pt.innerHTML += '<center><h4>Минимальный набор</h4></center><div id="sets"></div>'
    findMinimalXsAmount(values.FUNCTION, values.LEARNING_RATE, values.ACTIVATION_FUNCTION);
}

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

function initTable(to) {
    if (!to) { return; }

    to.innerHTML = '';
    let table = document.createElement('table');
    table.innerHTML = `
    <caption><h3>Параметры НС на последовательных эпохах</h3></caption>
    <tr>
        <th>Номер эпохи <i>k</i></th>
        <th>Вектор весов <b>w</b></th>
        <th>Выходной вектор <b>y</b></th>
        <th>Сумарная ошибка <i>E</i></th>
    </tr>`
    table.setAttribute('border', '1px');
    table.setAttribute('cellpadding', '0');
    table.setAttribute('cellspacing', '0');
    to.appendChild(table);
}

function appendToTable(k,w,y,E) {
    let table = document.querySelector('table');
    let tableRow = document.createElement('tr');

    w.forEach((el, i)=>{ w[i] = (+el.toFixed(RANK)); });
    tableRow.innerHTML = `<td><center>${k}</center></td><td><center>(${w})</center></td><td><center>(${y})</center></td><td><center>${E}</center></td>`;

    table.appendChild(tableRow);
}

function plot(map) {
    new Morris.Line({
        // ID of the element in which to draw the chart.
        element: 'myfirstchart',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: map,
        // The name of the data record attribute that contains x-values.
        xkey: 'k',
        // A list of names of data record attributes that contain y-values.
        ykeys: ['E'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
        labels: ['Суммарная ошибка'],

        parseTime: false,
        smooth: false,
      });
}

function printResults(result) {
    let table = document.querySelectorAll('table')[1];

    result.table.forEach(row => {
        let tableRow = document.createElement('tr');
        row.w.forEach((el, i)=>{ row.w[i] = (+el.toFixed(RANK)); });
        tableRow.innerHTML = `<td><center>${row.k}</center></td><td><center>(${row.w})</center></td><td><center>(${row.y})</center></td><td><center>${row.E}</center></td>`;
    
        table.appendChild(tableRow);
    });

    let sets = document.getElementById("sets");

    result.sets.forEach((set, i) => {
        let s = document.createElement('div');
        set.shift();
        s.innerHTML = `<center>x <sup><small>(${i})</small></sup> = ${set}</center>`;
        sets.appendChild(s);
    })
}

// ____Logic_____

/**
 * @param {Array} booleanFunc
 * @param {Number} lerningRate
 * @param {Number} activationFunc
 */
function startLearning(booleanFunc, lerningRate, activationFunc) {
    let map = [];

    var totalError = 1;
    let numberOfVariables = Math.log2(booleanFunc.length);
    let weightVector = generateZeroWeightVector(numberOfVariables + 1);

    for(let era = 0; totalError != 0; era++) {
        if (era == 100) break; // если цикл бесконечный

        let netVector = calculateNet(weightVector);
        let yVector = calculateY(netVector, activationFunc);
        let errorVector = calculateError(booleanFunc, yVector);
        totalError = calculateTotalError(errorVector);
     
        appendToTable(era, weightVector, yVector, totalError);
        map.push({k: era, E: totalError});

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
    plot(map);
}

/**
 * корректировка вектора весов согласно правилу Видроу-Хоффа (дельта-правило)
 * @param {Object} v структура с векторами весов, net, нормой обучения, целевой функцией и ФА
 * @returns {Array} Новый вектор весов
 */
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
    }
    return v.w;
}

/**
 * Вычисление ошибки
 * @param {Array} t целевой выход
 * @param {Array} y реальный выход НС
 * @returns {Array} Вектор ошибок
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
 * @param {Array} weightVector вектор весов W
 * @returns {Array} вектор сетового входа net
 */
function calculateNet(weightVector) {
    let xVectors = generateXs(weightVector.length);
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
 * Вычисление выходного вектора Y
 * @param {Array} netVector вектор сетового входа net
 * @param {Number} activationFunc функция активации
 * @returns {Array} реальный выход НС
 */
function calculateY(netVector, activationFunc) {
    let yVector = new Array(netVector.length);

    netVector.forEach((net, i) => {
        yVector[i] = f(activationFunc, net);
    });

    return yVector;
}

/**
 * Вычисление квадратичного отклонения
 * @param {Array} error вектор ошибок
 * @returns {Number}
 */
function calculateTotalError(error) {
    total = 0;
    error.forEach((elem) => { total += elem * elem; });
    return total;
}

/**
 * Генерация векторов переменных Х (Х0-еденичный)
 * @param {Number} size размер вектора(количество переменных)
 * @returns {Array} вектор X = (x0, x1, ...)
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
 * @param {Number} size размер вектора
 * @returns {Array} вектор W = (w0, w1, ...)
 */
function generateZeroWeightVector(size) {
    let vector = new Array(size);
    vector.fill(0, 0, size);
    return vector;
}

function findMinimalXsAmount(booleanFunc, lerningRate, activationFunc) {
    let input = {
        t : booleanFunc,
        n : lerningRate,
        fa : activationFunc,
    };

    let result = {
        found: false,
        table: [],
    };

    for (let i = 1; i < booleanFunc.length; i++) {
        let combinations = getAllCombinations(booleanFunc.length, i);

        for (let j = 0; j < combinations.length; j++) {
            partialTraining(combinations[j], input, result);
            if (result.found) {  
                break;
            }
        }
        if (result.found) {
            console.log(result.table);
            console.log(result.sets);
            printResults(result);
            break;
        }
    }
}

function partialTraining(combination, input, result) {
    let table = [];

    var totalError = 1;
    let numberOfVariables = Math.log2(input.t.length);
    let weightVector = generateZeroWeightVector(numberOfVariables + 1);

    for(let era = 0; totalError != 0; era++) {
        if (era == 100) break; // если цикл бесконечный

        let netVector = calculateNet(weightVector);
        let yVector = calculateY(netVector, input.fa);
        let errorVector = calculateError(input.t, yVector);
        totalError = calculateTotalError(errorVector);
        
        table.push({
            k : era,
            w : weightVector.slice(),
            y : yVector.slice(),
            E : totalError,
        });
        
        if (totalError != 0) {
            let res = correctWeightOnSet(weightVector, combination, input);
            weightVector = res.w.slice();
            result.sets = res.xs.slice();
        } else {
            result.found = true;
            result.table = table;
            return;
        }
    }
}

function correctWeightOnSet(w, combination, input) {
    let xVectors = generateXs(w.length);
    let xs = [];
    
    combination.forEach((index) => {
        let x = [];
        let net = 0;
        for (let j = 0; j < w.length; j++) {
            net += xVectors[j][index] * w[j];
            x.push(xVectors[j][index]);
        };
        xs.push(x.slice());
        
        let delta = input.t[index] - f(input.fa, net);

        for (let j = 0; j < w.length; j++) {
            w[j] += xVectors[j][index] * delta * input.n * df(input.fa, net);
        };
    });

    return { w, xs };
}

function checkWeigts(w, fa) {
    let net = calculateNet(w);
    let y = calculateY(net, fa);
    return y;
}