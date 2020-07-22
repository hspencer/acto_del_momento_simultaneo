class Note {
    constructor(lat, lon, title, text, author) {
        this.connectedTo = "nothing";
        this.springDist = 0;
        this.creatingSprings = false;
        let margin = w / 5;
        this.x = map(lon, minlon, maxlon, margin, w - margin);
        this.y = map(lat, minlat, maxlat, h - margin, margin);
        this.title = title;
        this.text = text;
        this.author = author;
        this.label = author.toUpperCase();
        this.radius = map(this.text.length, 0, 50, 0, 30);
        this.r = 12;
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
        if (this.over) {
            blendMode(MULTIPLY);
            strokeWeight(.5);
            stroke(0, 20);
            fill(255, 15);
            ellipse(0, 0, this.r * 2);
        } else {
            blendMode(BLEND);
            fill(255, 4);
            strokeWeight(.25);
            stroke(0, 3 + alfa);
            if (this.touched) {
                noFill();
                noStroke();
            }
            ellipse(0, 0, this.r * 2);
        }

        if (this.touched) {
            noStroke();
            fill(0, 40);
            ellipse(0, 0, 2);
        }
        pop();

        if (this.creatingSprings) {
            // paint growing circle
            noStroke();
            fill(180, 50, 0, 3);
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
                        // paint new spring circle distance
                        stroke(180, 50, 0, 100);
                        noFill();
                        ellipse(this.x, this.y, this.springDist * 2);
                        this.creatingSprings = false;
                    }
                    this.springDist ++;
                }
            }
        }
    }
}