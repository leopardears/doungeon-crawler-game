var Turn = function () {
    this.timer = 1;
    this.player = true;
    this.enemy = false;

    this.switch = true;
    this.swiOnSwitch = true
}

Turn.prototype.changeTurn = function(deltatime){

    if (Turn.swiOnSwitch == true) {//if player off turn on enemies
        if (Turn.switch == true) {
            this.player = true;
        }
        if (Turn.switch == false) {
            this.enemy = true;
            this.player = false;
        }
    }

    if (Turn.swiOnSwitch == false){ //if both enemy and player is false start restart timer
        Turn.timer -= deltatime;
        Turn.enemy = false;

    }
    if (Turn.timer = 0) {//if timer = 0 turn player back ont repeat
        Turn.swiOnSwitch = true;
        Turn.switch = true;
        Turn.timer = 1;
    }
}
