let canvas = document.getElementById("canvasPang");
let ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

//Player
let currentFrame = 0
let right = false
let left = false
let up = false
let down = false
let space = false
let lives = 5
let startGame = true
let gameOverBool = false
let animation = null

//Harpoon
let harpoons = []
let maxHarpoons = 1 //For powerUps


//Ball
let iniRadius = 60
let minimumRadius = iniRadius / 4
let balls = []


//PowerUp
let powerups = []
let powerup1 = false
let powerup2 = false
let powerup3 = false
let timesUp = false
function PowerUp(x,y,id,img){
this.x = x
this.y = y
this.id = id
this.img = img
this.cy = 2

//Math.floor(Math.random()*4);


switch(this.id){
  case 1:
    this.img.src = "images2/powerup1.png" 
    
    break;
  case 2:
    this.img.src = "images2/powerup2.png"
    
    break;
  case 3:
    this.img.src = "images2/powerup3.png" 
    
    break;
  case 4:
    this.img.src = "images2/powerup4.png" 
    
    break;
  default:
    console.log("Error 404: PowerUp not found")
    break;
}

this.draw = function(){
  ctx.drawImage(this.img,this.x,this.y,50,50)
}
this.update = function(){

  if(this.y +50> canvas.height){
    this.cy = 0
    this.y = canvas.height - 50

  }
  this.y += this.cy
  


}
this.getCurrentPos = function () {
  let x = this.x
  let y = this.y
  let id = this.id
  let powerupPos = {
    x: x,
    y: y,
    id: id
  }
  return powerupPos
}


}



//Player object
function Player(image, playerWidth, playerHeight, step, spriteLine) {

  this.image = image
  this.playerWidth = playerWidth
  this.playerHeight = playerHeight
  this.step = step
  this.stepUpDown = step
  this.spriteLine = spriteLine
  this.image.src = "images2/gb_walk.png"

  //Draw player 
  this.draw = function () {
    ctx.drawImage(this.image, this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
  }

  //Draw player mov
  this.listenEvent = function (right, left, nothing, currentFrame, up, down, space) {

    this.right = right
    this.left = left
    this.nothing = nothing
    this.currentFrame = currentFrame
    this.up = up
    this.down = down
    this.space = space

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!(this.stepUpDown != 10)) {//Only happens when the sprite is not in the air
      if (this.right) {
        this.spriteLine = 0
        this.step = this.step + 20
        
        if (this.step > canvas.width - this.playerWidth) {
          this.step = canvas.width - this.playerWidth - 1
        }
        //ctx.drawImage(this.image, this.currentFrame * this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
        ctx.drawImage(this.image, this.playerWidth * 6, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
      }
      else if (this.left) {
        this.spriteLine = 110
        this.step = this.step - 20
        if (this.step < 0) {
          this.step = 1
        }
        ctx.drawImage(this.image, this.playerWidth * 6, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
      }
      else if (this.space) { //Precisamos pensar melhor na tecla espaço, estou a por true quando é up, e false a down, mas o harpão so lança a down
        this.spriteLine = 440
        this.step = this.step

        ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y, this.playerWidth, this.playerHeight)

      }
      else if (this.down) {
        this.spriteLine = 110
        this.stepUpDown = this.stepUpDown - 10
        ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y + this.stepUpDown, this.playerWidth, this.playerHeight)
      }
      else if (this.nothing) {
        ctx.drawImage(this.image, this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
      }
    }

    //This will serve for the sprite come down
    if (!(this.up)) {
      this.spriteLine = 110
      this.stepUpDown = this.stepUpDown - 10
      ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y - this.stepUpDown, this.playerWidth, this.playerHeight)

    }
    if (this.up) {
      this.spriteLine = 110
      this.stepUpDown = this.stepUpDown + 10
      ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y - this.stepUpDown, this.playerWidth, this.playerHeight)
      
    }

    if (this.stepUpDown <= 10) {
      this.stepUpDown = 10
    }
  }

  this.getCurrentPos = function () {
    let x = this.step + (this.playerWidth / 2)
    let y = canvas.height
    let playerPos = {
      x: x,
      y: y
    }
    return playerPos
  }
}

function Harpoon(position) {
  this.x = position.x
  this.y = position.y
  this.increment = 0

  this.draw = function () {


    ctx.beginPath()
    ctx.lineWidth = 5
    ctx.strokeStyle = `rgb(150,90,255)`
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x, this.y - this.increment)
    ctx.stroke()
    this.increment += 10

  }
  this.getCurrentPos = function () {

    let harpoonPos = { x: this.x - 2.5, y: this.y - this.increment, x1: this.x + 2.5 }
    return harpoonPos

  }

}

function Ball(x, y, vx, vy, radius, speed, velIn, ang) {
  this.x = x
  this.y = y
  this.vx = vx
  this.vy = vy
  this.radius = radius
  this.speed = speed
  this.velIn = velIn
  this.ang = ang
  this.tempvx = 0
  this.tempvy = 0



  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red'
    ctx.fill();
  }

  this.update = function () {
    //Freeze power up
    if(powerup3==true){
      if (this.tempvx == 0 && this.tempvy == 0){
        this.tempvx = this.vx //Save vx and vy
        this.tempvy = this.vy
        this.vx = 0
        this.vy = 0
        //Need to stop gravity

      }    
    }
    else if(powerup3==false){
      if(this.vx == 0 && this.vy == 0){
        this.vx = this.tempvx //Recover moviment
        this.vy = this.tempvy
        this.tempvx = 0
        this.tempvy = 0
      }

    }

    this.x += this.vx
    this.y += this.vy

    if (this.y + this.radius >= canvas.height) {
      this.vy = -this.vy
      //this.y = canvas.height- this.radius
      //this.vy = (this.velIn + 20) * Math.sin(this.ang * Math.PI / 180)

    }
    else if (this.x + this.radius >= canvas.width) {
      this.vx = -this.vx
      //this.x = canvas.width- this.radius
    }
    else if (this.x - this.radius <= 0) {
      this.vx = -this.vx
      //this.x = this.radius
    }
    else if (this.y - this.radius <= 0) {
      this.vy = -this.vy
      //this.y = this.radius
    } else {
      this.vy += this.speed
    }


  }
  this.getCurrentPos = function () {

    let ballPos = { x: this.x, y: this.y, r: this.radius }
    return ballPos


  }
}

//Creation of player
let playerWidth = 1000 / 9
let playerHeight = 550 / 5
let step = 0
let spriteLine = 0
let player1 = new Player(new Image(), playerWidth, playerHeight, step, spriteLine);



function powerupActivate(i){

  switch(powerups[i].getCurrentPos().id){
    case 1: //Harpon stick on top
      powerup1 = true
      break;
    case 2: //Harpon unlimited
      powerup2 = true
      maxHarpoons = 20
      // times up maxharpoons = 1
      break;
    case 3: //Freeze
      powerup3 = true
      break;
    case 4: 
        if(lives<5){lives+=1}
      break;
    default: console.log("Error on power up power id detect")
      break;

  }
  
}

window.onload = function () {
  //Falta ver altura max e relacionar com raio e vy
  let x = 100
  let y = 400
  let radius = iniRadius
  let speed = 0.1
  let velIn = 5
  let ang = -85
  let vx = velIn * Math.cos(ang * Math.PI / 180)
  let vy = velIn * Math.sin(ang * Math.PI / 180)
  balls.push(new Ball(x, y, vx, vy, radius, speed, velIn, ang))
  
  menu()

}

function Animate() {

  
  // player
  player1.draw();

  //ListenEvent and Draw player mov



  if (space) {
    player1.listenEvent(false, false, false, currentFrame, false, false, true)
  }
  else {
    if (right) {
      player1.listenEvent(true, false, false, currentFrame, false, false, false)
    }
    else if (left) {
      player1.listenEvent(false, true, false, currentFrame, false, false, false)
    }
    else if (up) {
      player1.listenEvent(false, false, false, currentFrame, true, false, false)
    }
    else if (down) {
      player1.listenEvent(false, false, false, currentFrame, false, true, false)
    }
    else {
      player1.listenEvent(false, false, true, currentFrame, false, false, false)
    }


  }

  for (let i = 0; i < powerups.length; i++) {
    powerups[i].draw()
  
  }
  for (let i = 0; i < powerups.length; i++) {
    powerups[i].update()
    
    if(powerups[i].getCurrentPos().x <= player1.getCurrentPos().x + playerWidth &&
    powerups[i].getCurrentPos().x + 50 >= player1.getCurrentPos().x &&
    powerups[i].getCurrentPos().y <= player1.getCurrentPos().y + playerHeight &&
    powerups[i].getCurrentPos().y +50 >= player1.getCurrentPos().y 
    ){
      console.log("Powerup activate")
      powerupActivate(i)
      powerups.splice(i, 1)


    }
  }


  for (let i = 0; i < harpoons.length; i++) {

    harpoons[i].draw()

  }

  for (let j = 0; j < harpoons.length; j++) {

    if(powerup1==true){

      //Nothig? xD
    }
    else if(powerup1==false){

      if (harpoons[j].y - harpoons[j].increment < 10) {
        harpoons.splice(j, 1)
      }
    }
  }

  for (let h = 0; h < balls.length; h++) {
    balls[h].draw()

  }

  for (let q = 0; q < balls.length; q++) {

    balls[q].update()

    for (let j = 0; j < harpoons.length; j++) {



      if (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r >= harpoons[j].getCurrentPos().x
        && balls[q].getCurrentPos().x - balls[q].getCurrentPos().r <= harpoons[j].getCurrentPos().x1
        && balls[q].getCurrentPos().y + balls[q].getCurrentPos().r >= harpoons[j].getCurrentPos().y
      ) {
        harpoons.splice(j, 1)

        if (!(balls[q].getCurrentPos().r == minimumRadius)) {

          divideBall(balls[q].getCurrentPos().x, balls[q].getCurrentPos().y, balls[q].getCurrentPos().r)

          balls.splice(q, 1)

        }
        else {

          balls.splice(q, 1)

        }

        //Random PowerUp with random change of drop

      
        let x = balls[q].getCurrentPos().x -25
        let y = balls[q].getCurrentPos().y -25
        let id = Math.floor(Math.random()*4)+1
        let img = new Image()
        powerups.push(new PowerUp(x, y, id, img))

      }

      


    }

    if (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r >= player1.getCurrentPos().x
      && balls[q].getCurrentPos().x - balls[q].getCurrentPos().r <= player1.getCurrentPos().x + playerWidth
      && balls[q].getCurrentPos().y + balls[q].getCurrentPos().r >= player1.getCurrentPos().y
    ) {

      if (lives > 0) {
        lives--

      }

      if (lives == 0) {
        console.log("game you over")
        gameOverBool = true
        gameOver()
      }


    }


  }
  //ver posicao no codigo
  if (balls.length == 0) {
    console.log("game won")
    gameWon()
  }
  //Update sprite location
  currentFrame++
  if (currentFrame >= 6) {
    currentFrame = 0
  }

  //window.requestAnimationFrame(Animate)
  //Draw lives
  if (startGame) {
    ctx.font = "16px Arial"
    ctx.fillText("lives: " + lives, 8, 20)
  }

  switch(lives){
    case 0:
    let a = new Image()
    a.src = "images2/live0.png"
    ctx.drawImage(a,8,20,100,16)
    case 1:
    let b = new Image()
    b.src = "images2/live1.png"
    ctx.drawImage(b,8,20,100,16)
    case 2:
    let c = new Image()
    c.src = "images2/live2.png"
    ctx.drawImage(c,8,20,100,16)
    case 3:
    let d = new Image()
    d.src = "images2/live3.png"
    ctx.drawImage(d,8,20,100,16)
    case 4:
    let e = new Image()
    e.src = "images2/live4.png"
    ctx.drawImage(e,8,20,100,16)
    //Nao muda para as outras, img parece que fica por icma
    break;
    default: console.log("Error on lives count") 
    break;
  }
}

function divideBall(x, y, r) {

  let flag = 1

  if (flag == 1) {

    let ang = ((Math.PI / 4))
    let velIn = 5
    let vx = velIn * Math.cos(ang * Math.PI / 180)
    let vy = velIn * Math.sin(ang * Math.PI / 180)
    let speed = 0.1
    

    balls.push(new Ball(x, y, vx, vy - 5, r / 2, speed, velIn, ang))//We need to check out why this works
    flag++

  }
  if (flag == 2) {

    let ang = ((Math.PI / 4))
    let velIn = 5
    let vx = velIn * Math.cos(ang * Math.PI / 180)
    let vy = velIn * Math.sin(ang * Math.PI / 180)
    let speed = 0.1

    balls.push(new Ball(x, y, -vx, vy - 5, r / 2, speed, velIn, ang))

  }

}

function menu() {
  //Menu
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  let img = new Image() 
  img.src = "images2/pang.png" //https://i.imgur.com/7Gc8NXt.png
  img.addEventListener("load", function () {
    ctx.drawImage(img, 300, 0, 400, 200)
  })
  
  ctx.font = "50px Arial"
  ctx.fillStyle = "white"
  let text = "Start Game"
  let textWidth = ctx.measureText(text).width
  console.log(textWidth)
  ctx.fillText(text, (canvas.width/2)-(textWidth/2) , 300)
}

function gameOver() {
  startGame = false
  clearInterval(animation)
  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  ctx.font = "60px Arial"
  ctx.fillStyle = "white"
  let text = "Game Over"
  let textWidth = ctx.measureText(text).width
  console.log(textWidth)
  ctx.fillText(text, (canvas.width/2)-(textWidth/2) , 200)

}

function gameWon() {
  startGame = false
  clearInterval(animation)
  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  ctx.font = "60px Arial"
  ctx.fillStyle = "white"
  let text = "Game Won"
  let textWidth = ctx.measureText(text).width
  console.log(textWidth)
  ctx.fillText(text, (canvas.width/2)-(textWidth/2) , 200)

}

// Key press and Key Up - eventListener
function keyDown(e) {
  switch (e.keyCode) {
    case 39:
      right = true
      break;
    case 37:
      left = true
      break;
    case 38:
      up = true
      break;
    case 40:
      down = true
      break;

  }
}

function keyUp(e) {
  switch (e.keyCode) {
    case 39:
      right = false
      break;
    case 37:
      left = false
      break;
    case 38:
      up = false
      break;
    case 40:
      down = false
      break;
    case 32:
      space = false
      if (harpoons.length < maxHarpoons) {
        harpoons.push(new Harpoon(player1.getCurrentPos()))
      }

      break;
  }
}

function keySpaceBarHandler(e) {
  if (e.keyCode == 32) {
    space = true
  }

}

/*function keyEnterHandler(e) {
  if (e.keyCode == 13) {
    startGame = true
    console.log(startGame)
    window.setInterval(Animate, 1000 / 60)
  }
}*/

function myFunction(e) {
  let mouseX = e.pageX - canvas.offsetLeft
  let mouseY = e.pageY - canvas.offsetTop
  if (startGame == true) {
    
    if (mouseY < 300  && mouseY > 300 - 40 && mouseX < (canvas.width/2) - (255.6396484375/2) + 255.6396484375 && mouseX > (canvas.width/2) - (255.6396484375/2)) { //textheight=40, textwidth = 255.6396484375
      console.log("ola")
      console.log(gameOverBool)
    
      startAnimation()
    }
  }
  
}

function startAnimation() {
  animation = window.setInterval(Animate, 1000 / 60)
  return animation
}

window.addEventListener('click', myFunction); 

window.addEventListener("keydown", keyDown)
window.addEventListener("keyup", keyUp)
window.addEventListener("keypress", keySpaceBarHandler)
//window.addEventListener("keypress", keyEnterHandler)



