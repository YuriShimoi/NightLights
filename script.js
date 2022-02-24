cvn = null;
ctx = null;

move_spotlight = false;

cvn_size  = {'width': 1200, 'height': 675};
spotlight = null;

function updateDraw() {
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 0, cvn_size.width, cvn_size.height);

    spotlight.drawCasts();
    // spotlight.drawRects();
    spotlight.drawSpotlight();
}

function resizeCanvas() {
    cvn.width  = cvn_size.width;
    cvn.height = cvn_size.height;
};

_documentReady = setInterval((func) => {if(document.readyState !== "complete")return; clearInterval(_documentReady); delete _documentReady; func();}, 1, () => {
    cvn = document.getElementById("screen");
    ctx = cvn.getContext("2d");
    resizeCanvas();

    spotlight = new SPOTLIGHT(cvn, cvn_size.width/2, cvn_size.height/2, 1200);
    spotlight.addRect( 300, 100,  80, 120);
    spotlight.addRect(1000, 150,  80,  80);
    spotlight.addRect( 350, 400, 180,  80);
    spotlight.addRect( 530, 450,  80,  80);

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