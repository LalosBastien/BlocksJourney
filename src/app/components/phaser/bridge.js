export default class Bridge {
    constructor(info, parent, game) {
        this.x = info.x;
        this.y = info.y;
        this.open = false;
        this.game = game;
        this.parent = parent;


        //console.log("game", this.game)

        this.sprite = this.game.add.sprite(this.x + 7,  this.y + 7, 'bridge');
        this.sprite.enableBody = false;
        //this.game.physics.arcade.enable(this.sprite);
        this.sprite.pivot.x = 7;
        this.sprite.pivot.y = 7;
        this.sprite.angle = -90;
        this.target = -90;
        //this.sprite.body.allowGravity = false;
        //console.log(this.sprite.body)
    }

    close() {
        if (this.open) {
            this.switch();
            this.parent.switch(true);
        }
    }


    //common interface for switchable objects
    switch() {
        this.open = !this.open;
        this.target = this.open ? 0 : -90;
    }

    checkCollision(player) {
        const boundsBridge  = new Phaser.Rectangle(this.x, this.y, 80, 15);

        return Phaser.Rectangle.intersects(boundsBridge, player.body.getBounds(new Phaser.Rectangle()));
    }

    checkDetection(position) {
        const boundsBridge  = new Phaser.Rectangle(this.x, this.y, 80, 15);
        const detector  = new Phaser.Rectangle(position.x, position.y - 5, 10, 60);
        return Phaser.Rectangle.intersects(boundsBridge, detector);
    }

    update(player) {
        const angle = Math.trunc(this.sprite.angle);
        if (Math.abs(Math.abs(angle) - Math.abs(this.target)) > 1) {
            this.sprite.angle += this.open ? 1 : -1

        }
        if (this.open && this.checkCollision(player) && !player.body.onFloor()) {
            player.body.y = this.y - player.body.height;
        }
    }

}
