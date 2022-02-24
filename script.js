cvn = null;
ctx = null;

move_spotlight = false;

cvn_size  = {'width': 1200, 'height': 675};
spotlight = {'x': cvn_size.width/2, 'y': cvn_size.height/2, 'r': 1000};
raycast   = new RAYCAST(cvn_size.width, cvn_size.height);

function updateDraw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, cvn_size.width, cvn_size.height);

    raycast._rect_list.forEach(r => {drawRect(r.x, r.y, r.width, r.height)});
    let casts = raycast.getCasts(spotlight.x, spotlight.y);
    drawLighting(casts);
    // casts.map(c => {drawCast(c.x, c.y)});
    drawSpotlight();
}

function drawSpotlight(){
    ctx.beginPath();
    ctx.arc(spotlight.x, spotlight.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffff77";
    ctx.fill();
    ctx.strokeStyle = "#ffffaa";
    ctx.stroke();
}

function drawRect(x, y, width, height){
    ctx.fillStyle = "#aaa";
    ctx.fillRect(x, y, width, height);
}

function drawCast(x, y, color="red") {
    ctx.beginPath();
    ctx.moveTo(spotlight.x, spotlight.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawLighting(casts, color="#eeaa3399") {
    // console.log(casts);

    ctx.beginPath();
    ctx.moveTo(casts[0].x, casts[0].y);
    for(let c in casts) {
        if(c === 0) continue;
        ctx.lineTo(casts[c].x, casts[c].y);
    }
    ctx.closePath();

    // Create gradient
    let gradient = ctx.createRadialGradient(spotlight.x, spotlight.y, 0, spotlight.x, spotlight.y, spotlight.r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fill();
}

function resizeCanvas() {
    cvn.width  = cvn_size.width;
    cvn.height = cvn_size.height;
};

_documentReady = setInterval((func) => {if(document.readyState !== "complete")return; clearInterval(_documentReady); delete _documentReady; func();}, 1, () => {
    cvn = document.getElementById("screen");
    ctx = cvn.getContext("2d");
    
    raycast.addRect(300, 100, 80, 120);
    raycast.addRect(1000, 150, 80, 80);
    raycast.addRect(350, 400, 180, 80);
    raycast.addRect(530, 450, 80, 80);

    resizeCanvas();
    updateDraw();

    cvn.addEventListener("mousedown", (e) => {
        move_spotlight = true;
    });

    cvn.addEventListener("mousemove", (e) => {
        if(move_spotlight) {
            spotlight.x = e.offsetX;
            spotlight.y = e.offsetY;

            updateDraw();
        }
    });
    cvn.addEventListener("mouseup", (e) => {
        move_spotlight = false;
    });
    cvn.addEventListener("mouseleave", (e) => {
        move_spotlight = false;
    });
});