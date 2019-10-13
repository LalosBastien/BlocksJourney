import {
    Component, Input, OnChanges, OnDestroy,
    OnInit, SimpleChanges, Output, EventEmitter
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

import Ladder from './ladder';
import Switch from './switch';

@Component({
    selector: 'app-phaser',
    templateUrl: './phaser.component.html',
    styleUrls: ['./phaser.component.scss']
})
export class PhaserComponent implements OnInit, OnChanges, OnDestroy {
    game: Phaser.Game;
    router: Router;
    map: any;
    layer: any;
    target: any;
    player: any;
    monsters: any;
    monstersInitialPositions: any;
    spikes: any;
    coins: any;
    message: any;
    coinCountText: any;
    timerText: any;
    bg: any;
    json: any;
    meta: any;
    objectifs: any;
    steps: any;
    started: any;
    timerStart: any;
    items: any;
    width: any;
    height: any;
    buttonPanelHeight: any;
    currentBlock: any;
    isPlayerRunning: boolean;
    isPlayerJumping: boolean;
    xTarget: number;
    yTarget: number;
    bgClouds;
    bgGround;
    i;
    detector;
    energy;
    energyLevel;
    energyTotal;
    bmd;
    healthBar;
    bgSound;
    algoSound;
    winSound;
    looseSound;
    coinSound;
    ladders;
    ladder;
    onLadder: boolean;
    wasOnLadder: boolean;
    collisionEnabled: boolean;
    emptyStars;
    oneStars;
    twoStars;
    threeStars;
    switches;
    objFail;
    objSuccess;

    @Input() api: LevelRequestService;
    @Input() data: any;
    @Input() blockly: BlocklyComponent;
    @Output() onNavigate = new EventEmitter<string>();
    private component: any;
    showLevelEnd: boolean;
    showLevelObj: boolean;
    ngOnInit() {
        this.detector = { rightHole: false, leftHole: false };
        this.initAssets();
        this.meta = this.data.level;
        this.objectifs = this.data.objectifs;
        this.showLevelObj = true;
        this.showLevelEnd = false;
        this.data = this.data.levelInfo;
        this.started = false;
        this.i = 0;
        this.energyTotal = this.data.player.initialEnergy;
        this.energyLevel = this.energyTotal;
        this.energy = {
            text: this.energyLevel,
            fill: '#c79a00'
        };
        this.coinCountText = {
            text: 0,
            fill: '#ffcd02'
        };
        this.timerText = {
            text: 0,
            fill: 'white'
        };
        this.message = {
            status: 'pending',
            text: 'Pause'
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
    toggleObj() {
        this.showLevelObj = (this.showLevelObj) ? false : true;
    }
    toggleLvlEnd() {
        this.showLevelEnd = (this.showLevelEnd) ? false : true;
    }
    navigateToMenu() {
        this.onNavigate.emit('levels');
    }

    preload() {
        this.game.load.tilemap('level', null, this.json.level, Phaser.Tilemap.TILED_JSON);

        // Load all characters from JSON
        this.json.level.tilesets.forEach(element => {
            this.game.load.image(element.name, 'assets/game/tiles/' + element.image);
        });

        // Load audio
        this.game.load.audio('bg_sounds', 'assets/game/audio/' + (this.json.audio.bgSound || 'bensound-cute.wav'));
        this.game.load.audio('algo_sounds', 'assets/game/audio/' + (this.json.audio.algoSound || 'sunny.wav'));
        this.game.load.audio('coin', 'assets/game/audio/coin.wav');
        this.game.load.audio('winner', 'assets/game/audio/weeee.wav');
        this.game.load.audio('looser', 'assets/game/audio/game_over.wav');

        // Load fixed objects
        this.game.load.image('bg_clouds', 'assets/game/bg_clouds.png');
        this.game.load.image('bg_ground', 'assets/game/bg_ground.png');
        this.game.load.image('grid', 'assets/game/grid-cell-80.png');
        this.game.load.image('ladderMid', 'assets/game/ladderMid.png');
        this.game.load.image('ladderTop', 'assets/game/ladderTop.png');
        this.game.load.image('switchLeft', 'assets/game/sprites/switchLeft.png');
        this.game.load.image('switchRight', 'assets/game/sprites/switchRight.png');
        this.game.load.image('bridge', 'assets/game/tiles/bridge2.png');
        this.game.load.image('coinIco', 'assets/game/sprites/coinIco.png');
        this.game.load.image('energyIco', 'assets/game/sprites/energy.png');

        // Load goal & player
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

        // World
        this.component.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = this.json.physics.gravity;
        this.component.game.stage.backgroundColor = '#fafafa';
        this.component.bgClouds = this.game.add.tileSprite(0, 0, 9000, this.component.height, 'bg_clouds');
        this.component.bgGround = this.game.add.tileSprite(0, 0, 9000, this.component.height, 'bg_ground');

        // Audio
        this.component.bgSound = this.game.add.audio('bg_sounds');
        this.component.algoSound = this.game.add.audio('algo_sounds');
        this.component.winSound = this.game.add.audio('winner');
        this.component.looseSound = this.game.add.audio('looser');
        this.component.coinSound = this.game.add.audio('coin');
        this.component.bgSound.play();

        // Map
        this.component.collisionEnabled = true;
        this.component.bgGround.fixedToCamera = true;
        this.component.map = this.game.add.tilemap('level');
        this.json.level.tilesets.forEach(element => {
            this.component.map.addTilesetImage(element.name);
        });
        this.component.map.setCollisionByExclusion([13, 14, 15, 16, 17, 46, 47, 48, 49, 50, 51]);
        this.component.layer = this.component.map.createLayer(this.json.level.layers[0].name);
        this.component.layer.resizeWorld();

        //  Only for debug
        this.component.layer.debug = false;

        // GUI
        this.coinCountText = this.game.add.text(32, 50, '', { fill: 'white' });
        this.timerText = this.game.add.text(32, 50, '', { fill: 'white' });
        this.energy = this.game.add.text(10, 10, '', { fill: '#c79a00' });
        this.component.menuBar = this.game.add.bitmapData(this.component.width, 150);
        this.component.formatProgressBar(this.component.menuBar, 0, 0 , this.component.width, 130, '#333');
        this.component.energyBackground = this.game.add.bitmapData(160, 40);
        this.component.formatProgressBar(this.component.energyBackground, 0, 0, 180, 30, '#333');
        this.component.energyBar = this.game.add.bitmapData(160, 40);
        this.component.formatProgressBar(this.component.energyBar, 5, 5 , 150, 20, '#d47a1d');

        this.component.menuBar = this.game.add.sprite(0, 0, this.component.menuBar);
        this.component.menuBar.anchor.y = 0.5;
        this.component.menuBar.alpha = 0.5;

        this.component.menuBar.fixedToCamera = true;

        this.component.energyImg = this.game.add.sprite(35, 10, 'energyIco');
        this.component.energyImg.fixedToCamera = true;
        this.component.backgroundBar = this.game.add.sprite(80, 32, this.component.energyBackground);
        this.component.backgroundBar.anchor.y = 0.5;
        this.component.backgroundBar.fixedToCamera = true;
        this.component.healthBar = this.game.add.sprite(80, 32, this.component.energyBar);
        this.component.healthBar.anchor.y = 0.5;
        this.component.healthBar.fixedToCamera = true;


        // sprites
        this.ladders = [];
        this.component.ladders = this.json.ladders ? this.json.ladders.map(ladder => new Ladder(ladder, this.game)) : [];
        this.component.coinImg = this.game.add.sprite(this.component.width - 100, 15, 'coinIco');
        this.component.coinImg.fixedToCamera = true;
        this.energy = this.game.add.text(0, 0, '', {fill: 'white', fontSize: 12});
        this.message = this.game.add.text(0, 0, '', {fill: 'white'});
        this.coinCountText = this.game.add.text(0, 0, '', {fill: 'white'});
        this.timerText = this.game.add.text(0, 0, '', {fill: 'white'});

        this.component.player = this.game.add.sprite(this.json.player.x, this.json.player.y, 'player');
        this.component.target = this.game.add.sprite(this.json.goal.x, this.json.goal.y, 'star');
        this.component.monsters = [];
        this.component.spikes = [];
        this.component.coins = [];

        this.json.sprites.forEach((element) => {
            const newSprite = this.game.add.sprite(element.x, element.y, `${element.name}${this.component[element.name + 's'].length}`);
            this.component[element.name + 's'].push(newSprite);
        });

        this.component.switches = this.json.switches ? this.json.switches.map(data => new Switch(data, this.component.game)) : [];

        // Properties
        this.game.physics.enable(this.component.monsters, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.component.spikes, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.component.coins, Phaser.Physics.ARCADE);
        this.game.physics.enable([this.component.player, this.component.target], Phaser.Physics.ARCADE);

        this.component.monstersInitialPositions = this.component.monsters.map(monster => ({ x: monster.x, y: monster.y }));

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

        this.component.coins.map(coin => {
            const newCoin = coin;
            newCoin.body.immovable = true;
            newCoin.body.allowGravity = false;
            newCoin.body.collideWorldBounds = true;
            newCoin.animations.add('action', [0, 1, 2, 1], 6, true);
            newCoin.animations.play('action');
            return newCoin;
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
        this.component.player.animations.add('ladder', [9, 10], 5, true);
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
        this.bgSound.stop();
        this.algoSound.play();
    }

    stopAlgo() {
        window.dispatchEvent(new Event('StopGame'));
        this.started = false;
        this.handleEndGame(false, `Perdu : Le personnage n'atteint pas l'objectif`, 0);
    }

    muteSound() {
        this.game.sound.mute = !this.game.sound.mute;
    }

    volumeUp() {
        this.game.sound.volume += 0.1;
    }

    volumeDown() {
        this.game.sound.volume -= 0.1;
    }

    replaceCoins() {
        this.coins.map((coin) => {
            coin.revive();
            return { ...coin};
        });
    }

    replaceMonsters() {
       this.monsters.map((monster, i) => {
           const { x, y } = this.monstersInitialPositions[i];
           return { ...monster, x, y };
       });
    }

    handleEndGameSound(win) {
        this.algoSound.stop();
        if (win) {
            this.winSound.play();
        } else {
            this.looseSound.play();
            this.bgSound.play();
        }
    }
    async handleEndGame(win, message, time) {
        this.toggleLvlEnd();
        this.replaceCoins();
        this.handleEndGameSound(win);
        this.closeBridges();
        this.steps = 0;
        this.coinCount = 0;
        this.player.x = this.data.player.x;
        this.player.y = this.data.player.y;
        this.replaceMonsters();
        this.isPlayerRunning = false;
        this.message.status = win;
        this.message.text = win ? message.text : (message);
        this.message.stars = 0;
        if (win) {
            this.message.data = message.data;
            let { stars, objComplete } = this.checkObjCompletion(message.data);
            this.message.objComplete = objComplete;
            this.message.stars = stars;
        }
        this.blockly.resetInterpreter();
        await this.validateLevel(time, win ? 'success' : 'failed', this.data.player.initialEnergy - this.energyLevel, this.message.stars);
    }

    closeBridges() {
        this.switches.forEach(theSwitch => theSwitch.switchable.close());
    }

    checkBridgesCollision(position) {
        return this.switches.find(theSwitch => theSwitch.switchable.checkDetection(position));
    }

    checkObjCompletion(data) {
        let stars = 0;
        let objComplete = {}
        console.log(data);
        for (let obj of this.objectifs) {
            objComplete[obj.libelle] = false;
            if (obj.libelle == "Coins") {
                obj.result = data.coins;
                if (data && (data.coins == obj.goal)) {
                    objComplete[obj.libelle] = true;
                    stars += 1;
                }
            }
            else if (obj.libelle == "Algotime") {
                obj.result = data.time;
                if (data && data.time && data.time <= obj.goal) {
                    objComplete[obj.libelle] = true;
                    stars += 1;
                }
            }
            else if (obj.libelle == "Energy") {
                obj.result = data.energy;
                if (data && data.energy && data.energy <= obj.goal) {
                    objComplete[obj.libelle] = true;
                    stars += 1;
                }
            }
        }
        return { stars, objComplete };
    }

    async validateLevel(algoTime, status, energyConsumed, stars) {
        try {
            await this.api.validate(this.meta.id, algoTime, status, energyConsumed, stars);
            await this.api.get(this.meta.id);
        } catch (e) {
            console.log('not validated', e);
        }
    }

    update() {
        // Timer
        if (this.component.started) {
            console.log((Date.now() - this.component.timerStart) / 1000);
            this.timerText.text = (Date.now() - this.component.timerStart) / 1000;
            this.timerText.fill = this.component.timerText.fill;
            this.timerText.x = this.game.camera.x + this.component.width - 500;
            this.timerText.y = this.game.camera.y + 11;
        }

        // Energy bar
        this.energy.text = this.component.energyLevel;
        const energyLoose = 160 * (this.component.energyLevel / this.component.energyTotal);
        if (energyLoose < 0 && this.component.started) {
            this.component.handleEndGame(false, `Perdu : Le personnage n'a plus d'énergie`, 0);
            this.component.started = false;
        } else {
            this.component.healthBar.width = energyLoose;
        }
        this.energy.x = this.game.camera.x + this.component.width / 7.5;
        this.energy.y = this.game.camera.y + this.component.height / 24;

        // Coin counter
        this.coinCountText.text = 'x' + this.component.coinCount;
        this.coinCountText.fill = this.component.coinCountText.fill;
        this.coinCountText.x = this.game.camera.x + this.component.width - 70;
        this.coinCountText.y = this.game.camera.y + 11;

        // Hole checker
        const { x: posX, y: posY } = this.component.player.body.position;
        this.component.detector.rightHole = !this.component.map.getTileWorldXY(posX + 30, posY + 100)
        && !this.component.checkBridgesCollision({x: posX + 30, y: posY });
        this.component.detector.leftHole = !this.component.map.getTileWorldXY(posX - 30, posY + 100)
        && !this.component.checkBridgesCollision({x: posX + 30, y: posY});

        this.component.bgClouds.tilePosition.x -= 1 / 2;

        if (!this.component.player || !this.component.player.body) {
            return;
        }

        // Switch updater
        this.component.switches.forEach(theSwitch => theSwitch.update(this.component.player));

        // World collider
        this.game.physics.arcade.collide(this.component.player, this.component.layer, () => { }, () => this.component.collisionEnabled);

        // Monster collider
        this.component.monsters.forEach(monster => {
            this.component.monsterMove(monster);
            this.game.physics.arcade.collide(monster, this.component.layer);
            this.game.physics.arcade.collide(this.component.player, monster, () => {
                const time = Date.now() - this.component.timerStart;
                this.component.handleEndGame(false, 'Perdu: tué par un montre', time);
                this.component.started = false;
            }, () => true, this);
        });

        // Spike collider
        this.component.spikes.forEach(spike => {
            this.game.physics.arcade.collide(this.component.player, spike, () => {
                const time = Date.now() - this.timerStart;
                this.component.handleEndGame(false, 'Perdu: tué par un piège', time);
                this.component.started = false;
            }, () => true, this);
        });


        // Coin collider
        this.component.coins.forEach(coin => {
            this.game.physics.arcade.collide(this.component.player, coin, () => {
                coin.kill();
                this.component.coinSound.play();
                ++this.component.coinCount;
            }, () => true, this);
        });

        // Goal collider
        this.game.physics.arcade.collide(this.component.player, this.component.target, () => {
            if (this.component.started) {
                const time = Date.now() - this.component.timerStart;
                const message = {
                    data: {
                        steps: this.component.steps,
                        time: Math.floor(time / 1000),
                        energy: Math.floor(1000 - this.component.energyLevel),
                        coins: this.component.coinCount
                    },
                    text: 'Gagné !'
                };

                this.component.handleEndGame(true, message, time);
                this.component.started = false;
            }
        }, () => true, this);

        this.component.synchronizeBlockly();
    }

    synchronizeBlockly() {
        if (this.isPlayerRunning || this.onLadder) {
            // handle player moves
            this.handleMove();
        } else if (this.started) {
            // Detect algorithm end || Game over
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
        this.energyLevel = this.data.player.initialEnergy;
        this.player.body.acceleration.x = 0;
        this.player.body.velocity.x = 0;
        this.player.animations.stop(null, true);
        this.player.animations.frame = 4;
    }

    handleMove() {
        const approximateX = Math.trunc(this.player.body.position.x);
        const approximateY = Math.trunc(this.player.body.position.y);
        const xDirection = this.xTarget > approximateX; // true right, false left
        const yDirection = this.yTarget > approximateY; // true right, false left
        const playerReachedXTarget = xDirection ? this.xTarget <= approximateX : this.xTarget >= approximateX;
        const playerReachedYTarget = this.onLadder ? yDirection ? this.yTarget <= approximateY : this.yTarget >= approximateY : false;
        const speedRun = 100;
        const speedJump = 75;
        const speedLadder = 80;

        this.player.body.velocity.x = this.isPlayerJumping ? (xDirection ? speedRun : -speedRun) : (xDirection ? speedJump : -speedJump);
        if (this.onLadder && !playerReachedYTarget) {
            this.player.body.velocity.y = yDirection ? speedLadder : -speedLadder;
        }

        if (this.isPlayerJumping) {
            this.player.body.velocity.y = -260;
            this.isPlayerJumping = false;
        }
        if (playerReachedXTarget) {
            this.player.body.position.x = this.xTarget;
            this.player.body.velocity.x = 0;
            this.isPlayerRunning = false;
            //if (playerReachedYTarget)
            //this.player.animations.stop();
        }
        if (playerReachedYTarget) {
            this.collisionEnabled = true;
            this.player.body.position.y = this.yTarget;
            this.player.body.velocity.y = 0;
            this.onLadder = false;
            this.isPlayerRunning = false;
            this.wasOnLadder = true;
        }

        if (!this.isPlayerRunning && !this.isPlayerJumping && !this.onLadder) {
            this.player.animations.stop();
        }
    }

    render() {
        // Only for debug
        // this.game.debug.spriteInfo(this.component.player, 32, 32);
        // this.game.debug.cameraInfo(this.game.camera, 400, 32);
        // this.game.debug.body(this.component.player);
        // this.game.debug.body(this.component.layer);


        // this.component.monsters.forEach(monster => {
        //     this.game.debug.body(monster);
        // });

        // this.component.spikes.forEach(spike => {
        //     this.game.debug.body(spike);
        // });
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
        this.wasOnLadder = false;
        this.energyLevel -= 100;
        this.player.animations.play('right');
        this.isPlayerRunning = true;
        this.xTarget = this.player.body.position.x + 80;
    }

    async moveLeft() {
        this.wasOnLadder = false;
        this.energyLevel -= 100;
        this.player.animations.play('left');
        this.isPlayerRunning = true;
        this.xTarget = this.player.body.position.x - 80;
    }

    async jump(sign) {
        this.wasOnLadder = false;
        this.energyLevel -= 200;
        this.isPlayerRunning = true;
        this.isPlayerJumping = true;
        this.player.animations.play(sign > 0 ? 'right' : 'left');
        this.player.animations.stop(null, true);
        this.player.animations.frame = sign > 0 ? 6 : 1;
        this.xTarget = this.player.body.position.x + sign * 80;
    }

    async up() {
        this.ladders.forEach(ladder => {
            if (ladder.checkCollision(this.player)) {
                this.onLadder = true;
                this.yTarget = ladder.y - this.player.body.height;
                this.collisionEnabled = false;
                this.player.animations.play('ladder');
            }
        });
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

    checkLadder() {
        const r = this.ladders.reduce((result, ladder) => {
            if (!result) {
                return ladder.checkCollision(this.player);
            }
        }, false);
        return this.blockly.interpreter.createPrimitive(r && !this.wasOnLadder);
    }

    useLadder(value) {
        const direction = value > 0;
        this.ladders.forEach(ladder => {
            if (ladder.checkCollision(this.player)) {
                this.onLadder = true;
                this.yTarget = direction ? ladder.y - this.player.body.height : ladder.bottom - this.player.body.height;
                this.collisionEnabled = false;
                this.player.animations.play('ladder');
            }
        });
    }

    async pick() {
        // TODO: implement method
        // this.items.push("items");
    }

    async interact() {
        this.switches.forEach(theSwitch => {
            if (theSwitch.checkCollision(this.player)) {
                theSwitch.switch();
            }
        });
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
        interpreter.setProperty(scope, 'checkLadder', interpreter.createNativeFunction(this.checkLadder.bind(this)));
        interpreter.setProperty(scope, 'useLadder', interpreter.createNativeFunction(this.useLadder.bind(this)));
        interpreter.setProperty(scope, 'up', interpreter.createNativeFunction(this.up.bind(this)));
        interpreter.setProperty(scope, 'pick', interpreter.createNativeFunction(this.pick.bind(this)));
        interpreter.setProperty(scope, 'interact', interpreter.createNativeFunction(this.interact.bind(this)));
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
    initAssets() {
        this.emptyStars = require('../../../assets/game/star0_white.png');
        this.oneStars = require('./../../../assets/game/star1_white.png');
        this.twoStars = require('./../../../assets/game/star2_white.png');
        this.threeStars = require('./../../../assets/game/star3_white.png');
        this.objFail = require('./../../../assets/game/objFail.png');
        this.objSuccess = require('./../../../assets/game/objSuccess.png');

    }
}
