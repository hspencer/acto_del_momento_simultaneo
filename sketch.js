/**
 *  Acto del Momento Simultáneo
 *  e[ad] Escuela de Arquitectura y Diseño
 *  2020
 */

let sketch; // html canvas object
let data;   // JSON data object
let notes;  // array of visual objects
let w, h;   // global width and height
let alfa = 255;
let lastTime = 0;

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

// typefaces
let serif, sans, sansBold;

function preload() {
	// calculate width and height from html div
	w = document.getElementById("p5").offsetWidth;
	h = document.getElementById("p5").offsetHeight;
	let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=2000&uselang=user&errorformat=bc&query=[[Categor%C3%ADa:Acto%20del%20momento%20simult%C3%A1neo]]|%3FNota|%3FAutor|%3FPosici%C3%B3n|%3FImagen";
	data = loadJSON(url, gotData, 'jsonp');
	// fonts
	serif = loadFont("fonts/Alegreya-Regular.ttf");
	sans = loadFont("fonts/AlegreyaSans-Light.ttf");
	sansBold = loadFont("fonts/AlegreyaSans-Bold.ttf");
}
// geographical boundaries
let minlat, maxlat, minlon, maxlon;

function gotData(response) {
	minlat = 999999;
	minlon = minlat;
	maxlat = -999999;
	maxlon = maxlat;
	for (let key in data.query.results) {
		let thisResult = data.query.results[key];
		let lat = thisResult.printouts['Posición'][0].lat;
		let lon = thisResult.printouts['Posición'][0].lon;
		// calc geo boundaries
		if (minlat > lat) { minlat = lat; }
		if (minlon > lon) { minlon = lon; }
		if (maxlat < lat) { maxlat = lat; }
		if (maxlon < lon) { maxlon = lon; }
	}
}

function createObjects() {
	/// mouse
	let canvasmouse = Mouse.create(sketch.elt);
	canvasmouse.pixelRatio = pixelDensity();
	let options = {
		mouse: canvasmouse,
		stiffness: 1
	};

	mConstraint = MouseConstraint.create(engine, options);
	World.add(world, mConstraint);

	/// limits
	// top

	let thickness = 500;

	boundaries.push(new Boundary(w / 2, 0 - thickness / 2, width, thickness, 0));

	// bottom
	boundaries.push(new Boundary(w / 2, height + thickness / 2, width, thickness, 0));

	// sides
	boundaries.push(new Boundary(-thickness / 2, h / 2, thickness, height * 15, 0));
	boundaries.push(new Boundary(w + thickness / 2, h / 2, thickness, height * 15, 0));

	for (let key in data.query.results) {
		let thisResult = data.query.results[key];
		let lat = thisResult.printouts['Posición'][0].lat;
		let lon = thisResult.printouts['Posición'][0].lon;
		let author = thisResult.printouts['Autor'][0].fulltext;
		let title = thisResult.fulltext;
		let t = thisResult.printouts['Nota'][0];
		// console.log(lat, lon, author, title, t);
		// only create complete notes
		if (!isNaN(lat) &&
			!isNaN(lon) &&
			typeof title === 'string' &&
			typeof t === 'string' &&
			typeof author === 'string') {
			let thisNote = new Note(lat, lon, title, t, author);
			notes.push(thisNote);
		}
	}
}

let g; // other graphics
function createBlendGraphics() {
	g = createGraphics(w, h);
	g.background(255);
}

let btnS;
let springs;

function setup() {
	sketch = createCanvas(w, h);
	notes = [];
	springs = [];
	sketch.parent('p5');
	createMatterStuff();
	createObjects();
	createBlendGraphics();
	// btnU = createButton("U");
	// btnU.parent('btns');
	// btnU.mousePressed(unlinkAll);

	btnS = createButton("F");
	btnS.parent('btns');
	btnS.mousePressed(saveFile);
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
	background(g.get());
	Engine.update(engine);

	for (let note of notes) {
		note.display();
		if (note.over) {
			displayNoteTitle(note);
		}
		// if a note is being clicked or dragged display the content
		if (mConstraint.body === note.body) {
			displayNoteContent(note);
		}
	}

	// draw springs
	for (spring of springs) {
		stroke(180, 30, 0, 160);
		strokeWeight(.25);
		line(spring.bodyA.position.x, spring.bodyA.position.y, spring.bodyB.position.x, spring.bodyB.position.y);

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
	updateGraphics();
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
}

function saveFile() {
	let filename = "" + year() + month() + day() + "-" + hour() + minute() + second() + ".png";
	let file = createImage(width, height);
	file = get();
	file.save(filename, 'png');
}

function displayNoteTitle(note) {
	g.fill(180, 30, 0);
	g.textFont(serif);
	g.textSize(16);
	g.noStroke();
	g.text(note.title.toUpperCase(), 0, 20);
	let tw = g.textWidth(note.title.toUpperCase());
	g.textFont(serif);
	g.fill(0, 190);
	let aw = g.textWidth(" - " + note.author);
	if (tw + aw < w) {
		g.text(" - " + note.author, tw, 20);
	} else {
		g.text(note.author, 0, 20 + textAscent());
	}
}

function displayNoteContent(note) {
	g.textSize(48);
	g.fill(80, 150);
	g.text(note.text, 0, 30, w, h - 30);
}

function updateGraphics() {
	// draw springs trails
	for (spring of springs) {
		g.stroke(180, 30, 0, 45);
		strokeWeight(1);
		g.line(spring.bodyA.position.x, spring.bodyA.position.y, spring.bodyB.position.x, spring.bodyB.position.y);

	}
	g.blendMode(ADD);
	g.fill(255, 1);
	g.noStroke();
	g.rect(0, 0, w, h);
	g.blendMode(BLEND);
}