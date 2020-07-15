let sketch; // el objeto canvas
let data; // los datos tomados del JSON
let notes;
let w, h;

class Note {
  constructor(lat, lon, title, text, author) {
    this.x = map(lon, minlon, maxlon, 20, w - 20); 
    this.y = map(lat, minlat, maxlat, h - 20, 20); 
    
    this.title = title; 
    this.text = text; 
    this.author = author; 
    this.label = author.toUpperCase();
    this.radius = map(this.text.length, 0, 50, 0, 30);
    this.w = 14 + textWidth(this.label);
    this.h = 6 + textAscent() + textDescent();
    this.over = false;
  }
  
  rollover(px, py) {
    this.over = abs((px - this.x)) < this.w/2 && abs((py - this.y)) < this.h/2;
  }

  display() {
    rectMode(CENTER);
    textAlign(CENTER);
    if(this.over){
      strokeWeight(2);
      fill("red");
    }else{
      noStroke();
      fill("white");
    }
    rect(this.x, this.y, this.w, this.h);
    fill("black");
    text(this.label, this.x, this.y + 5);
  }
}


function preload() {
  w = document.getElementById("p5").offsetWidth;
  h = w/2;
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

  if(minlat > lat){minlat = lat;}
  if(minlon > lon){minlon = lon;}
  if(maxlat < lat){maxlat = lat;}
  if(maxlon < lon){maxlon = lon;}
 }

 console.log("geographic constraints:\n"+"minlat = "+minlat+"\tmaxlat = "+maxlat+"\nminlon = "+minlon+"\tmaxlon = "+maxlon);
}


function createObjects(){
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
  createObjects();
}

function windowResized() {
  w = document.getElementById("p5").offsetWidth;
  h = w/2;  
  sketch = createCanvas(w, h);
  sketch.parent('p5');
  createObjects();
}

function draw() {

  background("pink");
  for (let i = 0; i  < notes.length; i++) {
    notes[i].display();
    notes[i].rollover(mouseX, mouseY);
  }
}

function keyTyped() {
  console.log(data.query.results);
}