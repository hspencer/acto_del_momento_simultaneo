/**
 *  Acto del Momento Simultáneo
 *  Herbert Spencer
 *  2020
 */

let sketch; // html canvas object
let notes;  // array of visual objects
let w, h;   // global width and height
let lastTime = 0;
let n = 128;
let springs;

// matter aliases : thanks Dan Shiffman and CodingTrain, Nature of Code, etc...
var Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Constraint = Matter.Constraint,
	Mouse = Matter.Mouse,
	MouseConstraint = Matter.MouseConstraint;

// matter.js main components
let engine;
let world;
let boundaries = [];


function preload() {
	// calculate width and height from html div
	w = document.getElementById("p5").offsetWidth;
	h = document.getElementById("p5").offsetHeight;
	// fonts
}


function createObjects() {
	createConstraints();
	for (let i = 0; i < n; i++) {
		let thisNote = new Note();
		notes.push(thisNote);
	}
}

function createConstraints() {
	/// mouse
	let canvasmouse = Mouse.create(sketch.elt);
	canvasmouse.pixelRatio = pixelDensity();
	let options = {
		mouse: canvasmouse,
		angularStiffness: 2,
		stiffness: 2
	};

	mConstraint = MouseConstraint.create(engine, options);
	World.add(world, mConstraint);

	/// limits
	let thickness = 500;
	// top
	boundaries.push(new Boundary(w / 2, 0 - thickness / 2, width, thickness, 0));

	// bottom
	boundaries.push(new Boundary(w / 2, height + thickness / 2, width, thickness, 0));

	// sides
	boundaries.push(new Boundary(-thickness / 2, h / 2, thickness, height * 15, 0));
	boundaries.push(new Boundary(w + thickness / 2, h / 2, thickness, height * 15, 0));
}

let g; // other graphics
function createBlendGraphics() {
	g = createGraphics(w, h);
	g.background(255);
	print("g Graphics created");
}

function setup() {
	sketch = createCanvas(w, h);
	notes = [];
	springs = [];
	sketch.parent('p5');
	createMatterStuff();
	createObjects();
	createBlendGraphics();
}

function createMatterStuff() {
	engine = Engine.create();
	world = engine.world;
	engine.world.gravity.y = 0;
}

function windowResized() {
	notes = [];
	springs = [];
	createMatterStuff();
	w = document.getElementById("p5").offsetWidth;
	h = document.getElementById("p5").offsetHeight;
	sketch = createCanvas(w, h);
	sketch.parent('p5');
	createObjects();
	createBlendGraphics();
}

function draw() {
	updateGraphics();
	background(g.get());
	Engine.update(engine);

	for (let note of notes) {
		note.display();
	}

	// draw springs
	for (spring of springs) {
		spring.display();
	}

	if (mConstraint.body) {
		let pos = mConstraint.body.position;
		let offset = mConstraint.constraint.pointB;
		let m = mConstraint.mouse.position;

		// paint line while dragging object

		strokeWeight(2);
		stroke(180, 30, 0, 140);
		line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
	}

	if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
		mConstraint.constraint.bodyB = null;
	}
}

function mouseClicked() {
	for (note of notes) {
		if (note.over) {
			if (!note.touched) {
				note.touched = true;
				note.creatingSpring = true;
			}
		}
	}
	lastTime = millis();
}

function touchEnded() {
	for (note of notes) {
		if (note.over) {
			if (!note.touched) {
				note.touched = true;
				note.creatingSpring = true;
			}
		}
	}
	lastTime = millis();
	mouseX = -100;
	mouseY = -100;
}

function saveFile() {
	let filename = "acto-del-momento-simultaneo-" + year() + month() + day() + "-" + hour() + minute() + second() + ".png";
	let file = createImage(width, height);
	file = get();
	file.save(filename, 'png');
}


function updateGraphics() {
	// draw springs trails
	for (spring of springs) {
		g.stroke(spring.col + "33");
		g.strokeWeight(1);
		g.line(spring.bodyA.position.x, spring.bodyA.position.y, spring.bodyB.position.x, spring.bodyB.position.y);
	}
	for (n of notes) {
		if (n.touched) {
			g.stroke(0, 190);
			g.strokeWeight(1);
			g.point(n.x, n.y);
		}
	}
	g.blendMode(ADD);
	g.fill(255, 1);
	g.noStroke();
	g.rect(0, 0, w, h);
	g.blendMode(BLEND);
}