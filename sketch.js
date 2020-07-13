let sketch; // el objeto canvas
let data; // los datos tomados del JSON


// esta es la clase para construir los objetos a partir del JSON
class Note {
  constructor(lat, lon, title, text, author) {
    this.x = map(lat, -90, 90, 0, width); // data.query.results.[].printouts.Posición.Object.lat
    this.y = map(lon, -90, 90, 0, height); // data.query.results.[].printouts.Posición.Object.lon
    this.title = title; //data.query.results.[].fulltext
    this.text = text; //data.query.results.[].printouts.Nota
    this.autor = author; //data.query.results.[].printouts.Autor.Object.fulltext
  }

  display() {
    ellipse(x, y, 10, 10);
    textAlign(CENTER);
    text(autor, 0, 50);
  }
}


// precarga del JSON antes de construir el canvas
function preload() {
  let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=2000&uselang=user&errorformat=bc&query=[[Categor%C3%ADa:Acto%20del%20momento%20simult%C3%A1neo]]|%3FNota|%3FAutor|%3FPosici%C3%B3n|%3FImagen";
  httpGet(url, 'jsonp', false, function(response) {
    data = response;
  });
}

function setup() {
  sketch = createCanvas(document.getElementById("p5").offsetWidth, 400);
  sketch.parent('p5');
  background("pink");
  
// acá deberíamos pasar los datos a los objetos de class Note
  
  
  /*
  let noteData = [];
  noteData = data.query.results.slice(); // no funca
  for (let i = 0; i < noteData.length; i++) {

  }
  */
  
}

function windowResized() {
  sketch = createCanvas(document.getElementById("p5").offsetWidth, 400);
  sketch.parent('p5');
}

function draw() {

}

function keyTyped() {
  console.log(data.query.results);
}