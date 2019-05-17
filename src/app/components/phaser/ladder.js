export default class Ladder {
    constructor(ladderInfo, game) {
        console.log('init ladder')
        this.tileHeight = ladderInfo.tileHeight;
        this.x = ladderInfo.x;
        this.y = ladderInfo.y;
        this.game = game;
        this.internalGroup = this.game.add.group();
        this.internalGroup.enableBody = true;
        const ladder = this.internalGroup.create(ladderInfo.x - 10, ladderInfo.y, 'ladderTop');
        ladder.body.immovable = true;
        ladder.body.allowGravity = false;
        for (let i = 1; i < this.tileHeight; i++) {
            const ladder = this.internalGroup.create(ladderInfo.x - 10, ladderInfo.y + 80 * i, 'ladderMid');
            ladder.body.immovable = true;
            ladder.body.allowGravity = false;
        }

    }

    checkCollision(player) {
        const boundsLadder  = new Phaser.Rectangle(this.x, this.y, 60, this.tileHeight * 80);

        return Phaser.Rectangle.intersects(boundsLadder, player.body.getBounds(new Phaser.Rectangle()));
    }

    get() {
        return this.internalGroup;
    }

}
