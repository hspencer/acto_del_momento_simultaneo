/**
 *  Acto del Momento Simultáneo
 *  e[ad] Escuela de Arquitectura y Diseño
 *  2020
 */


let sketch; // el objeto canvas
let data;   // los datos tomados del JSON
let notes;
let w, h;

// matter aliases
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
  notes = [];
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

function setup() {
  sketch = createCanvas(w, h);
  sketch.parent('p5');
  textFont("Alegreya Sans");
  engine = Engine.create();
  world = engine.world;
  //Engine.run(engine);

  boundaries.push(new Boundary(w/2, height, width, 50, 0));
  boundaries.push(new Boundary(-10, h/2, 20, height, 0));
  boundaries.push(new Boundary(w + 10, h/2, 20, height, 0));

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
  Engine.update(engine);
  background("white");
  for (let i = 0; i < notes.length; i++) {
    notes[i].display();

    if(mConstraint.body === notes[i].body){
      textAlign(LEFT);
      textSize(18);
      textStyle(BOLD);
      fill(180, 30, 0)
      text(notes[i].title, 50, 50);
      textSize(36);
      textStyle(NORMAL);
      fill(30);
      text(notes[i].text, 50, 100);//, 400, 400);
    }
  }

  if (mConstraint.body) {
    var pos = mConstraint.body.position;
    var offset = mConstraint.constraint.pointB;
    var m = mConstraint.mouse.position;
    stroke(200, 150, 0);
    line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
  }
}
