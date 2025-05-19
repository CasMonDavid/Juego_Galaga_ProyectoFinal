// VARIABLES GLOBALES
let nivel_actual=0, balas_en_pantalla=[], cooldown=0;

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
        balas_en_pantalla.push(new Misil(this.x,this.y,10))
        cooldown=30;
      };
    }
  }
}

class Misil {
  constructor(x,y,velocidad){
    this.x=x;
    this.y=y;
    this.velocidad=velocidad;
    this.w=10;
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

  }
  mostrar (){

  }
  movimiento(){

  }
}

// CREAR ENTIDADES //
let jugador = new Jugador(10,620,35,20,3,7);

// Crea niveles empezando de 0 y va avanzando cada que es llamado.
function crear_nivel(){
  switch (nivel_actual) {
    case 0:

      nivel_actual=1;
      break;
    case 1:

    nivel_actual=2;
      break;
    case 2:
      nivel_actual=3;
      break;
    case 3:
      // AL TERMINAR EL ULTIMO NIVEL(3), GANA EL JUEGO
      break;
    default:break;
  }
}
// FUNCIONES DE ACTUALIZACIÓN //
function actualizar(){
  jugador.mostrar();
  jugador.actualizar();
  jugador.disparo();
  actualizar_disparos();
}
function actualizar_disparos(){
  if (balas_en_pantalla.length>0){
    balas_en_pantalla.forEach(bala => {
      bala.actualizar();
      bala.mostrar();
    });
  }
  cooldown = max(cooldown-1,0);
}

// FUNCIONES DE P5 //
function setup() {
  createCanvas(900, 750);
}

function draw() {
  background(220);

  actualizar();
}
