class Note {
    constructor(lat, lon, title, content, author) {
        this.connectedTo = "nothing";
        this.springDist = 0;
        this.creatingSpring = false;
        let margin = w / 5;
        this.x = map(lon, minlon, maxlon, margin, w - margin);
        this.y = map(lat, minlat, maxlat, h - margin, margin);
        this.title = title;
        this.content = content;
        this.author = author;
        this.radius = map(this.text.length, 0, 50, 6, 25);
        this.r = this.radius;
        this.over = false;
        this.touched = false;
        this.angle;
        let options = {
            friction: 0,
            restitution: 0.77,
            mass: 30
        };
        this.body = Bodies.circle(this.x, this.y, this.r, options);
        World.add(world, this.body);
    }
    rollover(x, y) {
        if (dist(this.x, this.y, x, y) < this.radius) {
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
            stroke(0);
            strokeWeight(3);
            point(0, 0);
        }
        if (this.over && !this.touched) {
            fill(180, 30, 0, 45);
            stroke(180, 30, 0, 250);
            strokeWeight(1);
            ellipse(0, 0, this.r * 2);
        }
        if (!this.over && this.touched) {
            stroke(0);
            strokeWeight(3);
            point(0, 0);
        }
        if (!this.over && !this.touched) {
            stroke(0, 45);
            strokeWeight(1.5);
            fill(190, 25);
            ellipse(0, 0, this.r * 2);
        }

        pop();

        if (this.creatingSpring) {
            // paint growing circle
            noFill();
            stroke(0, 10);
            strokeWeight(3);
            ellipse(this.x, this.y, this.springDist * 2);
            // check all other notes
            for (let other of notes) {
                // if its different and not already connected
                if (this.body != other.body && this.title != other.connectedTo) {
                    // calculate the distance between notes
                    let d = dist(this.x, this.y, other.x, other.y);
                    // if its closer that the growing circle
                    if (d <= this.springDist) {
                        let options = {
                            label: "spring",
                            length: d,
                            bodyA: this.body,
                            bodyB: other.body,
                            stiffness: 1
                        }
                        this.connectedTo = other.title;
                        // create new spring
                        let spring = Constraint.create(options);
                        World.add(world, spring);
                        springs.push(spring);
                        this.creatingSpring = false;
                    }
                    this.springDist++;
                }
            }
        }
    }
}