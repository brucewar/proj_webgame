/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-7-25
 * Time: 上午10:31
 * To change this template use File | Settings | File Templates.
 */
var TOTOLCOUNT = 8;
var ROW_COUNT = 8;
var COL_COUNT = 8;
var LocPosition;
var LocPositiontwo;
var numMul = 0;
//set 1px margin between pictures
var MARGIN = 1;
//font
var FONT_TYPE = "Futura-CondensedExtraBold";
var topScore = 0;
var topScorePlayer = "";
//var gAudioEngine = null;
//var gAudioClick = null;
var size = 0;
// LocPositional vars
// 这个类中两个变量，一个是精灵，一个是精灵缩放的比例
function ScalePictures(sprite, scaale) {
  this.sprite = sprite;
  this.scaale = scaale;
}
var HelloWorldScene = cc.Scene.extend({
  onEnter: function () {
    this._super();
    var layer = new ConnectEditor();
    layer.init();
    this.addChild(layer);
  }
});
var ConnectEditor = cc.Layer.extend({
  blankLeft: 0,     //左边空隙
  size: 0,      //canvas 大小
  timerground: null,         //精度条背景
  canvasSizeHeigt: null,      //游戏区域的高度
  timer: null,            //时间的标签
  sprtTimer: null,
  time: 100,             //总时间
  gTimer: null,         //时间进度条
  clickStatus: true,    //点击状态
  pictureWidth: null,     //图片精灵的宽度
  pictureHeight: null,    //图片精灵的高度
  leftSpace: null,        //左空隙
  blackgroundimage: 0,    //背景图片

  scaleSize: null,        //缩放比例
  rectangleSize: null,    //蒙板大小
  lblScore: null,//分数标签
  gAudioClick: null,
  score: 0,
  userscore: connect_userScore,
  RoadArray: null,
  linesprite: null,
  gameState: 0,
  resultLayer: null,
  resultSprite: null,
  resultText: null,
  gAudioClick: null,       //声音对象
  score: 0,                //分数标签
  RoadArray: null,         //路劲拐点
  linesprite: null,         //线条精灵
  gameState: 0,              //游戏状态
  resultLayer: null,         //游戏结束后的层
  resultSprite: null,        //游戏结束后的图片
  resultText: null,          //文字
  downloadButton: null,
  downloadMenu: null,
  wxButton: null,
  menu: null,
  wxMenu: null,
  updateButton: null,
  galleryButton: null,
  galleryMenu: null,
  gameArea: null,
  gameAreaLeft: null,
  lazyLayer: null,
  spriteArray: null,         //精灵数组
  connections: null,         //实例化的变量
  background: null,
  isMouseDown: false,
  helloImg: null,
  helloLabel: null,
  lblLevel: null,
  level: 1,
  lblUserScore: null,
  lblUserDiamond: null,
  circle: null,
  countTouch: true,
  LineImageWidth: 0,
  LineImageHeigt: 0,
  starFly: [],
  spriteBatchNode: [],
  flyNumber: 0,
  star: null,
  row: null,
  col: null,
  row1: null,
  col1: null,
  num: 1,
  linePointone: null,              //线条的第一个点
  linePointtwo: null,              //线条的第二个点
  MaskArray: null,                  //蒙板数组
  scoreText: null,
  spriateRectangle: null,
  firstClick: 1,                    //判断是第几次点击，用来判断播放什么声音
  connect_img1: null,               //异步加载图片
  connect_img2: null,
  connect_img3: null,
  connect_img4: null,
  connect_img5: null,
  full_img: null,                  //加载全图
  Game_Prepare: null,
  Game_Playing: null,
  Game_Stoping: null,
  countconnet: 0,                     //几连击
  dribbleState: 0,                   //连击状态
  rectangleWidth: null,
  backgroundImg: null,
  gPressSound: null,
  gErrorSound: null,


  ctor: function () {
    this._super();
  },
  //加分函数
  addPoint: function (point) {
    this.score = this.score + point;
    this.lblScore.setString("分数:" + this.score.toString());
  },
  updateUserScore: function (score) {


    this.userscore = this.userscore + score;
    $.ajax({
      url: "/user_update_score",
      data: {user_id: playerID, score: this.userscore},
      type: "POST",
      timeout: 20000,
      success: function (data) {
        console.log("update score successfully");
      },
      error: function (data) {
        console.log("update score error");
      }
    });
    this.lblUserScore.setString("金币:" + this.userscore.toString());
  },

  //用来判断屏幕是宽度优先还是长度优先
  judgeScreen: function () {
    size = cc.size(document.documentElement.clientWidth, document.documentElement.clientHeight);
    this.canvasSizeHeigt = 9 * size.height / 11;
    if (this.canvasSizeHeigt < size.width) {
      this.pictureWidth = this.canvasSizeHeigt / (TOTOLCOUNT - 1);
      this.blankLeft = 0;
      this.LineImageWidth = this.pictureWidth / 2 + 2 * MARGIN;
      this.leftSpace = (size.width - this.pictureWidth * TOTOLCOUNT - MARGIN * (TOTOLCOUNT + 3)) / 2 - MARGIN;
    } else {
      this.pictureWidth = size.width / (TOTOLCOUNT - 1);
      this.LineImageWidth = this.pictureWidth / 2 + 2 * MARGIN;
      this.leftSpace = -this.pictureWidth / 2;
      this.blankLeft = 15;
    }
  },

  init: function () {
    var selfPointer = this;
    // 1. super init first
    this._super();
    this.gameState = 0;
    this.Game_Prepare = true;
    this.Game_Playing = false;
    this.Game_Stoping = false;
    this.judgeScreen();
    gAudioClick = cc.AudioEngine.getInstance();

    // draw background image
    var bgWScale;
    var bgHScale;
    bgWScale = size.width / 180;
    bgHScale = size.height / 270;
    this.backgroundImg = cc.Sprite.create(s_back);
    this.backgroundImg.setScaleX(bgWScale);
    this.backgroundImg.setScaleY(bgHScale);
    this.backgroundImg.setAnchorPoint(0.5, 0.5);
    this.backgroundImg.setPosition(cc.p(0, 0));
    this.addChild(this.backgroundImg, 0);

    //时间的进度条的背景图片
    this.timerground = cc.Sprite.create(s_head);
    var sizeScale = (size.width / 1.3) / this.timerground.getContentSize().width
    this.timerground.setPosition(cc.p(size.width / 2 - this.timerground.getContentSize().width * sizeScale / 2, 2 * size.height / 18));
    this.timerground.setAnchorPoint(cc.p(0, 1));
    this.timerground.setScale(sizeScale, (size.height / 11 * 5 / 9) / this.timerground.getContentSize().height);
    this.addChild(this.timerground, 1);

    this.timer = cc.LabelTTF.create("100", FONT_TYPE, 25);
    this.timer.setPosition(size.width / 2, 2 * size.height / 12 - 1.4 * MARGIN);
    this.timer.setAnchorPoint(cc.p(0.5, 1));
    this.timer.setScale((size.height / 11 * 5 / 9) / this.timerground.getContentSize().height * 0.8);
    this.timer.setColor(cc.c3b(255, 255, 255));
    //  this.addChild(this.timer,4) ;

    //时间进度条
    this.gTimer = cc.ProgressTimer.create(cc.Sprite.create(s_timer));
    var sizeScale1 = (size.width / 1.34) / this.gTimer.getContentSize().width;
    this.gTimer.setPosition(cc.p(size.width / 2 - this.gTimer.getContentSize().width * sizeScale1 / 2,
        2 * size.height / 18 - sizeScale1 * MARGIN - MARGIN));
    this.gTimer.setScale(sizeScale1, (size.height / 11 * 4 / 9) / this.gTimer.getContentSize().height);
    this.gTimer.setPercentage(100);
    this.gTimer.setType(cc.PROGRESS_TIMER_TYPE_BAR);
    this.gTimer.setMidpoint(cc.p(0, 0));
    this.gTimer.setAnchorPoint(cc.p(0, 1));
    this.gTimer.setBarChangeRate(cc.p(1, 0));
    this.addChild(this.gTimer, 3);


    this.lblScore = cc.LabelTTF.create("分数:" + 0, FONT_TYPE, 40);
    //分数标签
    //this.lblScore = cc.LabelBMFont.create("0",s_font,40);
    var labelScoreScale = (size.height / 30) / this.lblScore.getContentSize().height;
    this.lblScore.setAnchorPoint(cc.p(0, 0));
    this.lblScore.setPosition(cc.p(2.5 * size.width / 6, size.height / 18));
    this.lblScore.setScale(labelScoreScale);
    this.lblScore.setColor(cc.c3b(200, 100, 255));//改变颜色
    this.lblScore.setAnchorPoint(cc.p(0, 1));
    this.addChild(this.lblScore, 3);

    this.lblUserDiamond = cc.LabelTTF.create("钻石:" + user_diamond, FONT_TYPE, 40);
    this.lblUserDiamond.setAnchorPoint(cc.p(0, 0));
    this.lblUserDiamond.setPosition(cc.p(1.4 * size.width / 6, size.height / 18));
    this.lblUserDiamond.setScale(labelScoreScale);
    this.lblUserDiamond.setColor(cc.c3b(240, 115, 155));//改变颜色
    this.lblUserDiamond.setAnchorPoint(cc.p(0, 1));
    this.addChild(this.lblUserDiamond, 3);


    this.lblUserScore = cc.LabelTTF.create("金币:" + this.userscore, FONT_TYPE, 40);
    this.lblUserScore.setAnchorPoint(cc.p(0, 0));
    this.lblUserScore.setPosition(cc.p(0.1 * size.width / 6, size.height / 18));
    this.lblUserScore.setScale(labelScoreScale);
    this.lblUserScore.setColor(cc.c3b(218, 178, 115));//改变颜色
    this.lblUserScore.setAnchorPoint(cc.p(0, 1));
    this.addChild(this.lblUserScore, 3);
    this.updateUserScore(-100);

    //关卡
    this.lblLevel = cc.LabelTTF.create("LEVEL:" + this.level, FONT_TYPE, 25);
    //  this.lblLevel = cc.LabelBMFont.create("LEVEL:"+ this.level,s_font, 25);
    var lblScaleSize = (size.height / 30) / this.lblLevel.getContentSize().height;
    this.lblLevel.setPosition(cc.p(4.0 * size.width / 6, size.height / 18));
    this.lblLevel.setScale(lblScaleSize);
    this.lblLevel.setAnchorPoint(cc.p(0, 1));
    this.lblLevel.setColor(cc.c3b(255, 255, 255));
    this.addChild(this.lblLevel, 3);

    cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
    this.setTouchEnabled(true);

    //返回按钮
    var returnItem = cc.MenuItemImage.create(s_ReturnUp, s_ReturnDown, function () {
      history.back();
    }, this);
    returnItem.setAnchorPoint(cc.p(0, 1));
    returnItem.setScale((size.height / 11) / returnItem.getContentSize().height);
    returnItem.setPosition(cc.p(0, 0));

    //重排按钮
    var resortItem = cc.MenuItemImage.create(s_resort, s_resortPressed, this.resortSelected, this);
    resortItem.setAnchorPoint(cc.p(0, 1));
    resortItem.setScale((size.height / 11) / returnItem.getContentSize().height);
    resortItem.setPosition(cc.p(size.width / 5 * 2, 0));

    //提示按钮
    var hintItem = cc.MenuItemImage.create(s_hintUp, s_hintDown, this.hintConnect, this);
    hintItem.setAnchorPoint(cc.p(0, 1));
    hintItem.setScale((size.height / 11) / returnItem.getContentSize().height);
    hintItem.setPosition(cc.p(size.width / 5 * 3, 0));

    //走不通时随机换个别图片
    var resortSingleItem = cc.MenuItemImage.create(s_sin, s_sinp, this.resortSingle, this);
    resortSingleItem.setPosition(cc.p(size.width / 5 * 4, 0));
    resortSingleItem.setScale((size.height / 11) / returnItem.getContentSize().height);
    resortSingleItem.setAnchorPoint(cc.p(0, 1));

    this.menu = cc.Menu.create(returnItem, resortItem, resortSingleItem, hintItem);
    this.menu.setPosition(cc.p(0, size.height));
    this.menu.setAnchorPoint(cc.p(0, 1));
    this.addChild(this.menu, 1);
    ImageArray = new Array();
    cc.TextureCache.getInstance().addImageAsync(editorImgPath, this, this.imageLoadCallback);
    cc.TextureCache.getInstance().addImageAsync(editorImgPath1, this, this.imageLoadCallback1);
    cc.TextureCache.getInstance().addImageAsync(editorImgPath2, this, this.imageLoadCallback2);
    cc.TextureCache.getInstance().addImageAsync(editorImgPath3, this, this.imageLoadCallback3);
    cc.TextureCache.getInstance().addImageAsync(editorImgPath4, this, this.imageLoadCallback4);
    cc.TextureCache.getInstance().addImageAsync(FullPicture, this, this.imageLoadCallbackFullImage);
    this.scheduleUpdate();

  },
  imageLoadCallbackFullImage: function (object) {
    this.full_img = cc.TextureCache.getInstance().textureForKey(FullPicture);
  },
  //imageLoadCallback
  imageLoadCallback: function (object) {
    this.connect_img1 = cc.TextureCache.getInstance().textureForKey(editorImgPath);
    ImageArray.push(this.connect_img1);
  },
  imageLoadCallback1: function (object) {
    this.connect_img2 = cc.TextureCache.getInstance().textureForKey(editorImgPath1);
    ImageArray.push(this.connect_img2);
  },
  imageLoadCallback2: function (obkect) {
    this.connect_img3 = cc.TextureCache.getInstance().textureForKey(editorImgPath2);
    ImageArray.push(this.connect_img3);
  },
  imageLoadCallback3: function (object) {
    this.connect_img4 = cc.TextureCache.getInstance().textureForKey(editorImgPath3);
    ImageArray.push(this.connect_img4);
  },
  imageLoadCallback4: function (object) {
    this.connect_img5 = cc.TextureCache.getInstance().textureForKey(editorImgPath4);
    ImageArray.push(this.connect_img5);
  },
  //提示按钮的功能
  hintConnect: function () {
    var hintArray = this.connections.hint(ROW_COUNT, COL_COUNT);
    if (hintArray != null) {
      if (this.userscore < 10) {
        return 0;
      }
      this.updateUserScore(-10);
      this.addShakeLeft(hintArray[0].rows, hintArray[0].cols);
      this.addShakeRight(hintArray[1].rows, hintArray[1].cols);
      this.addShakeMaskLeft(hintArray[0].rows, hintArray[0].cols);
      this.addShakeMaskRight(hintArray[1].rows, hintArray[1].cols);
      var callfun = cc.CallFunc.create(function () {
        this.spriteArray[hintArray[0].rows][hintArray[0].cols].sprite.setZOrder(1);
        this.spriteArray[hintArray[1].rows][hintArray[1].cols].sprite.setZOrder(1);
        this.MaskArray[hintArray[0].rows][hintArray[0].cols].setZOrder(2);
        this.MaskArray[hintArray[1].rows][hintArray[1].cols].setZOrder(2);
      }, this);
      var actionSequence = cc.Sequence.create(callfun);
      this.runAction(actionSequence);
    } else {
      return;
    }
  },
  //update
  update: function (dt) {
    if (this.Game_Prepare) {
      for (i = 0; i < 5; i++) {
        if (ImageArray[i] == null) {
          return;
        }
      }
      if (startTimer) {
        // 新建对象模型
        this.connections = new ConnectionModel(ROW_COUNT, COL_COUNT, true);
        this.connections.generateMap();
        this.drawDesk();
        this.schedule(this.updateTime, 1);
        this.Game_Prepare = false;
        this.Game_Playing = false;
      }
    }
  },
  updateTime: function (dt) {
    this.time = this.time - 1;
    this.timer.setString(this.time.toString());
    var lefttime = this.time / 100 * 100;
    if (lefttime < 0) {
      lefttime = 0
    }
    if (lefttime > 99.9) {
      lefttime = 99.9
    }
    this.gTimer.setPercentage(lefttime);
    if (this.time == 0) {
      this.unschedule(this.updateTime);
      this.timer.setString(0);
      var waittime = cc.DelayTime.create(1.3);
      var ca = cc.CallFunc.create(function () {
        this.gameOver();
      }, this);
      var sequence = cc.Sequence.create(waittime, ca);
      this.runAction(sequence);
    }
  },
  // a selector callback
  menuCloseCallback: function (sender) {
    cc.Director.getInstance().end();
  },
  //打乱的功能
  resortSingle: function (e) {
    if (this.userscore < 20) {
      return 0;
    }
    this.updateUserScore(-20);
    this.removeAllConnection();
    this.connections.resortArray(ROW_COUNT, COL_COUNT, true);
    this.drawDesk();
  },
  //全部重选
  resortSelected: function (e) {
    this.removeAllConnection();
    Number = 5;
    this.connections = new ConnectionModel(ROW_COUNT, COL_COUNT, true);
    this.connections.reSortGame(ROW_COUNT, COL_COUNT);
    this.score = 0;
    this.lblScore.setString(this.score);
    this.unschedule(this.updateTime);
    this.time = 100;
    this.level = 1;
    this.lblLevel.setString("LEVEL " + this.level, FONT_TYPE, 15);
    this.allCount = 4;
    this.schedule(this.updateTime, 1);
    this.drawDesk();
  },
  //图片蒙板往右开始旋转
  addShakeMaskRight: function (i, j) {
    var moveright = cc.MoveBy.create(0.2, cc.p(20, 0));
    var movedown = cc.MoveBy.create(0.2, cc.p(0, -20));
    var moveleft = cc.MoveBy.create(0.2, cc.p(-20, 0));
    var moveup = cc.MoveBy.create(0.2, cc.p(0, 20));
    var seq = cc.Sequence.create(moveright, movedown, moveleft, moveup);
    this.MaskArray[i][j].runAction(seq);
    this.MaskArray[i][j].setZOrder(11);
  },
  //图片蒙板往左开始旋转
  addShakeMaskLeft: function (i, j) {
    var moveleft = cc.MoveBy.create(0.2, cc.p(-20, 0));
    var movedown = cc.MoveBy.create(0.2, cc.p(0, -20));
    var moveright = cc.MoveBy.create(0.2, cc.p(20, 0));
    var moveup = cc.MoveBy.create(0.2, cc.p(0, 20));
    var seq = cc.Sequence.create(moveleft, movedown, moveright, moveup);
    this.MaskArray[i][j].runAction(seq);
    this.MaskArray[i][j].setZOrder(11);
  },
  //图片往右开始旋转
  addShakeRight: function (i, j) {
    var moveright = cc.MoveBy.create(0.2, cc.p(20, 0));
    var movedown = cc.MoveBy.create(0.2, cc.p(0, -20));
    var moveleft = cc.MoveBy.create(0.2, cc.p(-20, 0));
    var moveup = cc.MoveBy.create(0.2, cc.p(0, 20));
    var seq = cc.Sequence.create(moveright, movedown, moveleft, moveup);
    this.spriteArray[i][j].sprite.runAction(seq);
    this.spriteArray[i][j].sprite.setZOrder(10);
  },
  //图片往左开始旋转
  addShakeLeft: function (i, j) {
    var moveleft = cc.MoveBy.create(0.2, cc.p(-20, 0));
    var movedown = cc.MoveBy.create(0.2, cc.p(0, -20));
    var moveright = cc.MoveBy.create(0.2, cc.p(20, 0));
    var moveup = cc.MoveBy.create(0.2, cc.p(0, 20));
    var seq = cc.Sequence.create(moveleft, movedown, moveright, moveup);
    this.spriteArray[i][j].sprite.runAction(seq);
    this.spriteArray[i][j].sprite.setZOrder(10);
  },
  //添加蒙板
  addMask: function (i, j) {
    this.spriateRectangle = cc.Sprite.create(s_rectangle);
    this.spriateRectangle.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
    this.spriateRectangle.setAnchorPoint(cc.p(0.5, 0.5));
    this.rectangleWidth = this.spriateRectangle.getContentSize().width;
    this.rectangleSize = this.pictureWidth / this.spriateRectangle.getContentSize().width;
    this.spriateRectangle.setScale(this.pictureWidth / this.spriateRectangle.getContentSize().width);
    this.addChild(this.spriateRectangle, 2);
  },

  //生成游戏区域
  drawDesk: function () {
    this.judgeScreen();
    this.spriteArray = new Array();
    this.MaskArray = new Array();
    for (var i = 0; i < this.connections.connectionArray.length; i++) {
      var spriates = new Array();
      var mask = new Array();
      for (var j = 0; j < this.connections.connectionArray[i].length; j++) {
        switch (this.connections.connectionArray[i][j]) {
          case 0:
            spriate = cc.Sprite.create();
            mask.push(this.spriateRectangle);
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            spriate.setScale(this.pictureWidth / spriate.getContentSize().width);
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.pictureWidth / spriate.getContentSize().width);
            spriates.push(scalepic);
            break;
          case 1:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[0]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 2:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[1]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 3:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[2]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 4:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[3]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 5:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[4]);
            // spriate = cc.Sprite.createWithTexture(ImageArray[4]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 6:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[0]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setFlipX(true);
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 7:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[1]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setFlipX(true);
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 8:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[2]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setFlipX(true);
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 9:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[3]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setFlipX(true);
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          case 10:
            this.addMask(i, j);
            mask.push(this.spriateRectangle);
            spriate = cc.Sprite.createWithTexture(ImageArray[4]);
            this.scaleSize = this.pictureWidth / spriate.getContentSize().width;
            spriate.setFlipX(true);
            spriate.setPosition(cc.p(this.leftSpace + j * (this.pictureWidth + MARGIN) + this.pictureWidth / 2, size.height - i * (this.pictureWidth + MARGIN) - size.height / 11));
            spriate.setScale(this.scaleSize);
            spriate.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(spriate, 1);
            var scalepic = new ScalePictures(spriate, this.scaleSize);
            spriates.push(scalepic);
            break;
          default:
            break;
        }
      }
      this.spriteArray.push(spriates);
      this.MaskArray.push(mask);
    }
    cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, this.updatedribble, 2.5, cc.REPEAT_FOREVER, 0, false);
  },
  flyStar: function (i, j) {
    this.star = cc.Sprite.create(s_flystar);
    this.star.setPosition(this.spriteArray[i][j].sprite.getPosition().x, this.spriteArray[i][j].sprite.getPosition().y);
    this.star.setAnchorPoint(cc.p(0.5, 0.5));
    this.star.setScale(0.4);
    this.addChild(this.star, 6);
  },
  //右边的星星飞
  flybeginother: function (j) {
    var moveleft = cc.MoveBy.create(0.1, cc.p(-20, 0));
    var movedown = cc.MoveBy.create(0.1, cc.p(0, -20));
    var moveright = cc.MoveBy.create(0.1, cc.p(20, 0));
    var moveup = cc.MoveBy.create(0.1, cc.p(0, 20));
    var moveto = cc.MoveTo.create(0.5, cc.p(3.0 * size.width / 6, size.height / 18));
    var hide = cc.Hide.create();
    var sequence = cc.Sequence.create(moveleft, movedown, moveright, moveup, moveto, hide);
    this.starFly[j].runAction(sequence);
  },

  //左边的星星飞
  flybegin: function (i) {
    var moveleft = cc.MoveBy.create(0.1, cc.p(-20, 0));
    var movedown = cc.MoveBy.create(0.1, cc.p(0, -20));
    var moveright = cc.MoveBy.create(0.1, cc.p(20, 0));
    var moveup = cc.MoveBy.create(0.1, cc.p(0, 20));
    var moveto = cc.MoveTo.create(0.5, cc.p(3.0 * size.width / 6, size.height / 18));
    var hide = cc.Hide.create();
    var calf = cc.CallFunc.create(function () {
      this.addPoint(10);
    }, this);
    var sequence = cc.Sequence.create(moveleft, movedown, moveright, moveup, moveto, hide, calf);
    this.starFly[i].runAction(sequence);
  },
  //移除游戏区域的所有精灵
  removeAllConnection: function () {
    for (var i = 0; i < this.MaskArray.length; i++) {
      for (var j = 0; j < this.MaskArray[0].length; j++) {
        this.removeChild(this.MaskArray[i][j]);
      }
    }
    ;
    for (var i = 0; i < this.spriteArray.length; i++) {
      for (var j = 0; j < this.spriteArray[0].length; j++) {
        this.removeChild(this.spriteArray[i][j].sprite);
      }
    }
  },
  //移除某个位置的精灵
  removeSprites: function (i, j) {
    this.removeChild(this.spriteArray[i][j].sprite);
    this.removeChild(this.MaskArray[i][j]);
  },
  //游戏结束
  gameOver: function () {
    this.gameState = 1;
    this.removeAllChildren();
    size = cc.size(document.documentElement.clientWidth, document.documentElement.clientHeight);
    if (size.width < size.height) {
      this.resultLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 255), size.width, size.height);
      this.resultLayer.setPosition(cc.p(0, 0));
      this.resultSprite = cc.Sprite.createWithTexture(this.full_img);
      this.resultSprite.setAnchorPoint(0, 0);
      var scaleParamHeight = (size.height / 9 * 4) / this.resultSprite.getContentSize().height;
      var scaleParam = (size.width / 6 * 4) / this.resultSprite.getContentSize().width;
      var realWidth = this.resultSprite.getContentSize().width * scaleParam;
      this.resultSprite.setPosition(cc.p(size.width / 6, size.height - realWidth - 10));
      this.resultSprite.setScale(scaleParam, scaleParamHeight);
      this.resultLayer.addChild(this.resultSprite, 1);
      var str = '您完成了连连看 ' + gameName + '\r\n请点击右上角，查看公众号，\r\n关注我们后您将获得更多功能';
      this.resultText = cc.LabelTTF.create(str, FONT_TYPE, 16);
      this.resultText.setPosition(cc.p(size.width / 2, this.resultSprite.getPosition().y - 40));
      this.resultLayer.addChild(this.resultText, 1);

      this.downloadButton = cc.MenuItemImage.create(
        "js/res/download_normal.png",
        "js/res/download_pressed.png",
        function () {
          console.log('download the image');
          window.location = '/picture_download?blob_id=' + fullImgPath + "&picture_name=" + "";

        }, this);
      this.downloadButton.setPosition(cc.p(size.width / 6 * 4,
          this.resultText.getPosition().y - 80));

      // gallery button

      this.galleryButton = cc.MenuItemImage.create(
        "js/res/gallery_normal.png",
        "js/res/gallery_pressed.png",
        function () {
          window.location = "../game_list.html?game_id=0&game_type=3&user_id=" + userID;
        }, this);
      this.galleryButton.setPosition(cc.p(size.width / 6 * 2,
          this.resultText.getPosition().y - 80));

      var resultmenu = cc.Menu.create(this.downloadButton, this.wxButton, this.galleryButton);
      resultmenu.setPosition(cc.PointZero());
      this.resultLayer.addChild(resultmenu, 100);
      this.addChild(this.resultLayer, 100);
      var name = "";
      if (0 == playerStatus) {
        do {
          name = prompt("请输入您的名字(不超过5个字符)\n关注我们的公众账号创建自己的图库)", "");
          if (null == name) {
            return;
          }
        } while (name.length > 5 || name.length <= 0 ||
          validateIllegalChar('名字', name) == false);
        nickName = name;
      }
      this.updateScore(this);
      return;
    } else {
      this.resultLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 255), size.width, size.height);
      this.resultLayer.setPosition(cc.p(0, 0));
      this.resultSprite = cc.Sprite.createWithTexture(this.full_img);
      this.resultSprite.setAnchorPoint(0, 0);
      var scaleParamHeight = (size.height / 6 * 3) / this.resultSprite.getContentSize().height;
      var realHeight = this.resultSprite.getContentSize().height * scaleParamHeight;
      var realWidth = this.resultSprite.getContentSize().width * scaleParamHeight;
      this.resultSprite.setPosition(cc.p(size.width / 2 - realWidth / 2, size.height - realHeight - 10));
      this.resultSprite.setScale(scaleParamHeight);
      this.resultLayer.addChild(this.resultSprite, 1);
      var str = '您完成了连连看 ' + gameName + '\r\n请点击右上角，查看公众号，\r\n关注我们后您将获得更多功能';
      this.resultText = cc.LabelTTF.create(str, FONT_TYPE, 16);
      this.resultText.setPosition(cc.p(size.width / 2, this.resultSprite.getPosition().y - 40));
      this.resultLayer.addChild(this.resultText, 1);
      this.downloadButton = cc.MenuItemImage.create(
        "js/res/download_normal.png",
        "js/res/download_pressed.png",
        function () {
          console.log('download the image');
          window.location = '/picture_download?blob_id=' + fullImgPath + "&picture_name=" + "";

        }, this);
      this.downloadButton.setPosition(cc.p(size.width / 6 * 4,
          this.resultText.getPosition().y - 80));
      // wx button


      this.galleryButton = cc.MenuItemImage.create(
        "js/res/gallery_normal.png",
        "js/res/gallery_pressed.png",
        function () {
          window.location = "../game_list.html?game_id=0&game_type=3&user_id=" + userID;
        }, this);
      this.galleryButton.setPosition(cc.p(size.width / 6 * 2,
          this.resultText.getPosition().y - 80));

      var resultmenu = cc.Menu.create(this.downloadButton, this.wxButton, this.galleryButton);
      resultmenu.setPosition(cc.PointZero());
      this.resultLayer.addChild(resultmenu, 100);
      this.addChild(this.resultLayer, 100);
      var name = "";
      if (0 == playerStatus) {
        do {
          name = prompt("请输入您的名字(不超过5个字符)\n关注我们的公众账号创建自己的图库)", "");
          if (null == name) {
            return;
          }
        } while (name.length > 5 || name.length <= 0 ||
          validateIllegalChar('名字', name) == false);
        nickName = name;
      }

      this.updateScore(this);
      return;
    }
  },
  onPressPlay: function () {
    //gAudioClick.playEffect("js/sounds/click.ogg",false);
  },
  onPressSuccessStop: function () {
    //    gAudioClick.stopEffect(this.gPressSound);
  },
  onPressErrorStop: function () {
    //    gAudioClick.stopEffect(this.gErrorSound);
  },
  //不能消除时播放的声音
  onPressPlayError: function () {
    this.gErrorSound = gAudioClick.playEffect("./js/sounds/cancel.ogg", false);
  },
  //成功时播放的声音
  onPressPlaySuccess: function () {
    this.gPressSound = gAudioClick.playEffect("js/sounds/connect.ogg", false);
  },
  //plist动态效果
  removeSpritepist: function (i, j) {
    var particle = cc.ParticleSystem.create("js/res/taken-gem.plist");
    var positionX = this.spriteArray[i][j].sprite.getPosition().x;
    var positionY = this.spriteArray[i][j].sprite.getPosition().y;
    particle.setPosition(cc.p(positionX, positionY));
    particle.setAutoRemoveOnFinish(true);
    this.addChild(particle, 5);
  },

  //上传分数
  updateScore: function (gameInstance) {
    if (0 == playerStatus) {
      $.ajax({
        url: '/connects_update',
        data: {connects_id: gameID, score: this.score, nick_name: nickName, player_id: playerID,
          player_avatar: '', new_player: 1},
        type: "POST",
        timeout: 20000,
        success: function (data) {
          // update author variables
          console.log(data);
          var objData = JSON.parse(data);
          topScore = objData.topScore;
          topScorePlayer = objData.topScorePlayer;
          gameInstance.displayScores();
          localStorage.setItem('user_wx_id', playerID);
        },
        error: function (data) {
          alert('score updating only failed');
        }
      });
    } else {
      $.ajax({
        url: '/connects_update',
        data: {connects_id: gameID, score: this.score, nick_name: nickName, player_id: playerID,
          player_avatar: avatarID, new_player: 0},
        type: "POST",
        timeout: 20000,
        success: function (data) {
          // update author variables
          console.log(data);
          var objData = JSON.parse(data);
          topScore = objData.topScore;
          topScorePlayer = objData.topScorePlayer;
          gameInstance.displayScores();
        },
        error: function (data) {
          alert('score updating failed');
        }
      });
    }
  },
  displayScores: function () {
    this.scoreText = cc.LabelTTF.create('最高纪录:' + topScore + '分(' + topScorePlayer + ')', FONT_TYPE, 16);
    this.resultLayer.addChild(this.scoreText);
    this.scoreText.setPosition(cc.p(size.width / 2,
        this.resultText.getPosition().y - 40));
  },
  //每关过后过度关卡
  interlayer: function () {
    this.lblScore.setVisible(false);
    this.lblUserDiamond.setVisible(false);
    this.lblUserScore.setVisible(false);
    this.menu.setVisible(false);
    this.timerground.setVisible(false);
    this.lblLevel.setVisible(false);
    this.gTimer.setVisible(false);
    this.flyNumber = 0;
    this.starFly = [];
    var markedLabel = cc.LabelTTF.create("LEVEL:" + (this.num + 1), FONT_TYPE, 20);
    this.num++;
    markedLabel.setPosition(cc.p(size.width + 10, size.height / 2));
    markedLabel.setColor(cc.c3b(255, 255, 255));
    this.addChild(markedLabel);
    var moveLeft1 = cc.MoveTo.create(3, cc.p(size.width / 2, size.height / 2));
    var callFun = cc.CallFunc.create(function () {
      this.removeChild(markedLabel);
      this.lblLevel.setString("LEVEL" + this.level);
      this.connections = new ConnectionModel(ROW_COUNT, COL_COUNT, true);
      this.connections.generateMap();
      this.menu.setVisible(true);
      this.timerground.setVisible(true);
      // this.timer.setVisible(true);
      this.gTimer.setVisible(true);
      this.lblScore.setVisible(true);
      this.lblUserDiamond.setVisible(true);
      this.lblUserScore.setVisible(true);
      this.lblLevel.setVisible(true);
      this.drawDesk();
      this.allCount--;
    }, this);
    var actionSeq = cc.Sequence.create(moveLeft1, callFun);
    markedLabel.runAction(actionSeq);
  },
  //飞的分数
  flyLabelConnect: function (conn) {
    var LabelConnect = cc.LabelTTF.create(conn + "连击", FONT_TYPE, 15);
    var PositionX = this.spriteArray[this.row][this.col].sprite.getPosition().x;
    var PositionY = this.spriteArray[this.row1][this.col1].sprite.getPosition().y;
    LabelConnect.setPosition(PositionX, PositionY);
    this.addChild(LabelConnect, 10);
    var scaless = cc.ScaleTo.create(0.9, 3);
    var moveto = cc.MoveTo.create(0.9, cc.p(3.0 * size.width / 6, size.height / 18));
    var sw = cc.Spawn.create(scaless, moveto);
    var hide = cc.Hide.create();
    var callback = cc.CallFunc.create(
      function () {
        var soc = numMul * 10 - 10;
        this.addPoint(soc);
      }, this
    );
    var sequence = cc.Sequence.create(sw, hide, callback);
    LabelConnect.runAction(sequence);
  },
  //连击更新
  updatedribble: function (dt) {
    switch (this.countconnet) {
      case 2:
        numMul = this.countconnet;
        this.flyLabelConnect(this.countconnet);
        this.countconnet = 0;
        break;
      case 3:
        numMul = this.countconnet;
        this.flyLabelConnect(this.countconnet);
        this.countconnet = 0;
        break;
      case 4:
        numMul = this.countconnet;
        this.flyLabelConnect(this.countconnet);
        this.countconnet = 0;
        break;
      case 5:
        numMul = this.countconnet;
        this.flyLabelConnect(this.countconnet);
        this.countconnet = 0;
        break;
      default:
        this.countconnet = 0;
    }
    ;
  },
  onTouchBegan: function (touches, event) {
    return true;
  },
  onTouchEnded: function (touches, event) {
    if (this.gameState == 0) {
      //gAudioClick.stopAllEffects();
      size = cc.size(document.documentElement.clientWidth, document.documentElement.clientHeight);
      if (this.countTouch) {
        LocPosition = touches.getLocation();
        this.col = Math.floor((LocPosition.x - this.leftSpace) / (this.pictureWidth + MARGIN));
        this.row = Math.floor((size.height - size.height / 11 + this.pictureWidth / 2 - LocPosition.y) / (this.pictureWidth + MARGIN));
        if (this.row <= 0 || this.row >= ROW_COUNT - 1 || this.col <= 0 || this.col >= COL_COUNT - 1) {
          return;
        }
        if (this.connections.connectionArray[this.row][this.col] == 0) {
          return;
        }

        if (this.firstClick % 2 == 1) {
          if (this.gPressSound != null) {
            this.onPressSuccessStop();
          }
          if (this.gErrorSound != null) {
            this.onPressErrorStop();
          }
          this.firstClick++;
        }
        //当第一点下去后图片的效果
        var maskScaleSize = this.rectangleSize * 1.2;
        switch (this.connections.connectionArray[this.row][this.col]) {
          case 1:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 2:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 3:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 4:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 5:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 6:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 7:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 8:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 9:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          case 10:
            var extendScale = this.spriteArray[this.row][this.col].scaale * 1.2;
            this.MaskArray[this.row][this.col].setScale(maskScaleSize);
            this.spriteArray[this.row][this.col].sprite.setScale(extendScale);
            this.spriteArray[this.row][this.col].sprite.setZOrder(3);
            this.MaskArray[this.row][this.col].setZOrder(4);
            break;
          default :
            break;
        }
        this.countTouch = false;
        this.clickStatus = false;
      } else {
        this.clickStatus = true;
        LocPositiontwo = touches.getLocation();
        this.col1 = Math.floor((LocPositiontwo.x - this.leftSpace) / (this.pictureWidth + MARGIN));
        this.row1 = Math.floor((size.height - size.height / 11 + this.pictureWidth / 2 - LocPositiontwo.y) / (this.pictureWidth + MARGIN));
        this.countTouch = true;
        //图片成功配对以后
        if (this.connections.isConnected(this.row, this.col, this.row1, this.col1)) {
          this.connections.setStatus(this.row, this.col, this.row1, this.col1);
          this.RoadArray = this.connections.roadPoint;
          if (this.firstClick % 2 == 0) {
            this.onPressPlaySuccess();
            this.firstClick++;
          }
          if (this.RoadArray[0] == this.RoadArray[6]) {   // 水平方向在同一条直线上
            if (this.RoadArray[1] == this.RoadArray[3] && this.RoadArray[3] == this.RoadArray[5] && this.RoadArray[5] != this.RoadArray[7]) {  //直接连接
              linePointone = cc.p(this.leftSpace + this.RoadArray[1] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[0] - size.height / 11);
              linePointtwo = cc.p(this.leftSpace + this.RoadArray[7] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[6] - size.height / 11);
              this.linesprite = new LineSprite(linePointone, linePointone, linePointone, linePointtwo);
              this.linesprite.setAnchorPoint(cc.p(0, 0));
              this.addChild(this.linesprite, 2);
            } else {  //有拐点
              if (this.RoadArray[0] != this.RoadArray[2] && this.RoadArray[2] == this.RoadArray[4]) {
                linePointone = cc.p(this.leftSpace + this.RoadArray[1] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[0] - size.height / 11);
                linePointtwo = cc.p(this.leftSpace + this.RoadArray[3] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[2] - size.height / 11);
                linePointthree = cc.p(this.leftSpace + this.RoadArray[5] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[4] - size.height / 11);
                linePointfour = cc.p(this.leftSpace + this.RoadArray[7] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[6] - size.height / 11);
                this.linesprite = new LineSprite(linePointone, linePointtwo, linePointthree, linePointfour);
                this.addChild(this.linesprite, 2);
              }
            }
          } else if (this.RoadArray[1] == this.RoadArray[7]) {
            if (this.RoadArray[0] == this.RoadArray[2] && this.RoadArray[2] == this.RoadArray[4]) {  //竖直方向
              linePointone = cc.p(this.leftSpace + this.RoadArray[1] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[0] - size.height / 11);
              linePointtwo = cc.p(this.leftSpace + this.RoadArray[7] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[6] - size.height / 11);
              this.linesprite = new LineSprite(linePointone, linePointone, linePointone, linePointtwo);
              this.linesprite.setAnchorPoint(cc.p(0, 0));
              this.addChild(this.linesprite, 2);
            } else {  //竖直方向有拐点
              linePointone = cc.p(this.leftSpace + this.RoadArray[1] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[0] - size.height / 11);
              linePointtwo = cc.p(this.leftSpace + this.RoadArray[3] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[2] - size.height / 11);
              linePointthree = cc.p(this.leftSpace + this.RoadArray[5] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[4] - size.height / 11);
              linePointfour = cc.p(this.leftSpace + this.RoadArray[7] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[6] - size.height / 11);
              this.linesprite = new LineSprite(linePointone, linePointtwo, linePointthree, linePointfour);
              this.addChild(this.linesprite, 2);
            }
          } else { //两个点不在同一个图像
            linePointone = cc.p(this.leftSpace + this.RoadArray[1] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[0] - size.height / 11);
            linePointtwo = cc.p(this.leftSpace + this.RoadArray[3] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[2] - size.height / 11);
            linePointthree = cc.p(this.leftSpace + this.RoadArray[5] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[4] - size.height / 11);
            linePointfour = cc.p(this.leftSpace + this.RoadArray[7] * this.pictureWidth + this.LineImageWidth, size.height - this.pictureWidth * this.RoadArray[6] - size.height / 11);
            this.linesprite = new LineSprite(linePointone, linePointtwo, linePointthree, linePointfour);
            this.addChild(this.linesprite, 2);
          }
          this.flyStar(this.row, this.col);
          this.starFly.push(this.star);
          this.flyStar(this.row1, this.col1);
          this.starFly.push(this.star);
          this.flybeginother(this.flyNumber);
          this.flyNumber++;
          this.flybegin(this.flyNumber);
          this.flyNumber++;
          this.removeSpritepist(this.row, this.col);
          this.removeSpritepist(this.row1, this.col1);
          this.removeSprites(this.row, this.col);
          this.removeSprites(this.row1, this.col1);
          this.countconnet++;
        } else {
          //图片没有不匹配，把图片还原
          this.onPressPlayError();
          this.firstClick--;
          switch (this.connections.connectionArray[this.row][this.col]) {
            case 1:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 2:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 3:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 4:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 5:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 6:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 7:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 8:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 9:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            case 10:
              this.MaskArray[this.row][this.col].setScale(this.rectangleSize);
              this.spriteArray[this.row][this.col].sprite.setScale(this.spriteArray[this.row][this.col].scaale);
              this.MaskArray[this.row][this.col].setZOrder(2);
              this.spriteArray[this.row][this.col].sprite.setZOrder(1);
              break;
            default :
              break;
          }
        }
      }
      if (this.clickStatus) {
        if (this.row != this.row1 || this.cow != this.col1) {
          var delay = cc.DelayTime.create(0.1);
          var hide = cc.Hide.create();
          if ('undefined' != typeof this.linesprite && null != this.linesprite) {
            this.linesprite.runAction(cc.Sequence.create(delay, hide));
          }
        } else {
          return;
        }
      }
      //游戏结束以后参数设置
      if (this.connections.gameFinish()) {
        this.isMouseDown = false;
        this.removeAllConnection();
        this.judgeScreen();
        this.level++;
        Number++;
        if (Number >= 10) {
          Number = 10;
        }
        var waittime = cc.DelayTime.create(1.5);
        var ca = cc.CallFunc.create(function () {
          this.interlayer();
        }, this);
        var sequence = cc.Sequence.create(waittime, ca);
        this.runAction(sequence);
      }
    }
  },
  onTouchesCancelled: function (touches, event) {
    console.log("onTouchesCancelled");
  }
});
