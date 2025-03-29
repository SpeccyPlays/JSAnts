class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Ant {
  constructor(screenWidth, screenHeight, velocity, boundary) {
    this.currentPos = new Vector(
      this.generateRandomInteger(boundary, screenWidth - boundary),
      this.generateRandomInteger(boundary, screenHeight - boundary)
    );
    this.antState = "WANDER";
    this.velocity = new Vector(velocity, velocity);
    this.desiredVelocity = new Vector(0, 0);
    this.oldPos = new Vector(0, 0);
    this.desired = new Vector(0, 0);
    this.setDesired(screenWidth / 2, screenHeight / 2);
    this.avoidPos = new Vector(0, 0);
    this.maxForce = 10;
    this.maxSpeed = 10;
  }
  generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
  setCurrentPosToOldPos() {
    this.oldPos.x = this.currentPos.x;
    this.oldPos.y = this.currentPos.y;
  }
  setDesired(x, y) {
    this.desired.x = x;
    this.desired.y = y;
  }
  setAvoidPos(x, y) {
    this.avoidPos.x = x;
    this.avoidPos.y = y;
  }
  setMagnitude(temp, newMag) {
    const length = Math.sqrt(temp.x * temp.x + temp.y * temp.y);
    if (length != 0) {
      temp.x = (temp.x / length) * newMag;
      temp.y = (temp.y / length) * newMag;
    }
    return temp;
  }
  addToVelocityX(x) {
    this.velocity.x += x;
  }
  addToVelocityY(y) {
    this.velocity.y += y;
  }
  checkBoundary(width, height, boundary, hudBoundary) {
    //check if we're going to go off screen
    if (this.currentPos.x < boundary) {
      this.velocity.x += 2;
    } else if (this.currentPos.x > width - boundary) {
      this.velocity.x -= 2;
    }
    if (this.currentPos.y < hudBoundary) {
      this.velocity.y += 2;
    } else if (this.currentPos.y > height - boundary) {
      this.velocity.y -= 2;
    }
  }
  detectCollision(x, y, r) {
    /*
      Check if we're in the circle of x and y
      Including the radius as there's a different range for if we hit another ant or desired location
      */
    const dx = x - this.currentPos.x;
    const dy = y - this.currentPos.y;
    const rr = r * r; //(r + r) * (r + r);
    const distance = dx * dx + dy * dy;
    if (distance <= rr) {
      return true;
    } else {
      return false;
    }
  }
  slowDown(collisionDetectRadius) {
    /*
        Slow down if we're nearing the desired target
        */
    if (
      this.detectCollision(
        this.desired.x,
        this.desired.y,
        collisionDetectRadius
      )
    ) {
      if (this.velocity.x != 0) {
        this.velocity.x /= 2;
      }
      if (this.velocity.y != 0) {
        this.velocity.y /= 2;
      }
    }
  }
  slowDown() {
    if (this.velocity.x != 0) {
      this.velocity.x /= 2;
    }
    if (this.velocity.y != 0) {
      this.velocity.y /= 2;
    }
  }
  seeking(x, y) {
    setDesired(x, y);
  }
  wandering(wanderingDistance) {
    /*
        Go to a point in front of the ant
        Pick a random point on a circle from there
        Set that to where the ant wants to head towards
        Makes the movement look more natural
    
        */
    let tempX = this.currentPos.x + this.velocity.x * wanderingDistance;
    let tempY = this.currentPos.y + this.velocity.y * wanderingDistance;
    const randAngle = (this.generateRandomInteger(0, 360) * Math.PI) / 180.0;
    const randomDistance = this.generateRandomInteger(10, 30);
    tempX += randomDistance * Math.cos(randAngle);
    tempY += randomDistance * Math.sin(randAngle);
    this.setDesired(tempX, tempY);
  }
  calculateVelocties() {
    /*
        Set the desired velocity to the amount we need to move to desired
        Reduce the magnitude or it'll go straight there
        Limit the velocity for the same reason 
        (I think for the last two)
        */
    this.desiredVelocity.x = this.desired.x - this.currentPos.x;
    this.desiredVelocity.y = this.desired.y - this.currentPos.y;
    this.desiredVelocity = this.setMagnitude(this.desiredVelocity, this.maxSpeed);
    this.desiredVelocity.x *= this.maxSpeed;
    this.desiredVelocity.y *= this.maxSpeed;
    if (this.desiredVelocity.x > this.maxSpeed) {
      this.desiredVelocity.x = this.maxSpeed;
    } else if (this.desiredVelocity.x < -this.maxSpeed) {
      this.desiredVelocity.x = -this.maxSpeed;
    }
    if (this.desiredVelocity.y > this.maxSpeed) {
      this.desiredVelocity.y = this.maxSpeed;
    } else if (this.desiredVelocity.y < -this.maxSpeed) {
      this.desiredVelocity.y = -this.maxSpeed;
    }
  }
  steering(maxForce) {
    /*
        How much the ant will turn towards it's desired destination
        Use the class maxforce value to limit or increase the turning force
        */
    this.calculateVelocties();
    let steeringForce = new Vector(0, 0);
    steeringForce.x = this.desiredVelocity.x - this.velocity.x;
    steeringForce.y = this.desiredVelocity.y - this.velocity.y;
    if (steeringForce.x > maxForce) {
      steeringForce.x = maxForce;
    } else if (steeringForce.x < -maxForce) {
      steeringForce.x = -maxForce;
    }
    if (steeringForce.y > maxForce) {
      steeringForce.y = maxForce;
    } else if (steeringForce.y < -maxForce) {
      steeringForce.y = -maxForce;
    }
    this.velocity.x += steeringForce.x;
    this.velocity.y += steeringForce.y;
  }
  locomotion() {
    this.currentPos.x += this.velocity.x;
    this.currentPos.y += this.velocity.y;
  }
  getDesiredX() {
    return this.desired.x;
  }
  getDesiredY() {
    return this.desired.y;
  }
}

class AntController {
  constructor(numOfAnts, ctx, width, height) {
    this.numOfAnts = numOfAnts;
    this.ants = [];
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.ctx.fillStyle = "green";
    for (let i = 0; i < this.numOfAnts; i++){
        this.ants[i] = new Ant(this.width, this.height, 10, 10);
    };
    this.antSize = 2;
    this.boundary = 5; //screenboundary
    this.hudBoundary = 30; //how much space the HUD takes up - from y = 0 up
    this.maxForce = 1; //how much steering force is applied - greater number means more sharp turns (I think)
    this.wanderingDistance = 4; //how far in front of the ant when setting up wandering
    //the size of the circle used to determine if an ant is gonna collide
    //also used for the size of the food
    this.collisionDetectRadius = 10;

    this.antDetectRadius = this.antSize * 2; //size of circle to detect another ant
    this.avoidanceFactor = 0.1; //used for avoiding a predator
    this.minSeparationDistance = 3;
  }
  move(){
    this.ants.forEach(ant => {
        ant.setCurrentPosToOldPos();
        ant.checkBoundary(this.width, this.height, this.boundary, this.hudBoundary);
        ant.wandering(this.wanderingDistance);
        //collision detection works better if steering here
        ant.steering(this.maxForce);
        //required for collision detection calculations
        let dx = 0;
       let dy = 0;
        let neighbourAnts = 0;
        //loop through all ants to check for collisions
        for (let j = 0; j < this.numOfAnts; j++){
            if(ant !== j){
                if(ant.detectCollision(this.ants[j].currentPos.x, this.ants[j].currentPos.y, this.antDetectRadius)){
                    dx += (this.ants[j].currentPos.x - ant.currentPos.x);
                    dy += (this.ants[j].currentPos.y - ant.currentPos.y);
                    neighbourAnts ++;
                }
            }
        }
         /***** the sqrt slows it down a bit but not much **/
        /*let distance = Math.sqrt(dx * dx + dy * dy);
        if (neighbourAnts > 0 && distance < this.minSeparationDistance) {
            // Calculate a separation force to move the ant away from its neighbors
            const separationForceX = -(dx / distance) * this.minSeparationDistance;
            const separationForceY = -(dy / distance) * this.minSeparationDistance;
            ant.addToVelocityX(separationForceX);
            ant.addToVelocityY(separationForceY);
        }*/
        ant.locomotion();
        //removeCoords(ants[i].oldPos.x, ants[i].oldPos.y, antSize);
    });
  }
  draw() {
    this.ants.forEach((ant) => {
      this.ctx.fillRect(ant.currentPos.x, ant.currentPos.y, this.antSize, this.antSize);
    });
  }
}
