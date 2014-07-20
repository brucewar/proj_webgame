var SPEED = 3000;
var PHOTOPATH = editorImgPath;
var PHOTOTEXTURE = null;
var mScore = userScore;
var BACKGROUND = 0;
var MIDDLEGROUND = 1;
var FOREGROUND = 2;
var FONT_TYPE = 'Futura-CondensedExtraBold';
var STATE_FINISHED = 2;
var TOPSCORE = mScore;
var EachBet = 0;
var tigereffect = cc.AudioEngine.getInstance();
tigereffect.setEffectsVolume(0.5);
var TigerNode = cc.Node.extend({
  mTigerBatchNodes: [],
  mTigerSpritesBatchCount: 5,
  mUtilSize: null,
  ctor: function () {
    this._super();
  },
  init: function () {
    var winSize = cc.size(document.documentElement.clientWidth,
      document.documentElement.clientHeight);
    this.mUtilSize = new cc.Size(winSize.height / 6, winSize.height / 6);
    for (var i = 0; i < this.mTigerSpritesBatchCount; i++) {
      var path;
      if (i == 4)
        path = PHOTOPATH;
      else
        path = "./js/res/" + i + ".png";
      var batchNode = cc.SpriteBatchNode.create(path);
      this.mTigerBatchNodes[i] = batchNode;
      this.addChild(batchNode);
    }
    for (var i = 0; i < this.mTigerSpritesBatchCount + 3; i++) {
      var index = i % this.mTigerSpritesBatchCount;
      var batchNode = this.mTigerBatchNodes[index];
      var sprite = cc.Sprite.createWithTexture(batchNode.getTexture());
      sprite.setAnchorPoint(cc.p(0, 0));
      sprite.setPosition(cc.p(0, i * this.mUtilSize.height));
      sprite.setScale(this.mUtilSize.width / sprite.getContentSize().width,
          this.mUtilSize.height / sprite.getContentSize().height);
      batchNode.addChild(sprite);
    }
    this.setContentSize(new cc.Size(this.mUtilSize.width,
        this.mUtilSize.height * (this.mTigerSpritesBatchCount + 3)));
  }
});
var LineSprite = cc.Sprite.extend({
  pointx: null,
  pointy: null,

  ctor: function (pointx, pointy) {
    this._super();
    this.pointx = pointx;
    this.pointy = pointy;
  },
  draw: function () {
    cc.drawingUtil.setLineWidth(2);
    cc.drawingUtil.setDrawColor4B(0, 0, 0, 255);
    cc.drawingUtil.drawLine(this.pointx, this.pointy);

  }
});
var TigerLayer = cc.Layer.extend({
  mGameLayer: null,
  mIndexInGameLayer: 0,
  mScrollCounts: 0,
  mMaxScrollCounts: 0,
  mStopIndex: 0,
  mIsSlowDown: true,
  mSlowDown: false,
  mIsBegin: false,
  mIsOver: false,
  mSpeed: SPEED,
  mTigerNode: null,
  mStopPosition: null,
  // tigereffect :null,
  init: function () {
    this._super();
    this.mTigerNode = new TigerNode();
    this.mTigerNode.init();
    this.addChild(this.mTigerNode);
    this.mStopPosition = cc.p(0, 0);
    //tigereffect = cc.AudioEngine.getInstance();
    //tigereffect.setEffectsVolume(0.5);
    //tigereffect.preloadSound(scoreEffect);
  },
  update: function (delta) {
    if (!this.mIsBegin)
      return;
    if (!this.mIsSlowDown) {
      var curPos = this.mTigerNode.getPosition();
      curPos.y -= this.mSpeed * delta;

      if (curPos.y < -this.mTigerNode.mTigerSpritesBatchCount *
        this.mTigerNode.mUtilSize.height) {
        curPos.y += this.mTigerNode.mTigerSpritesBatchCount *
          this.mTigerNode.mUtilSize.height;
        this.mScrollCounts++;
        if (this.mScrollCounts >= this.mMaxScrollCounts) {
          curPos.y = -(this.mStopIndex - 1) * this.mTigerNode.mUtilSize.height;
          this.unschedule(this.update);
          this.reset();

        }
      }
      curPos = cc.p(curPos.x, curPos.y);
      this.mTigerNode.setPosition(curPos);

    } else {
      var curPos = this.mTigerNode.getPosition();
      curPos.y -= this.mSpeed * delta;
      if (curPos.y < -this.mTigerNode.mTigerSpritesBatchCount *
        this.mTigerNode.mUtilSize.height) {
        curPos.y += this.mTigerNode.mTigerSpritesBatchCount *
          this.mTigerNode.mUtilSize.height;
        this.mScrollCounts++;
        if (this.mScrollCounts >= this.mIndexInGameLayer * 5)
          this.mSpeed *= 0.9;
        if (this.mScrollCounts >= this.mMaxScrollCounts - 1) {
          this.mSlowDown = true;
        }
      }

      var preSpeed = this.mSpeed;
      if (this.mSlowDown) {
        //this.mSpeed = curPos.y - this.mStopPosition.y;
        curPos.y = this.mStopPosition.y
        if (this.mIndexInGameLayer != 2)
          tigereffect.playEffect(scoreEffect, false);
      }

      if ((this.mSlowDown && curPos.y - this.mStopPosition.y < 1) ||
        this.mSpeed < 1) {
        //this.mCanCalculate = true;
        this.unschedule(this.update);
        this.mGameLayer = this.getParent();
        if (this.mIndexInGameLayer == this.mGameLayer.mTigerLayerCount - 1) {

          this.mGameLayer.calculateScore();

        }
        curPos = this.mStopPosition;
        if (this.mIndexInGameLayer == 2) {
          tigereffect.stopAllEffects();
          //this.updateUserScore();
          EachBet = 0;
          if (mScore > TOPSCORE)
            TOPSCORE = mScore;

        }
        this.reset();
      }
      curPos = cc.p(curPos.x, curPos.y);
      this.mTigerNode.setPosition(curPos);
    }

  },
//    updateUserScore:function(){
//        $.ajax({
//            url:"/user_update_score?user_id="+userID+"&score="+mScore ,
//            type:"post",
//            timeout : 20000,
//            success:function(data){
//                console.log('updateUserScore success');
//            },
//            error:function(data) {
//                console.log('updateUserScore error');
//            }
//        });
//    },
  visit: function () {
    this._super();
  },

  reset: function () {
    this.mIsBegin = false;
    this.mIsOver = true;
    this.mSpeed = SPEED;
    this.mScrollCounts = 0;
    this.mSlowDown = false;
  },

  setStopIndex: function (index) {
    this.mStopIndex = index;
    if (this.mStopIndex - 1 < 1) {
      this.mStopIndex += this.mTigerNode.mTigerSpritesBatchCount;
    }
    this.mStopPosition = cc.p(this.mTigerNode.getPositionX(),
        -(this.mStopIndex - 1) * this.mTigerNode.mUtilSize.height);
  }
});

var ChangeBetMenu = cc.Layer.extend({
  mChaneBetMenus: [],
  mChangeBetValue: [10, 20, 50, 100, 500],
  init: function () {
    this._super();
    var winSize = cc.size(document.documentElement.clientWidth,
      document.documentElement.clientHeight);
    var utilSize = new cc.Size(winSize.height / 6, winSize.height / 6);
    var margin = winSize.width / 20;
    var changeBetItemSize = new cc.Size(winSize.width / 7, utilSize.height / 2);

    /* var tenItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "10", "font.fnt"), function (sender) {
     this.changeRet(tenItem, 10);
     }, this);
     var tenMenu = cc.Menu.create(tenItem);
     tenMenu.setPosition(cc.p(tenItem.getContentSize().width / 2,tenItem.getContentSize().height / 2));
     this.addChild(tenMenu);

     var twentyItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "20", "font.fnt"), function (sender) {
     this.changeRet(twentyItem, 20);
     }, this);*/
    var twentyMenu = cc.Menu.create(twentyItem);
    twentyMenu.setPosition(cc.p(changeBetItemSize.width + twentyItem.getContentSize().width / 2,
        twentyItem.getContentSize().height / 2));
    this.addChild(twentyMenu);

    var fiftyItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
      "50", "font.fnt"), function (sender) {
      this.changeRet(fiftyItem, 50);
    }, this);
    var fiftyMenu = cc.Menu.create(fiftyItem);
    fiftyMenu.setPosition(cc.p(2 * changeBetItemSize.width + fiftyItem.getContentSize().width / 2,
        fiftyItem.getContentSize().height / 2));
    this.addChild(fiftyMenu);

    var hundredItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
      "100", "font.fnt"), function (sender) {
      this.changeRet(hundredItem, 100);
    }, this);

    var hundredMenu = cc.Menu.create(hundredItem);
    hundredMenu.setPosition(cc.p(3 * changeBetItemSize.width + hundredItem.getContentSize().width / 2,
        hundredItem.getContentSize().height / 2));
    this.addChild(hundredMenu);
//        this.adjustChangeBetSize(hundredItem,3);

    var fiveHundredItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
      "500", "font.fnt"), function (sender) {
      this.changeRet(fiveHundredItem, 500);
    }, this);
    var fiveHundredMenu = cc.Menu.create(fiveHundredItem);
    fiveHundredMenu.setPosition(cc.p(4 * changeBetItemSize.width + fiveHundredItem.getContentSize().width / 2,
        fiveHundredItem.getContentSize().height / 2));
    fiveHundredItem.setScale(changeBetItemSize.width / fiveHundredItem.getContentSize().width,
        changeBetItemSize.height / fiveHundredItem.getContentSize().height);
    this.addChild(fiveHundredMenu);

  },

  adjustChangeBetSize: function (changeBetMenu, changeBetItem, index) {
    var winSize = cc.size(document.documentElement.clientWidth,
      document.documentElement.clientHeight);
    var utilSize = new cc.Size(winSize.height / 6, winSize.height / 6);
    var changeBetItemSize = new cc.Size(winSize.width / 7, utilSize.height / 2);

    changeBetItem.setPosition(cc.p(4 * changeBetItem.width + changeBetItem.getContentSize().width / 2,
        changeBetItem.getContentSize().height / 2));
    changeBetItem.setScale(changeBetItemSize.width / changeBetItem.getContentSize().width,
        changeBetItemSize.height / changeBetItem.getContentSize().height);
  }
});

var GameLayer = cc.LayerColor.extend({
  //TODO
  mTigerLayers: [],
  mTigerLayerCount: 3,
  // mScore: 100,
  mScoreDisplay: null,
  mBet: 5,//赌注
  mBetChange: 5,
  mBetDisplay: null,
  gameState: null,
  resultText: null,
  wxButton: null,
  wxMenu: null,
  EachBetDisplay: null,
  galleryMenu: null,
  galleryButton: null,
  downloadButton: null,
  downloadMenu: null,
  galleryMenu: null,
  windowsize: cc.size(document.documentElement.clientWidth,
    document.documentElement.clientHeight),
  // startEffect:null,
  // initMusic:null,
  resultLayer: null,
  ScoreInfoLayer: null,
  mHighestIndex: 0,
  init: function () {
    this._super(cc.c4b(0, 0, 0, 255));
    cc.TextureCache.getInstance().addImageAsync(PHOTOPATH, this, this.createGameScreen);
  },
  createGameScreen: function () {
    PHOTOTEXTURE = cc.TextureCache.getInstance().textureForKey(PHOTOPATH);
    var winSize = cc.size(document.documentElement.clientWidth,
      document.documentElement.clientHeight);
    var utilSize = new cc.Size(winSize.height / 6, winSize.height / 6);
    var margin = winSize.width / 20;
    /**------------------------
     *      BEGIN：
     * 创建老虎机节点的滚动层     *
     *--------------------------*/
    var midIndex = Math.floor(this.mTigerLayerCount / 2);
    for (var i = 0; i < this.mTigerLayerCount; i++) {
      var selfPointer = this;
      var layer = new TigerLayer();
      layer.init();
      layer.mGameLayer = selfPointer;
      layer.mIndexInGameLayer = i;
      layer.mMaxScrollCounts = i * 5 + 10;
      layer.setPosition(winSize.width / 2 - utilSize.width / 2 + (i - midIndex) * (utilSize.width + margin),
          winSize.height / 2);
      this.mTigerLayers[i] = layer;
      this.addChild(layer, MIDDLEGROUND);
    }
    /**------------------------
     *          END：
     * 创建老虎机节点的滚动层     *
     *--------------------------*/

    /**------------------------
     *      BEGIN：
     * 创建老虎机背景图片     *
     *--------------------------*/
    var background = cc.Sprite.create(s_background);
    background.setAnchorPoint(cc.p(0, 0));
    background.setPosition(cc.p(0, this.mTigerLayers[0].getPositionY() + utilSize.height / 2 - 1));
    background.setScale(winSize.width / background.getContentSize().width,
        2 * utilSize.height / background.getContentSize().height);
    this.addChild(background, BACKGROUND);
    /**------------------------
     *      END：
     * 创建老虎机背景图片     *
     *--------------------------*/


    /**------------------------
     *      BEGIN：
     * 加入老虎机表面    *
     *--------------------------*/
    var upsurface = cc.Sprite.create(s_upsurface);
    var upsurfaceSize = upsurface.getContentSize();
    upsurface.setAnchorPoint(cc.p(0, 0));
    upsurface.setPosition(cc.p(0, winSize.height - utilSize.height / 2));
    upsurface.setScale(winSize.width / upsurfaceSize.width,
        (utilSize.height / 2) / (upsurfaceSize.height));
    this.addChild(upsurface, FOREGROUND);

    var downsurface = cc.Sprite.create(s_downsurface);
    var downsurfaceSize = downsurface.getContentSize();
    downsurface.setAnchorPoint(cc.p(0, 0));
    downsurface.setPosition(cc.p(0, winSize.height / 2));
    downsurface.setScale(winSize.width / downsurfaceSize.width,
        (utilSize.height * 0.5) / downsurfaceSize.height);
    this.addChild(downsurface, FOREGROUND);

    var surface = cc.Sprite.create(s_surface);
    var surfaceSize = surface.getBoundingBox().size;
    surface.setAnchorPoint(cc.p(0, 0));
    surface.setPosition(cc.p(0, 0));
    surface.setScale(winSize.width / surfaceSize.width,
        (winSize.height * 0.52) / surfaceSize.height);
    this.addChild(surface, FOREGROUND);
    /**------------------------
     *          END：
     * 加入老虎机表面     *
     *--------------------------*/

    /**------------------------
     *      BEGIN：
     * 创建开始游戏按钮     *
     *--------------------------*/
    var startGameMenu = cc.MenuItemImage.create(s_StartNormal,
      s_StartSelected, this.startGame, this);
    startGameMenu.setScale(utilSize.width / startGameMenu.getBoundingBox().getWidth() * 0.5,
        utilSize.height / startGameMenu.getBoundingBox().getHeight() * 0.5);

    var startMenu = cc.Menu.create(startGameMenu);
    startMenu.setPosition(cc.p(winSize.width * 0.5, winSize.height * 0.4));
    this.addChild(startMenu, FOREGROUND);


    this.EachBetDisplay = cc.LabelTTF.create("此局得分:" + EachBet, 16);
    this.EachBetDisplay.setPosition(cc.p(winSize.width * 0.2, winSize.height * 0.5));
//        this.mScoreDisplay.setScale(utilSize.width  / this.mScoreDisplay.getBoundingBox().width,
//            utilSize.height * 0.5 / this.mScoreDisplay.getBoundingBox().height);
    // console.log(EachBet+"---");
    this.EachBetDisplay.setScale(1, 1);
    this.addChild(this.EachBetDisplay, FOREGROUND);
    /**------------------------
     *      END：
     * 创建开始游戏按钮           *
     *--------------------------*/
    /**
     *  BEGIN
     * 游戏计分规则
     */
    var ScoreInfoMenu = cc.MenuItemImage.create(back_down,
      back_up, this.gameComplete, this);
    ScoreInfoMenu.setScale(utilSize.width / ScoreInfoMenu.getBoundingBox().getWidth() * 0.5,
        utilSize.height / ScoreInfoMenu.getBoundingBox().getHeight() * 0.5);

    var ScoreInfoMenu = cc.Menu.create(ScoreInfoMenu);
    ScoreInfoMenu.setPosition(cc.p(winSize.width * 0.5, winSize.height * 0.4 - 150));
    this.addChild(ScoreInfoMenu, FOREGROUND);

    /**
     *  END
     * 游戏计分规则
     */
    /**------------------------
     *      BEGIN：
     * 创建分数标签               *
     *--------------------------*/
      // this.mScoreDisplay = cc.LabelBMFont.create("Score:" + mScore, s_font_fnt,
      //     winSize.width * 0.3, cc.TEXT_ALIGNMENT_LEFT);
    this.mScoreDisplay = cc.LabelTTF.create("积分:" + mScore, 16);
    this.mScoreDisplay.setPosition(winSize.width * 0.5, winSize.height * 0.95);
//        this.mScoreDisplay.setScale(utilSize.width  / this.mScoreDisplay.getBoundingBox().width,
//            utilSize.height * 0.5 / this.mScoreDisplay.getBoundingBox().height);
    this.mScoreDisplay.setScale(1.5, 1.5);
    this.addChild(this.mScoreDisplay, FOREGROUND);


    var line1 = cc.Sprite.create(s_line);
    line1.setPosition(winSize.width * 0.02, winSize.height * 0.75);
    line1.setScale(1, 1);
    this.addChild(line1, FOREGROUND);

    var line2 = cc.Sprite.create(s_line);
    line2.setPosition(winSize.width * 0.98, winSize.height * 0.75);
    line2.setScale(1, 1);
    this.addChild(line2, FOREGROUND);
    var line = new LineSprite(cc.p(winSize.width * 0.02, winSize.height * 0.75), cc.p(winSize.width * 0.98, winSize.height * 0.75));
    this.addChild(line, FOREGROUND);


    /* var resetItem = cc.MenuItemImage.create(refresh_down,refresh_up, function (sender) {
     mScore = 100;
     this.mScoreDisplay.setString("积分:" + mScore);
     for(var i = 0; i < this.mTigerLayerCount; i++){
     var layer = this.mTigerLayers[i];
     layer.reset();
     layer.unschedule(layer.update);
     layer.mTigerNode.setPosition(0,0);
     }
     }, this);
     resetItem.setScale(0.5);
     var resetMenu = cc.Menu.create(resetItem);
     resetMenu.setPosition(winSize.width * 0.8, winSize.height * 0.95);
     this.addChild(resetMenu, FOREGROUND);*/

    /* var returnItem = cc.MenuItemImage.create(return_up,return_down, function (sender) {
     history.back();
     }, this);
     returnItem.setScale(0.95);
     var returnMenu = cc.Menu.create(returnItem);
     returnMenu.setPosition(winSize.width * 0.2, winSize.height * 0.95);
     this.addChild(returnMenu, FOREGROUND);    */
    /**------------------------
     *      END：
     * 创建分数标签     *
     *--------------------------*/

    /**------------------------
     *      BEGIN：
     * 创建赌注标签     *
     *--------------------------*/
//        this.mBetDisplay = cc.LabelBMFont.create("Bet:" + this.mBet, s_font_fnt,
//            winSize.width * 0.3, cc.TEXT_ALIGNMENT_LEFT);
    this.mBetDisplay = cc.LabelTTF.create("下注:" + this.mBet, 16);
    this.mBetDisplay.setScale(1.5, 1.5);
    this.mBetDisplay.setPosition(cc.p(winSize.width * 0.5, winSize.height * 0.25))
    this.addChild(this.mBetDisplay, FOREGROUND);
    /**------------------------
     *      END：
     * 创建赌注标签     *
     *--------------------------*/

    /**------------------------
     *      BEGIN：
     * 创建改变赌注按钮     *
     *--------------------------*/
    var plusBetItem, plusBetMenu, minusBetItem, minusBetMenu;
    plusBetItem = cc.MenuItemImage.create(s_plus_normal,
      s_plus_pressed, function () {
        if (!this.canStartGame()) {
          return;
        }
        tigereffect.playEffect(scoreEffect, false);
        if (this.mBet + this.mBetChange > mScore)
          this.mBet = mScore;
        else
          this.mBet += this.mBetChange;
        if (this.mBet > 50)
          this.mBet = 5;
        this.mBetDisplay.setString("下注:" + this.mBet);
        this.adjustRetChangePos(plusBetMenu, plusBetItem, minusBetMenu, minusBetItem, margin);
      }, this);
    plusBetItem.setScale(utilSize.width / 1.5 / plusBetItem.getBoundingBox().getWidth(),
        utilSize.height / 2 / plusBetItem.getBoundingBox().getHeight());
    plusBetMenu = cc.Menu.create(plusBetItem);

    this.addChild(plusBetMenu, FOREGROUND);

    minusBetItem = cc.MenuItemImage.create(s_minus_normal,
      s_minus_pressed, function () {
        if (!this.canStartGame()) {
          return;
        }
        tigereffect.playEffect(scoreEffect, false);
        if (this.mBet > this.mBetChange)
          this.mBet -= this.mBetChange;
        else
          this.mBet = 50;
        this.mBetDisplay.setString("下注:" + this.mBet);
        this.adjustRetChangePos(plusBetMenu, plusBetItem, minusBetMenu, minusBetItem, margin);
      }, this);
    minusBetItem.setScale(utilSize.width / 1.5 / minusBetItem.getBoundingBox().getWidth(),
        utilSize.height / 2 / minusBetItem.getBoundingBox().getHeight());
    minusBetMenu = cc.Menu.create(minusBetItem);
    this.addChild(minusBetMenu, FOREGROUND);
    this.adjustRetChangePos(plusBetMenu, plusBetItem, minusBetMenu, minusBetItem, margin);

    var changeBetMenu = cc.Menu.create();
    changeBetMenu.setPosition(cc.p(winSize.width / 2, winSize.height * 0.15));
//        this.addChild(changeBetMenu, FOREGROUND);

    /* var tenItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "10", s_font_fnt), function (sender) {
     this.changeRet(tenItem, 10);
     }, this);
     changeBetMenu.addChild(tenItem);

     var twentyItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "20", s_font_fnt), function (sender) {
     this.changeRet(twentyItem, 20);
     }, this);
     changeBetMenu.addChild(twentyItem);

     var fiftyItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "50", s_font_fnt), function (sender) {
     this.changeRet(fiftyItem, 50);
     }, this);
     changeBetMenu.addChild(fiftyItem);

     var hundredItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "100", s_font_fnt), function (sender) {
     this.changeRet(hundredItem, 100);
     }, this);
     changeBetMenu.addChild(hundredItem);

     var fiveHundredItem = cc.MenuItemLabel.create(cc.LabelBMFont.create(
     "500", s_font_fnt), function (sender) {
     this.changeRet(fiveHundredItem, 500);
     }, this);*/
    // changeBetMenu.addChild(fiveHundredItem);

    //   changeBetMenu.alignItemsHorizontally();
    /**------------------------
     *      END：
     * 创建改变赌注按钮     *
     *--------------------------*/
  },
  ScoreInfo: function () {
    if (!this.canStartGame()) {
      return;
    }
    var size = cc.size(document.documentElement.clientWidth,
      document.documentElement.clientHeight);
    this.ScoreInfoLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 252), size.width, size.height);
    var resultSprite = cc.Sprite.create(s_scoreinfo);
    resultSprite.setAnchorPoint(cc.p(0, 0));
    var scaleParam = (size.width / 6 * 4) / resultSprite.getContentSize().width;
    resultSprite.setScale(scaleParam, scaleParam);
    var realWidth = resultSprite.getContentSize().width * scaleParam;
    var realHeight = resultSprite.getContentSize().height * scaleParam;
    resultSprite.setPosition(cc.p(size.width / 6, size.height - realHeight - 10));
    var backBtu = cc.MenuItemImage.create(
      "./js/res/gallery_normal.png",
      "./js/res/gallery_pressed.png",
      function () {
        this.ScoreInfoLayer.setVisible(false);
      }, this);
    var backMenu = cc.Menu.create(backBtu);
    backMenu.setAnchorPoint(cc.p(0, 0));
    backMenu.setPosition(cc.p(size.width / 2, size.height - realHeight - 50));
    this.ScoreInfoLayer.addChild(resultSprite);
    this.ScoreInfoLayer.addChild(backMenu);
    this.addChild(this.ScoreInfoLayer, 5000);
  },

  adjustRetChangePos: function (plusBetMenu, plusBetItem, minusBetMenu, minusBetItem, margin) {
    minusBetMenu.setPosition(cc.p(
        this.mBetDisplay.getPositionX() - this.mBetDisplay.getBoundingBox().getWidth() * 0.5 - minusBetItem.getBoundingBox().getWidth() * 0.5 - margin,
      this.mBetDisplay.getPositionY()));
    plusBetMenu.setPosition(cc.p(
        this.mBetDisplay.getPositionX() + this.mBetDisplay.getBoundingBox().getWidth() * 0.5 + plusBetItem.getBoundingBox().getWidth() * 0.5 + margin,
      this.mBetDisplay.getPositionY()));
  },
  changeRet: function (retChangeItem, retChange) {
    this.mBetChange = retChange;
    this.removeAllLayerColor();
    var layer = cc.LayerColor.create(cc.c4b(255, 0, 255, 100),
      retChangeItem.getBoundingBox().getWidth(),
      retChangeItem.getBoundingBox().getHeight());
    layer.setPosition(cc.p(retChangeItem.getParent().getPositionX() + retChangeItem.getPositionX(),
        retChangeItem.getParent().getPositionY() + retChangeItem.getPositionY()));
    layer.setTag(retChange);
    layer.ignoreAnchorPointForPosition(false);
    layer.setAnchorPoint(cc.p(0.5, 0.5));
    this.addChild(layer, FOREGROUND);
  },
  adjustChangeRetSize: function (retChangeItem, normalSize) {
    retChangeItem.setScaleX(normalSize.width * 0.5 / retChangeItem.getContentSize().width);
    retChangeItem.setScaleY(normalSize.height * 0.5 / retChangeItem.getContentSize().height);
  },
  removeAllLayerColor: function () {
    if (this.getChildByTag(10))
      this.removeChildByTag(10);
    if (this.getChildByTag(20))
      this.removeChildByTag(20);
    if (this.getChildByTag(50))
      this.removeChildByTag(50);
    if (this.getChildByTag(100))
      this.removeChildByTag(100);
    if (this.getChildByTag(500))
      this.removeChildByTag(500);
  },
  update: function (delta) {
    console.log("ten update");
  },
  //fTODO
  startGame: function () {
    //cc.AudioEngine.getInstance().playEffect("./js/res/1.mp3",false);
    //this.initMusic.stopMusic(true);
    if (!this.canStartGame()) {
      return;
    }
    this.EachBetDisplay.setString("此局得分:" + EachBet);
    if (!this.canStartGame() || mScore <= 0) {
      return;
    }
    tigereffect.playEffect(winEffect, true);

    if (mScore < this.mBet) {
      this.mBet = mScore;
      this.mBetDisplay.setString("下注:" + this.mBet);
    }
    var layer;
    mScore -= this.mBet;
    this.mScoreDisplay.setString("积分:" + mScore);
    layer = this.mTigerLayers;
    $.ajax({
      url: "/bandits_getResult",
      type: "post",
      data: {bet: this.mBet, score: mScore, user_id: userID},
      timeout: 20000,
      success: function (data) {
        console.log(data);
        for (var i = 0; i < 3; i++) {
          layer[i].setStopIndex(data[i]);
          layer[i].mIsBegin = true;
          layer[i].mIsOver = false;
          layer[i].schedule(layer[i].update);
        }
        mScore = data[3];
        EachBet = data[4]
      },
      error: function (data) {
        console.log('bandits_getResult error');
      }
    });
    //TODO
//       var w = [0,1,1,1,2,2,3,3,4];
//        var whichOne = Math.floor(Math.random() * 9);
//        var temp = [];
//        temp[0] = w[whichOne];
//        layer = this.mTigerLayers[0];
//        var Other;
//        for (var i = 0; i < this.mTigerLayerCount; i++) {
//            layer = this.mTigerLayers[i];
//            if(i == 0){
//            if (!layer.mIsBegin) {
//                layer.setStopIndex( w[whichOne]);
//                layer.mIsBegin = true;
//                layer.mIsOver = false;
//                layer.schedule(layer.update);
//            }
//            }else{
//                while(1){
//                    Other  = Math.floor(Math.random() * layer.mTigerNode.mTigerSpritesBatchCount);
//                    if(Other != whichOne) {
//                        temp[1] = Other;
//                        break;
//                    }
//                }
//               var probability = Math.floor(Math.random() * 2);
//                layer.setStopIndex(temp[probability]);
//                layer.mIsBegin = true;
//                layer.mIsOver = false;
//                layer.schedule(layer.update);
//            }
//        }
    //TODO
  },
  canStartGame: function () {
    var layer;
    for (var i = 0; i < this.mTigerLayerCount; i++) {
      layer = this.mTigerLayers[i];
      if (layer.mIsBegin) {

        return false;
      }
    }
    return true;
  },
  calculateScore: function () {
    /* var layer0 = this.mTigerLayers[0];
     var layer1 = this.mTigerLayers[1];
     var layer2 = this.mTigerLayers[2];

     if (layer0.mStopIndex == layer1.mStopIndex && layer1.mStopIndex == layer2.mStopIndex) {
     if(layer0.mStopIndex  % layer0.mTigerNode.mTigerSpritesBatchCount != 4){
     EachBet = (layer0.mStopIndex % layer0.mTigerNode.mTigerSpritesBatchCount + 1)
     * this.mBet;
     mScore += EachBet;
     } else {
     EachBet = 6 * this.mBet;
     mScore += EachBet;
     }

     } else if((layer0.mStopIndex == 4 && layer1.mStopIndex == 4) ||
     (layer0.mStopIndex == 4 && layer2.mStopIndex == 4) ||
     (layer1.mStopIndex == 4 && layer2.mStopIndex == 4)) {
     EachBet = 2 * this.mBet;
     mScore += EachBet;
     }
     /*else if(layer0.mStopIndex == 4|| layer1.mStopIndex == 4 || layer2.mStopIndex == 4){
     EachBet = 2 * this.mBet;
     mScore += EachBet;
     } */

    var score = "积分:" + mScore;
    this.mScoreDisplay.setString(score);
    this.EachBetDisplay.setString("此局得分:" + EachBet);
    //TODO
    if (mScore <= 0) {
      this.gameComplete();
    }

  },
  //更新数据
  updateScore: function () {

    if (0 == playerStatus) {
      $.ajax({
        url: "/bandits_update_score_only",
        type: "post",
        data: {bandits_id: bandits.id, score: TOPSCORE, nick_name: nickName},
        timeout: 20000,
        success: function (data) {
          console.log('updateScore only success');
        },
        error: function (data) {
          console.log('updateScore only error');
        }
      });
    } else {
      $.ajax({
        url: "/bandits_update",
        type: "post",
        data: {bandits_id: bandits.id, score: TOPSCORE, nick_name: nickName, player_id: playerID,
          player_avatar: avatarID},
        timeout: 20000,
        success: function (data) {
          console.log('updateScore success');
        },
        error: function (data) {
          console.log('updateScore error');
        }
      });
    }
  },
  gameComplete: function () {
    if (!this.canStartGame()) {
      return;
    }
    console.log('You completed this game !!');
    TOPSCORE = mScore - userScore;
    var name = "";
    if (0 == playerStatus) {
      do {
        name = prompt("请输入您的名字(不超过5个字符)\n关注我们的公众账号创建自己的图库)", "");
      } while (name.length > 5 || name.length <= 0 ||
        validateIllegalChar('名字', name) == false);
      nickName = name;
    }


    var size = cc.size(document.documentElement.clientWidth,
      document.documentElement.clientHeight);
    this.resultLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 252), size.width, size.height);
    // process this image
    // phase 1, for those which are in shape of square
    var resultSprite = cc.Sprite.create(editorImgPath);
    resultSprite.setAnchorPoint(cc.p(0, 0));
    var scaleParam = (size.width / 6 * 4) / resultSprite.getContentSize().width;
    var realWidth = resultSprite.getContentSize().width * scaleParam;
    console.log('result sprite scale = ' + scaleParam);
    resultSprite.setPosition(cc.p(size.width / 6, size.height - realWidth - 10));
    var str;
    if (TOPSCORE > 0)
      str = bandits.gameName + ' Game Over! 您本局赢得:' + TOPSCORE + ' 分';
    else {
      str = bandits.gameName + ' Game Over! 您本局输掉:' + (-TOPSCORE) + ' 分';
      TOPSCORE = 0;
    }
    str += "\r\n请点击右上角关注我们的公众账号";
    this.updateScore();
    this.resultText = cc.LabelTTF.create(str, FONT_TYPE, 16);
    this.resultText.setPosition(cc.p(size.width / 2, resultSprite.getPosition().y - 20));
    resultSprite.setScale(scaleParam, scaleParam);
    // generate post-menus
    // download button
    this.downloadButton = cc.MenuItemImage.create(
      "./js/res/download_normal.png",
      "./js/res/download_pressed.png",
      function () {
        console.log('download the image');
        window.location = '/picture_download?blob_id=' + bandits.fullImageBlobId + '&picture_name=' +
          bandits.gameName;
      }, this);

    this.downloadMenu = cc.Menu.create(this.downloadButton);
    this.downloadMenu.setPosition(cc.PointZero());
    this.downloadButton.setPosition(cc.p(size.width / 6 * 5,
        this.resultText.getPosition().y - 60));

    /*
     // wx button
     this.wxButton = cc.MenuItemImage.create(
     "./js/res/wx_normal.png",
     "./js/res/wx_pressed.png",
     function () {
     console.log('go to wx platform');

     },this);

     this.wxMenu = cc.Menu.create(this.wxButton);
     this.wxMenu.setPosition(cc.PointZero());
     this.wxButton.setPosition(cc.p(size.width / 6 * 3,
     this.resultText.getPosition().y - 60));
     */

    // gallery button
    this.galleryButton = cc.MenuItemImage.create(
      "./js/res/gallery_normal.png",
      "./js/res/gallery_pressed.png",
      function () {
        console.log('to back to gallery');
        window.location = "../game_list.html?game_id=0&game_type=2&user_id=" + userID;
      }, this);

    this.galleryMenu = cc.Menu.create(this.galleryButton);
    this.galleryMenu.setPosition(cc.PointZero());
    this.galleryButton.setPosition(cc.p(size.width / 6,
        this.resultText.getPosition().y - 60));

    this.resultLayer.addChild(this.downloadMenu);

    /*
     if(userType == 0) {
     this.resultLayer.addChild(this.wxMenu);
     } else if(userType == 1) {
     this.resultLayer.addChild(this.updateMenu);
     }
     */
    //this.resultLayer.addChild(this.wxMenu);
    // update score automatically

    //this.updateScore(this);
    this.resultLayer.addChild(this.galleryMenu);
    this.resultLayer.addChild(resultSprite);
    this.resultLayer.addChild(this.resultText);
    this.addChild(this.resultLayer, 5000);

    this.gameState = STATE_FINISHED;
  },


  initResourceCallBack: function (tmp) {
    console.log(tmp);
  },
  // a selector callback
  menuCloseCallback: function (sender) {
    cc.Director.getInstance().end();
  },
  onTouchesBegan: function (touches, event) {
    this.isMouseDown = true;
  },
  onTouchesMoved: function (touches, event) {
    if (this.isMouseDown) {
      if (touches) {
        //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
      }
    }
  },
  onTouchesEnded: function (touches, event) {
    this.isMouseDown = false;
  },
  onTouchesCancelled: function (touches, event) {
    console.log("onTouchesCancelled");
  }
});

var TigerGame = cc.Scene.extend({
  onEnter: function () {
    this._super();
    var layer = new GameLayer();
    layer.init();
    this.addChild(layer);
  }
});

