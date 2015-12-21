window['#ray.painter'] = function(exports, module){
    "use strict";

    // Sphere radius.
    var RADIUS = 20;
    // Square of  the sphere  radius. Because we  don't want  to compute
    // this more than once.
    var RADIUS_2 = RADIUS * RADIUS;
    // Distance between two sphere centers (in orhtogonal plane).
    var SPARSITY = 40;
    // Distance  between  the screen  and  the  eye (the  camera).  This
    // defined a kinf of DOF (depth of field).
    var EYE = 1;

    /**
     * @param {ImageData} background.
     * @param {Uint8ClampedArray}  background.data -  Array of pixels  of the
     * screen. [Red, Green, Blue, Alpha, Red, Green, ...].
     * @param W - width of the screen.
     * @param H - height of the screen.
     */
    var Painter = function(background, W, H, deform) {
        this.background = background;
        this.W = W;
        this.H = H;
        var i, j, k;
        // Size of the  screen in the 3D space. This  screen lies in the
        // plane of equation `Z = this.z - EYE`.  This screen is plitted
        // into `W`  cols and `H`  rows, representing the  final pixels.
        // In ray-tracing, we cast a ray  of light from the eye, through
        // a  cell of  the screen  (mapped to  a final  pixel) until  it
        // reaches a sphere or lost itself into darkness.
        var s = EYE * Math.min(W, H) / 2;
        var xx, yy;
        var maxX = 0;
        var maxY = 0;
        this.screen = [];
        for (j = 0 ; j < H ; j++) {
            for (i = 0 ; i < W ; i++) {
                xx = (i - W / 2) / s;
                yy = (j - H / 2) / s;
                this.screen.push([xx, yy]);
                maxX = Math.max(maxX, Math.abs(xx));
                maxY = Math.max(maxY, Math.abs(yy));
            }
        }
console.info("[ray.painter] maxX, maxY=...", maxX, maxY);
        if (typeof deform === 'function') {
            this.screen.forEach(function (itm, idx, arr) {
                var x = itm[0];
                var y = itm[1];
                arr[idx] = deform(x, y, maxX, maxY);
            });
        }

        // Preparing a random table. Computed once.
        this.random = [];
        for (k = 0 ; k < 999997 ; k++) {
            this.random.push(Math.random());
        }
        // Preparing a cosine table to prevent time consuming calculus.
        this.cos = [];
        for (k = 0 ; k < 1000 ; k++) {
            this.cos.push(Math.cos(k * Math.PI / 500));
        }
        // (x,y,z) space coords of the eye (camera).
        this.x = Math.random() * SPARSITY;
        this.y = Math.random() * SPARSITY;
        this.z = 0;
        // (vx,vy,vz) direction of yes's move.
        this.vx = Math.random() * .06 - .03;
        this.vy = Math.random() * .06 - .03;
        this.vz = .04;
        this.time = 0;
    };

    /**
     * @return void
     */
    Painter.prototype.paint = function(time) {
        var delta = time - this.time;
        if (delta > 2000) {
            delta = 0;
        }
        this.time = time;
        this.x += delta * this.vx;
        this.y += delta * this.vy;
        this.z += delta * this.vz;

        var data = this.background.data;
        var index = 0;
        // Position of the nearest plan. Relative to the eye.
        var planZ, planZ0 = SPARSITY * Math.ceil(this.z / SPARSITY) - this.z + 1;
        var planX, planY;
        var color = 0;
        var col, row, depth;
        var ray, rayX, rayY, rayZ = 1;
        var sphereX, sphereY, dist;
        var idxX, idxY, idxZ;
        var idxRnd;
        var radius, radius2;
        var bumpPeriod;
        for (row = 0 ; row < this.H ; row++) {
            for (col = 0 ; col < this.W ; col++) {
                ray = this.screen[col + row * this.W];
                rayX = ray[0];
                rayY = ray[1];
                color = 0;
                planZ = planZ0;
                idxZ = Math.floor(.5 + (planZ0 + this.z) / SPARSITY);
                for (depth = 0 ; depth < 8 ; depth++) {
                    // Intersection with plan.
                    planX = rayX * planZ + this.x;
                    planY = rayY * planZ + this.y;
                    // Finding nearest sphere.
                    sphereX = SPARSITY * Math.floor(.5 + planX / SPARSITY);
                    sphereY = SPARSITY * Math.floor(.5 + planY / SPARSITY);
                    // Distance to the center of the sphere.
                    dist = (sphereX - planX) * (sphereX - planX) + (sphereY - planY) * (sphereY - planY);
                    idxX = Math.floor(.5 + planX / SPARSITY);
                    idxY = Math.floor(.5 + planY / SPARSITY);
                    idxRnd = (3 * idxX + 7 * idxY + 11 * idxZ) % this.random.length;
                    if (idxRnd < 0) idxRnd += this.random.length;
                    radius = RADIUS * (this.random[idxRnd + 3] / 2 + .4);
                    bumpPeriod = this.random[idxRnd + 4] * 300 + 500;
                    radius += radius * .1
                        * this.cos[Math.floor(this.cos.length * time / bumpPeriod) % this.cos.length];
                    radius2 = radius * radius;
                    if (dist < radius2) {
                        color = 1 - planZ / (7 * SPARSITY);
                        break;
                    }
                    planZ += SPARSITY;
                    idxZ++;
                }
                color *= 1 - dist / radius2;
                color *= 255;
                data[index    ] = color * this.random[idxRnd];
                data[index + 1] = color * this.random[idxRnd + 1];
                data[index + 2] = color * this.random[idxRnd + 2];
                index += 4;
            }
        }
    };


    module.exports = Painter;

};
