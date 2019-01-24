let canvas = document.getElementById("canvasPang");
let ctx = canvas.getContext("2d");

/*SOunds*/
let theme = new Audio("Theme.mp3");

canvas.width = 1000;
canvas.height = 600;

//Player e controlos
let currentFrame = 0
let right = false
let left = false
let up = false
let down = false
let space = false
let lives = 5
let startGame = true
let gameOverBool = false
let gameWonBool = false
let animation = null
let pause = false
let animation2 = null
let controlsBool = false
let level = false
let levelsMenuBool = false
let menuBool = true
let scoreMultiplier = 1

let textWidthStartGame = 0
let textWidthControls = 0
let textWidthLevels = 0
let textWidthBack = 0
let textWidthLevel1 = 0
let textWidthLevel2 = 0
let textWidthLevel3 = 0
let textWidthReturnToMenu = 0
let textWidthNextLevel = 0

let scorePlus = 100
let currentScore = 0
let currentBest = 0

if (localStorage.getItem("currentBest") == null) {
  localStorage.setItem("currentBest", currentBest)
}

//Niveis
let currentLevel = 1
let creationOfLevel = true

let backgroundSrc = ""

let platforms = []

//Harpoon
let harpoons = []
let maxHarpoons = 1 //For powerUps

//Ball
let iniRadius = 60
let minimumRadius = 15
let balls = []

//PowerUp
let powerups = []
let powerup1 = false
let powerup2 = false
let powerup3 = false
let timesUp = false
let randPUP = 0
let powerUpFrame = 0

//Níveis (Arrays de objetos)
let levels = [{
  number: 1,
  ballsBig: 1,
  backgroundSrc: "images2/background.gif",
  platforms: [],
},
{
  number: 2,
  ballsBig: 2,
  backgroundSrc: "images2/background2.gif",
  platforms: [{
    // x: 200,
    // y: 200,
    // w: 200,
    // h: 50
  }]
},
{
  number: 3,
  ballsBig: 3,
  backgroundSrc: "images2/background3.gif",
  platforms: [{
    // x: 200,
    // y: 200,
    // w: 200,
    // h: 50
  }]
}]

function PowerUp(x, y, id, img) {
  this.x = x
  this.y = y
  this.id = id
  this.img = img
  this.cy = 2

  switch (this.id) {
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

  this.draw = function () {
    ctx.drawImage(this.img, this.x, this.y, 50, 50)
  }

  this.update = function () {

    if (this.y + 50 > canvas.height) {
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

//Plataformas
function Platform(x, y, width, height) {

  this.x = x
  this.y = y
  this.width = width
  this.height = height

  this.draw = function () {

    ctx.fillStyle = "blue"
    ctx.fillRect(this.x, this.y, this.width, this.height)

  }

}

//Player
function Player(image, playerWidth, playerHeight, step, spriteLine) {

  this.image = image
  this.playerWidth = playerWidth
  this.playerHeight = playerHeight
  this.step = step
  this.stepUpDown = step
  this.spriteLine = spriteLine
  this.image.src = "images2/gb_walk.png"

  this.ground = canvas.height
  //this.onPlatform = false

  this.draw = function () {
    ctx.drawImage(this.image, this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
  }

  this.listenEvent = function (right, left, nothing, currentFrame, up, down, space) { //Esta função é muito importante, pois é aqui que "ouvimos" em que tecla está a clicar, e assim, decidimos as ações que o sprite irá realizar

    this.right = right
    this.left = left
    this.nothing = nothing
    this.currentFrame = currentFrame
    this.up = up
    this.down = down
    this.space = space

    //Cada vez que o atualizamos, metemos sempre o background ativo no nivel
    let background = new Image()
    background.src = backgroundSrc
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    //if (!(this.stepUpDown != 10)) {--> Isto serviu para a experiência de fazer o jogador subir para as plataformas, mas não conseguimos concretizar. Por isso, fica para a versão 2 :)
    if (this.right) {

      this.spriteLine = 0
      this.step = this.step + 10

      if (this.step > canvas.width - this.playerWidth) {
        this.step = canvas.width - this.playerWidth - 1
      }

      //if (!this.onPlatform) { //Verifica se está ou não em cima duma plataforma
      ctx.drawImage(this.image, this.playerWidth * 6, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
      //}

    }
    else if (this.left) {

      this.spriteLine = 110
      this.step = this.step - 10

      if (this.step < 0) {
        this.step = 1
      }
      //if (!this.onPlatform) {
      ctx.drawImage(this.image, this.playerWidth * 6, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
      //}
    }
    else if (this.space) {

      this.spriteLine = 220
      this.step = this.step

      ctx.drawImage(this.image, this.playerWidth * 4, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y, this.playerWidth, this.playerHeight)

    }
    /*
    else if (this.down) { --> Usado para descer duma plataforma
      this.spriteLine = 110
      this.stepUpDown = this.stepUpDown - 10
      ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y + this.stepUpDown, this.playerWidth, this.playerHeight)
    }
    */

    else if (this.nothing) {
      ctx.drawImage(this.image, this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
    }

    /*Isto serve como "gravidade"
    if (!(this.up)) {
      this.spriteLine = 110
      this.stepUpDown = this.stepUpDown - 10
      ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y - this.stepUpDown, this.playerWidth, this.playerHeight)

      
      if (this.getCurrentPos().y - this.stepUpDown <= platform1.y && (this.getCurrentPos().x <= platform1.x)) {
        this.ground = platform1.y - this.playerHeight
        this.onPlatform = true
      }

    }
    if (this.up) {
      this.spriteLine = 110
      this.stepUpDown = this.stepUpDown + 10
      ctx.drawImage(this.image, this.playerWidth * 3, this.spriteLine, this.playerWidth, this.playerHeight, this.getCurrentPos().x, this.getCurrentPos().y - this.stepUpDown, this.playerWidth, this.playerHeight)

    }

    if (this.stepUpDown <= 10) {
      this.stepUpDown = 10
    }*/
  }

  this.getCurrentPos = function () {
    let x = this.step + (this.playerWidth / 2)
    let y = this.ground //- this.stepUpDown
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

    this.x += this.vx
    this.y += this.vy

    if (this.y + this.radius >= canvas.height) {

      this.vy = -this.vy

    }
    else if (this.x + this.radius >= canvas.width) {

      this.vx = -this.vx

    }
    else if (this.x - this.radius <= 0) {

      this.vx = -this.vx

    }
    else if (this.y - this.radius <= 0) {

      this.vy = -this.vy

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

function powerupActivate(i) {

  switch (powerups[i].getCurrentPos().id) {
    case 1: //Harpon stick on top
      powerup1 = true
      break;
    case 2: //Harpon unlimited
      powerup2 = true
      maxHarpoons = 5
      // times up maxharpoons = 1
      break;
    case 3: //Freeze
      powerup3 = true
      break;
    case 4:
      if (lives < 5) { lives += 1 }
      break;
    default: console.log("Error on power up power id detect")
      break;
  }
}

window.onload = function () {

  menu()

}

function Animate() {

  level = false

  //É aqui onde lemos o array que contém os níveis, e os criamos
  if (creationOfLevel) {

    for (let i = 0; i < levels.length; i++) {

      if (currentLevel == levels[i].number) {

        //Aqui vai inserir todos os dados dos níveis nas suas variáveis respetivas
        for (let j = levels[i].ballsBig; j > 0; j--) {

          let x = (j) * 200
          let y = 400
          let radius = 60
          let speed = 0.1
          let velIn = 5
          let ang = -85
          let vx = velIn * Math.cos(ang * Math.PI / 180)
          let vy = velIn * Math.sin(ang * Math.PI / 180)

          balls.push(new Ball(x, y, vx, vy, radius, speed, velIn, ang))

        }

        /*
        for (let a = 0; a < levels[i].platforms.length; a++) {

          let plats = levels[i].platforms[a]

          platforms.push(new Platform(plats.x, plats.y, plats.w, plats.h))

        }*/

        backgroundSrc = levels[i].backgroundSrc

      }
    }

    creationOfLevel = false //Esta flag tem um propósito muito importante, pois sempre que corremos o Animate, se não tivermos esta flag, ele vai estar sempre a criar o nível. Por isso é que quando acaba o nível (todas as bolas
    // são destruídas), metemos esta variável a true e acrescentamos um valor à variavel currentLevel

  }

  let background = new Image()
  background.src = backgroundSrc
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  player1.draw();

  //Escutar os eventos acionados
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
    /*else if (up) {
      player1.listenEvent(false, false, false, currentFrame, true, false, false)
    }
    else if (down) {
      player1.listenEvent(false, false, false, currentFrame, false, true, false)
    }*/
    else {
      player1.listenEvent(false, false, true, currentFrame, false, false, false)
    }
  }

  for (let i = 0; i < powerups.length; i++) {

    powerups[i].draw()

  }
  for (let i = 0; i < powerups.length; i++) {

    powerups[i].update()

    //Colisão dos PowerUps com o Player
    if (powerups[i].getCurrentPos().x <= player1.getCurrentPos().x + playerWidth &&
      powerups[i].getCurrentPos().x + 50 >= player1.getCurrentPos().x &&
      powerups[i].getCurrentPos().y <= player1.getCurrentPos().y + playerHeight &&
      powerups[i].getCurrentPos().y + 50 >= player1.getCurrentPos().y) {

      powerupActivate(i)
      powerups.splice(i, 1)

      powerUpFrame = currentFrame

    }
  }

  for (let i = 0; i < harpoons.length; i++) {

    harpoons[i].draw()

  }

  for (let j = 0; j < harpoons.length; j++) {

    if (powerup1 == true) {

      if (space) { harpoons.splice(j, 1) }

    }
    else if (powerup1 == false) {

      if (harpoons[j].y - harpoons[j].increment < 10) {
        harpoons.splice(j, 1)
      }

    }
  }

  for (let h = 0; h < balls.length; h++) {

    balls[h].draw()

  }

  /*
  for (let i = 0; i < platforms.length; i++) {

    platforms[i].draw()

  }*/

  for (let q = 0; q < balls.length; q++) {

    if (powerup3 == false) { //Só damos update às bolas se o PowerUp Freeze estiver inativo

      balls[q].update()
      if (balls[q].getCurrentPos().y - balls[q].getCurrentPos().r < 0) {
        balls.splice(q, 1)
      }

      /* Infelizmente, após várias tentativas, as plataformas não ficaram a 100% como nó desejávamos, mas deixaremos aqui o código pois não se sabe o que o futuro nos espera
      for (let j = 0; j < platforms.length; j++) {

        //Down Collision
        if (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r >= platforms[j].x &&
          balls[q].getCurrentPos().x + balls[q].getCurrentPos().r <= platforms[j].x + platforms[j].width &&
          balls[q].getCurrentPos().y - balls[q].getCurrentPos().r <= platforms[j].y + platforms[j].height - 1 &&
          balls[q].getCurrentPos().y - balls[q].getCurrentPos().r <= platforms[j].y + platforms[j].height + 1) { //Decidimos aqui fazer a intereseção num intervalo, pois assim temos uma maior margem
          console.log("Bateu em baixo")
          balls[q].vy = -balls[q].vy
        }

        //Up Collision
        else if (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r >= platforms[j].x &&
          balls[q].getCurrentPos().x + balls[q].getCurrentPos().r <= platforms[j].x + platforms[j].width &&
          balls[q].getCurrentPos().y + balls[q].getCurrentPos().r <= platforms[j].y - 1 &&
          balls[q].getCurrentPos().y + balls[q].getCurrentPos().r <= platforms[j].y + 1) {
          console.log("Bateu em cima")
          balls[q].vy = -balls[q].vy
        }

        //Left Collision
        else if ((balls[q].getCurrentPos().y + balls[q].getCurrentPos().r <= platforms[j].y + platforms[j].height ||
          balls[q].getCurrentPos().y - balls[q].getCurrentPos().r >= platforms[j].y) &&
          (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r == platforms[j].x)) {
          console.log("Bateu em esquerda")
          balls[q].vx = -balls[q].vx
        }

        //Right Collision
        else if ((balls[q].getCurrentPos().y + balls[q].getCurrentPos().r <= platforms[j].y + platforms[j].height ||
          balls[q].getCurrentPos().y - balls[q].getCurrentPos().r >= platforms[j].y) &&
          (balls[q].getCurrentPos().x - balls[q].getCurrentPos().r == platforms[j].x + platforms[j].width)) {
          console.log("Bateu em direita")
          balls[q].vx = -balls[q].vx
        }
      }
      */
    }
    for (let j = 0; j < harpoons.length; j++) {

      //Colisão com os harpões
      if (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r >= harpoons[j].getCurrentPos().x
        && balls[q].getCurrentPos().x - balls[q].getCurrentPos().r <= harpoons[j].getCurrentPos().x1
        && balls[q].getCurrentPos().y + balls[q].getCurrentPos().r >= harpoons[j].getCurrentPos().y) {

        scoreMultiplier += 0.1
        currentScore = parseInt(currentScore + (scorePlus * scoreMultiplier))

        harpoons.splice(j, 1)

        if (!(balls[q].getCurrentPos().r == minimumRadius)) {
          divideBall(balls[q].getCurrentPos().x, balls[q].getCurrentPos().y, balls[q].getCurrentPos().r)
          balls.splice(q, 1)
        }
        else {
          balls.splice(q, 1)
        }

        randPUP = Math.floor(Math.random() * 5)

        if (randPUP == 1) {

          //Aqui criamos o powerup
          let x = balls[q].getCurrentPos().x - 25
          let y = balls[q].getCurrentPos().y - 25
          let id = Math.floor(Math.random() * 4) + 1
          let img = new Image()
          powerups.push(new PowerUp(x, y, id, img))

        }
      }
    }

    if (balls[q].getCurrentPos().x + balls[q].getCurrentPos().r >= player1.getCurrentPos().x
      && balls[q].getCurrentPos().x - balls[q].getCurrentPos().r <= player1.getCurrentPos().x + playerWidth
      && balls[q].getCurrentPos().y + balls[q].getCurrentPos().r >= player1.getCurrentPos().y) {

      scoreMultiplier = 1

      if (lives > 0) {
        lives--
      }

      if (lives == 0) {

        gameOverBool = true

        if (currentScore > localStorage.getItem("currentBest")) {
          currentBest = currentScore
          localStorage.setItem("currentBest", currentBest)
        }

        gameOver()

      }
    }
  }

  //Passagem de nível ou Jogo ganho
  if (balls.length == 0) {

    powerups = []
    creationOfLevel = true
    currentLevel++

    if (currentLevel == 4) {

      gameWonBool = true

      if (currentScore > localStorage.getItem("currentBest")) {
        currentBest = currentScore
        localStorage.setItem("currentBest", currentBest)
      }

      gameWon()
    }
    else {

      LevelWon()

    }

  }

  //Update à localização do sprite e timer dos powerups
  currentFrame++

  if (currentFrame - powerUpFrame >= 500) {

    powerUpFrame = 0
    powerup3 = false
    powerup2 = false
    powerup1 = false

  }

  //Lives, Level and Score display in game
  if (gameWonBool == false && level == false && gameOverBool == false) {
    switch (lives) {
      case 0:
        let a = new Image()
        a.src = "images2/live0.png"
        ctx.drawImage(a, 8, 10, 100, 16)
        break;
      case 1:
        let b = new Image()
        b.src = "images2/live1.png"
        ctx.drawImage(b, 8, 10, 100, 16)
        break;
      case 2:
        let c = new Image()
        c.src = "images2/live2.png"
        ctx.drawImage(c, 8, 10, 100, 16)
        break;
      case 3:
        let d = new Image()
        d.src = "images2/live3.png"
        ctx.drawImage(d, 8, 10, 100, 16)
        break;
      case 4:
        let e = new Image()
        e.src = "images2/live4.png"
        ctx.drawImage(e, 8, 10, 100, 16)
        break;
      case 5:
        let f = new Image()
        f.src = "images2/live5.png"
        ctx.drawImage(f, 8, 10, 100, 16)
        break;
      default: console.log("Error on lives count")
        break;
    }
    ctx.font = "25px Arial"
    ctx.fillStyle = "white"
    ctx.fillText("Score: " + currentScore, 850, 30)

    ctx.font = "25px Arial"
    ctx.fillStyle = "white"
    let textLevel = "Level: " + currentLevel
    let textWidthLevel = ctx.measureText(textLevel).width
    ctx.fillText(textLevel, (canvas.width / 2) - (textWidthLevel / 2), 30)
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

  scoreMultiplier = 1
  currentScore = 0

  //Menu
  menuBool = true
  levelsMenuBool = false
  controlsBool = false

  ctx.fillStyle = "black"
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
  textWidthStartGame = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidthStartGame / 2), 275)

  ctx.font = "50px Arial"
  ctx.fillStyle = "white"
  let text2 = "Controls"
  textWidthControls = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidthControls / 2), 375)

  ctx.font = "50px Arial"
  ctx.fillStyle = "white"
  let text3 = "Levels"
  textWidthLevels = ctx.measureText(text3).width
  ctx.fillText(text3, (canvas.width / 2) - (textWidthLevels / 2), 475)

  ctx.font = "40px Arial"
  ctx.fillStyle = "white"
  let text4 = "Highscore: " + localStorage.getItem("currentBest")
  let textWidthHighscore = ctx.measureText(text4).width
  ctx.fillText(text4, (canvas.width / 2) - (textWidthHighscore / 2), 550)

}

function Controls() {

  controlsBool = true
  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()

  ctx.font = "50px Arial"
  ctx.fillStyle = "white"
  let text = "Controls"
  let textWidth = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), 100)

  let img = new Image()
  img.src = "images2/controls2.png"
  img.addEventListener("load", function () {
    ctx.drawImage(img, 150, 175)
  })

  ctx.font = "25px Arial"
  ctx.fillStyle = "white"
  let text2 = "Back"
  textWidthBack = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidthBack / 2), 500)

}

function gameOver() {

  startGame = false
  clearInterval(animation)

  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  ctx.font = "60px Arial"
  ctx.fillStyle = "white"
  let text = "Game Over!"
  let textWidth = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), 200)

  ctx.font = "40px Arial"
  ctx.fillStyle = "white"
  let text2 = "Return to Menu"
  textWidthReturnToMenu = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidthReturnToMenu / 2), 350)

}

function Pause() {

  ctx.fillStyle = "rgb(0,0,0,0.8)"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  ctx.font = "60px Arial"
  ctx.fillStyle = "white"
  let text = "Pause"
  let textWidth = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), 200)
  ctx.font = "20px Arial"
  ctx.fillStyle = "white"
  let text2 = "Pess enter to unpause"
  let textWidth2 = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidth2 / 2), 250)

}

function gameWon() {

  startGame = false
  clearInterval(animation)

  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  ctx.font = "60px Arial"
  ctx.fillStyle = "white"
  let text = "You Win!"
  let textWidth = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), 200)

  ctx.font = "40px Arial"
  ctx.fillStyle = "white"
  let text2 = "Return to Menu"
  textWidthReturnToMenu = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidthReturnToMenu / 2), 350)

}

function LevelWon() {

  level = true
  clearInterval(animation)
  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  ctx.font = "60px Arial"
  ctx.fillStyle = "white"
  let text = "Level " + (currentLevel - 1) + " Completed"
  let textWidth = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), 200)

  ctx.font = "50px Arial"
  ctx.fillStyle = "white"
  let text2 = "Next Level"
  textWidthNextLevel = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidthNextLevel / 2), 350)

}

function levelsMenu() {

  menuBool = false
  levelsMenuBool = true
  ctx.fillStyle = "black"
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fill()

  ctx.font = "50px Arial"
  ctx.fillStyle = "white"
  let text4 = "Levels"
  let textWidth4 = ctx.measureText(text4).width
  ctx.fillText(text4, (canvas.width / 2) - (textWidth4 / 2), 100)

  ctx.font = "40px Arial"
  ctx.fillStyle = "white"
  let text = "Level 1"
  textWidthLevel1 = ctx.measureText(text).width
  ctx.fillText(text, (canvas.width / 2) - (textWidthLevel1 / 2), 225)

  ctx.font = "40px Arial"
  ctx.fillStyle = "white"
  let text2 = "Level 2"
  textWidthLevel2 = ctx.measureText(text2).width
  ctx.fillText(text2, (canvas.width / 2) - (textWidthLevel2 / 2), 300)

  ctx.font = "40px Arial"
  ctx.fillStyle = "white"
  let text3 = "Level 3"
  textWidthLevel3 = ctx.measureText(text3).width
  ctx.fillText(text3, (canvas.width / 2) - (textWidthLevel3 / 2), 375)

  ctx.font = "25px Arial"
  ctx.fillStyle = "white"
  let text5 = "Back"
  textWidthBack = ctx.measureText(text3).width
  ctx.fillText(text5, (canvas.width / 2) - (textWidthBack / 2), 500)

}

// Key press e Key Up - eventListener
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

function keyEnterHandler(e) {
  if (gameOverBool == false && gameWonBool == false && startGame == false && level == false) {
    if (e.keyCode == 13) {
      if (pause == false) {
        pause = true
        clearInterval(animation)
        startAnimation2()
        Pause()
      }
      else {
        pause = false
        clearInterval(animation2)
        startAnimation()
      }
    }
  }
}

function mouseFunction(e) {
  let mouseX = e.pageX - canvas.offsetLeft
  let mouseY = e.pageY - canvas.offsetTop
  if (startGame == true) {
    if (controlsBool == false && levelsMenuBool == false) {
      if (mouseY < 275 && mouseY > 275 - 40 && mouseX < (canvas.width / 2) - (textWidthStartGame / 2) + textWidthStartGame && mouseX > (canvas.width / 2) - (textWidthStartGame / 2)) {
        startAnimation()
        startGame = false
      }
    }

    if (levelsMenuBool == false) {
      if (mouseY < 375 && mouseY > 375 - 40 && mouseX < (canvas.width / 2) - (textWidthControls / 2) + textWidthControls && mouseX > (canvas.width / 2) - (textWidthControls / 2)) {
        Controls()
      }

      if (mouseY < 500 && mouseY > 500 - 20 && mouseX < (canvas.width / 2) - (textWidthBack / 2) + textWidthBack && mouseX > (canvas.width / 2) - (textWidthBack / 2)) {
        menu()
      }

    }

    if (controlsBool == false) {
      if (mouseY < 475 && mouseY > 475 - 40 && mouseX < (canvas.width / 2) - (textWidthLevels / 2) + textWidthLevels && mouseX > (canvas.width / 2) - (textWidthLevels / 2)) {
        levelsMenu()
      }

      if (menuBool == false) {
        if (mouseY < 225 && mouseY > 225 - 30 && mouseX < (canvas.width / 2) - (textWidthLevel1 / 2) + textWidthLevel1 && mouseX > (canvas.width / 2) - (textWidthLevel1 / 2)) {
          startGame = false
          startAnimation()
        }

        if (mouseY < 300 && mouseY > 300 - 30 && mouseX < (canvas.width / 2) - (textWidthLevel2 / 2) + textWidthLevel2 && mouseX > (canvas.width / 2) - (textWidthLevel2 / 2)) {
          startGame = false
          currentLevel = 2
          startAnimation()
        }

        if (mouseY < 375 && mouseY > 375 - 30 && mouseX < (canvas.width / 2) - (textWidthLevel1 / 2) + textWidthLevel3 && mouseX > (canvas.width / 2) - (textWidthLevel3 / 2)) {
          startGame = false
          currentLevel = 3
          startAnimation()
        }

        if (mouseY < 500 && mouseY > 500 - 20 && mouseX < (canvas.width / 2) - (textWidthBack / 2) + textWidthBack && mouseX > (canvas.width / 2) - (textWidthBack / 2)) {
          menu()
        }
      }
    }

  }

  else {
    if (mouseY < 350 && mouseY > 350 - 40 && mouseX < (canvas.width / 2) - (textWidthReturnToMenu / 2) + textWidthReturnToMenu && mouseX > (canvas.width / 2) - (textWidthReturnToMenu / 2)) {
      if (gameOverBool == true || gameWonBool == true) {
        location.reload()
      }
    }
    if (mouseY < 350 && mouseY > 350 - 40 && mouseX < (canvas.width / 2) - (textWidthNextLevel / 2) + textWidthNextLevel && mouseX > (canvas.width / 2) - (textWidthNextLevel / 2)) {
      if (level == true) {
        startAnimation()
        level = false
      }

    }
  }
}

function startAnimation() {
  animation = window.setInterval(Animate, 1000 / 60)
  return animation
}

function startAnimation2() {
  animation2 = window.setInterval(keyEnterHandler, 1000 / 60)
  return animation2
}

window.addEventListener('click', mouseFunction);

window.addEventListener("keydown", keyDown)
window.addEventListener("keyup", keyUp)
window.addEventListener("keypress", keySpaceBarHandler)
window.addEventListener("keypress", keyEnterHandler)