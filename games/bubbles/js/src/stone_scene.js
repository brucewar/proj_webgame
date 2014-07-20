var ROW = 10;
var COL = 10;
var SCOPE = 5;
var size = null;
var blank = 2;
var stoneImg = null;
var FONT_TYPE = 'Futura-CondensedExtraBold';

var STATE_PREPARE = 0;
var STATE_PLAYING = 1;
var STATE_FINISHED = 2;

var topScore = "";
var topScorePlayer = "";

var floorBlockRealWidth = 48;
var limitScore = 20000

//var PropSprite = cc.Sprite.extend({
//    ctor:function(){
//        this._super();
//        this.initWithFile(s_Props);
//        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
//    },
//    containsTouchLocation:function(touch){
//        //获取触摸点位置
//        var getPoint = touch.getLocation();
//        getPoint.x += size.width/3;
//        //获取图片区域尺寸
//        var contentSize  =  this.getContentSize();
//        //定义拖拽的区域
//        var myRect = cc.rect(this.getPosition().x, this.getPosition().y, contentSize.width, contentSize.height);
//        //判断点击是否在区域上
//        console.log(cc.rectContainsPoint(myRect, getPoint));
//        return cc.rectContainsPoint(myRect, getPoint);
//    },
//    onTouchBegan:function(touch, event) {
//        if (!this.containsTouchLocation(touch)) return false;
//        return true;
//    },
//    onTouchMoved:function (touch, event) {
//        cc.log("onTouchMoved");
//        var touchPoint = touch.getLocation();
//        this.setPositionX(touchPoint.x + size.width/3 - this.getContentSize().width/2);  //设置X轴位置等于触摸的x位置
//    },
//    onTouchEnded:function(touch, event){
//
//    }
//});

var GameLayer = cc.Layer.extend({
  isMouseDown: false,
  sprites: null,
  stoneModel: null,
  gameState: null,
  soundEffect: null,

  propsLayer: null,
  propsHelp: null,
  hammerButton: null,

  background: null,
  backgroundImg: null,
  lazyLayer: null,
  lblScore: null,
  lblGold: null,
  lblReset: null,
  lblLevel: null,
  menu: null,
  refreshButton: null,
  returnButton: null,

  score: null,
  requireScore: null,
  level: null,
  firstWidth: null,
  firstHeight: null,
  stoneWidth: null,

  connected: null,
  connectedBack: null,
  stoneBatchNodes: [],
  floorBatchNode: null,

  resultLayer: null,
  resultSprite: null,
  resultText: null,
  downloadButton: null,
  downloadMenu: null,
  wxButton: null,
  wxMenu: null,
  updateMenu: null,
  galleryButton: null,
  updateButton: null,
  scoreText: null,
  galleryMenu: null,

  nextLevelDelayTime: null,

  ctor: function (requireScore, score) {
    this._super();
    this.requireScore = requireScore;
    this.score = score;
    this.level = 1;
    cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
    this.soundEffect = cc.AudioEngine.getInstance();
    this.soundEffect.setEffectsVolume(0.5);
  },
  update: function () {
    if (this.gameState == STATE_PREPARE) {
      if (stoneImg == null) return;
      for (var i = 0; i < 5; i++) {
        var path;
        if (i == 4) {
          path = stoneImgPath;
        } else {
          path = "./js/res/" + i + ".png";
        }
        var batchNode = cc.SpriteBatchNode.create(path);
        this.addChild(batchNode, 1);
        this.stoneBatchNodes.push(batchNode);
      }
      this.addStones();
      this.gameState = STATE_PLAYING;
    }
//        if(g_gameState == 1){
//            g_gameState = 2;
//            this.lblGold = cc.LabelTTF.create("GOLD " + gold, FONT_TYPE, 40);
//            this.lblGold.setPosition(cc.p(size.width/2, this.firstHeight/2));
//            this.lblGold.setScale(this.firstHeight/2/this.lblGold.getContentSize().height);
//            this.lblGold.setColor(cc.c3b(255,255,255));
//            this.addChild(this.lblGold,1000);
//        }
  },
  init: function () {
    this._super();
    var width = document.documentElement.clientWidth;
    if (document.documentElement.clientWidth >= 720)
      width = 720;
    size = cc.size(width, document.documentElement.clientHeight);
    console.log(document.documentElement.clientWidth + "-----");
    this.firstHeight = size.height / (ROW + 2);
    if (size.height / (ROW + 2) * ROW > size.width) {
      this.stoneWidth = (size.width - blank * (COL + 1)) / COL;
      this.firstWidth = blank;
    } else {
      this.stoneWidth = (size.height / (ROW + 2) * ROW - blank * (ROW + 1)) / ROW;
      this.firstWidth = (size.width - COL * this.stoneWidth - blank * (COL + 1)) / 2;
    }
//
//        //draw props
//        this.propsLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 128), size.width/3, size.height);
//        this.propsLayer.setPosition(cc.p(-size.width/3,0));
//        this.propsLayer.setAnchorPoint(cc.p(0,0));
//
//        this.propsHelp = new PropSprite();
//        this.propsHelp.setPosition(cc.p(size.width/3, size.height/(ROW+3)*(ROW+1)));
//        this.propsHelp.setAnchorPoint(cc.p(0,0));
//        this.propsHelp.setScale(size.height/(ROW+2)/this.propsHelp.getContentSize().height);
//        this.propsLayer.addChild(this.propsHelp,200);
//
//        this.hammerButton = cc.Sprite.create(s_Hammer);
//        this.hammerButton.setPosition(cc.p(size.width/3/2,size.height/6*5));
//        this.hammerButton.setScale(size.height/6/this.hammerButton.getContentSize().height);
//        this.hammerButton.setAnchorPoint(cc.p(0.5,1));
//        this.propsLayer.addChild(this.hammerButton,200);
//
//        this.addChild(this.propsLayer,200);

    // draw the floor
    var floorHeight = this.firstHeight;
    var floorWidth = floorHeight;
    var floorBlockCount = Math.ceil(size.width / floorWidth);
    var floorBlockScale = floorWidth / floorBlockRealWidth;
    console.log("there are " + floorBlockCount + " blocks on the floor, scale = " + floorBlockScale);
    this.floorBatchNode = cc.SpriteBatchNode.create(s_Floor);
    this.addChild(this.floorBatchNode, 100);
    for (var floorIndex = 0; floorIndex < floorBlockCount; floorIndex++) {
      var floorBlock = cc.Sprite.createWithTexture(this.floorBatchNode.getTexture());
      floorBlock.setAnchorPoint(cc.p(0, 0.5));
      floorBlock.setPosition(cc.p(floorIndex * floorWidth, this.firstHeight - floorHeight / 2));
      // a work around to remove the tiny white spaces between floor blocks
      floorBlock.setScaleX(floorBlockScale * 1.05);
      floorBlock.setScaleY(floorBlockScale);
      this.addChild(floorBlock, 1000);
    }

    // draw background image
    var bgWScale;
    var bgHScale;
    bgWScale = size.width / 360;
    bgHScale = size.height / 540;
    this.backgroundImg = cc.Sprite.create(s_back);
    this.backgroundImg.setScaleX(bgWScale);
    this.backgroundImg.setScaleY(bgHScale);
    this.backgroundImg.setAnchorPoint(0.5, 0.5);
    this.backgroundImg.setPosition(cc.p(0, 0));
    this.addChild(this.backgroundImg, 0);

    /*
     this.background = cc.LayerColor.create(cc.c4b(64, 64, 64, 252),size.width,size.height);
     this.background.setPosition(0,0);
     this.background.setAnchorPoint(cc.p(0,0));
     this.addChild(this.background, 0);
     */
    var menuItemRefresh = cc.MenuItemImage.create(s_ButtonRefreshUp, s_ButtonRefreshDown, this.resetGame, this);
    var menuItemScale = size.height / (ROW + 2) / menuItemRefresh.getContentSize().height;
    menuItemRefresh.setScale(menuItemScale);
    var menuItemReturn = cc.MenuItemImage.create(s_ButtonReturnUp, s_ButtonReturnDown, this.returnGame, this);
    menuItemReturn.setScale(menuItemScale);
    var menuPosition = cc.p(menuItemRefresh.getContentSize().width * menuItemScale / 2 + menuItemReturn.getContentSize().width * menuItemScale / 2 + blank * 2, size.height - size.height / (ROW + 2) / 2 - blank * 2);
    this.menu = cc.Menu.create(menuItemReturn, menuItemRefresh);
    this.menu.alignItemsHorizontally();
    this.menu.setPosition(menuPosition);
    this.addChild(this.menu, 2);

    var positionY = size.height - size.height / (ROW + 2) / 2;

    this.lblLevel = cc.LabelTTF.create("LEVEL " + this.level, FONT_TYPE, 40);
    this.lblLevel.setPosition(cc.p(size.width - blank * 2, positionY));
    this.lblLevel.setAnchorPoint(cc.p(1, 0.5));
    this.lblLevel.setScale(size.height / (ROW + 2) / 3 * 2 / this.lblLevel.getContentSize().height);
    this.lblLevel.setColor(cc.c3b(255, 255, 255));
    this.addChild(this.lblLevel, 1);

    var lblScale = size.height / (ROW + 2) / 3 * 2 / this.lblLevel.getContentSize().height;
    var lblScorePosition = cc.p(size.width / 2 - blank * 4, positionY);
    this.lblScore = cc.LabelTTF.create(this.score + "/" + this.requireScore, FONT_TYPE, 40);
    this.lblScore.setAnchorPoint(cc.p(0.5, 0.5));
    this.lblScore.setPosition(lblScorePosition);
    this.lblScore.setScale(size.height / (ROW + 2) / 3 * 2 / this.lblScore.getContentSize().height);
    //this.lblScore.setAnchorPoint(cc.p(1,0.5));
    this.lblScore.setColor(cc.c3b(255, 255, 255));
    this.addChild(this.lblScore, 1);

    // add floor
    this.gameState = STATE_PREPARE;
    this.downloadImg();
    this.setTouchEnabled(true);
    this.scheduleUpdate();
  },
  // a selector callback
  menuCloseCallback: function (sender) {
    cc.Director.getInstance().end();
  },
  addStones: function () {
    this.stoneModel = new StoneModel(ROW, COL, SCOPE);
    this.sprites = new Array();
    var sprite;
    for (var i = this.stoneModel.stoneArray.length - 1; i >= 0; i--) {
      var spriteRow = new Array();
      for (var j = 0; j < this.stoneModel.stoneArray[i].length; j++) {
        var positionX = size.width + this.firstWidth + j * (this.stoneWidth + blank);
        var positionY = this.firstHeight + (ROW - 1 - i) * (this.stoneWidth + blank);
        sprite = this.createSprite(this.stoneModel.stoneArray[i][j], positionX, positionY);
        spriteRow.push(sprite);
        //所有精灵初始化之后播放动画
        if (i == 0 && j == COL - 1) {
          var showFun = cc.CallFunc.create(function () {
            var time = 0.5;
            for (var j = 0; j < COL; j++) {
              for (var i = 0; i < ROW; i++) {
                var t_positionX = this.firstWidth + j * (this.stoneWidth + blank);
                var t_positionY = this.firstHeight + (ROW - 1 - i) * (this.stoneWidth + blank);
                var moveLeft = cc.MoveTo.create(time, cc.p(t_positionX, t_positionY));
                //var sequence = cc.Sequence.create(delay,moveLeft);
                this.sprites[i][j].runAction(moveLeft);
              }
              time += 0.1;
            }
          }, this);
          this.sprites[i][j].runAction(showFun);
        }
      }
      this.sprites.push(spriteRow);
    }
    for (var k = 0; k < this.sprites.length / 2; k++) {
      spriteRow = this.sprites[k];
      this.sprites[k] = this.sprites[this.sprites.length - k - 1];
      this.sprites[this.sprites.length - k - 1] = spriteRow;
    }
  },

  downloadImg: function () {
    cc.TextureCache.getInstance().addImageAsync(stoneImgPath, this, this.downloadCallback);
  },

  downloadCallback: function () {
    stoneImg = cc.TextureCache.getInstance().textureForKey(stoneImgPath);
    this.resultSprite = cc.Sprite.create(fullImgPath);
  },

  resetGame: function (event) {
    this.level = 1;
    this.requireScore = 1000;
    this.score = 0;
    this.lblLevel.setString("LEVEL " + this.level);
    this.lblScore.setString(this.score + "/" + this.requireScore);
    this.index = 0;
    this.scoreUpLevel = 3;
    this.sprites.length = 0;

    for (var i = 0; i < SCOPE; i++) {
      this.stoneBatchNodes[i].removeAllChildren(true);
    }
    this.removeConnectedBackground();
    this.connected = null;
    this.addStones();
  },

  returnGame: function (event) {
    history.back();
  },

  onTouchBegan: function (touch, event) {
    var loc = touch.getLocation();
    var x = ROW - 1 - Math.floor((loc.y - this.firstHeight + blank / 2) / (this.stoneWidth + blank));
    var y = Math.floor((loc.x - this.firstWidth + blank / 2) / (this.stoneWidth + blank));
    var t_connected = this.stoneModel.findConnectedStone(x, y);
    if (x < 0 || x > ROW - 1 || y < 0 || y > COL - 1 || this.sprites[x][y] == null || t_connected.length < 2) {
      this.removeConnectedBackground();
      this.connected = null;
      return;
    }
    if (t_connected.length >= 2) {
      if (this.connected != null && this.inConnected(x, y)) {
        this.removeConnectedSprite(this.connected);
        this.checkGameStatus();
        this.removeConnectedBackground();
        this.connected = null;
      } else {
        this.removeConnectedBackground();
        this.connected = t_connected;
        this.sortConnected(this.connected);
        this.setConnectedBackground();
      }
    }
    this.isMouseDown = true;
  },
  onTouchMoved: function (touch, event) {
    if (this.isMouseDown) {
      if (touch) {
        //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
      }
    }
  },
  onTouchEnded: function (touch, event) {
    this.isMouseDown = false;
  },
  onTouchCancelled: function (touch, event) {
    console.log("onTouchesCancelled");
  },
  sortConnected: function (connected) {
    var temp;
    //sort by col
    for (var i = 1; i < connected.length; i++) {
      for (var j = 0; j < connected.length - i; j++) {
        if (connected[j].y > connected[j + 1].y) {
          temp = connected[j + 1];
          connected[j + 1] = connected[j];
          connected[j] = temp;
        }
      }
    }
    //sort of same col by row
    for (var i = 1; i < connected.length; i++) {
      for (var j = 0; j < connected.length - i; j++) {
        if (connected[j].y == connected[j + 1].y && connected[j].x > connected[j + 1].x) {
          temp = connected[j + 1];
          connected[j + 1] = connected[j];
          connected[j] = temp;
        }
      }
    }
  },
  removeConnectedSprite: function (connected) {
    if (connected.length >= 2) {
      var currentScore;
      if (this.stoneModel.stoneArray[connected[0].x][connected[0].y] == 4) {
        currentScore = connected.length * connected.length * 10;
      } else {
        currentScore = connected.length * connected.length * 5;
      }
      this.score += currentScore;

      //removed score action
      var tlblScore = cc.LabelTTF.create(currentScore, FONT_TYPE, 20);
      tlblScore.setPosition(this.sprites[connected[0].x][connected[0].y].getPosition());
      tlblScore.setColor(cc.c3b(255, 255, 255));
      tlblScore.setAnchorPoint(cc.p(0.5, 1));
      this.addChild(tlblScore, 6);

      var moveAction = cc.MoveTo.create(1.5, cc.p(size.width / 2, size.height / (ROW + 2) * (ROW + 1)));
      var fadeAction = cc.FadeOut.create(0.2);
      var callfun = cc.CallFunc.create(function () {
        this.removeChild(tlblScore);
        this.lblScore.setString(this.score + "/" + this.requireScore);
      }, this);
      var actionSequence = cc.Sequence.create(moveAction, fadeAction, callfun);
      tlblScore.runAction(actionSequence);
      var stoneType = this.stoneModel.stoneArray[connected[0].x][connected[0].y];

      this.soundEffect.playEffect(s_StoneRemoveSound, false);

      for (var i = 0; i < connected.length; i++) {
        var y = connected[i].y;

        //remove stones effect
        var particle = cc.ParticleSystem.create("./js/res/stone_remove.plist");
        var positionX = this.sprites[connected[i].x][y].getPosition().x + this.stoneWidth / 2;
        var positionY = this.sprites[connected[i].x][y].getPosition().y + this.stoneWidth / 2;
        particle.setPosition(cc.p(positionX, positionY));
        particle.setAutoRemoveOnFinish(true);
        this.addChild(particle, 5);

        this.stoneModel.removeConnectedStone(connected[i].x, y);
        this.stoneBatchNodes[stoneType].removeChild(this.sprites[connected[i].x][y]);

        if (connected[i].x == ROW - 1 && this.sprites[connected[i].x - 1][y] == null) {
          this.updateUI(y);
        } else {
          var time = 0.1;
          for (var j = connected[i].x; j > 0; j--) {
            if (this.sprites[j - 1][y] == null) break;
            var moveDown = cc.MoveTo.create(time, cc.p(this.sprites[j - 1][y].getPosition().x, this.sprites[j - 1][y].getPosition().y - this.stoneWidth - blank));
            this.sprites[j - 1][y].runAction(moveDown);
            time += 0.1;
          }
          for (var j = connected[i].x; j > 0; j--) {
            this.sprites[j][y] = this.sprites[j - 1][y];
          }
          this.sprites[j][y] = null;
        }
      }
    }
  },
  createSprite: function (stoneType, positionX, positionY) {
    var sprite;
    var batchNode = this.stoneBatchNodes[stoneType];
    sprite = cc.Sprite.createWithTexture(batchNode.getTexture());
    sprite.setPosition(cc.p(positionX, positionY));
    sprite.setScale(this.stoneWidth / sprite.getContentSize().width);
    sprite.setAnchorPoint(cc.p(0, 0));
    batchNode.addChild(sprite);
    return sprite;
  },
  updateUI: function (nullCol) {
    if (nullCol != null) {
      this.stoneModel.updateAndMove(nullCol);
      var time = 0.02;
      for (var j = nullCol; j > 0; j--) {
        for (var i = ROW - 1; i >= 0; i--) {
          if (this.sprites[i][j - 1] == null) break;
          var moveRight = cc.MoveTo.create(time, cc.p(this.sprites[i][j - 1].getPosition().x + this.stoneWidth + blank, this.sprites[i][j - 1].getPosition().y));
          this.sprites[i][j - 1].runAction(moveRight);
          time += 0.02;
        }
        for (var i = ROW - 1; i >= 0; i--) {
          this.sprites[i][j] = this.sprites[i][j - 1];
        }
      }
      for (var i = 0; i < ROW; i++) {
        this.sprites[i][j] = null;
      }
    }
  },
  setConnectedBackground: function () {
    var bgSprite;
    this.connectedBack = new Array();
    for (var i = 0; i < this.connected.length; i++) {
      bgSprite = cc.LayerColor.create(cc.c4b(255, 255, 255, 100), this.stoneWidth + blank, this.stoneWidth + blank);
      var position = this.sprites[this.connected[i].x][this.connected[i].y].getPosition();
      bgSprite.setPosition(cc.p(position.x - blank / 2, position.y - blank / 2));
      bgSprite.setAnchorPoint(0, 0);
      this.addChild(bgSprite, 2);
      this.connectedBack.push(bgSprite);
    }
  },
  removeConnectedBackground: function () {
    if (this.connectedBack != null) {
      for (var i = 0; i < this.connectedBack.length; i++) {
        this.removeChild(this.connectedBack[i]);
      }
    }
    this.connectedBack = null;
  },
  inConnected: function (x, y) {
    var i;
    for (i = 0; i < this.connected.length; i++) {
      if (x == this.connected[i].x && y == this.connected[i].y) {
        return true;
      }
    }
    return false;
  },
  checkGameStatus: function () {
    if (!this.stoneModel.checkHasConnected()) {
      if (this.score >= this.requireScore) {
        this.level++;
        this.removeRestStones();
        this.menu.setEnabled(false);

        var lblDelay = cc.DelayTime.create(this.nextLevelDelayTime);
        var fadeOut1 = cc.FadeOut.create(0.2);
        var fadeOut2 = cc.FadeOut.create(0.2);
        var fadeOut3 = cc.FadeOut.create(0.2);
        var fadeCallFun = cc.CallFunc.create(function () {
          if (this.level < 6) {
            this.requireScore += 2500;
          } else {
            this.requireScore += 2500 + 500 * (this.level - 5);
          }
          var nextLblLevel = cc.LabelTTF.create("LEVEL " + this.level, FONT_TYPE, 20);
          nextLblLevel.setPosition(cc.p(size.width + nextLblLevel.getContentSize().width / 2, size.height / 2 + 20));
          nextLblLevel.setColor(cc.c3b(255, 255, 255));
          var nextLblScore = cc.LabelTTF.create("目标分：" + this.requireScore);
          nextLblScore.setPosition(cc.p(size.width + nextLblScore.getContentSize().width / 2, size.height / 2));
          nextLblScore.setColor(cc.c3b(255, 255, 255));

          this.addChild(nextLblLevel);
          this.addChild(nextLblScore);
          var moveLeft = cc.MoveTo.create(1, cc.p(size.width / 2, size.height / 2 + 20));
          var moveLeft1 = cc.MoveTo.create(1, cc.p(size.width / 2, size.height / 2));
          var moveEase = cc.EaseOut.create(moveLeft, 3);
          var moveEase1 = cc.EaseOut.create(moveLeft1, 3);
          var callFun = cc.CallFunc.create(function () {
            this.removeChild(nextLblLevel);
            this.removeChild(nextLblScore);
            //this.addRects();
            this.addStones();
            this.menu.setEnabled(true);
            this.lblScore.setString(this.score + "/" + this.requireScore);
            this.lblLevel.setString("LEVEL " + this.level);
            var fadeIn1 = cc.FadeIn.create(0.2);
            var fadeIn2 = cc.FadeIn.create(0.2);
            var fadeIn3 = cc.FadeIn.create(0.2);
            this.lblScore.runAction(fadeIn1);
            this.lblLevel.runAction(fadeIn2);
            this.menu.runAction(fadeIn3);
          }, this);
          var actionSeq = cc.Sequence.create(moveEase1, callFun);
          nextLblLevel.runAction(moveEase);
          nextLblScore.runAction(actionSeq);
        }, this);
        var sequence1 = cc.Sequence.create(lblDelay, fadeOut1);
        var sequence2 = cc.Sequence.create(lblDelay, fadeOut2);
        var sequence3 = cc.Sequence.create(lblDelay, fadeOut3, fadeCallFun);
        this.lblScore.runAction(sequence1);
        this.lblLevel.runAction(sequence2);
        this.menu.runAction(sequence3);
      } else {
        this.removeRestStones();
        this.gameOver();
      }
    }
  },
  removeRestStones: function () {
    this.nextLevelDelayTime = 1;
    for (var i = 0; i < ROW; i++) {
      for (var j = 0; j < COL; j++) {
        if (this.sprites[i][j] != null) {
          //var fadeOut = cc.FadeOut.create(delayTime);
          var delay = cc.DelayTime.create(this.nextLevelDelayTime);
          var callFun = cc.CallFunc.create(function (sprite) {
            sprite.setVisible(false);
            this.soundEffect.playEffect(s_StoneRemoveSound, false);
            var particle = cc.ParticleSystem.create("./js/res/stone_remove.plist");
            var positionX = sprite.getPosition().x + this.stoneWidth / 2;
            var positionY = sprite.getPosition().y + this.stoneWidth / 2;
            particle.setPosition(cc.p(positionX, positionY));
            particle.setAutoRemoveOnFinish(true);
            this.addChild(particle, 5);
          }, this, this.sprites[i][j]);
          var sequence;
          if (i == ROW - 1 && j == COL - 1) {
            var callFun1 = cc.CallFunc.create(function () {
              for (var i = 0; i < SCOPE; i++) {
                this.stoneBatchNodes[i].removeAllChildren(true);
              }
              this.sprites.length = 0;
            }, this);
            sequence = cc.Sequence.create(delay, callFun, callFun1);
          } else {
            sequence = cc.Sequence.create(delay, callFun);
          }
          this.sprites[i][j].runAction(sequence);
          this.nextLevelDelayTime += 0.2;
        }
      }
    }
  },

  gameOver: function () {
    this.resultLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 252), size.width, size.height);
    // process this image
    // phase 1, for those which are in shape of square
    this.resultSprite.setAnchorPoint(cc.p(0.5, 0));
    var scaleParam;
    if (size.width / 6 * 4 > size.height / 2) {
      scaleParam = size.height / 2 / this.resultSprite.getContentSize().height;
    } else {
      scaleParam = (size.width / 6 * 4) / this.resultSprite.getContentSize().width;
    }
    this.resultSprite.setPosition(cc.p(size.width / 2, size.height / 2 - 10));
    this.resultText = cc.LabelTTF.create('遗憾，没达到分数要求哦~', FONT_TYPE, 16);
    this.resultText.setPosition(cc.p(size.width / 2, this.resultSprite.getPosition().y - 20));
    this.resultSprite.setScale(scaleParam, scaleParam);
    {
      // phase 2, for full size image (TODO)
    }
    // generate post-menus
    // download button
    this.downloadButton = cc.MenuItemImage.create(
      "./js/res/download_normal.png",
      "./js/res/download_pressed.png",
      function () {
        console.log('download the image');
        //downloadImage(editorImgPath, this.img);
        //window.location = fullImgPath;
        window.location = '/picture_download?blob_id=' + fullImageBlod_id;
      }, this);

    this.downloadMenu = cc.Menu.create(this.downloadButton);
    this.downloadMenu.setPosition(cc.PointZero());
    this.downloadButton.setPosition(cc.p(size.width / 4 * 3,
        this.resultText.getPosition().y - 110));

    // wx button
    /*
     this.wxButton = cc.MenuItemImage.create(
     "./js/res/wx_normal.png",
     "./js/res/wx_pressed.png",
     function () {
     console.log('go to wx platform');
     window.location = "http://weixin.qq.com/r/8nXPwBDEYC4fhwGjnyDW";
     },this);

     this.wxMenu = cc.Menu.create(this.wxButton);
     this.wxMenu.setPosition(cc.PointZero());
     this.wxButton.setPosition(cc.p(size.width / 6 * 3,
     this.resultText.getPosition().y - 60));
     */
//
//        // update score button
//        this.updateButton = cc.MenuItemImage.create(
//            "./js/res/update_score_normal.png",
//            "./js/res/update_score_pressed.png",
//            function () {
//                console.log('update score');
//                this.updateScore(this);
//            },this);
//
//        this.updateMenu = cc.Menu.create(this.updateButton);
//        this.updateMenu.setPosition(cc.PointZero());
//        this.updateButton.setPosition(cc.p(size.width / 6 * 3,
//            this.resultText.getPosition().y - 100));

    // gallery button
    this.galleryButton = cc.MenuItemImage.create(
      "./js/res/gallery_normal.png",
      "./js/res/gallery_pressed.png",
      function () {
        console.log('to back to gallery');
        //history.back();
        window.location.reload();
      }, this);

    this.galleryMenu = cc.Menu.create(this.galleryButton);
    this.galleryMenu.setPosition(cc.PointZero());
    this.galleryButton.setPosition(cc.p(size.width / 4,
        this.resultText.getPosition().y - 110));

    var str = "请点击右上角，查看公众号，\r\n关注我们后您将获得更多功能";
    var notify = cc.LabelTTF.create(str, FONT_TYPE, 16);
    notify.setPosition(cc.p(size.width / 2, this.resultText.getPosition().y - 60));
    this.resultLayer.addChild(notify);

    this.resultLayer.addChild(this.downloadMenu);
    //this.resultLayer.addChild(this.wxMenu);
    // update score automatically
    var name = "";
    if (0 == playerStatus) {
      do {
        name = prompt("请输入您的真实微博昵称，作为兑奖凭证。", "");
      } while (name.length <= 0 || validateIllegalChar('名字', name) == false);
      nickName = name;
    }

    this.resultLayer.addChild(this.galleryMenu);
    this.resultLayer.addChild(this.resultSprite);
    this.resultLayer.addChild(this.resultText);

    this.resultLayer.setAnchorPoint(cc.p(0, 0));
    this.resultLayer.setPosition(cc.p(size.width, 0));
    this.addChild(this.resultLayer, 5000);
    var delay = cc.DelayTime.create(this.nextLevelDelayTime);
    var moveLeft = cc.MoveTo.create(1, cc.p(0, 0));
    var callFun = cc.CallFunc.create(function () {
      this.updateScore(this);
    }, this);
    var sequence = cc.Sequence.create(delay, moveLeft, callFun);
    this.resultLayer.runAction(sequence);

    this.gameState = STATE_FINISHED;
  },

  updateUserGold: function (userid) {
    if (this.score >= limitScore) {
      gold += 150;
    } else {
      gold += 50;
    }
    $.ajax({
      url: '/user_update_score',
      data: {user_id: userid, score: gold},
      type: "POST",
      timeout: 20000,
      success: function () {
        console.log("update user gold successfully");
      },
      error: function () {
        console.log("user gold update error");
      }
    });
  },

  updateScore: function (gameInstance) {
    if (0 == playerStatus) {
      $.ajax({
        url: '/bubbles_update',
        data: { bubbles_id: gameID, score: this.score, nick_name: nickName, player_id: playerID,
          player_avatar: '', new_player: 1},
        type: "POST",
        timeout: 20000,
        success: function (data) {
          // update author variables
          console.log(data);
          var objData = JSON.parse(data);
          topScore = objData.topScore;
          topScorePlayer = objData.topScorePlayer;
          gameInstance.displayScore();
          // save nick name to local storage for future use
          // this statement is important, but may not work on some types of device
          localStorage.setItem('user_wx_id', playerID);
          //gameInstance.updateUserGold(playerID);
        },
        error: function (data) {
          alert('score updating only failed');
        }
      });
    } else {
      $.ajax({
        url: '/bubbles_update',
        data: { bubbles_id: gameID, score: this.score, nick_name: nickName, player_id: playerID,
          player_avatar: avatarID, new_player: 0},
        type: "POST",
        timeout: 20000,
        success: function (data) {
          // update author variables
          console.log(data);
          var objData = JSON.parse(data);
          topScore = objData.topScore;
          topScorePlayer = objData.topScorePlayer;
          gameInstance.displayScore();
          //gameInstance.updateUserGold(playerID);
        },
        error: function (data) {
          console.log('score updating failed');
        }
      });
    }
  },

  displayScore: function () {
    this.scoreText = cc.LabelTTF.create('最高纪录:' + topScore + '分(' + topScorePlayer + '), 您的成绩:' + this.score +
      '分', FONT_TYPE, 16);
    this.resultLayer.addChild(this.scoreText);
    this.scoreText.setPosition(cc.p(size.width / 2,
        this.resultText.getPosition().y - 20));
  }
});

var GameScene = cc.Scene.extend({
  onEnter: function () {
    this._super();
    var layer = new GameLayer(1000, 0);
    layer.init();
    this.addChild(layer);
  }
});