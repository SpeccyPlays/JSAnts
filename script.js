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
    this.oldPos = new Vector(0, 0);
    this.desired = new Vector(0, 0);
    this.setDesired(screenWidth / 2, screenHeight / 2);
    this.avoidPos = new Vector(0, 0);
    this.maxForce = 10;
  }
  generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
  setCurrentPosToOldPos() {
    this.oldPos.x = currentPos.x;
    this.oldPos.y = currentPos.y;
  }
  setDesired(x, y) {
    this.desired.x = x;
    this.desired.y = y;
  }
  setAvoidPos(x, y) {
    this.avoidPos.x = x;
    this.avoidPos.y = y;
  }
  setMagnitude(temp, inewMag) {
    const length = sqrt(temp.x * temp.x + temp.y * temp.y);
    if (length != 0) {
      temp.x = (temp.x / length) * newMag;
      temp.y = (temp.y / length) * newMag;
    }
    return temp;
  }
  setMagnitude(temp, newMag) {
    const length = sqrt(temp.x * temp.x + temp.y * temp.y);
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
    const tempX = this.currentPos.x + this.velocity.x * wanderingDistance;
    const tempY = this.currentPos.y + this.velocity.y * wanderingDistance;
    const randAngle = (this.generateRandomInteger(0, 360) * PI) / 180.0;
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
    this.desiredVelocity = this.setMagnitude(this.desiredVelocity, maxSpeed);
    this.desiredVelocity.x *= maxSpeed;
    this.desiredVelocity.y *= maxSpeed;
    if (this.desiredVelocity.x > maxSpeed) {
      this.desiredVelocity.x = maxSpeed;
    } else if (this.desiredVelocity.x < -maxSpeed) {
      this.desiredVelocity.x = -maxSpeed;
    }
    if (this.desiredVelocity.y > maxSpeed) {
      this.desiredVelocity.y = maxSpeed;
    } else if (this.desiredVelocity.y < -maxSpeed) {
      this.desiredVelocity.y = -maxSpeed;
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
