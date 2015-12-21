window['#ray.painter'] = function(exports, module){
"use strict";

var RADIUS = 20;      // Sphere radius.
var RADIUS_2 = RADIUS * RADIUS;
var SPARSITY = 50;    // Distance between two sphere centers (in orhtogonal plane).
var EYE = 2;         // Distance between the screen and the eye.

/**
 */
var Painter = function(background, W, H) {
    this.background = background;
    this.W = W;
    this.H = H;
    this.screenX = [];
    this.screenY = [];
    var i, j, k;
    var s = EYE * Math.min(W, H) / 2;
    for (i = 0 ; i < W ; i++) {
        this.screenX.push((i - W / 2) / s);
    }
    for (j = 0 ; j < H ; j++) {
        this.screenY.push((j - H / 2) / s);
    }
    this.random = [];
    for (k = 0 ; k < 999997 ; k++) {
        this.random.push(Math.random());
    }
    this.cos = [];
    for (k = 0 ; k < 1000 ; k++) {
        this.cos.push(Math.cos(k * Math.PI / 500));
    }
    this.x = Math.random() * SPARSITY;
    this.y = Math.random() * SPARSITY;
    this.z = 0;
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
    var rayX, rayY, rayZ = 1;
    var sphereX, sphereY, dist;
    var idxX, idxY, idxZ;
    var idxRnd;
    var radius, radius2;
    var bumpPeriod;
    for (row = 0 ; row < this.H ; row++) {
        rayY = this.screenY[row];
        for (col = 0 ; col < this.W ; col++) {
            rayX = this.screenX[col];
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
