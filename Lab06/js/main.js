const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

const addPoints = document.getElementById('add-points');
addPoints.addEventListener('submit', this.addPoint.bind(this), false)

const addCenters = document.getElementById('add-centers');
addCenters.addEventListener('submit', this.addCenter.bind(this), false)

var POINTS = [];
var CENTERS = [];

/**
 * Обработчик формы добавления точки
 * @param {Event} event
 */
function addCenter(event) {
    event.preventDefault();
    let x = document.getElementById('xc');
    let y = document.getElementById('yc');
    drawСenter(ctx, x.value, y.value, "red")
}

/**
 * Обработчик формы добавления точки
 * @param {Event} event
 */
function addPoint(event) {
    event.preventDefault();
    let x = document.getElementById('x');
    let y = document.getElementById('y');
    drawPoint(ctx, x.value, y.value, "black")
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
    rectangle.rect(x, y, 10, 10);
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
    circle.closePath()
}