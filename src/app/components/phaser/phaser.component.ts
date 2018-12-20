import {
  Component,
  OnInit
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
export class PhaserComponent implements OnInit {
  game: Phaser.Game;
  blockly: BlocklyComponent;
  router: Router;
  map; layer; target; player;
  monsters; spikes;
  message; runButton; stopButton; bg;
  json; meta; steps; started; timerStart; terminated; items;
  width; height; buttonPanelHeight; cb; currentBlock;

  constructor(private _api: LevelRequestService, json: string) {

    this.json = JSON.parse(json);
    console.log(this.json);
    this.meta = this.json.level;
    this.json = this.json.levelInfo;

      this.width =  window.innerWidth * 0.6 - 60
      this.buttonPanelHeight = 150;
      this.height = 500;

    this.game = new Phaser.Game(this.width, this.height, Phaser.Auto, 'content', {
      destroy: this.destroy,
      json: this.json,
      preload: this.preload,
      create: this.create,
      update: this.update,
      render: this.render,
      moveLeft: this.moveLeft,
      moveRight: this.moveRight,
      highlightBlock: this.highlightBlock,
        currentBlock: this.currentBlock,
      jump: this.jump,
      up: this.up,
      down: this.down,
      pick: this.create,
      delay: this.delay,
      gameOver: this.gameOver,
      bindInterpreter: this.bindInterpreter,
        blockly: this.blockly,
        startGame: this.startGame,
      monsterMove: this.monsterMove,
      validateLevel: this.validateLevel,
      height: this.height,
      width: this.width,
      buttonPanelHeight: this.buttonPanelHeight,
      meta: this.meta,
      _api: this._api,
      terminated: this.terminated,
    });

      Phaser.Canvas.addToDOM(this.game.canvas, document.getElementById('canvasHolder'))
  }

  ngOnInit() {}

  destroy() {
    this.game.destroy();
  }

  preload() {
    Phaser.Canvas.addToDOM(this.game.canvas, document.getElementById('canvasHolder'));
    this.terminated = false;
    this.blockly = new BlocklyComponent(this.json['toolbox']);
    this.startGame = this.startGame.bind(this);

    window.addEventListener("PlayGame", this.startGame);
    window.addEventListener("StopGame", this.stopGame);

    this.game.load.tilemap('level', null, this.json['level'], Phaser.Tilemap.TILED_JSON);

    this.json['level']['tilesets'].forEach(element => {
      this.game.load.image(element['name'], 'assets/game/tiles/' + element['image']);
    });

    this.game.load.image('background', this.json['images']['background']);

    this.game.load.spritesheet('star', this.json['goal']['path'], 16, 16);
    this.json['sprites'].forEach(element => {

      this.game.load.spritesheet(
        element.name + element.id,
        element.path,
        element.spriteWidth,
        element.spriteHeight
      );
    });

    this.game.load.spritesheet(
      'player', this.json['player']['path'],
      this.json['player']['spriteWidth'],
      this.json['player']['spriteHeight']
    );

    this.game.load.spritesheet('button', 'assets/game/start_button.png', 177, 80);
    this.game.load.spritesheet('stopButton', 'assets/game/stop_button.png', 171, 75.5);
  }
  create() {
      console.log('create')
    this.layer = [];
    this.steps = 0;
    this.started = false;
    let i = 0;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.stage.backgroundColor = '#fafafa';

    this.bg = this.game.add.tileSprite(0, 0, this.width, this.height, 'background');
    this.bg.fixedToCamera = true;

    this.map = this.game.add.tilemap('level');

    this.json['level']['tilesets'].forEach(element => {
      this.map.addTilesetImage(element['name']);
    });

    this.map.setCollisionByExclusion([13, 14, 15, 16, 17, 46, 47, 48, 49, 50, 51]);

    this.layer = this.map.createLayer(this.json['level']['layers'][0]['name']);
    this.layer.resizeWorld();

    //  Only for debug
    this.layer.debug = false;

    this.game.physics.arcade.gravity.y = this.json['physics']['gravity'];
    this.message = this.game.add.text(32, 32, '', {fill: 'white'});
    this.message.x = (window.innerWidth / 2) - 400;

    this.player = this.game.add.sprite(this.json['player']['x'], this.json['player']['y'], 'player');
    this.target = this.game.add.sprite(this.json['goal']['x'], this.json['goal']['y'], 'star');
    this.monsters = [];
    this.spikes = [];

    this.json.sprites.forEach((element) => {
      const newSprite = this.game.add.sprite(element.x, element.y, `${element.name}${this[element.name + 's'].length}`);
        this[element.name + 's'].push(newSprite);
    });


    this.game.physics.enable(this.monsters, Phaser.Physics.ARCADE);
    this.game.physics.enable(this.spikes, Phaser.Physics.ARCADE);
    this.game.physics.enable([this.player, this.target], Phaser.Physics.ARCADE);


    this.monsters.map(monster => {
      const newMonster = monster;
        newMonster.body.bounce.y = 0.5;
        newMonster.body.allowGravity = true;
        newMonster.body.collideWorldBounds = true;
        newMonster.body.setSize(32, 32, 0, 0);
        newMonster.animations.add('action', [0, 1, 2, 3], 5, true);
        newMonster.animations.play('action');
        return newMonster;
    });

    this.spikes.map(spike => {
        const newSpike = spike;
        newSpike.body.immovable = true;
        newSpike.body.allowGravity = false;
        newSpike.body.collideWorldBounds = true;
        newSpike.body.setSize(5, 10, 22, 20);
        newSpike.animations.add('action', [0, 1, 2, 3], 5, true);
        newSpike.animations.play('action');
        return newSpike;
    });

    this.target.body.allowGravity = false;
    this.target.body.collideWorldBounds = true;
    this.target.body.immovable = true;

    this.player.body.bounce.y = 0.2;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(this.json['player']['spriteWidth'], this.json['player']['spriteHeight'], 0, 0);
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 10, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    this.player.animations.play(this.json['player']['facing']);

    this.game.camera.follow(this.player);



    this.cb = function() {
      this.blockly.generateCode(this.bindInterpreter.bind(this));
      if (this.message)
      this.message.text = '';
      this.started = true;
      this.timerStart = Date.now();
    };
      this.cb.bind(this);

    this.runButton = this.game.add.button(0, this.height + 10, 'button', this.cb, this, 2, 1, 0);

    const cb2 = function() {
      console.log('stop button hit');
      this.gameOver('You stopped the game');
      this.started = false;
    };
    cb2.bind(this);
    this.stopButton = this.game.add.button(200, this.height + 10, 'stopButton', cb2, this, 2, 1, 0);

      console.log(document.getElementById('gameHolder'))
      console.log(document.getElementsByTagName('canvas')[0])
      document.getElementById('canvasHolder').appendChild(document.getElementsByTagName('canvas')[0])
  }

  startGame() {
      this.blockly.generateCode(this.bindInterpreter.bind(this));
      this.message.text = '';
      this.started = true;
      this.timerStart = Date.now();
  }

    stopGame() {
        this.started = false;
        this.gameOver('You stopped the game');
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

  async validateLevel(algoTime, status) {
    try {
      await this._api.validate(this.meta.id, algoTime, status);
        console.log('validated');
      await this._api.get(this.meta.id);
        console.log('new game started');

    } catch (e) {
      console.log('not validated', e);
    }

  }

  update() {
    if (this.terminated) {
      this.destroy();
      return;
    }

    if (this.player && this.player.body) {
      this.game.physics.arcade.collide(this.player, this.layer);
      this.player.body.velocity.x = 0;

      this.monsters.forEach(monster => {
          this.monsterMove(monster);
          this.game.physics.arcade.collide(monster, this.layer);
          this.game.physics.arcade.collide(this.player, monster, () => {
              const time = Date.now() - this.timerStart;
              this.validateLevel(time, 'failed');
              this.gameOver('Perdu: tué par un montre');
              this.started = false;
          }, () => true, this);
      });

        this.spikes.forEach(spike => {
            this.game.physics.arcade.collide(this.player, spike, () => {
                const time = Date.now() - this.timerStart;
                this.validateLevel(time, 'failed');
                this.gameOver('Perdu: tué par un piège');
                this.started = false;
            }, () => true, this);
        });


    this.game.physics.arcade.collide(this.player, this.target, () => {
      if (this.started) {
        const time = Date.now() - this.timerStart;
        console.log(time);
        this.validateLevel(time, 'success');
        //  alert('YOU WON with ' + this.steps + ' steps in ' + Math.floor(time / 1000) + ' seconds');
        this.message.text = 'Gagné avec ' + this.steps + ' étapes en ' + Math.floor(time / 1000) + ' secondes';
        this.message.fill = 'green';
        // this.terminated = true;
        // window.location.href = window.location.origin + '/#/levels';

        this.started = false;
      }
    }, () => true, this);

      if (this.blockly.interpreter.step()) {
        // if (!this.started) {
        //   this.gameOver();
        // } else {
        console.log('step');
        ++this.steps;
      // }
      } else if (this.started) {
        this.started = false;
        this.gameOver('Perdu : Objectif non atteint');
      } else {
        this.player.body.acceleration.x = 0;
        this.player.body.velocity.x = 0;
        this.player.animations.stop();
      }
    }
  }

  render() {
    // this.game.debug.spriteInfo(this.player, 32, 32);
    // this.game.debug.spriteInfo(this.monster, 32, 32);
    // this.game.debug.body(this.player);
    // this.game.debug.body(this.layer);
    // this.game.debug.body(this.monster);
    // this.game.debug.body(this.trap);
    // this.game.debug.body(this.target);
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  gameOver(message) {
    this.blockly.resetInterpreter();
    // alert('Game Over, try again');
    this.message.text = message;
    this.message.fill = 'red';
    this.steps = 0;
    this.player.x = this.json['player']['x'];

      // const time = Date.now() - this.timerStart;
      // console.log(time);
      // this.validateLevel(time, 'failed');
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
      this.currentBlock = id.data
  }
}
