/**
 *  Acto del Momento Simultáneo
 *  e[ad] Escuela de Arquitectura y Diseño
 *  2020
 */

let sketch; // html canvas object
let data;   // JSON data object
let notes;  // array of visual objects
let w, h;   // global width and height

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
  w = document.getElementById("p5").offsetWidth;
  h = document.getElementById("p5").offsetHeight;
  let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=2000&uselang=user&errorformat=bc&query=[[Categor%C3%ADa:Acto%20del%20momento%20simult%C3%A1neo]]|%3FNota|%3FAutor|%3FPosici%C3%B3n|%3FImagen";
  data = loadJSON(url, gotData, 'jsonp');

  serif = loadFont("fonts/Alegreya-Regular.ttf");
  sans = loadFont("fonts/AlegreyaSans-Light.ttf");
  sansBold = loadFont("fonts/AlegreyaSans-Bold.ttf");
}



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

    if (minlat > lat) { minlat = lat; }
    if (minlon > lon) { minlon = lon; }
    if (maxlat < lat) { maxlat = lat; }
    if (maxlon < lon) { maxlon = lon; }
  }

  console.log("geographic constraints:\n" + "minlat = " + minlat + "\tmaxlat = " + maxlat + "\nminlon = " + minlon + "\tmaxlon = " + maxlon);
}


function createObjects() {
  for (let key in data.query.results) {
    let thisResult = data.query.results[key];
    let lat = thisResult.printouts['Posición'][0].lat;
    let lon = thisResult.printouts['Posición'][0].lon;
    let autor = thisResult.printouts['Autor'][0].fulltext;
    let title = thisResult.fulltext;
    let t = thisResult.printouts['Nota'][0];
    let thisNote = new Note(lat, lon, title, t, autor);
    notes.push(thisNote);
  }
}

function setup() {
  sketch = createCanvas(w, h);
  notes = [];
  sketch.parent('p5');
  engine = Engine.create();
  world = engine.world;
  //Engine.run(engine);

  /////////////////////////////////////////////// limits
  // bottom
  boundaries.push(new Boundary(w / 2, height + 49, width, 100, 0));

  // sides
  boundaries.push(new Boundary(-49, h / 2, 100, height * 15, 0));
  boundaries.push(new Boundary(w + 49, h / 2, 100, height * 15, 0));

  // top bumps
  /*
  let n = 8;
  for(let i = 1; i < n; i++){
    let spacer = w/n;
    let tl = new Boundary(spacer * i, -10, 20, 10, random(-1, 1));
    //tl.show();
    boundaries.push(tl);
  }
  */
  createObjects();

  let canvasmouse = Mouse.create(sketch.elt);
  canvasmouse.pixelRatio = pixelDensity();
  let options = {
    mouse: canvasmouse
  };
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);
}

function windowResized() {
  w = document.getElementById("p5").offsetWidth;
  h = document.getElementById("p5").offsetHeight;
  sketch = createCanvas(w, h);
  sketch.parent('p5');
  createObjects();
}

function draw() {

  Engine.update(engine);
  for (let i = 0; i < notes.length; i++) {
    notes[i].display();

    // if a note is being clicked or dragged
    if (mConstraint.body === notes[i].body) {
      fill(255, 10);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, w, h);
      textAlign(LEFT);
      textFont(sansBold);
      textSize(18);
      fill(180, 30, 0, 15);
      text(notes[i].title.toUpperCase(), 0, 20);
      textFont(serif);
      textSize(40);
      fill(0, 10);
      text(notes[i].text, 0, 45, w, h - 45);
    }
  }

  if (mConstraint.body) {
    let pos = mConstraint.body.position;
    let offset = mConstraint.constraint.pointB;
    let m = mConstraint.mouse.position;
    // paint line while dragging object
    /*
    strokeWeight(3);
    stroke(180, 30, 0, 90);
    line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
    */
  }

  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    mConstraint.constraint.bodyB = null;
  }
}

