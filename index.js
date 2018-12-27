let canvas = document.getElementById("canvasPang");
let ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

let currentFrame = 0
let right = false
let left = false
let harpoons = []
let maxHarpoons = 1 //For powerUps

let iniRadius = 30
let minimumRadius = iniRadius / 4

let balls = []

//Player object
function Player(image, playerWidth, playerHeight, step, spriteLine) {

  this.image = image
  this.playerWidth = playerWidth
  this.playerHeight = playerHeight
  this.step = step
  this.spriteLine = spriteLine
  this.image.src = "images2/gb_walk.png"

  //Draw player 
  this.draw = function () {
    ctx.drawImage(this.image, this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
  }

  //Draw player mov
  this.listenEvent = function (right, left, nothing, currentFrame) {
    this.right = right
    this.left = left
    this.nothing = nothing
    this.currentFrame = currentFrame

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (this.right) {
      this.spriteLine = 0
      this.step = this.step + 20
      if (this.step > canvas.width - this.playerWidth) {
        this.step = canvas.width - this.playerWidth - 1
      }
      ctx.drawImage(this.image, this.currentFrame * this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
    }
    else if (this.left) {
      this.spriteLine = 150
      this.step = this.step - 20
      if (this.step < 0) {
        this.step = 1
      }
      ctx.drawImage(this.image, this.currentFrame * this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
    }
    else if (this.nothing) {
      ctx.drawImage(this.image, this.playerWidth, this.spriteLine, this.playerWidth, this.playerHeight, this.step, canvas.height - this.playerHeight, this.playerWidth, this.playerHeight)
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
let playerWidth = 104
let playerHeight = 150
let step = 0
let spriteLine = 0
let player1 = new Player(new Image(), playerWidth, playerHeight, step, spriteLine);

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

  window.setInterval(Animate, 1000 / 60)
  //Animate()
}

function Animate() {

  //Draw player
  player1.draw();

  //ListenEvent and Draw player mov
  if (right) {
    player1.listenEvent(true, false, false, currentFrame)
  }
  else if (left) {
    player1.listenEvent(false, true, false, currentFrame)
  }
  else {
    player1.listenEvent(false, false, true, currentFrame)
  }

  for (let i = 0; i < harpoons.length; i++) {

    harpoons[i].draw()

  }

  for (let j = 0; j < harpoons.length; j++) {

    if (harpoons[j].y - harpoons[j].increment < 10) {
      harpoons.splice(j, 1)
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

      }

    }


  }

  //Update sprite location
  currentFrame++
  if (currentFrame >= 6) {
    currentFrame = 0
  }

  //window.requestAnimationFrame(Animate)
}

function divideBall(x, y, r) {

  let flag = 1

  if (flag == 1) {

    let ang = ((Math.PI / 4))
    let velIn = 5
    let vx = velIn * Math.cos(ang * Math.PI / 180)
    let vy = velIn * Math.sin(ang * Math.PI / 180)
    let speed = 0.1
    console.log(vy)

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

// Key press and Key Up - eventListener
function keyDown(e) {
  switch (e.keyCode) {
    case 39:
      right = true
      break;
    case 37:
      left = true
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
    case 32:
      if (harpoons.length < maxHarpoons) {
        harpoons.push(new Harpoon(player1.getCurrentPos()))
      }

      break;
  }
}

window.addEventListener("keydown", keyDown)
window.addEventListener("keyup", keyUp)



