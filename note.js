class Note {
    constructor(lat, lon, title, text, author) {
        textFont(sans);
        textSize(16);
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
        let pos = this.body.position;
        let angle = this.body.angle;
        this.x = pos.x;
        this.y = pos.y;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        if (this.over) {
            blendMode(MULTIPLY);
            strokeWeight(.5);
            stroke(0, 15);
            fill(255, 15);
        } else {
            blendMode(BLEND);
            fill(255, 4);
            strokeWeight(.1);
            stroke(0, 15);
        }

        
        ellipse(0, 0, this.r * 2);

        if (this.touched) {
            noStroke();
            fill(0, 40);
            ellipse(0, 0, 2);
        }
        pop();

        if (this.creatingSprings) {
            while (this.connectedNotes.length < 2) {
                for (let other of notes) {
                    print("other x: " + other.x);
                    if (this.body != other.body) {
                        let d = dist(this.x, this.y, other.x, other.y);


                        if (d < this.springDist) {
                            this.connectedNotes.push(other);

                        }

                        this.springDist += 32;
                    }

                    noFill();
                    stroke(180, 30, 0, 25);
                    ellipse(this.x, this.y, this.springDist);
                }

            }
            this.makeS();
            this.creatingSprings = false;
        }
    }

    createSprings() {
        this.connectedNotes = [];
        this.springDist = 0;
        this.creatingSprings = true;

    }

    makeS() {
        for (let i = 0; i < this.connectedNotes.length; i++) {
            let otherNote = this.connectedNotes[i];
            let otherBody = otherNote.body;
            let d = dist(this.x, this.y, otherNote.x, otherNote.y);
            let options = {
                bodyA: this.body,
                bodyB: otherBody,
                length: d,
                stiffness: 0.1
            }
            let spring = Constraint.create(options);
            World.add(world, spring);
            springs.push(spring);
        }
    }
}