window['#ray.main'] = function(exports, module){
    var Painter = require("ray.painter");

    var Global = {
        ctx: null,
        background : null,
        painter: null
    };

    function paint(time) {
        Global.ctx.putImageData(Global.background, 0, 0);
        Global.painter.paint(time);
        window.requestAnimationFrame(paint);
    }


    window.setTimeout(
        function() {
            var res = window.localStorage.getItem("res");
            if (res == null) res = 2;
            res = parseInt(res);
            if (isNaN(res)) res = 2;
            document.getElementById("res1").removeAttribute("disabled");
            document.getElementById("res2").removeAttribute("disabled");
            document.getElementById("res4").removeAttribute("disabled");
            document.getElementById("res" + res).setAttribute("disabled", "true");

            var canvas = document.querySelector("canvas");
            var rect = canvas.getBoundingClientRect();
            canvas.setAttribute("width", rect.width / res);
            canvas.setAttribute("height", rect.height / res);
            var W = canvas.width, H = canvas.height;
            Global.ctx = canvas.getContext("2d");
            Global.ctx.fillStyle = "#000";
            Global.ctx.fillRect(0,0,W,H);
            Global.background = Global.ctx.getImageData(0, 0, W, H);
            Global.painter = new Painter(
                Global.background, W, H,
                function(x, y, mx, my) {
                    var r = Math.sqrt(x*x + y*y) / Math.max(mx, my, 0.0001);
                    var a = Math.PI * 1 * r;
                    return [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)];
                }
            );
            window.requestAnimationFrame(paint);

            function move(x, y) {
                var rect = canvas.getBoundingClientRect();
                x -= rect.left;
                y -= rect.top;
                x = (x - W / 2) / W;
                y = (y - H / 2) / H;
                Global.painter.vx = x / 15;
                Global.painter.vy = y / 15;
            }

            canvas.addEventListener(
                "mousemove",
                function(evt) {
                    move(evt.clientX, evt.clientY);
                }
            );
            canvas.addEventListener(
                "touchmove",
                function(evt) {
                    move(evt.touches[0].clientX, evt.touches[0].clientY);
                    evt.preventDefault();
                }
            );
        },
        1
    );

    window.res = function(res) {
        window.localStorage.setItem("res", res);
        window.location.reload();
    };
};
