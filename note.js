class Note {
    constructor(lat, lon, title, text, author) {
        let margin = 50;
        this.x = map(lon, minlon, maxlon, margin, w - margin);
        this.y = map(lat, minlat, maxlat, 0, -h * 5);
        this.title = title;
        this.text = text;
        this.author = author;
        this.label = author.toUpperCase();
        this.radius = map(this.text.length, 0, 50, 0, 30);
        this.w = 14 + textWidth(this.label);
        this.h = 6 + textAscent() + textDescent();
        var options = {
            friction: 0.3,
            restitution: 0.6
        };
        this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);
        World.add(world, this.body);
    }

    display() {
        rectMode(CENTER);
        textAlign(CENTER);
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        strokeWeight(1);
        stroke(100);
        fill(255);
        rect(0, 0, this.w, this.h);
        fill(0);
        text(this.label, 0, 5);
        pop();
    }
}