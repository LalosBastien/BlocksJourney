import {
  Component, EventEmitter, Input,
  OnInit, Output
} from '@angular/core';
// import * as Interpreter from '../../../../node_modules/js-interpreter';
// const Interpreter = require('js-interpreter');
declare var Blockly: any;
import * as Interpreter from 'js-interpreter';
import actionBlocs from './blocs/actions/index.js';
import conditionBlocs from './blocs/conditions/index.js';

@Component({
  selector: 'app-blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.scss']
})
export class BlocklyComponent implements OnInit {
  @Output() blockyLoaded = new EventEmitter();
  public interpreter;
  public workspace;
  public code;

  @Input() data: any;
  constructor() {}

  ngOnInit() {
    this.createBlocks();
    this.interpreter = new Interpreter('');
  }

  resetInterpreter() {
    this.interpreter = new Interpreter('');
  }

  createBlocks() {
    this.createMoves();
    this.movesGenerator();
    this.workspace = Blockly.inject('blocklyDiv', {
      toolbox: this.data.levelInfo.toolbox
    });
      this.workspace.traceOn(true);
    window.dispatchEvent(new Event('blockyLoaded'));

    return this.workspace;
  }

  generateCode(bindMethod) {
    console.log('test: ', bindMethod);
    Blockly.JavaScript.addReservedWords('code');
    Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    Blockly.JavaScript.addReservedWords('highlightBlock');
    this.code = Blockly.JavaScript.workspaceToCode(this.workspace);
    console.log(this.code)
    this.interpreter = new Interpreter(this.code.toString(), bindMethod);
  }

  createMoves() {
    console.log({ ...actionBlocs, ...conditionBlocs })
    Object.entries({ ...actionBlocs, ...conditionBlocs }).forEach(([name, json]) => {
      Blockly.Blocks[name] = {
        init: function() {
          this.jsonInit(json);
        }
      };
    });
  }

  movesGenerator() {
    Blockly.JavaScript['move'] = function(block) {
      const dir = block.getFieldValue('DIRECTION');
      const instructions = {
        Right: 'moveRight();',
        Left: 'moveLeft();'
      };
      return instructions[dir];
    };

    Blockly.JavaScript['run'] = function(block) {
      const dir = block.getFieldValue('DIRECTION');
      const instructions = {
        Right: 'moveRight();',
        Left: 'moveLeft();'
      };
      let code = instructions[dir];
      for (let i = 0; i < 10; ++i) {
        code += instructions[dir];
      }
      return code;
    };

    Blockly.JavaScript['stop'] = function() {
      return 'stop();';
    };

    Blockly.JavaScript['jump'] = function(block) {
      const dir = block.getFieldValue('DIRECTION');
      const instructions = {
        Right: 'jump(1);',
        Left: 'jump(-1);'
      };
      return instructions[dir];
    };

    Blockly.JavaScript['check_holes'] = function(block) {
      const dir = block.getFieldValue('DIRECTION');
      console.log('DIRECTION :' + dir);
      const instructions = {
        right: ['rightHole()', Blockly.JavaScript.ORDER_FUNCTION_CALL],
        left: ['leftHole()', Blockly.JavaScript.ORDER_FUNCTION_CALL]
      };
      return instructions[dir];
    };

    Blockly.JavaScript['up'] = function() {
      return 'up();';
    };

    Blockly.JavaScript['down'] = function() {
      return 'down();';
    };

    Blockly.JavaScript['pick'] = function() {
      return 'pick();';
    };

  }

}
