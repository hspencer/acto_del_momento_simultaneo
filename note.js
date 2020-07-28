/** a note is a note is a note  */

class Note {
    constructor() {
        this.connectedTo = "nothing";
        this.r = random(5, 15);
        this.springDist = this.r;
        this.creatingSpring = false;
        let margin = w / 48;
        this.x = random(margin, w - margin);
        this.y = random(h - margin, margin);
        this.col = getCol();
        this.over = false;
        this.touched = false;
        let f = {
            x: random(-.015, .015),
            y: random(-.015, .015)
        }
        let options = {
            friction: 0,
            frictionAir: 0,
            restitution: 0.77,
            force: f
        };
        this.body = Bodies.circle(this.x, this.y, this.r, options);
        World.add(world, this.body);
    }
    rollover(x, y) {
        if (dist(this.x, this.y, x, y) < this.r) {
            this.over = true;
        } else {
            this.over = false;
        }
    }
    display() {
        this.rollover(mouseX, mouseY);
        this.angle = this.body.angle;
        let pos = this.body.position;
        this.x = pos.x;
        this.y = pos.y;
        push();
        translate(pos.x, pos.y);
        rotate(this.angle);

        if (this.over && this.touched) {
            fill(180, 30, 0, 45);
            noStroke();
            ellipse(0, 0, this.r * 2);
            stroke(this.col);
            strokeWeight(3);
            point(0, 0);
        }
        if (this.over && !this.touched) {
            fill(this.col + "FF");
            stroke(0, 150);
            strokeWeight(1);
            ellipse(0, 0, this.r * 2);
        }
        if (!this.over && this.touched) {
            noFill();
            strokeWeight(2);
            stroke(0, 20);
            ellipse(0, 0, this.r * 2);
            stroke(0);
            strokeWeight(5);
            point(0, 0);
            g.blendMode(MULTIPLY);
            g.stroke(0);
            g.strokeWeight(5);
            g.point(0, 0);
            g.blendMode(BLEND);

        }
        if (!this.over && !this.touched) {
            stroke(0, 45);
            strokeWeight(1.5);
            fill(this.col + "66");
            ellipse(0, 0, this.r * 2);
        }

        pop();

        if (this.creatingSpring) {
            // paint growing circle
            g.fill(this.col + "22");
            g.blendMode(MULTIPLY);
            g.stroke(0, 5);
            g.ellipse(this.x, this.y, this.springDist * 2);
            // check all other notes
            for (let other of notes) {
                // if its different and not already connected
                if (this.body != other.body && this.title != other.connectedTo) {
                    // calculate the distance between notes
                    let d = dist(this.x, this.y, other.x, other.y);
                    // if its closer that the growing circle
                    if (d <= this.springDist) {
                        this.connectedTo = other.title;
                        // create new spring
                        let spring = new Spring(this.body, other.body, d, this.col);
                        springs.push(spring);
                        this.creatingSpring = false;
                    }
                }
            }
            this.springDist++;
        }
    }
}


class Spring {
    constructor(body1, body2, len, col) {
        this.bodyA = body1;
        this.bodyB = body2;
        this.length = len;
        this.col = col;
        let options = {
            label: "spring",
            length: this.length,
            bodyA: this.bodyA,
            bodyB: this.bodyB,
            stiffness: 0.891
        }
        let spring = Constraint.create(options);
        World.add(world, spring);
    }
    display(){
        stroke(this.col);
        strokeWeight(.75);
        line(this.bodyA.position.x, this.bodyA.position.y, this.bodyB.position.x, this.bodyB.position.y);
    }
}


let col = ["#DB4813", "#740013", "#74009D", "#DEC449", "#271262", "#A6E94E", "#FF374A", "#6BA4FF", "#1451FA", "#7014FA", "#107040"];

function getCol() {
    let i = Math.floor(random(col.length));
    return col[i];
}
