/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-7-29
 * Time: 上午10:02
 * To change this template use File | Settings | File Templates.
 */
var curDetail = 2;
var LineSprite = cc.Sprite.extend({
    point: null,
    pointtwo: null,
    pointthree: null,
    pointfour: null,
    colorArray: null,
    create: function (path) {
      return cc.Spriate.create(path);
    },
    ctor: function (point1, point2, point3, point4) {
      this.point = point1;
      this.pointtwo = point2;
      this.pointthree = point3;
      this.pointfour = point4;
      this._super();
      cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
    },

    draw: function () {
      this.colorArray = new Array(5, 75, 150, 200, 255);
      var choosecolor = Math.floor(Math.random() * 5);
      cc.drawingUtil.setDrawColor4B(this.colorArray[choosecolor], this.colorArray[5 - choosecolor], 255, 255);
      cc.drawingUtil.setLineWidth(1);
      if (this.point.x == this.pointfour.x) {  //同一行
        if (this.point.x == this.pointtwo.x && this.point.y == this.pointtwo.y && this.pointtwo.x == this.pointthree.x && this.pointthree.y == this.pointtwo.y) {
          this.drawLines(this.point.x, this.point.y, this.pointfour.x, this.pointfour.y, 40);
        } else {
          this.drawLines(this.point.x, this.point.y, this.pointtwo.x, this.pointtwo.y, 40);
          this.drawLines(this.pointtwo.x, this.pointtwo.y, this.pointthree.x, this.pointthree.y, 40);
          this.drawLines(this.pointthree.x, this.pointthree.y, this.pointfour.x, this.pointfour.y, 40);
        }
      }
      else if (this.point.y == this.pointfour.y) {
        if (this.point.x == this.pointtwo.x && this.point.y == this.pointtwo.y && this.pointtwo.x == this.pointthree.x && this.pointthree.y == this.pointtwo.y) {
          this.drawLines(this.point.x, this.point.y, this.pointfour.x, this.pointfour.y, 40);
        } else {
          this.drawLines(this.point.x, this.point.y, this.pointtwo.x, this.pointtwo.y, 40);
          this.drawLines(this.pointtwo.x, this.pointtwo.y, this.pointthree.x, this.pointthree.y, 40);
          this.drawLines(this.pointthree.x, this.pointthree.y, this.pointfour.x, this.pointfour.y, 40);
        }
      }
      else {
        this.drawLines(this.point.x, this.point.y, this.pointtwo.x, this.pointtwo.y, 40);
        this.drawLines(this.pointtwo.x, this.pointtwo.y, this.pointthree.x, this.pointthree.y, 40);
        this.drawLines(this.pointthree.x, this.pointthree.y, this.pointfour.x, this.pointfour.y, 40);
      }
    },
    drawLines: function (x1, y1, x2, y2, displace) {
      if (displace < curDetail) {
        cc.drawingUtil.drawLine(cc.PointMake(x1, y1), cc.PointMake(x2, y2));
      }
      else {
        var mid_x = (x1 + x2) / 2;
        var mid_y = (y1 + y2) / 2;
        mid_x += (Math.random() - .5) * displace;
        mid_y += (Math.random() - .5) * displace;
        this.drawLines(x1, y1, mid_x, mid_y, displace / 2);
        this.drawLines(x2, y2, mid_x, mid_y, displace / 2);
      }
    }
  }
);
