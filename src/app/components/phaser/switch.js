import Bridge from './bridge';

export default class Switch {
    constructor(info, game) {
        this.x = info.x;
        this.y = info.y;
        this.game = game;
        this.internalGroup = this.game.add.group();
        this.state = true;
       // this.internalGroup.enableBody = true;
        this.sprite = this.internalGroup.create(info.x, info.y, 'switchRight');
        //this.sprite.body.allowGravity = false;

        this.switchable = new Bridge({ x: info.switchable.x, y: info.switchable.y}, this, this.game);
    }

    get() {
        return this.internalGroup;
    }

    checkCollision(player) {
        const boundsSwitch  = new Phaser.Rectangle(this.x - 32, this.y, 64, 32);

        return Phaser.Rectangle.intersects(boundsSwitch, player.body.getBounds(new Phaser.Rectangle()));
    }

    update(player) {
        this.switchable.update(player);
    }

    switch(fromSwitchable) {
        this.state = !this.state;
        const name = this.state ? 'switchRight' : 'switchLeft';
        if (!fromSwitchable)
            this.switchable.switch();
        this.sprite.loadTexture(name);
    }

}
