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

    @Input() api: LevelRequestService;
    @Input() data: any;
    @Input() blockly: BlocklyComponent;
    private component: any;

    ngOnInit() {
        this.runAlgo = this.runAlgo.bind(this);
        // this.data = json;
        console.log(this.data);
        this.meta = this.data.level;
        this.data = this.data.levelInfo;

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

        this.game.load.image('background', this.json.images.background);

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

        this.component.bg = this.game.add.tileSprite(0, 0, this.component.width, this.component.height, 'background');
        this.component.bg.fixedToCamera = true;
        this.component.map = this.game.add.tilemap('level');

        this.json.level.tilesets.forEach(element => {
            this.component.map.addTilesetImage(element.name);
        });

        this.component.map.setCollisionByExclusion([13, 14, 15, 16, 17, 46, 47, 48, 49, 50, 51]);

        this.component.layer = this.component.map.createLayer(this.json.level.layers[0].name);
        this.component.layer.resizeWorld();

        //  Only for debug
        this.component.layer.debug = false;

        this.game.physics.arcade.gravity.y = this.json.physics.gravity;
        this.message = this.game.add.text(32, 32, '', {fill: 'white'});

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
            newSpike.body.setSize(5, 10, 22, 20);
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
    }

    runAlgo() {
        this.blockly.generateCode(this.bindInterpreter.bind(this));
        this.started = true;
        this.timerStart = Date.now();
    }

    stopAlgo() {
        window.dispatchEvent(new Event('StopGame'));
        this.started = false;
    }

    async handleEndGame(win, message, time) {
        this.steps = 0;
        this.player.x = this.data.player.x;
        this.message.fill = win ? 'green' : 'red';
        this.message.text = message;
        this.blockly.resetInterpreter();
        await this.validateLevel(time, win ? 'success' : 'failed');
    }

    async validateLevel(algoTime, status) {
        try {
            await this.api.validate(this.meta.id, algoTime, status);
            await this.api.get(this.meta.id);
        } catch (e) {
            console.log('not validated', e);
        }
    }

    update() {
        this.message.text = this.component.message.text;
        this.message.fill = this.component.message.fill;

        this.message.x = this.component.width / 2 - this.message.width / 2;

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
            this.game.physics.arcade.collide(this.player, spike, () => {
                const time = Date.now() - this.timerStart;
                this.component.handleEndGame(false, 'Perdu: tué par un piège', time);
                this.component.started = false;
            }, () => true, this);
        });


        this.game.physics.arcade.collide(this.component.player, this.component.target, () => {
            if (this.component.started) {
                const time = Date.now() - this.component.timerStart;
                const message = `Gagné avec ${this.component.steps} étapes en ${Math.floor(time / 1000)} secondes`;
                this.component.handleEndGame(true, message, time);
                this.component.started = false;
            }
        }, () => true, this);

        if (this.component.blockly.interpreter.step()) {
        } else if (this.component.started) {
            this.component.started = false;
            const time = Date.now() - this.component.timerStart;
            this.component.handleEndGame(false, `Perdu : Le personnage n'atteint pas l'objectif`, time);
        } else {
            this.component.player.body.acceleration.x = 0;
            this.component.player.body.velocity.x = 0;
            this.component.player.animations.stop();
        }
    }

    render() {
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
        this.player.animations.play('right');
        this.player.body.acceleration.x = 2000;
        this.player.body.velocity.x = 200;
    }

    async moveLeft() {
        this.player.animations.play('left');
        this.player.body.acceleration.x = -2000;
        this.player.body.velocity.x = -200;
    }

    async jump() {
        this.player.body.velocity.y = -350;
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
        interpreter.setProperty(scope, 'jump', interpreter.createNativeFunction(this.jump.bind(this)));
        interpreter.setProperty(scope, 'up', interpreter.createNativeFunction(this.up.bind(this)));
        interpreter.setProperty(scope, 'down', interpreter.createNativeFunction(this.down.bind(this)));
        interpreter.setProperty(scope, 'pick', interpreter.createNativeFunction(this.pick.bind(this)));
        interpreter.setProperty(scope, 'highlightBlock', interpreter.createNativeFunction(this.highlightBlock.bind(this)));
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnDestroy(): void {
        this.game.destroy();
        console.log('DESTROYED PHASER LOL');
    }
}
