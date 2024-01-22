/**
 *  Acto del Momento Simultáneo
 *  Herbert Spencer
 *  2020
 */

let sketch; // html canvas object
let data;   // JSON data object
let notes;  // array of visual objects
let springs;
let w, h;   // global width and height
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

let g; // other graphics
let btnS; // save button

function preload() {
	// calculate width and height from html div
	w = document.getElementById("p5").offsetWidth;
	h = document.getElementById("p5").offsetHeight;
	let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=2000&uselang=user&errorformat=bc&query=[[Categor%C3%ADa:Acto%20del%20momento%20simult%C3%A1neo]]|%3FNota|%3FAutor|%3FPosici%C3%B3n|%3FImagen|limit=900";
	data = loadJSON(url, gotData, 'jsonp');
	// fonts
	serif = loadFont("fonts/Alegreya-Regular.ttf");
	sans = loadFont("fonts/AlegreyaSans-Light.ttf");
	sansBold = loadFont("fonts/AlegreyaSans-Bold.ttf");
	btnS = createButton("F");
	btnS.parent('btns');
	btnS.mousePressed(saveFile);
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
		console.log(thisResult.fulltext);
		let lat = thisResult.printouts['Posición'][0].lat;
		let lon = thisResult.printouts['Posición'][0].lon;
		// calc geo boundaries
		if (minlat > lat) { minlat = lat; }
		if (minlon > lon) { minlon = lon; }
		if (maxlat < lat) { maxlat = lat; }
		if (maxlon < lon) { maxlon = lon; }
	}
	print("lat range: " + minlat + ", " + maxlat);
	print("lon range. " + minlon + ", " + maxlon);
}

function createObjects() {
	createConstraints();
	for (let key in data.query.results) {
		let thisResult = data.query.results[key];
		let lat = thisResult.printouts['Posición'][0].lat;
		let lon = thisResult.printouts['Posición'][0].lon;
		let author = thisResult.printouts['Autor'][0];
		let title = thisResult.fulltext;
		let content = thisResult.printouts['Nota'][0];
		
		// only create complete notes
		// if (!isNaN(lat) &&
		// 	!isNaN(lon) &&
		// 	typeof title === 'string' &&
		// 	typeof t === 'string' &&
		// 	typeof author === 'string') {
			let thisNote = new Note(lat, lon, title, content, author);
			notes.push(thisNote);
			//print("note " + title + " created successfully")
		//}
	}
}

function createConstraints() {
	/// mouse
	let canvasmouse = Mouse.create(sketch.elt);
	canvasmouse.pixelRatio = pixelDensity();
	let options = {
		mouse: canvasmouse,
		angularStiffness: 0.999,
		stiffness: 0.999,
		length: 0.01
	};

	mConstraint = MouseConstraint.create(engine, options);
	World.add(world, mConstraint);

	/// limits
	let thickness = 500;
	// top
	boundaries.push(new Boundary(w / 2, 0 - thickness / 2, w*2, thickness, 0));

	// bottom
	boundaries.push(new Boundary(w / 2, height + thickness / 2, w*2, thickness, 0));

	// sides
	boundaries.push(new Boundary(-thickness / 2, h / 2, thickness, height * 15, 0));
	boundaries.push(new Boundary(w + thickness / 2, h / 2, thickness, height * 15, 0));
}

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
		strokeWeight(.75);
		line(spring.bodyA.position.x, spring.bodyA.position.y, spring.bodyB.position.x, spring.bodyB.position.y);
	}

	if (mConstraint.body) {
		let pos = mConstraint.body.position;
		let offset = mConstraint.constraint.pointB;
		let m = mConstraint.mouse.position;

		// paint line while dragging object
		strokeWeight(2);
		stroke(200);
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
	setup();
}

function displayNoteTitle(note) {
	fill(150, 30, 0, 150);
	textFont(sansBold);
	textSize(16);
	noStroke();
	text(note.title.toUpperCase(), 0, 20);
	let tw = textWidth(note.title.toUpperCase());
	textFont(serif);
	fill(0, 130);
	let aw = textWidth(" - " + note.author);
	if (tw + aw < w) {
		text(" - " + note.author, tw, 20);
	} else {
		text(note.author, 0, 20 + textAscent());
	}
}

function displayNoteContent(note) {
	g.textFont(serif);
	g.textSize(48);
	g.noStroke();
	g.fill(80, 95);
	g.text(note.content, 0, 30, w, h - 30);
}
function updateGraphics() {
	// draw springs trails
	for (spring of springs) {
		g.stroke(180, 30, 0, 25);
		g.strokeWeight(1);
		g.line(spring.bodyA.position.x, spring.bodyA.position.y, spring.bodyB.position.x, spring.bodyB.position.y);
	}
	for(n of notes){
		if(n.touched){
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