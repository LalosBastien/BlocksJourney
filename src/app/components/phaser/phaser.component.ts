import {
    Component, Input, OnChanges, OnDestroy,
    OnInit, SimpleChanges
} from '@angular/core';
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';
import {
    BlocklyComponent
} from '../blockly/blockly.component';
import {
    Router
} from '@angular/router';
import {
    LevelRequestService
} from '../../providers/Api/levelRequest.service';
import * as Interpreter from 'js-interpreter';

@Component({
    selector: 'app-phaser',
    templateUrl: './phaser.component.html',
    styleUrls: ['./phaser.component.scss']
})
export class PhaserComponent implements OnInit, OnChanges, OnDestroy {
    game: Phaser.Game;
    router: Router;
    map;
    layer;
    target;
    player;
    monsters;
    spikes;
    message;
    bg;
    json;
    meta;
    steps;
    started;
    timerStart;
    items;
    width;
    height;
    buttonPanelHeight;
    currentBlock;
    isPlayerRunning: boolean;
    isPlayerJumping: boolean;
    xTarget: number;
    bgClouds;
    bgGround;
    i;
    detector;
    energy;
    energyLevel;
    energyTotal;
    bmd;
    healthBar;

    @Input() api: LevelRequestService;
    @Input() data: any;
    @Input() blockly: BlocklyComponent;
    private component: any;

    ngOnInit() {
        this.detector = { rightHole: false, leftHole: false};
        this.runAlgo = this.runAlgo.bind(this);
        // this.data = json;
        console.log(this.data);
        this.meta = this.data.level;
        this.data = this.data.levelInfo;
        this.started = false;
        this.i = 0;
        this.energyTotal = this.data.player.initialEnergy;
        this.energyLevel = this.energyTotal;
        this.energy = {
            text: this.energyLevel,
            fill: '#c79a00'
        };

        this.message = {
            text: 'Hello',
            fill: 'green'
        };

        this.width = window.innerWidth * 0.6 - 60;
        this.buttonPanelHeight = 150;
        this.height = 500;

        if (!this.game) {
            this.game = new Phaser.Game(this.width, this.height, Phaser.Auto, 'canvasHolder', {
                json: this.data,
                preload: this.preload,
                create: this.create,
                update: this.update,
                render: this.render,
                component: this
            });
        }
    }

    preload() {
        this.game.load.tilemap('level', null, this.json.level, Phaser.Tilemap.TILED_JSON);

        this.json.level.tilesets.forEach(element => {
            this.game.load.image(element.name, 'assets/game/tiles/' + element.image);
        });

        this.game.load.image('bg_clouds', 'assets/game/bg_clouds.png');
        this.game.load.image('bg_ground', 'assets/game/bg_ground.png');
        this.game.load.image('grid', 'assets/game/grid-cell-80.png');

        this.game.load.spritesheet('star', this.json.goal.path, 16, 16);
        this.json.sprites.forEach(element => {
            this.game.load.spritesheet(
                element.name + element.id,
                element.path,
                element.spriteWidth,
                element.spriteHeight
            );
        });

        this.game.load.spritesheet('player',
            this.json.player.path,
            this.json.player.spriteWidth,
            this.json.player.spriteHeight
        );
    }

    create() {
        this.component.layer = [];
        this.component.steps = 0;
        this.component.started = false;

        this.component.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.component.game.stage.backgroundColor = '#fafafa';
        this.component.bgClouds = this.game.add.tileSprite(0, 0, 9000, this.component.height, 'bg_clouds');
        this.component.bgGround = this.game.add.tileSprite(0, 0, 9000, this.component.height, 'bg_ground');

        this.component.bgGround.fixedToCamera = true;
        this.component.map = this.game.add.tilemap('level');

        this.json.level.tilesets.forEach(element => {
            this.component.map.addTilesetImage(element.name);
        });

        this.component.map.setCollisionByExclusion([13, 14, 15, 16, 17, 46, 47, 48, 49, 50, 51]);

        this.component.layer = this.component.map.createLayer(this.json.level.layers[0].name);
        this.component.layer.resizeWorld();

        //  Only for debug
        this.component.layer.debug = true;

        this.game.physics.arcade.gravity.y = this.json.physics.gravity;
        this.message = this.game.add.text(32, 50, '', {fill: 'white'});

        this.energy = this.game.add.text(10, 10, '', {fill: '#c79a00'});
        this.component.energyBackground = this.game.add.bitmapData(160, 40);
        this.component.formatProgressBar(this.component.energyBackground, 0, 0 , 180, 30, '#333');
        this.component.energyBar = this.game.add.bitmapData(160, 40);
        this.component.formatProgressBar(this.component.energyBar, 5, 5 , 150, 20, '#c79a00');

        this.component.backgroundBar = this.game.add.sprite(80, 32, this.component.energyBackground);
        this.component.backgroundBar.anchor.y = 0.5;
        this.component.backgroundBar.fixedToCamera = true;
        this.component.healthBar = this.game.add.sprite(80, 32, this.component.energyBar);
        this.component.healthBar.anchor.y = 0.5;
        this.component.healthBar.fixedToCamera = true;

        this.component.player = this.game.add.sprite(this.json.player.x, this.json.player.y, 'player');
        this.component.target = this.game.add.sprite(this.json.goal.x, this.json.goal.y, 'star');
        this.component.monsters = [];
        this.component.spikes = [];

        this.json.sprites.forEach((element) => {
            const newSprite = this.game.add.sprite(element.x, element.y, `${element.name}${this.component[element.name + 's'].length}`);
            this.component[element.name + 's'].push(newSprite);
        });

        this.game.physics.enable(this.component.monsters, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.component.spikes, Phaser.Physics.ARCADE);
        this.game.physics.enable([this.component.player, this.component.target], Phaser.Physics.ARCADE);

        this.component.monsters.map(monster => {
            const newMonster = monster;
            newMonster.body.bounce.y = 0.5;
            newMonster.body.allowGravity = true;
            newMonster.body.collideWorldBounds = true;
            newMonster.body.setSize(32, 32, 0, 0);
            newMonster.animations.add('action', [0, 1, 2, 3], 5, true);
            newMonster.animations.play('action');
            return newMonster;
        });

        this.component.spikes.map(spike => {
            const newSpike = spike;
            newSpike.body.immovable = true;
            newSpike.body.allowGravity = false;
            newSpike.body.collideWorldBounds = true;
            newSpike.body.setSize(5, 10, 20, 20);
            newSpike.animations.add('action', [0, 1, 2, 3], 5, true);
            newSpike.animations.play('action');
            return newSpike;
        });

        this.component.target.body.allowGravity = false;
        this.component.target.body.collideWorldBounds = true;
        this.component.target.body.immovable = true;

        this.component.player.body.bounce.y = 0.2;
        this.component.player.body.collideWorldBounds = true;
        this.component.player.body.setSize(this.json.player.spriteWidth, this.json.player.spriteHeight, 0, 0);
        this.component.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.component.player.animations.add('turn', [4], 10, true);
        this.component.player.animations.add('right', [5, 6, 7, 8], 10, true);
        this.component.player.animations.play(this.json.player.facing);

        this.game.camera.follow(this.component.player);
        this.game.add.tileSprite(0, 0, 9000, 9000, 'grid');
    }

    formatProgressBar(progressBar, x, y, width, height, fillStyle) {
        progressBar.ctx.beginPath();
        progressBar.ctx.rect(x, y, width, height);
        progressBar.ctx.fillStyle = fillStyle;
        progressBar.ctx.fill();
    }

    runAlgo() {
        this.blockly.generateCode(this.bindInterpreter.bind(this));
        this.started = true;
        this.timerStart = Date.now();
    }

    stopAlgo() {
        window.dispatchEvent(new Event('StopGame'));
        this.started = false;
        this.handleEndGame(false, `Perdu : Le personnage n'atteint pas l'objectif`, 0);
    }

    replaceMonsters() {
        let i = 0;
        this.monsters.forEach((monster) => {
            monster.x = this.data.monsters[i].x;
            monster.y = this.data.monsters[i].y;
            ++i;
        });
    }

    async handleEndGame(win, message, time) {
        this.steps = 0;
        this.player.x = this.data.player.x;
        this.player.y = this.data.player.y;
        this.replaceMonsters();
        this.isPlayerRunning = false;
        this.message.fill = win ? 'green' : 'red';
        this.message.text = message;
        this.blockly.resetInterpreter();
        await this.validateLevel(time, win ? 'success' : 'failed', this.data.player.initialEnergy - this.energyLevel);
    }

    async validateLevel(algoTime, status, energyConsumed) {
        try {
            await this.api.validate(this.meta.id, algoTime, status, energyConsumed);
            await this.api.get(this.meta.id);
        } catch (e) {
            console.log('not validated', e);
        }
    }

    update() {
        this.energy.text = this.component.energyLevel;
        const energyLoose = 160 * (this.component.energyLevel / this.component.energyTotal);
        if ( energyLoose < 0 && this.component.started) {
            this.component.handleEndGame(false, `Perdu : Le personnage n'a plus d'énergie`, 0);
            this.component.started = false;
        } else {
            this.component.healthBar.width = energyLoose;
        }
        this.energy.fill = this.component.energy.fill;
        this.energy.x = this.game.camera.x + 5;
        this.energy.y = this.game.camera.y + 10;

        this.message.text = this.component.message.text;
        this.message.fill = this.component.message.fill;
        this.message.x = this.game.camera.x + (this.component.width / 6);
        this.message.y = this.game.camera.y + 50;

        const { x: posX, y: posY } = this.component.player.body.position;
        this.component.detector.rightHole = !this.component.map.getTileWorldXY(posX + 30,  posY + 100);
        this.component.detector.leftHole = !this.component.map.getTileWorldXY(posX - 30,  posY + 100);

        this.component.bgClouds.tilePosition.x -= 1 / 2;

        if (!this.component.player || !this.component.player.body) {

            return;
        }
        this.game.physics.arcade.collide(this.component.player, this.component.layer);
        this.component.player.body.velocity.x = 0;

        this.component.monsters.forEach(monster => {
            this.component.monsterMove(monster);
            this.game.physics.arcade.collide(monster, this.component.layer);
            this.game.physics.arcade.collide(this.component.player, monster, () => {
                const time = Date.now() - this.component.timerStart;
                this.component.handleEndGame(false, 'Perdu: tué par un montre', time);
                this.component.started = false;
            }, () => true, this);
        });

        this.component.spikes.forEach(spike => {
            this.game.physics.arcade.collide(this.component.player, spike, () => {
                console.log('collide with trap');
                const time = Date.now() - this.timerStart;
                this.component.handleEndGame(false, 'Perdu: tué par un piège', time);
                this.component.started = false;
            }, () => true, this);
        });


        this.game.physics.arcade.collide(this.component.player, this.component.target, () => {
            if (this.component.started) {
                const time = Date.now() - this.component.timerStart;
                const message = `Gagné avec ${this.component.steps} étapes en ${Math.floor(time / 1000)} ` +
                    `secondes et ${Math.floor(1000 - this.component.energyLevel)} energie`;
                this.component.handleEndGame(true, message, time);
                this.component.started = false;
            }
        }, () => true, this);

        this.component.synchronizeBlockly();
    }

    synchronizeBlockly() {
        // Handle actions here
        if (this.isPlayerRunning) {
            this.handleMove();
        } else if (this.started) {
            if (!this.blockly.interpreter.step()) {
                this.blockly.interpreter = null;
                this.started = false;
                this.isPlayerRunning = false;
                const time = Date.now() - this.timerStart;
                this.handleEndGame(false, `Perdu : Le personnage n'atteint pas l'objectif`, time);
            }
        } else {
            this.handleIdle();
        }
    }



    handleIdle() {
        console.log(this.data.levelInfo)
        this.energyLevel = this.data.player.initialEnergy;
        this.player.body.acceleration.x = 0;
        this.player.body.velocity.x = 0;
        this.player.animations.stop(null, true);
        this.player.animations.frame = 4;
    }

    handleMove() {
        const aproximateX = Math.trunc(this.player.body.position.x);
        const direction = this.xTarget > aproximateX; // true right, false left
        const playerReachedTarget = direction ? this.xTarget <= aproximateX : this.xTarget >= aproximateX;
        console.log('target', this.xTarget, 'player:', aproximateX);
        const speedRun = 100;
        const speedJump = 75;

        this.player.body.velocity.x = this.isPlayerJumping ? (direction ? speedRun : -speedRun) : (direction ? speedJump : -speedJump);

        if (this.isPlayerJumping) {
            this.player.body.velocity.y = -260;

            this.isPlayerJumping = false;
        }
        if (playerReachedTarget) {
            this.player.body.position.x = this.xTarget;
            this.player.body.velocity.x = 0;
            this.isPlayerRunning = false;
            this.player.animations.stop();
        }
    }

    render() {
        // this.game.debug.spriteInfo(this.component.player, 32, 32);
        // this.game.debug.cameraInfo(this.game.camera, 400, 32);
        this.game.debug.body(this.component.player);
        this.game.debug.body(this.component.layer);

        this.component.monsters.forEach(monster => {
            this.game.debug.body(monster);
        });

        this.component.spikes.forEach(spike => {
            this.game.debug.body(spike);
        });
    }

    async monsterMove(monster: any) {
        if (monster.body.x >= 250) {
            monster.body.acceleration.x = -10;
            monster.body.velocity.x = -50;
        } else if (monster.body.x <= 200) {
            monster.body.acceleration.x = 10;
            monster.body.velocity.x = 50;
        }
    }

    async moveRight() {
        this.energyLevel -= 100;
        this.player.animations.play('right');
        this.isPlayerRunning = true;
        this.xTarget = this.player.body.position.x + 80;
    }

    async moveLeft() {
        this.energyLevel -= 100;
        this.player.animations.play('left');
        this.isPlayerRunning = true;
        this.xTarget = this.player.body.position.x - 80;
    }

    async jump(sign) {
        this.energyLevel -= 200;
        this.isPlayerRunning = true;
        this.isPlayerJumping = true;
        this.player.animations.play(sign > 0 ? 'right' : 'left');
        this.player.animations.stop(null, true);
        this.player.animations.frame = sign > 0 ? 6 : 1;
        this.xTarget = this.player.body.position.x + sign * 80;
    }

    rightHole() {
        console.log('Right gunna return ', this.detector.rightHole);
        this.energyLevel -= 25;
        return this.blockly.interpreter.createPrimitive(this.detector.rightHole);
    }

    leftHole() {
        console.log('Left gunna return ', this.detector.leftHole);
        this.energyLevel -= 25;
        return this.blockly.interpreter.createPrimitive(this.detector.leftHole);
    }

    async up() {
        // TODO: implement method
    }

    async down() {
        // TODO: implement method
    }

    async pick() {
        // TODO: implement method
        // this.items.push("items");
    }

    highlightBlock(id) {
        this.blockly.workspace.highlightBlock(id.data);
        this.currentBlock = id.data;
        ++this.steps;
    }

    bindInterpreter(interpreter, scope) {
        interpreter.setProperty(scope, 'moveRight', interpreter.createNativeFunction(this.moveRight.bind(this)));
        interpreter.setProperty(scope, 'moveLeft', interpreter.createNativeFunction(this.moveLeft.bind(this)));
        interpreter.setProperty(scope, 'moveLeft', interpreter.createNativeFunction(this.moveLeft.bind(this)));
        interpreter.setProperty(scope, 'rightHole', interpreter.createNativeFunction(this.rightHole.bind(this)));
        interpreter.setProperty(scope, 'leftHole', interpreter.createNativeFunction(this.leftHole.bind(this)));
        interpreter.setProperty(scope, 'jump', interpreter.createNativeFunction(this.jump.bind(this)));
        interpreter.setProperty(scope, 'up', interpreter.createNativeFunction(this.up.bind(this)));
        interpreter.setProperty(scope, 'down', interpreter.createNativeFunction(this.down.bind(this)));
        interpreter.setProperty(scope, 'pick', interpreter.createNativeFunction(this.pick.bind(this)));
        interpreter.setProperty(scope, 'highlightBlock', interpreter.createNativeFunction(this.highlightBlock.bind(this)));
        interpreter.setProperty(scope, 'log', interpreter.createNativeFunction(this.interpreterLog));
    }

    interpreterLog(val) {
        console.log(`[INTERPRETER] ${val}`);
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnDestroy(): void {
        this.game.destroy();
    }
}
