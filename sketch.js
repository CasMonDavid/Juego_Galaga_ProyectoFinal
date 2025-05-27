// VARIABLES GLOBALES
let nivel_actual=0, balas_en_pantalla=[], stars=[], cooldown=0, nivel_1;

let nivel_2, nivel_3;
let tiempo_nivel = 0;
let tiempo_aparicion = 0;
let enemigos_especiales_agregados = false;

let nivel_global = 1;
let estado_juego = "menu";
let tiempo_transicion = 0

class Jugador{
  constructor (x,y,w,h,vida,velocidad){
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.vida=vida;
    this.velocidad=velocidad;
  }
  mostrar (){
    stroke(0);
    fill(255);
    rect(this.x,this.y,this.w,this.h);
  }
  actualizar (){
    if (keyIsDown(LEFT_ARROW)) this.x = max(this.x - this.velocidad, 0);
    if (keyIsDown(RIGHT_ARROW)) this.x = min(this.x + this.velocidad, width-this.w);
  }
  disparo (){
    if (cooldown==0){
      if (keyIsDown(32)) {
        balas_en_pantalla.push(new Misil((this.x+(this.w/2)),this.y,13))
        cooldown=30;
      }
    }
  }
}

class Misil {
  constructor(x,y,velocidad){
    this.x=x;
    this.y=y;
    this.velocidad=velocidad;
    this.w=5;
    this.h=10;
  }
  mostrar (){
    stroke(0);
    fill(255);
    rect(this.x,this.y,this.w,this.h);
  }
  actualizar(){
    this.y-=this.velocidad;
  }
}

class Enemigos{
  constructor (x,y,w,h,tipo,vida){
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.tipo=tipo; // Tipo de enemigo
    this.vida=vida; // Vida del enemigo
  }
  mostrar (){
    fill(255, 0, 0);
    stroke(0);
    rect(this.x, this.y, this.w, this.h);
  }
  movimiento(){
    if (this.tipo === 'tipo1') {
      this.y += 1; // Movimiento vertical lento para tipo1
    } else if (this.tipo === 'tipo2') {
      this.x += random(-2, 2); // Movimiento horizontal para tipo2
      this.y += random(1, 3); // Movimiento vertical para tipo2
    }
  }
  toca_jugador(jugador) {
    if (this.x < jugador.x + jugador.w &&
        this.x + this.w > jugador.x &&
        this.y < jugador.y + jugador.h &&
        this.y + this.h > jugador.y) {
      return true; // Colisión detectada
    }
  }
  toca_bala(bala) {
    if (this.x < bala.x + bala.w &&
        this.x + this.w > bala.x &&
        this.y < bala.y + bala.h &&
        this.y + this.h > bala.y) {
      return true;
    }
  }
}

class Nivel{
  constructor (nivel, enemigos){
    this.nivel=nivel;
    this.enemigos=enemigos;
  }
  mostrar (){
    this.enemigos.forEach(enemigo => {
      if (enemigo.vida > 0) enemigo.mostrar(); // Mostrar solo si el enemigo está vivo
    });
  }
  actualizar_enemigos(){
    this.enemigos.forEach(enemigo => {
      enemigo.movimiento();
      if (enemigo.vida > 0 && enemigo.toca_jugador(jugador)) {
        console.log("¡Colisión con el jugador!");
      }
      if (balas_en_pantalla.length > 0) {
        balas_en_pantalla.forEach((bala, index) => {
          if (enemigo.vida > 0 && enemigo.toca_bala(bala)) {
            enemigo.vida -= 1; // Reduce la vida del enemigo
            balas_en_pantalla.splice(index, 1); // Elimina la bala que tocó al enemigo
            if (enemigo.vida <= 0) {
              console.log("Enemigo eliminado");
            }
          }
        });
      }
    });
  }
}

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-height, height);
    this.z = random(1, 4); // Profundidad para simular diferentes velocidades
    this.size = this.z; // Tamaño depende de la "profundidad"
    this.speed = this.z * 2; // Las más "cercanas" (mayor z) se mueven más rápido
    this.color = color(random(220, 255), random(220, 255), random(220, 255));
  }

  update() {
    this.color = color(random(150, 255), random(150, 255), random(150, 255));
    this.y += this.speed;
    if (this.y > height) {
      this.reset();
      this.y = 0;
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

//SISTEMA DE MENU----------------------------------------------START
function keyPressed() {
  if (estado_juego === "menu" && key === " ") {
    estado_juego = "transicion";
    nivel_actual = 0;
    nivel_global = 1;
    tiempo_transicion = millis();
  }
}

function mostrar_menu() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(64);
  text("GALAGA", width / 2, height / 2 - 100);
  textSize(24);
  text("Presiona SPACE para iniciar", width / 2, height / 2);
}

function mostrar_transicion() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("Nivel " + nivel_global, width / 2, height / 2);
  if (millis() - tiempo_transicion > 2000) {
    estado_juego = "jugando";
    crear_nivel();
  }
}
//SISTEMA DE MENU----------------------------------------------END

//SISTEMA DE NIVELES----------------------------------------------START
// CREAR ENTIDADES //
let jugador = new Jugador(10,620,20,30,3,7);

// Crea niveles empezando de 0 y va avanzando cada que es llamado.
function crear_nivel() {
  tiempo_nivel = millis();
  tiempo_aparicion = millis();
  enemigos_especiales_agregados = false;

  let nivel_ciclo = (nivel_global - 1) % 3;

  switch (nivel_ciclo) {
    case 0:
      nivel_1 = new Nivel(nivel_global, []);
      nivel_actual = 1;
      break;
    case 1:
      nivel_2 = new Nivel(nivel_global, []);
      nivel_actual = 2;
      break;
    case 2:
      nivel_3 = new Nivel(nivel_global, []);
      nivel_actual = 3;
      break;
  }
}

function enemigos_periodicos(nivel) {
  if (millis() - tiempo_aparicion > 1000) {
    tiempo_aparicion = millis();
    let x = random(100, width - 100);
    let y = random(10, 100);
    nivel.enemigos.push(new Enemigos(x, y, 30, 30, 'tipo2', 1));
  }
}

function enemigos_especiales(nivel, lista_enemigos) {
  if (!enemigos_especiales_agregados) {
    for (let enemigo of lista_enemigos) {
      nivel.enemigos.push(enemigo);
    }
    enemigos_especiales_agregados = true;
  }
}

function actualizar() {
  jugador.mostrar();
  jugador.actualizar();
  jugador.disparo();
  actualizar_disparos();

  switch (nivel_actual) {
    case 1:
      nivel_1.mostrar();
      nivel_1.actualizar_enemigos();
      enemigos_periodicos(nivel_1);
      if (millis() - tiempo_nivel > 10000) iniciar_transicion();
      break;

    case 2:
      nivel_2.mostrar();
      nivel_2.actualizar_enemigos();
      enemigos_periodicos(nivel_2);
      enemigos_especiales(nivel_2, [new Enemigos(400, 100, 40, 40, 'tipo2', 3)]);
      if (millis() - tiempo_nivel > 10000) iniciar_transicion();
      break;

    case 3:
      nivel_3.mostrar();
      nivel_3.actualizar_enemigos();
      enemigos_periodicos(nivel_3);
      enemigos_especiales(nivel_3, [
        new Enemigos(300, 100, 40, 40, 'tipo2', 3),
        new Enemigos(500, 100, 40, 40, 'tipo2', 3),
        new Enemigos(400, 50, 60, 60, 'tipo2', 7)
      ]);
      if (millis() - tiempo_nivel > 10000) iniciar_transicion();
      break;
  }
}
//SISTEMA DE NIVELES----------------------------------------------END


function iniciar_transicion() {
  estado_juego = "transicion";
  tiempo_transicion = millis();
  nivel_global++;
}

function keyPressed() {
  if (estado_juego === "menu" && key === " ") {
    estado_juego = "transicion";
    nivel_global = 1;
    tiempo_transicion = millis();
  }
}


function actualizar_disparos(){
  if (balas_en_pantalla.length>0){
    balas_en_pantalla.forEach(bala => {
      bala.actualizar();
      bala.mostrar();
    });
  }
  balas_en_pantalla.forEach((bala, index) => { // Elimina balas que salen de la pantalla
    if (bala.y < 0) {
      balas_en_pantalla.splice(index, 1);
    }
  });

  cooldown = max(cooldown-1,0);
}

function dibujar_fondo(){
  background(0);
  for (let star of stars) {
    star.update();
    star.show();
  }
}

// FUNCIONES DE P5 //
function setup() {
  createCanvas(900, 750);
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}

function draw() {
  if (estado_juego === "menu") {
    mostrar_menu();
  } else if (estado_juego === "transicion") {
    mostrar_transicion();
  } else if (estado_juego === "jugando") {
    dibujar_fondo();
    actualizar();
  }
}
