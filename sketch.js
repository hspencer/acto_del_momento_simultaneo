let sketch; // el objeto canvas
let data; // los datos tomados del JSON
let notes = [];
let w;

class Note {
  constructor(lat, lon, title, text, author) {
    this.x = map(lat, -33.5, -32.5, 0, w); 
    this.y = map(lon, -72, -71, 0, 400); 
    this.title = title; 
    this.text = text; 
    this.author = author; 
    this.radius = map(this.text.length, 0, 50, 0, 30);
    this.over = false;
  }
  
    rollover(px, py) {
    let d = dist(px, py, this.x, this.y);
    this.over = d < this.radius;
  }

  display() {
    ellipse(this.x, this.y, this.radius, this.radius);
    if(this.over){
    textAlign(CENTER);
    text(this.author, this.x, this.y + 20);}
  }
}


function preload() {
  w = document.getElementById("p5").offsetWidth;
  let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=2000&uselang=user&errorformat=bc&query=[[Categor%C3%ADa:Acto%20del%20momento%20simult%C3%A1neo]]|%3FNota|%3FAutor|%3FPosici%C3%B3n|%3FImagen";
  data = loadJSON(url, gotData, 'jsonp');
  
}


function gotData(response) {
  for (let key in data.query.results) {
    let thisResult = data.query.results[key];
    let lat = thisResult.printouts['Posición'][0].lat;
    let lon = thisResult.printouts['Posición'][0].lon;
    let autor = thisResult.printouts['Autor'][0].fulltext;
    let title = thisResult.fulltext;
    let t = thisResult.printouts['Nota'][0];
    let thisNote = new Note(lat, lon, title, t, autor);
    notes.push(thisNote);
    print("lat = "+lat+"\n"
          +"lon = "+lon+"\n"
          +"title = "+title+"\n"
          +"t = "+t+"\n"
          +"autor = "+autor+"\n"
         );
  }
}

function setup() {
  sketch = createCanvas(w, 400);
  sketch.parent('p5');
}

function windowResized() {
  sketch = createCanvas(w, 400);
  sketch.parent('p5');
}

function draw() {

  background("pink");
  for (let i = 0; i < notes.length; i++) {
    notes[i].display();
    notes[i].rollover(mouseX, mouseY);
  }
}

function keyTyped() {
  console.log(data.query.results);
}