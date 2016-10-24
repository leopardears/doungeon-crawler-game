var Player = function () {

    this.sprite = new Sprite("hero.png");
    this.sprite.buildAnimation(1, 1, 32, 32, 0.05, [0]);

    this.position = new Vector2();
    this.position.set(28 * TILE, 42 * TILE);

    this.width = 32;
    this.height = 32;

    this.turn = true
};

var turn = new Turn();
var keyboard = new Keyboard();

Player.prototype.update = function (deltaTime) {

    this.sprite.update(deltaTime);

    if (turn.player == true) {
        if (keyboard.isKeyDown(keyboard.KEY_LEFT)) {
            player.position.x -= 1 * TILE;
            turn.switch = false;
        }

        if (keyboard.isKeyDown(keyboard.KEY_RIGHT)) {
            player.position.x += 1 * TILE;
            turn.switch = false;
        }

        if (keyboard.isKeyDown(keyboard.KEY_UP)) {
            player.position.y -= 1 * TILE;
            turn.switch = false;
        }

        if (keyboard.isKeyDown(keyboard.KEY_DOWN)) {
            player.position.y += 1 * TILE;
            turn.switch = false;

        }
    }

}

Player.prototype.draw = function () {
    this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y - worldOffsetY);
}