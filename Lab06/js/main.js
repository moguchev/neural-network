const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
// Форма добавления точек
const addPoints = document.getElementById('add-points');
addPoints.addEventListener('submit', this.onAddPoint.bind(this), false);
// Форма добавления центров
const addCenters = document.getElementById('add-centers');
addCenters.addEventListener('submit', this.onAddCenter.bind(this), false);
// Форма выбора метрики
const main = document.getElementById('main-form');
main.addEventListener('submit', this.onBegin.bind(this), false);

const points = document.getElementById('points')
initScreenTable(points, 'points-screen', 'Исходные точки');
const centers = document.getElementById('centers')
initScreenTable(centers, 'centers-screen', 'Исходные центры кластеров');

// массив точек
var POINTS = [];
// массив центров
var CENTERS = [];
// массив цветов
const COLORS = [
    'fuchsia',
    'red', 
    'yellow', 
    'lime',
    'green',
    'aqua',
    'blue',
    'navy',
    'purple',
    'black',
    'silver'
];
const DARKCOLORS = [
    'rgba(255, 0, 255, 0.15)',
    'rgba(255, 0, 0, 0.15)',
    'rgba(255, 255, 0, 0.15)',
    'rgba(0, 255, 0, 0.15)',
    'rgba(0, 128, 0, 0.15)',
    'rgba(0, 255, 255, 0.15)',
    'rgba(0, 0, 255, 0.15)',
    'rgba(0, 0, 128, 0.15)',
    'rgba(128, 0, 128, 0.15)',
    'rgba(0, 0, 0, 0.15)',
    'rgba(192, 192, 192, 0.15)'
];
/**
 * вычисление расстояния
 * @param {number} type
 * @param {number} x
 * @param {number} y
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function ComputeDistance(type, x, y, a, b) {
    switch(type) {
        case 1:
            // Евклида
            return Math.sqrt(Math.pow(x-a, 2) + Math.pow(y-b, 2));
        case 2:
            // Чебышева
            return Math.max(Math.abs(x-a), Math.abs(y-b));
        default:
            console.log('ERROR');
            return 0;
    }
}

/**
 * main
 * @param {number} distanceType
 * @param {Array}
 */
function getClusters(distanceType) {
    let centers = JSON.parse(JSON.stringify(CENTERS));
    let Q = Infinity;
    let oldQ = 0;
    let clusters = [];
    do {
        clusters = clustering(distanceType, centers);
        console.log(JSON.stringify(centers));
        computeNewCenters(centers, clusters);
        console.log(JSON.stringify(centers));
        oldQ = Q;
        Q = computeSum(centers, clusters, distanceType);
    } while(Q - oldQ != 0);
    return {cl: clusters, c: centers};
}

/**
 * 
 * @param {Array} centers
 * @param {Array} clusters
 * @param {number} d
 */
function computeSum(centers, clusters, d) {
    let sum = 0;
    clusters.forEach((cluster, center)=>{
        cluster.forEach((point)=>{
            sum += ComputeDistance(d, POINTS[point].x, POINTS[point].y,
                centers[center].x, centers[center].y)
        });
    });
    return sum;
}

/**
 * кластеризация
 * @param {number} d
 * @param {Array} centers
 * @returns {Array}
 */
function clustering(d, centers) {
    let clusters = new Array(centers.length);
    for (let i = 0; i < centers.length; i++) {
        clusters[i] = new Array();
    }
    
    POINTS.forEach((point, index) => {
        let distances = new Array(centers.length);
        centers.forEach((center, i) => {
            distances[i] = ComputeDistance(d, point.x, point.y, center.x, center.y);
        });
        clusters[minIndex(distances)].push(index);
    });
    return clusters;
}

/**
 * пересчёт новых центров
 * @param {Array} centers
 * @param {Array} clusters
 * @param {Array} points
 */
function computeNewCenters(centers, clusters) {
    clusters.forEach((cluster, index)=>{
        let x = [];
        let y = [];
        cluster.forEach((point)=>{
            x.push(Number(POINTS[point].x));
            y.push(Number(POINTS[point].y));
        });
        x.sort((a, b) => a - b);
        y.sort((a, b) => a - b);
        len = cluster.length;
        median = Math.floor(len/2);
        if (len % 2 == 1) {
            centers[index].x = x[median];
            centers[index].y = y[median];
        } else {
            centers[index].x = (x[median] + x[median-1])/2;
            centers[index].y = (y[median] + y[median-1])/2;
        }
    });
}

/**
 * кластеризация
 * @param {Array} array
 * @returns {number} index
 */
// получение индекса минимального элемента массива
function minIndex(array) {
    if (array.length == 0)
        return -1;

    let index = 0;
    let min = array[index];
    for (let i = 0; i < array.length; i++) {
        if (min > array[i]) {
            min = array[i];
            index = i;
        }
    }
    return index;
}

// GUI
function plotResults(to, clusters, centers) {
    to.innerHTML = '';
    let table = document.createElement('table');
    table.innerHTML = `
    <caption>Таблица кластеров</caption>
    <tr>
        <th>Кластер</th>
        <th>Исходные центры кластеров</th>
        <th>Полученные центры</th>
        <th>Точки кластера</th>
    </tr>`
    table.setAttribute('border', '1px');
    table.setAttribute('cellpadding', '0');
    table.setAttribute('cellspacing', '0');
    to.appendChild(table);

    clusters.forEach((cluster, center) => {
        let points = ''
        cluster.forEach((point)=>{
            points += `(${POINTS[point].x},${POINTS[point].y}) `;
        });
        let tableRow = document.createElement('tr');
        tableRow.innerHTML = `
            <td><center>${center}</center></td>
            <td><center>(${CENTERS[center].x},${CENTERS[center].y})</center></td>
            <td><center>(${centers[center].x},${centers[center].y})</center></td>
            <td><center>${points}</center></td>`;
        table.appendChild(tableRow);
    })
}
/**
 * Обработчик формы добавления центра
 * @param {Event} event
 */
function onBegin(event) {
    event.preventDefault();
    console.log('CENTERS: ', CENTERS);
    console.log('POINTS: ', POINTS);
    document.getElementById('add-center').disabled = true;
    document.getElementById('add-point').disabled = true;
    d = Number(document.querySelector('[name="distance"]:checked').value);
    let result = getClusters(d);
    let clusters = result.cl;
    let newCenters = result.c;
    ctx.clearRect(0,0,800,500);
    
    clusters.forEach((cluster, center)=>{
        drawСenter(ctx, CENTERS[center].x, CENTERS[center].y, DARKCOLORS[center]);
        drawСenter(ctx, newCenters[center].x, newCenters[center].y, COLORS[center]);
        cluster.forEach(point =>{
            drawPoint(ctx, POINTS[point].x, POINTS[point].y, COLORS[center]);
        });
    });
    plotResults(document.getElementById('results'), clusters, newCenters);
}

/**
 * Обработчик формы добавления центра
 * @param {Event} event
 */
function onAddCenter(event) {
    event.preventDefault();
    let x = document.getElementById('xc');
    let y = document.getElementById('yc');

    if (CENTERS.length < COLORS.length) {
        appendToScreenTable('centers-screen', CENTERS.length, x.value, y.value);
        CENTERS.push({x: Number(x.value), y: Number(y.value)});
        drawСenter(ctx, x.value, y.value, 'red');
    }

    if (CENTERS.length == COLORS.length) {
        let button = document.getElementById('add-center');
        button.disabled = true;
    }
    // очищаем inputs
    x.value = '';
    y.value = '';
}

/**
 * Обработчик формы добавления точки
 * @param {Event} event
 */
function onAddPoint(event) {
    event.preventDefault();
    let x = document.getElementById('x');
    let y = document.getElementById('y');
    appendToScreenTable('points-screen', POINTS.length, x.value, y.value);
    POINTS.push({x: Number(x.value), y: Number(y.value)});
    drawPoint(ctx, x.value, y.value, 'black');
    // очищаем inputs
    x.value = '';
    y.value = '';
}

/**
 * функция отрисовки центра
 * @param {CanvasRenderingContext2D} ctx контекст canvas
 * @param {number} x координата центра точки
 * @param {number} y координата центра точки
 * @returns {string} цвет точки
 */
function drawСenter(ctx, x, y, color) {
    let rectangle = new Path2D();
    rectangle.rect(x-5, y-5, 10, 10);
    ctx.fillStyle = color;
    ctx.fill(rectangle);
    rectangle.closePath()
}

/**
 * функция отрисовки точки
 * @param {CanvasRenderingContext2D} ctx контекст canvas
 * @param {number} x координата центра точки
 * @param {number} y координата центра точки
 * @returns {string} цвет точки
 */
function drawPoint(ctx, x, y, color) {
    let circle = new Path2D();
    circle.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill(circle);
    ctx.fillStyle = "#000";
    ctx.stroke(circle);
    circle.closePath()
}

/**
 * функция инициализации таблицы
 * @param {HTMLElement} to
 * @param {string} id
 * @param {string} title
 */
function initScreenTable(to, id, title) {
    if (!to) { return; }

    to.innerHTML = '';
    let table = document.createElement('table');
    table.id = id;
    table.innerHTML = `
    <caption>${title}</caption>
    <tr>
        <th><i>i</i></th>
        <th><b>x,y</b></th>
    </tr>`
    table.setAttribute('border', '1px');
    table.setAttribute('cellpadding', '0');
    table.setAttribute('cellspacing', '0');
    to.appendChild(table);
}

/**
 * функция вставки в таблицу
 * @param {string} id
 * @param {number} i
 * @param {number} x
 * @param {number} y
 */
function appendToScreenTable(id,i,x,y) {
    let table = document.getElementById(id);
    let tableRow = document.createElement('tr');
    tableRow.innerHTML = `<td><center>${i}</center></td><td><center>(${x},${y})</center></td>`;
    table.appendChild(tableRow);
}
