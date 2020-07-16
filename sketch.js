/**
 *  Acto del Momento Simultáneo
 *  e[ad] Escuela de Arquitectura y Diseño
 *  2020
 */


let sketch; // el objeto canvas
let data;   // los datos tomados del JSON
let notes;
let w, h;

// matter aliases : thanks Dan Shiffman and CodingTrain, Nature of Code, etc...

var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Constraint = Matter.Constraint,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;


var engine;
var world;
var boundaries = [];


function preload() {
  w = document.getElementById("p5").offsetWidth;
  h = w / 2;
  let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=2000&uselang=user&errorformat=bc&query=[[Categor%C3%ADa:Acto%20del%20momento%20simult%C3%A1neo]]|%3FNota|%3FAutor|%3FPosici%C3%B3n|%3FImagen";
  data = loadJSON(url, gotData, 'jsonp');
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
    /*
    print("lat = "+lat+"\n"
          +"lon = "+lon+"\n"
          +"title = "+title+"\n"
          +"t = "+t+"\n"
          +"autor = "+autor+"\n"
         );
         */
  }
}

let count = 0;
let counting = true;

function createOneByOne() {
  if(count == 0){
    print("counting one by one")
  }
  print(" "+count);

  let I = 0;
  for (let key in data.query.results) {
    I++;
  }

  if (count < I) {
    let thisNote = data.query.results[count];
    console.log(thisNote);
    let lat = thisNote.printouts['Posición'][0].lat;
    let lon = thisNote.printouts['Posición'][0].lon;
    let autor = thisNote.printouts['Autor'][0].fulltext;
    let title = thisNote.fulltext;
    let t = thisNote.printouts['Nota'][0];
    let note = new Note(lat, lon, title, t, autor);
    notes.push(note);
    count++;
    print("pushed n°"+count);
  } else { counting = false; }
}

function setup() {
  sketch = createCanvas(w, h);
  notes = [];
  sketch.parent('p5');
  textFont("Alegreya Sans");
  engine = Engine.create();
  world = engine.world;
  //Engine.run(engine);

  boundaries.push(new Boundary(w / 2, height, width, 50, 0));
  boundaries.push(new Boundary(-10, h / 2, 20, height * 5, 0));
  boundaries.push(new Boundary(w + 10, h / 2, 20, height * 5, 0));
  
  // top bumps
  let tl = new Boundary(w * .2, 30, 50, 5, .3);
  let tr = new Boundary(w * .8, 30, 50, 5, -.3);
  // tl.show();
  // tr.show();
  boundaries.push(tl);
  boundaries.push(tr);

  createObjects();

  var canvasmouse = Mouse.create(sketch.elt);
  canvasmouse.pixelRatio = pixelDensity();
  //console.log(canvasmouse);
  var options = {
    mouse: canvasmouse
  };
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);
  console.log(mConstraint);
}

function windowResized() {
  w = document.getElementById("p5").offsetWidth;
  h = 500; // w / 2;
  sketch = createCanvas(w, h);
  sketch.parent('p5');
  createObjects();
}

function draw() {

  //if (counting) createOneByOne();
  Engine.update(engine);
  // background("white");
  for (let i = 0; i < notes.length; i++) {
    notes[i].display();

    if (mConstraint.body === notes[i].body) {
      fill(255, 5);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, w * .4, 165);
      textAlign(LEFT);
      textSize(18);
      textStyle(BOLD);
      fill(180, 30, 0)
      text(notes[i].title, 50, 50);
      textSize(36);
      textStyle(NORMAL);
      fill(30, 15);
      text(notes[i].text, 50, 100);//, 400, 400);
    }
  }

  if (mConstraint.body) {
    var pos = mConstraint.body.position;
    var offset = mConstraint.constraint.pointB;
    var m = mConstraint.mouse.position;
    strokeWeight(3);
    stroke(0, 75);
    line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
  }
}
