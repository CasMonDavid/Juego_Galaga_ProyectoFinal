// VARIABLES GLOBALES
let nivel_actual=0, balas_en_pantalla=[], stars=[], cooldown=0, enemgios_especiales_vivos=0;
let mejoresPuntajes = [0,0,0,0,0];


let nivel_1, nivel_2, nivel_3;
let tiempo_nivel = 0;
let tiempo_aparicion = 0;
let enemigos_especiales_agregados = false;

let nivel_global = 1;
let estado_juego = "menu";
let tiempo_transicion = 0

let vidas = 3;
let puntaje = 0;

// Variables para imagenes y sonidos---START
let img_naveJugador, img_enemigo_tipo1, img_enemigo_tipo2, img_enemigo_tipo_boss;
let sound_disparo_laser, sound_disparo_laser_enemigo, sound_nave_explosion, sound_boss_explosion, sound_muerte_jugador;

function preload(){// función para cargar multimedia
  img_naveJugador = loadImage('assets/nave_jugador.png');
  img_enemigo_tipo1 = loadImage('assets/enemigo_tipo1.png');
  img_enemigo_tipo2 = loadImage('assets/enemigo_tipo2.png');
  img_enemigo_tipo_boss = loadImage('assets/enemigo_tipo_boss.png');

  soundFormats('mp3');
  sound_disparo_laser = loadSound('assets/sound/disparo_laser.mp3');
  sound_nave_explosion = loadSound('assets/sound/nave_explosion.mp3');
  sound_boss_explosion = loadSound('assets/sound/boss_explosion.mp3');
  sound_disparo_laser_enemigo = loadSound('assets/sound/disparo_laser_enemigo.mp3');
  sound_muerte_jugador = loadSound('assets/sound/muerte_jugador.mp3');
}

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
    image(img_naveJugador,this.x,this.y,this.w,this.h);
  }
  actualizar (){
    if (keyIsDown(LEFT_ARROW)) this.x = max(this.x - this.velocidad, 0);
    if (keyIsDown(RIGHT_ARROW)) this.x = min(this.x + this.velocidad, width-this.w);
  }
  disparo (){
    if (cooldown==0){
      if (keyIsDown(32)) {
        balas_en_pantalla.push(new Misil((this.x+(this.w/2)),this.y,13))
        sound_disparo_laser.play();
        cooldown=30;
      }
    }
  }
  toca_bala_enemiga(bala){
    if (this.x < bala.x + bala.w &&
        this.x + this.w > bala.x &&
        this.y < bala.y + bala.h &&
        this.y + this.h > bala.y) {
      return true;
    }
  }
}

class Misil {
  constructor(x,y,velocidad){
    this.x=x;
    this.y=y;
    this.velocidad=velocidad;
    this.w=8;
    this.h=16;
    this.history = [];
  }
  mostrar (){
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      let alpha = map(i, 0, this.history.length, 50, 200);
      fill(0, 255, 255, alpha); // Color cian brillante
      if(this.velocidad<0) fill(255,0,0,alpha); // Color rojo brillante
      noStroke();
      ellipse(pos.x, pos.y, 6);
    }
    
    // Dibujar la bala
    fill(255);
    ellipse(this.x, this.y, this.w, this.h);
  }
  actualizar() {
    this.y-=this.velocidad;
    
    // Guardar posición para la estela
    this.history.push({ x: this.x, y: this.y });
    
    // Limitar tamaño de la estela
    if (this.history.length > 10) {
      this.history.shift();
    }
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
    this.cooldown=0;
    this.balas_en_pantalla=[];
    this.velocidadX = random([-2,2]);
  }
  mostrar (){
    /*fill(255, 0, 0);
    stroke(0);
    rect(this.x, this.y, this.w, this.h);*/
    switch(this.tipo){
      case "tipo1":
      case "tipo2":
        image(img_enemigo_tipo1,this.x, this.y, this.w, this.h);
        break;
      case "tipo3":
        image(img_enemigo_tipo2,this.x, this.y, this.w, this.h);
        break;
      case "tipo4":
        image(img_enemigo_tipo_boss,this.x, this.y, this.w, this.h);
        break;
      default:break;
    }
  }
  movimiento(){
    if (this.tipo === 'tipo1') { // Movimiento vertical lento para tipo1
      this.y += 1;
    } else if (this.tipo === 'tipo2') { // Movimiento zigzag
      if(this.x>(width-this.w) || this.x<0){
        this.velocidadX *= -1;
      }
      this.x += this.velocidadX;
      this.y += 0.5;
    }else if(this.tipo === 'tipo3'){
      if(this.x>(width-this.w) || this.x<0){
        this.velocidadX *= -1;
      }
      this.x += this.velocidadX;
      this.y += 0.5;
      this.disparo();
    }
    else if(this.tipo === 'tipo4'){
      if(this.x>(width-this.w) || this.x<0){
        this.velocidadX *= -1;
      }
      this.x += this.velocidadX;
      this.y += 0.4;
      this.disparo();
    }
  }
  disparo(){
    if(this.cooldown==0){
      switch (this.tipo) {
        case "tipo3":
          this.cooldown=240;
          break;
        case "tipo4":
          this.cooldown=120;
          break;
        default:
          break;
      }
      sound_disparo_laser_enemigo.play();
      this.balas_en_pantalla.push(new Misil((this.x+(this.w/2)),(this.y+this.h),-5))
    }
  }
  toca_jugador(jugador) {
    if (this.x < jugador.x + jugador.w &&
        this.x + this.w > jugador.x &&
        this.y < jugador.y + jugador.h &&
        this.y + this.h > jugador.y) {
      return true;
    }
  }
  toca_bala(bala) {
    if (this.x < bala.x + bala.w &&
        this.x + this.w > bala.x &&
        this.y < bala.y + bala.h &&
        this.y + this.h > bala.y) {
      if(this.tipo=="tipo4") this.velocidadX = (this.velocidadX>0)? this.velocidadX++ : this.velocidadX-- ;
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
    this.enemigos.forEach((enemigo, enemigoIndex) => {
      if (enemigo.vida>0){
        enemigo.movimiento();
        // Si el enemigo toca al jugador, pierde una vida y se elimina
        if (enemigo.toca_jugador(jugador)) {
          vidas = max(vidas - 1, 0);
          enemigo.vida = 0; 
          console.log("¡Colisión con el jugador!");
          if (vidas <= 0) estado_juego = "gameover";
        }
        // Si el enemigo llega al fondo de la pantalla, resta una vida
        if (enemigo.y > height) {
          vidas = max(vidas - 1, 0);
          enemigo.vida = 0;
          console.log("¡Enemigo alcanzó el fondo!");
          if (vidas <= 0) estado_juego = "gameover";
        }
        if (balas_en_pantalla.length > 0) {
          balas_en_pantalla.forEach((bala, index) => {
            if (enemigo.vida > 0 && enemigo.toca_bala(bala)) {
              enemigo.vida -= 1;
              balas_en_pantalla.splice(index, 1);
              // Otorgar puntos solo cuando se elimina completamente al enemigo
              if (enemigo.vida <= 0) {
                console.log("Enemigo eliminado");
                if (enemigo.tipo === "tipo4") { // jefe final
                  puntaje += 10;
                  sound_boss_explosion.play();
                } else if (enemigo.tipo === "tipo3") { // enemigos resistentes
                  puntaje += 3; 
                  sound_nave_explosion.play();
                } else { // enemigos normales
                  puntaje += 1;
                  sound_nave_explosion.play();
                }
              }
            }
          });
        }
      }
      // Balas de enemigos
      if(enemigo.balas_en_pantalla.length){
        enemigo.balas_en_pantalla.forEach((bala,index) => {
          bala.actualizar();
          bala.mostrar();
          if (jugador.toca_bala_enemiga(bala)) {
            vidas--;
            if (vidas <= 0) estado_juego = "gameover";
            enemigo.balas_en_pantalla.splice(index, 1);
          };
        });
        enemigo.balas_en_pantalla.forEach((bala, index) => { // Elimina balas que salen de la pantalla
          if (bala.y > (height+40)) {
            enemigo.balas_en_pantalla.splice(index, 1);
          }
        });
      }
      enemigo.cooldown = max(enemigo.cooldown-1,0);
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
// TECLA PARA REINICIAR EL JUEGO DESDE GAME OVER --------
function keyPressed(event) {
  if (estado_juego === "menu" && key === " ") {
    estado_juego = "transicion";
    nivel_actual = 0;
    nivel_global = 1;
    tiempo_transicion = millis();
    vidas = 3;
    puntaje = 0;
  } else if (estado_juego === "gameover" && key === " ") {
    estado_juego = "menu"; // Reinicia al menú principal
    vidas = 3;
    puntaje = 0;
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

  mostrar_puntajes();
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

function mostrar_gameover() {
  sound_muerte_jugador.play();
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(24);
  text("Presiona SPACE para volver al menú", width / 2, height / 2 + 20);
}

function mostrar_puntajes() {
  verificar_puntaje();
  fill(50);
  rect(width / 2 - 100, height / 2 + 50, 200, 180, 10);

  fill(255);
  textSize(20);
  text("TOP 5 PUNTAJES", width / 2, height / 2 + 70);

  let puntajesOrdenados = mejoresPuntajes.sort((a, b) => b - a).slice(0, 5);
  for (let i = 0; i < puntajesOrdenados.length; i++) {
    text(`#${i + 1}: ${puntajesOrdenados[i]}`, width / 2, height / 2 + 100 + i * 25);
  }
}


function verificar_puntaje(nuevoPuntaje) {
  // Encontramos el menor puntaje en la lista
  let menorPuntaje = Math.min(...mejoresPuntajes.map(p => p.puntaje));

  if (nuevoPuntaje > menorPuntaje) {

    // Agregamos el nuevo puntaje
    mejoresPuntajes.push(nuevoPuntaje);

    // Ordenamos y mantenemos solo los 5 mejores
    mejoresPuntajes.sort((a, b) => b.puntaje - a.puntaje);
    mejoresPuntajes = mejoresPuntajes.slice(0, 5);

    estado_juego = "menu";
  }
}

function cargar_puntajes() {
  let datos = localStorage.getItem("mejoresPuntajes");
  if (datos) {
    mejoresPuntajes = JSON.parse(datos);
  } else {
    // Si no hay datos guardados, inicializamos con valores por defecto
    mejoresPuntajes = [0, 0, 0, 0, 0];
    guardar_puntajes();
  }
}

function guardar_puntajes() {
  localStorage.setItem("mejoresPuntajes", JSON.stringify(mejoresPuntajes));
}

function verificar_puntaje(nuevoPuntaje) {
  let menorPuntaje = Math.min(...mejoresPuntajes);

  if (nuevoPuntaje > menorPuntaje) {
    // Agregar puntaje y ordenar
    mejoresPuntajes.push(nuevoPuntaje);
    mejoresPuntajes.sort((a, b) => b - a);
    mejoresPuntajes = mejoresPuntajes.slice(0, 5); // Mantener solo los 5 mejores

    guardar_puntajes(); // Guardar nueva lista

    estado_juego = "menu";
  }
}



//SISTEMA DE MENU----------------------------------------------END

//SISTEMA DE NIVELES----------------------------------------------START
// CREAR ENTIDADES //
let jugador = new Jugador(10,620,30,31,3,7);

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
    switch (nivel_actual) {
      case 1:
        nivel.enemigos.push(new Enemigos(x, y, 30, 30, 'tipo1', 1));
        break;
      case 2:
        nivel.enemigos.push(new Enemigos(x, y, 30, 30, 'tipo2', 1));
        break;
      case 3:
        nivel.enemigos.push(new Enemigos(x, y, 40, 40, 'tipo3', 3));
      default:
        break;
    }
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
  mostrar_UI();
  switch (nivel_actual) {
    case 1:
      nivel_1.mostrar();
      nivel_1.actualizar_enemigos();
      enemigos_periodicos(nivel_1);
      if(puntaje>=10) iniciar_transicion(); // Nivel 1 acaba al llegar a 10 puntos (matar a 10 enemigos básicos)
      break;

    case 2:
      nivel_2.mostrar();
      nivel_2.actualizar_enemigos();
      enemigos_periodicos(nivel_2);
      enemigos_especiales(nivel_2, [new Enemigos(((width/2)-20), 10, 40, 40, 'tipo3', 3)]);
      if(puntaje>=30) iniciar_transicion(); // Nivel 2 conseguir 30 puntos
      break;

    case 3:
      nivel_3.mostrar();
      nivel_3.actualizar_enemigos();
      enemigos_periodicos(nivel_3);
      enemigos_especiales(nivel_3, [
        new Enemigos(300, 100, 40, 40, 'tipo3', 3),
        new Enemigos(500, 100, 40, 40, 'tipo3', 3),
        new Enemigos(400, 50, 60, 60, 'tipo4', 7)
      ]);
      if (puntaje>=55) estado_juego = "menu";
      break;
    }
  if (vidas <= 0) {
    estado_juego = "gameover";
  }
}
//SISTEMA DE NIVELES----------------------------------------------END


function iniciar_transicion() {
  estado_juego = "transicion";
  tiempo_transicion = millis();
  nivel_global++;
}

function mostrar_UI() {
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Vidas: " + vidas, 20, 20);
  textAlign(RIGHT, TOP);
  text("Puntaje: " + puntaje, width - 20, 20);
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
  cargar_puntajes();

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
  } else if (estado_juego === "gameover") {
    mostrar_gameover();
  }
}
