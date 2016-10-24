var Enemy = function (x, y) {

    this.sprite = new Sprite("enemy.png");
    this.sprite.buildAnimation(1, 1, 32, 32, 0.3, 1);

    this.position = new Vector2();
    this.position.x = x
    this.position.y = y

    this.pause = 0;

    this.turn = false
}

Enemy.prototype.update = function (dt) {

    this.sprite.update(dt);

    var tx = pixelToTile(this.position.x);
    var ty = pixelToTile(this.position.y);
    var nx = (this.position.x) % TILE; // true if enemy overlaps right
    var ny = (this.position.y) % TILE; // true if enemy overlaps below
    var cell = cellAtTileCoord(LAYER_FLOOR, tx, ty);
    var cellright = cellAtTileCoord(LAYER_FLOOR, tx + 1, ty);
    var celldown = cellAtTileCoord(LAYER_FLOOR, tx, ty + 1);
    var celldiag = cellAtTileCoord(LAYER_FLOOR, tx + 1, ty + 1);


}


var turn = new Turn();

Enemy.prototype.action = function (deltaTime) {
    if (turn.enemy == true) {

        if (player.position.x - this.position.x == (TILE * 4) && player.position.x - this.position.x > TILE) {
            this.position.x += 1 * TILE;
            turn.mSwitch = false;
        }
        else if (player.position.x - this.position.x == (TILE * -4) && player.position.x - this.position.x < TILE) {
            this.position.x -= 1 * TILE;
            turn.mSwitch = false;

        }
        else if (player.position.y - this.position.y == (TILE * 4) && player.position.y - this.position.y > TILE) {
            this.position.y += 1 * TILE;
            turn.mSwitch = false;
        }
        else if (player.position.y - this.position.y == (TILE * -4) && player.position.y - this.position.y < TILE) {
            this.position.y -= 1 * TILE;
            turn.mSwitch = false;
        }
    }
    
    
}