MARKPOINTONE = 100;
MARKPOINTTWO = 101;
function ConnectionModel(_row, _col, _drawStatus) {
  this.minPoints = 50;
  this.count = 0;//记录没有连的精灵的个数
  this.stayPoints = [];
  this.roadPoint = new Array(-1, -1, -1, -1, -1, -1, -1, -1);
  this.row = _row;
  this.col = _col;
  this.connectionArray = new Array();
  this.drawStatus = _drawStatus;
  this.Values = null;
}
function Point(x, y, values) {
  this.rows = x;
  this.cols = y;
  this.values = values;
}

ConnectionModel.prototype.generateMap = function () {
  var half = (this.row - 2) * (this.col - 2) / 2;
  if (this.row * this.col % 2 != 0) {
    return;
  }
  for (var i = 0; i < this.row; i++) {
    var rowArray = new Array();
    for (var j = 0; j < this.col; j++) {
      rowArray.push(0);
    }
    this.connectionArray.push(rowArray);
  }
  var k = 1, c = 1;
  for (var m = 1; m <= half; m++) {
    var x = Math.floor(Math.random() * Number) + 1;
    for (var a = 1; a <= 2; a++) {
      while (this.connectionArray[k][c] != 0) {
        var k = Math.floor(Math.random() * (this.row - 2)) + 1;
        var c = Math.floor(Math.random() * (this.col - 2)) + 1;
      }
      this.connectionArray[k][c] = x;
    }
  }

};


ConnectionModel.prototype.addRoadPoints = function (r1, c1, r2, c2, r3, c3, r4, c4) {
  this.roadPoint[0] = r1;
  this.roadPoint[1] = c1;
  this.roadPoint[2] = r2;
  this.roadPoint[3] = c2;
  this.roadPoint[4] = r3;
  this.roadPoint[5] = c3;
  this.roadPoint[6] = r4;
  this.roadPoint[7] = c4;

};
ConnectionModel.prototype.RoadPointCount = function (r1, c1, r2, c2, r3, c3, r4, c4) {
  var count = 0;
  count = Math.abs(r2 - r1) + Math.abs(r3 - r2) + Math.abs(r4 - r3) + Math.abs(c2 - c1) + Math.abs(c3 - c2) + Math.abs(c4 - c3);
  if (count < this.minPoints) {
    this.addRoadPoints(r1, c1, r2, c2, r3, c3, r4, c4);
    minPoints = count;
  }
};
ConnectionModel.prototype.repeatModel = function () {
  var repeat = new Array();
  for (i = 0; i < this.connectionArray.length; i++) {
    clone = new Array();
    for (j = 0; j < this.connectionArray[i].length; j++) {
      clone.push(this.connectionArray[i][j]);
    }
    repeat.push(clone);
  }
  return repeat;
};
ConnectionModel.prototype.isConnected = function (row1, col1, row2, col2) {
  var tempModel = this.repeatModel();
  if (row1 == row2 && col1 == col2) {
    return false;
  }
  if (tempModel[row1][col1] == tempModel[row2][col2]) {
    tempModel[row1][col1] = MARKPOINTONE;
    tempModel[row2][col2] = MARKPOINTTWO;
    //开始标记第一个点
    for (var up1 = row1 - 1; up1 >= 0; up1--) {
      if (tempModel[up1][col1] == 0) {
        tempModel[up1][col1] = MARKPOINTONE;
      } else if (tempModel[up1][col1] == MARKPOINTTWO && tempModel[up1 + 1][col1] == MARKPOINTONE) {
        this.RoadPointCount(row1, col1, row1, col1, row1, col1, row2, col2);
        return true;
      } else {
        break;
      }
    }
    for (var down1 = row1 + 1; down1 < tempModel.length; down1++) {
      if (tempModel[down1][col1] == 0) {
        tempModel[down1][col1] = MARKPOINTONE;
      } else if (tempModel[down1][col1].connectionValue == MARKPOINTTWO && tempModel[down1 - 1][col1].connectionValue == MARKPOINTONE) {
        this.RoadPointCount(row1, col1, row1, col1, row1, col1, row2, col2);
        return true;
      } else {
        break;
      }

    }
    for (var right1 = col1 + 1; right1 < tempModel.length; right1++) {
      if (tempModel[row1][right1] == 0) {
        tempModel[row1][right1] = MARKPOINTONE;
      } else if (tempModel[row1][right1] == MARKPOINTTWO && tempModel[row1][right1 - 1] == MARKPOINTONE) {
        this.RoadPointCount(row1, col1, row1, col1, row1, col1, row2, col2);
        return true;
      } else {
        break;
      }
    }
    for (var left1 = col1 - 1; left1 >= 0; left1--) {
      if (tempModel[row1][left1] == 0) {
        tempModel[row1][left1] = MARKPOINTONE;
      } else if (tempModel[row1][left1] == MARKPOINTTWO && tempModel[row1][left1 + 1] == MARKPOINTONE) {
        this.RoadPointCount(row1, col1, row1, col1, row1, col1, row2, col2);
        return true;
      } else {
        break;
      }
    }
    //标记第二个点
    for (var up2 = row2 - 1; up2 >= 0; up2--) {
      if (tempModel[up2][col2] == 0) {
        tempModel[up2][col2] = MARKPOINTTWO;
      } else if (tempModel[up2][col2] == MARKPOINTONE && tempModel[up2 + 1][col2] == MARKPOINTTWO) {
        this.RoadPointCount(row2, col2, up2, col2, up2, col2, row1, col1);
        return true;
      } else {
        break;
      }
    }
    for (var down2 = row2 + 1; down2 < tempModel.length; down2++) {
      if (tempModel[down2][col2] == 0) {
        tempModel[down2][col2] = MARKPOINTTWO;
      } else if (tempModel[down2][col2] == MARKPOINTONE && tempModel[down2 - 1][col2] == MARKPOINTTWO) {
        this.RoadPointCount(row2, col2, down2, col2, down2, col2, row1, col1);
        return true;
      } else {
        break;
      }
    }
    for (var right2 = col2 + 1; right2 < tempModel[0].length; right2++) {
      if (tempModel[row2][right2] == 0) {
        tempModel[row2][right2] = MARKPOINTTWO;
      } else if (tempModel[row2][right2] == MARKPOINTONE && tempModel[row2][right2 - 1] == MARKPOINTTWO) {
        this.RoadPointCount(row2, col2, row2, right2, row2, right2, row1, col1);
        return true;
      } else {
        break;
      }
    }
    for (var left2 = col2 - 1; left2 >= 0; left2--) {
      if (tempModel[row2][left2] == 0) {
        tempModel[row2][left2] = MARKPOINTTWO;
      } else if (tempModel[row2][left2] == MARKPOINTONE && tempModel[row2][left2 + 1] == MARKPOINTTWO) {
        this.RoadPointCount(row2, col2, row2, left2, row2, left2, row1, col1);
        return true;
      } else {
        break;
      }
    }

    //继续从p1点开始查找
    for (var i = row1; i >= 0; i--) {
      if (tempModel[i][col1] == MARKPOINTONE && this.checkOne(i, col1, i, col2) && tempModel[i][col2] == MARKPOINTTWO) {
        this.RoadPointCount(row1, col1, i, col1, i, col2, row2, col2);
        return true;
      }
    }
    for (var down = row1; down < tempModel.length; down++) {
      if (tempModel[down][col1] == MARKPOINTONE && this.checkOne(down, col1, down, col2) && tempModel[down][col2] == MARKPOINTTWO) {
        this.RoadPointCount(row1, col1, down, col1, down, col2, row2, col2);
        return true;
      }
    }
    for (var right = col1; right < tempModel[0].length; right++) {
      if (tempModel[row1][right] == MARKPOINTONE && this.checkOne(row1, right, row2, right) && tempModel[row2][right] == MARKPOINTTWO) {
        this.RoadPointCount(row1, col1, row1, right, row2, right, row2, col2);
        return true;
      }
    }
    for (var left = col1; left >= 0; left--) {
      if (tempModel[row1][left] == MARKPOINTONE && this.checkOne(row1, left, row2, left) && tempModel[row2][left] == MARKPOINTTWO) {
        this.RoadPointCount(row1, col1, row1, left, row2, left, row2, col2);
        return true;
      }
    }
  }
  return false;
};
ConnectionModel.prototype.checkOne = function (r1, c1, r2, c2) {
  if (r1 == r2 && c1 == c2) {
    return true;
  }
  //两点位于同一列
  else if (c1 == c2) {
    //确保r1<r2
    if (r1 > r2) {
      var temp = r1;
      r1 = r2;
      r2 = temp;
    }
    if (r1 + 1 == r2)
      return true;
    for (var i = r1 + 1; i < r2; i++) {
      if (this.connectionArray[i][c1] > 0)
        return false;
    }
    return true;
  }
  // 位于同一行
  else if (r1 == r2) {
    if (c1 > c2) {
      var temp1 = c1;
      c1 = c2;
      c2 = temp1;
    }
    if (c1 + 1 == c2) {
      return true;
    }
    for (i = c1 + 1; i < c2; i++) {
      if (this.connectionArray[r1][i] > 0)
        return false;
    }
    return true;
  }
  return false;
};


ConnectionModel.prototype.setStatus = function (r1, c1, r2, c2) {
  if (this.isConnected(r1, c1, r2, c2)) {
    this.connectionArray[r1][c1] = 0;
    this.connectionArray[r2][c2] = 0;
  }
};
ConnectionModel.prototype.gameFinish = function () {
  for (i = 0; i < this.connectionArray.length; i++) {
    for (j = 0; j < this.connectionArray[i].length; j++) {
      if (this.connectionArray[i][j] != 0) {
        return false;
      }
    }
  }
  return true;
};
ConnectionModel.prototype.reSortGame = function (_row, _col) {
  this.row = _row;
  this.col = _col;
  this.connectionArray = new Array();
  this.generateMap();
};
ConnectionModel.prototype.recordArray = function (_row, _col) {
  var Points = new Array();
  this.Values = new Array();
  for (i = 0; i < this.connectionArray.length; i++) {
    for (j = 0; j < this.connectionArray[i].length; j++) {
      if (this.connectionArray[i][j] != 0) {
        point = new Point(i, j, this.connectionArray[i][j]);
        Points.push(point);
        this.Values.push(this.connectionArray[i][j]);
      }
    }
  }
  return Points;
};
ConnectionModel.prototype.shuffle = function (m) {
  //第i张与任意一张牌换位子，换完一轮即可
  for (var i = 0; i < m; i++) {
    var rnd = Math.floor(Math.random() * (i + 1)),
      temp = this.Values[rnd];
    this.Values[rnd] = this.Values[i];
    this.Values[i] = temp;
  }
  return this.Values;
};
ConnectionModel.prototype.resortArray = function (row, col) {
  var point = this.recordArray(row, col);
  var arr = this.shuffle(this.Values.length);
  for (var i = 0; i < point.length; i++) {
    this.connectionArray[point[i].rows][point[i].cols] = arr[i];
  }
};

ConnectionModel.prototype.hint = function (row, col) {
  var hintArray = new Array();
  var points = this.recordArray(row, col);
  for (var hini = 0; hini < points.length - 1; hini++) {
    for (var hinj = hini + 1; hinj < points.length; hinj++) {
      if (points[hini].values === points[hinj].values) {
        if (this.isConnected(points[hini].rows, points[hini].cols, points[hinj].rows, points[hinj].cols)) {
          hintArray.push(points[hini]);
          hintArray.push(points[hinj]);
          return hintArray;
        }
      }
    }
  }
};


