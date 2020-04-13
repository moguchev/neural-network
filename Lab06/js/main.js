var canvas = document.getElementById('field');

if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    
    for (i = 10; i < 100; i += 10) {
        drawPoint(ctx, i, i + Math.random()*100, "red")
    }
}


/**
 * функция отрисовки точки
 * @param {CanvasRenderingContext2D} ctx контекст canvas
 * @param {number} x координата центра точки
 * @param {number} y координата центра точки
 * @returns {string} цвет точки
 */
function drawPoint(ctx, x, y, color) {
    var circle = new Path2D();
    circle.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill(circle);
    circle.closePath()
}