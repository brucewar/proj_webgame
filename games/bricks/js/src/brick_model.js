(function () {

  function BrickModel(_row, _col, _deadBrickID, _blankRow, _blankCol, _userMatrix) {
    this.row = _row;
    this.col = _col;
    this.deadBrickID = _deadBrickID;
    this.blankRow = _blankRow;
    this.blankCol = _blankCol;
    if (null == _userMatrix) {
      this.brickArray = new Array();
      for (var r = 0; r < this.row; r++) {
        var rowArray = new Array();
        for (var c = 0; c < this.col; c++) {
          rowArray.push(this.col * r + c);
        }
        this.brickArray.push(rowArray);
      }
      this.brickArray[this.blankRow][this.blankCol] = -1;
    } else {
      // 1d - 2d user matrix convert
      console.log('convert 1d user matrix to 2d user matrix');
      var ele = 0;
      this.brickArray = new Array();
      for (var r = 0; r < this.row; r++) {
        var rowArray = new Array();
        for (var c = 0; c < this.col; c++) {
          if (_userMatrix[ele] == -1) {
            // calibrate blank row and col here
            this.blankRow = r;
            this.blankCol = c;
          }
          rowArray.push(_userMatrix[ele]);
          ele++;
        }
        this.brickArray.push(rowArray);
      }
    }
    /*
     // 3 * 3 matrix sample
     this.brickArray = ([0, 1, 2],
     [3, 4, 5],
     [6, 7, 8]);
     */
  }

  BrickModel.prototype.getRow = function () {
    return this.row;
  };

  BrickModel.prototype.getCol = function () {
    return this.col;
  };

  BrickModel.prototype.shuffle = function (simStepCount) {
    var movableBricks = new Array();
    for (var i = 0; i < simStepCount; i++) {
      // collect movable bricks
      movableBricks.length = 0;
      for (var r = 0; r < this.row; r++) {
        for (var c = 0; c < this.col; c++) {
          if (this.isMovable(r, c) != -1) {
            movableBricks.push(r);
            movableBricks.push(c);
          }
        }
      }

      var randIndex = Math.floor(Math.random() * (movableBricks.length / 2)) * 2;
      //console.log('randomly move brick at ' + movableBricks[randIndex] + ',' + movableBricks[randIndex + 1]);
      this.moveBrick(movableBricks[randIndex], movableBricks[randIndex + 1]);
    }
    return true;
  };

  BrickModel.prototype.judgeGame = function () {
    console.log('judge game in brick model');
    var index = 0;
    var debugString = "";
    /*
     // debug for result judgement
     for(var r = 0; r < this.row; r++) {
     debugString = "";
     for(var c = 0; c < this.col; c++) {
     debugString += this.brickArray[r][c];
     debugString += ",";
     index ++;
     }
     console.log(debugString);
     }
     */

    for (var r = 0; r < this.row; r++) {
      for (var c = 0; c < this.col; c++) {
        if (this.brickArray[r][c] != index) {
          console.log('brickArray[' + r + '][' + c + '] = ' + this.brickArray[r][c] + ', index = ' + index);
          return false;
        }
        index++;
      }
    }
    console.log('OK');
    return true;
  };

  BrickModel.prototype.isMovable = function (row, col) {
    //console.log('to move brick at ' + row + ',' + col + ' ; blank brick at ' + this.blankRow + ',' + this.blankCol);
    if (row + 1 == this.blankRow && col == this.blankCol) {
      // can move down
      return 1;
    } else if (row - 1 == this.blankRow && col == this.blankCol) {
      // can move up
      return 2;
    } else if (row == this.blankRow && col + 1 == this.blankCol) {
      // can move right
      return 3;
    } else if (row == this.blankRow && col - 1 == this.blankCol) {
      // can move left
      return 4;
    } else {
      // can not move
      return -1;
    }
  };

  BrickModel.prototype.move = function (brickId) {
    // only when the position of blank brick is [0, 2], the dead brick could be moved
    // console.log('clicked on brick with id = ' + brickId + ' dead brick id = ' + this.deadBrickID);
    if (brickId == this.deadBrickID) {
      if (this.blankRow == 0 && this.blankCol == 2) {
        this.moveLeft(0, 3);
        return 4;
      } else if (this.blankRow == 0 && this.blankCol == 3) {
        this.moveRight(0, 2);
        return 3;
      } else {
        console.log('you can not move a dead brick');
        return -1;
      }
    }
    for (var r = 0; r < this.row; r++) {
      for (var c = 0; c < this.col; c++) {
        if (this.brickArray[r][c] == brickId) {
          //console.log('to move brick at :' + r + ',' + c);
          return this.moveBrick(r, c);
        }
      }
    }
    return -1;
  };

  BrickModel.prototype.moveBrick = function (row, col) {
    var dir = this.isMovable(row, col);
    switch (dir) {
      case 1:
        this.moveDown(row, col);
        break;
      case 2:
        this.moveUp(row, col);
        break;
      case 3:
        this.moveRight(row, col);
        break;
      case 4:
        this.moveLeft(row, col);
        break;
      default:
        console.log('this brick is not movable');
        break;
    }
    return dir;
  };

  BrickModel.prototype.getArrayFromBrickMatrix = function () {
    var brick1dArray = new Array();
    for (var r = 0; r < this.row; r++) {
      for (var c = 0; c < this.col; c++) {
        brick1dArray.push(this.brickArray[r][c]);
      }
    }
    return brick1dArray;
  };

  BrickModel.prototype.moveDown = function (row, col) {
    this.swapBrick(row, col, row + 1, col);
  };

  BrickModel.prototype.moveUp = function (row, col) {
    this.swapBrick(row, col, row - 1, col);
  };

  BrickModel.prototype.moveRight = function (row, col) {
    this.swapBrick(row, col, row, col + 1);
  };

  BrickModel.prototype.moveLeft = function (row, col) {
    this.swapBrick(row, col, row, col - 1);
  };

  BrickModel.prototype.swapBrick = function (originRow, originCol, targetRow, targetCol) {
    // process blank brick, swap the blank brick and brick 2 directly
    if (originRow == 0 && originCol == 3) {
      this.brickArray[targetRow][targetCol] = 2;
      // since we judge whether brick could be moved only by blankRow and blankCol, set these 2 variables
      this.blankRow = originRow;
      this.blankCol = originCol;
    } else if (targetRow == 0 && targetCol == 3) {
      this.brickArray[originRow][originCol] = -1;
      this.blankRow = originRow;
      this.blankCol = originCol;
    } else {
      var tmp = this.brickArray[originRow][originCol];
      this.brickArray[originRow][originCol] = this.brickArray[targetRow][targetCol];
      this.brickArray[targetRow][targetCol] = tmp;
      this.blankRow = originRow;
      this.blankCol = originCol;
    }
  };

  return this.BrickModel = window.BrickModel = BrickModel;
})();