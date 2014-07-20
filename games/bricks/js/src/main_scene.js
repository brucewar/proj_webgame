// Constants
var STATE_PREPARE = 0;
var STATE_PLAYING = 1;
var STATE_FINISHED = 2;

var R0W_COUNT = 3;
var COL_COUNT = 3;

var DEFAULT_BLANK_ROW = 0;
var DEFAULT_BLANK_COL = 2;

// set 1px margin between bricks
var MARGIN = 1;

// font
var FONT_TYPE = 'Futura-CondensedExtraBold';

// blank brick default ID
var DEFAULT_BLANK_BRICK_ID = 2;

// local vars
var isMoving = false;
var stepUsed = 0;
var timeUsed = 0;
var topStepUsed = 0;
var topTimePlayer = 0;

// Game instance
var BricksEditor = cc.Layer.extend({
  // game state
  gameState: STATE_PREPARE,

  // bricks
  bricks: [],

  // background
  background: null,

  // accessory sprites
  lockIcon: null,

  // white space
  blankBrick: null,

  // core object
  brickModel: null,
  img: null,
  fullImg: null,
  fillerBatchNode: null,

  // core properties
  squareWidth: null,
  squareUnitWidth: null,
  squareLeft: null,
  squareTop: null,
  imgWidth: null,
  imgHeight: null,
  pieceWidth: null,
  pieceHeight: null,
  isAction: null,
  timeStampStart: null,

  // control variables
  isMouseDown: false,

  // menus
  shuffleMenu: null,
  activeMenu: null,
  activeButton: null,
  shuffleButton: null,
  shuffleMenuText: null,
  activeMenuText: null,
  backMenu: null,
  backButton: null,

  // layer displaying the result
  resultLayer: null,
  resultText: null,
  resultSprite: null,
  downloadButton: null,
  wxButton: null,
  galleryButton: null,
  updateButton: null,
  downloadMenu: null,
  wxMenu: null,
  scoreText: null,
  galleryMenu: null,
  updateMenu: null,

  // texts
  stepText: null,
  timeText: null,

  init: function () {
    var selfPointer = this;
    //////////////////////////////
    // 1. super init first
    this._super();
    /////////////////////////////
    // 2. add a menu item with "X" image, which is clicked to quit the program
    //    you may modify it.

    // ask director the window size
    //var size = cc.Director.getInstance().getWinSize();
    size = cc.size(document.documentElement.clientWidth, document.documentElement.clientHeight);
    console.log('window width = ' + size.width + ' , window height = ' + size.height);

    this.setTouchEnabled(true);
    /////////////////////////////
    // 3. add your codes below...

    // initialize background
    var bgWScale;
    var bgHScale;
    bgWScale = size.width / 360;
    bgHScale = size.height / 540;
    this.background = cc.Sprite.create(s_BackGround);
    this.background.setScaleX(bgWScale);
    this.background.setScaleY(bgHScale);
    this.background.setAnchorPoint(0.5, 0.5);
    this.background.setPosition(cc.p(0, 0));
    this.addChild(this.background, 0);
    /*
     this.background = cc.Sprite.create('./js/res/bricks_bg.png');
     this.background.setScale(1);
     this.background.setPosition(size.width / 2, size.height / 2);
     this.addChild(this.background);
     */

    // calculate brick square size and border
    // only consider portrait image layout
    this.squareWidth = Math.floor(size.width / 6) * 4 + MARGIN * 3;
    this.squareUnitWidth = Math.floor(size.width / 6);
    this.squareLeft = Math.floor(size.width / 6) - MARGIN * 3;
    this.squareTop = Math.floor(size.height / 4) * 3;

    // generate back menu
    this.backButton = cc.MenuItemImage.create(
      "./js/res/back_normal.png",
      "./js/res/back_pressed.png",
      function () {
        history.back();
      }, this);

    this.backMenu = cc.Menu.create(this.backButton);
    this.backMenu.setPosition(cc.PointZero());
    this.addChild(this.backMenu, 2000);
    this.backButton.setPosition(size.width / 14,
        size.height / 14 * 13);
    this.backButton.setScale(0.5);

    // add dash board for player mode
    if (userView == 1) {
      // add step count
      this.stepText = cc.LabelTTF.create('STEPS:' + stepUsed, FONT_TYPE, 24);
      this.addChild(this.stepText);
      this.stepText.setColor(cc.c3b(128, 200, 32));
      this.stepText.setPosition(cc.p(size.width / 4, 20));

      this.timeText = cc.LabelTTF.create('TIME:' + this.timeUsed, FONT_TYPE, 24);
      this.timeText.setColor(cc.c3b(128, 200, 32));
      this.addChild(this.timeText);
      this.timeText.setPosition(cc.p(size.width / 4 * 3, 20));
    }

    this.gameState = STATE_PREPARE;
    this.resetGame();

    // start scheduler
    this.scheduleUpdate();
  },

  resetGame: function () {
    this.isAction = false;
    isMoving = false;
    stepUsed = 0;
    timeUsed = 0;

    // initialize menus
    this.removeChild(this.shuffleMenu);
    this.removeChild(this.shuffleMenuText);
    this.removeChild(this.activeMenu);
    this.removeChild(this.activeMenuText);
    this.removeChild(this.lockIcon);

    console.log('pic locked in editor = ' + picLocked);
    if (('true' == picLocked || true == picLocked) && 0 == userView) {
      this.shuffleButton = cc.MenuItemImage.create(
        "./js/res/play_normal.png",
        "./js/res/play_pressed.png",
        function () {
          this.shuffleBricksUI();
          console.log('shuffle bricks');
        }, this);

      this.shuffleMenu = cc.Menu.create(this.shuffleButton);
      this.shuffleMenu.setPosition(cc.PointZero());
      this.addChild(this.shuffleMenu, 1);
      this.shuffleButton.setPosition(this.squareLeft + this.squareWidth - this.squareUnitWidth / 2,
          this.squareTop - 3 * (this.squareUnitWidth / 2 + MARGIN));
      this.shuffleButton.setScale(0.6);

      this.shuffleMenuText = cc.LabelTTF.create("SHUFFLE", FONT_TYPE, 10);
      this.addChild(this.shuffleMenuText);
      this.shuffleMenuText.setPosition(this.shuffleButton.getPosition().x, this.shuffleButton.getPosition().y - 25)
    }

    var activeButtonNormalTexture;
    var activeButtonPressedTexture;
    if ((('true' == picLocked || true == picLocked) && userView == 0) ||
      (('false' == picLocked || false == picLocked) && userView == 1 && this.gameState != STATE_PLAYING)) {
      activeButtonNormalTexture = "./js/res/power_normal.png";
      activeButtonPressedTexture = "./js/res/power_pressed.png";
    } else {
      activeButtonNormalTexture = "./js/res/power_highlighted.png";
      activeButtonPressedTexture = "./js/res/power_highlighted.png";
    }
    this.activeButton = cc.MenuItemImage.create(
      activeButtonNormalTexture,
      activeButtonPressedTexture,
      function () {
        if (('true' == picLocked || true == picLocked) && 0 == userView) {
          // for owner, he can save this picture
          console.log('active image');
          isMoving = true;
          this.createBricksGame(this);
        } else if (('false' == picLocked || false == picLocked) && 1 == userView && this.gameState != STATE_PLAYING) {
          // for player, he can play with this picture
          // START PLAYING !
          if (null != bricksID && '' != bricksID) {
            if (this.gameState == STATE_PREPARE) {
              this.startPlaying();
            }
          } else {
            console.log('picture is not selected');
          }
        } else {
          console.log('this picture is locked for player or unlocked for owner :)');
        }
      }, this);

    this.activeMenu = cc.Menu.create(this.activeButton);
    this.activeMenu.setPosition(cc.PointZero());
    this.addChild(this.activeMenu, 1);
    this.activeButton.setPosition(size.width / 2, this.squareTop - this.squareWidth / 2 - 40);

    var activeMenuText = "";
    if (userView == 0) {
      console.log('judge picture lock state in author view, piclocked = ' + picLocked);
      if (true == picLocked || 'true' == picLocked) {
        activeMenuText = "CREAT!";
      } else {
        activeMenuText = "CREATED!";
      }
    } else {
      console.log('judge picture lock state in player view');
      if ('false' == picLocked || false == picLocked) {
        switch (parseInt(this.gameState)) {
          case STATE_PREPARE:
            activeMenuText = 'START';
            break;
          case STATE_PLAYING:
            activeMenuText = 'PLAYING...';
            break;
          case STATE_FINISHED:
            activeMenuText = 'COMPLETED!';
            break;
          default:
            console.log('error state');
            activeMenuText = 'ERROR...';
            break;
        }
      } else {
        console.log('game playing is not allowed');
        activeMenuText = 'Error...';
      }
    }
    this.activeMenuText = cc.LabelTTF.create(activeMenuText, FONT_TYPE, 16);
    this.addChild(this.activeMenuText);
    this.activeMenuText.setPosition(size.width / 2, this.squareTop - this.squareWidth / 2 - 80);

    this.refreshUIRecord();

    // initialize lock icon
    if ('true' == picLocked || true == picLocked) {
      this.lockIcon = cc.Sprite.create('./js/res/locked.png');
      this.lockIcon.setScale(this.squareUnitWidth / 2 / this.lockIcon.getContentSize().width);
      this.lockIcon.setPosition(this.squareLeft + this.squareWidth - this.squareUnitWidth / 2, this.squareTop - this.squareUnitWidth / 2 - MARGIN);
      this.addChild(this.lockIcon, 2000);
    }

    if (null == editorImgPath || '' == editorImgPath) {
      console.log('get default image');
      editorImgPath = "./js/res/add.png";
    } else {
      console.log('current img path = ' + editorImgPath);
    }

    // generate user matrix if it is null
    if (null == userMatrix || '' == userMatrix) {
      // if user matrix is not determined, generate a default one
      userMatrix = [0, 1, -1, 3, 4, 5, 6, 7, 8];
    } else {
      console.log('user matrix =' + userMatrix);
    }
    if (null == blankX) {
      blankX = DEFAULT_BLANK_ROW;
    }

    if (null == blankY) {
      blankY = DEFAULT_BLANK_COL;
    }

    // generate brick model
    this.brickModel = new BrickModel(R0W_COUNT, COL_COUNT, 2, blankX, blankY, userMatrix);
    var img = cc.TextureCache.getInstance().addImageAsync(editorImgPath, this, this.imageLoadedCallback);
    var fullImg = cc.TextureCache.getInstance().addImageAsync(fullImgPath, this, this.fullImageLoadedCallback);
  },

  fullImageLoadedCallback: function (object) {
    this.fullImg = cc.TextureCache.getInstance().textureForKey(fullImgPath);
    this.resultSprite = cc.Sprite.create(fullImgPath);
  },

  // callback function of init phase, would be invoked when init is done
  imageLoadedCallback: function (object) {
    this.img = cc.TextureCache.getInstance().textureForKey(editorImgPath);
    var xCount = R0W_COUNT;
    var yCount = COL_COUNT;

    // clear bricks for last time
    for (var i = 0; i < this.bricks.length; i++) {
      this.removeChild(this.bricks[i]);
    }
    this.bricks.length = 0;

    // prepare a 4 * 3 unit-sized square
    this.pieceWidth = this.squareUnitWidth;
    this.pieceHeight = this.squareUnitWidth;
    console.log(editorImgPath);
    this.tempSprite = cc.Sprite.create(editorImgPath);
    //console.log("donwload image path = " + downloadImgPath);
    //this.resultSprite = cc.Sprite.create(downloadImgPath);
    this.imgWidth = this.tempSprite.getContentSize().width;
    this.imgHeight = this.tempSprite.getContentSize().height;

    console.log('image width = ' + this.imgWidth + ', image height = ' + this.imgHeight);

    // image util is used to divide images
    var imgUtilWidth = this.imgWidth / xCount;
    var imgUtilHeight = this.imgHeight / yCount;

    var batchNode = cc.SpriteBatchNode.create(s_Frame9);
    var t_sprite = cc.Sprite.create(s_Frame9);
    var frame9Width = t_sprite.getContentSize().width;
    var frame9Height = t_sprite.getContentSize().height;
    var test_sprite = cc.Scale9Sprite.create();
    test_sprite.updateWithBatchNode(batchNode, cc.rect(0, 0, frame9Width, frame9Height), false, cc.rect(frame9Width / 3, frame9Height / 3, frame9Width / 3, frame9Height / 3));
    test_sprite.setContentSize(cc.size(this.squareUnitWidth * 4 + MARGIN * 3 + frame9Width / 3 * 2, this.squareUnitWidth * 3 + MARGIN * 2 + frame9Height / 3 * 2));
    test_sprite.setPosition(cc.p(this.squareLeft - frame9Width / 3, this.squareTop + frame9Height / 3 + this.squareUnitWidth));
    test_sprite.setAnchorPoint(cc.p(0, 1));
    this.addChild(test_sprite, 100);

    console.log('util width = ' + imgUtilWidth + ', util height = ' + imgUtilHeight);

    for (var i = 0; i < xCount * yCount; i++) {
      var x = i % xCount;
      var y = Math.floor(i / xCount);
      // position of brick
      var posX;
      var posY;
      // position of image piece
      var imgX;
      var imgY;

      // get brick index in order, from user matrix
      /*
       * brick IDs:
       * [0][1][2]
       * [3][4][5]
       * [6][7][8]
       */
      //var userDeterminedBrickId = userMatrix[y][x];
      var userDeterminedBrickId = userMatrix[i];
      //console.log('udbi = ' + userDeterminedBrickId);
      //console.log('user determined brick id = ' + userDeterminedBrickId);
      if (x > 0) {
        posX = this.squareLeft + x * (this.pieceWidth + MARGIN);
      } else {
        posX = this.squareLeft;
      }
      if (y > 0) {
        posY = this.squareTop - y * (this.pieceHeight + MARGIN);
      } else {
        posY = this.squareTop;
      }
      imgY = Math.floor(userDeterminedBrickId / xCount);
      imgX = Math.floor(userDeterminedBrickId % xCount);
      if (-1 != userDeterminedBrickId) {
        // create unit sprite
        var sprite = cc.Sprite.createWithTexture(this.img, cc.rect(imgX * imgUtilWidth, imgY * imgUtilHeight,
          imgUtilWidth, imgUtilHeight));
        sprite.setAnchorPoint(cc.p(0, 0));

        // set unit sprite scale
        sprite.setScale(this.pieceWidth / imgUtilWidth, this.pieceHeight / imgUtilHeight);

        // id of brick indicates
        sprite.id = userDeterminedBrickId;
        this.bricks.push(sprite);
        this.addChild(sprite, 1000);

        if (imgX == DEFAULT_BLANK_COL && imgY == DEFAULT_BLANK_ROW) {
          console.log('brick matrix error @ 1, the blank brick is missing');
        } else {
          sprite.setPosition(cc.p(Math.floor(posX), Math.floor(posY)));
        }
      } else {
        // process the brick at blank position
        var sprite = cc.Sprite.createWithTexture(this.img, cc.rect(DEFAULT_BLANK_COL * imgUtilWidth,
            DEFAULT_BLANK_ROW * imgUtilHeight,
          imgUtilWidth,
          imgUtilHeight));
        sprite.setAnchorPoint(cc.p(0, 0));

        // set unit sprite scale
        sprite.setScale(this.pieceWidth / imgUtilWidth, this.pieceHeight / imgUtilHeight);

        sprite.id = DEFAULT_BLANK_BRICK_ID;
        this.bricks.push(sprite);
        this.addChild(sprite, 1000);
        sprite.setPosition(cc.p(this.squareLeft + 3 * (this.pieceWidth + MARGIN), this.squareTop));

        console.log('this is a blank brick, at ' + posX + ',' + posY);
        this.blankBrick = cc.Sprite.create('./js/res/blank.png', cc.rect(0, 0, 128, 128));
        this.blankBrick.setAnchorPoint(0, 0);
        this.blankBrick.setScale(this.pieceWidth / this.blankBrick.getContentSize().width);
        // directly put blank brick to the right position
        this.blankBrick.setPosition(cc.p(Math.floor(posX), Math.floor(posY)));
        this.addChild(this.blankBrick, 900);
      }
    }

    // drawFiller
    var fillerBlockRealWidth = 74;
    //var fillerHeight = this.pieceWidth;
    //var fillerWidth = fillerHeight;
    var fillerBlockCount = 2;
    var fillerBlockScale = this.pieceWidth / fillerBlockRealWidth;

    this.fillerBatchNode = cc.SpriteBatchNode.create(s_FrameFiller);
    this.addChild(this.fillerBatchNode, 100);
    for (var fillerIndex = 0; fillerIndex < fillerBlockCount; fillerIndex++) {
      var fillerBlock = cc.Sprite.createWithTexture(this.fillerBatchNode.getTexture());
      fillerBlock.setAnchorPoint(cc.p(0, 0));
      fillerBlock.setPosition(cc.p(this.squareLeft + 3 * (this.pieceWidth + MARGIN), this.squareTop -
        (fillerIndex + 1) * (this.pieceHeight + MARGIN)));
      // a work around to remove the tiny white spaces between floor blocks
      fillerBlock.setScaleX(fillerBlockScale * 1.05);
      fillerBlock.setScaleY(fillerBlockScale * 1.05);
      this.addChild(fillerBlock);
    }
  },

  update: function () {
    if (editorPicSet == 1) {
      editorPicSet = 0;
      this.gameState = STATE_PREPARE;
      this.resetGame();

    }
    if (this.gameState == STATE_PLAYING && userView == 1) {
      // update step and time text UI
      var currentTimeStamp = Date.parse(new Date());
      timeUsed = (currentTimeStamp - this.timeStampStart) / 1000;
      this.updateUIRecord();
    }
  },

  updateUIRecord: function () {
    this.stepText.setString('STEPS:' + stepUsed);
    this.timeText.setString('TIME:' + timeUsed);
  },

  refreshUIRecord: function () {
    if (userView == 1) {
      this.stepText.setString('STEPS:' + stepUsed);
      this.timeText.setString('TIME:' + timeUsed);
    }
  },

  updateTouchAction: function (pos) {
    this.isAction = true;
    var moveDirection = -1;
    if (-1 != pos.x && -1 != pos.y) {
      var brick = this.findBrickByPos(pos);
      if (null != brick) {
        //console.log("clicked on brick : " + brick.id);
        moveDirection = this.brickModel.move(brick.id);
        // save user matrix every time after a brick is moved
        // this should be atom operation which needs optimization in future
        userMatrix = this.brickModel.getArrayFromBrickMatrix();
        if (-1 != moveDirection) {
          isMoving = true;
          this.moveBrickUI(brick);
        }
      }
    }
  },

  // this function is deprecated for editor_scene
  findBrickById: function (brickId) {
    for (var i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].id == brickId) {
        return this.bricks[i];
      }
    }
    return null;
  },

  // find brick by touch position
  findBrickByPos: function (pos) {
    for (var i = 0; i < this.bricks.length; i++) {
      var brick = this.bricks[i];
      if (brick.getPosition().x <= pos.x && brick.getPosition().y <= pos.y &&
        brick.getPosition().x + this.pieceWidth > pos.x &&
        brick.getPosition().y + this.pieceHeight > pos.y)
        return brick;
    }
    return null;
  },

  // move brick in UI layer
  moveBrickUI: function (brick) {
    var tmpPosition = brick.getPosition();
    if (!this.isAction) {
      brick.setPosition(this.blankBrick.getPosition());
      this.blankBrick.setPosition(tmpPosition.x, tmpPosition.y);
    } else {
      var brickMoveTo = cc.MoveTo.create(0.2, this.blankBrick.getPosition());
      var blankMoveTo = cc.MoveTo.create(0.2, tmpPosition);

      var brickSequence = cc.Sequence.create(brickMoveTo);
      var blankSequence = cc.Sequence.create(blankMoveTo, cc.CallFunc.create(this.movingFinished,
        this.blankBrick,
        this));
      brick.runAction(brickSequence);
      this.blankBrick.runAction(blankSequence);
    }
  },

  // call back of moving brick animation
  movingFinished: function (nodeExecutingAction, data) {
    //console.log('moving finished');
    if (userView == 1) {
      stepUsed++;
      if (null != data) {
        console.log('begin judging game result...');
        data.judgeResult();
      }
    }
    isMoving = false;
  },

  // shuffle bricks in UI layer (in logic layer as well)
  shuffleBricksUI: function (simStepCount) {
    // critical section ??
    isMoving = true;
    this.brickModel.shuffle(4);
    // convert 2d matrix to 1d array
    userMatrix = this.brickModel.getArrayFromBrickMatrix();
    blankX = this.brickModel.blankRow;
    blankY = this.brickModel.blankCol;
    isMoving = false;
    /*
     // debug shuffled brick matrix
     for(var r = 0; r < 3; r++) {
     var debugString = "";
     for(var c = 0; c < 3; c++) {
     debugString += this.brickModel.brickArray[r][c] + ',';
     }
     console.log(debugString);
     }
     */
    // redraw shuffled matrix
    this.resetGame();
  },

  gameComplete: function () {
    console.log('You completed this game !!');
    this.resultLayer = cc.LayerColor.create(cc.c4(64, 64, 64, 252), size.width, size.height);
    // process this image
    // phase 1, for those which are in shape of square
    this.resultSprite.setAnchorPoint(cc.p(0.5, 0));
    var originWidth = this.resultSprite.getContentSize().width;
    var originHeight = this.resultSprite.getContentSize().height;
    var refSize = originWidth > originHeight ? originWidth : originHeight;
    var scaleParam = (size.width / 6 * 4) / refSize;
    var frameWidth;
    frameWidth = originHeight * scaleParam;
    console.log('result sprite scale = ' + scaleParam);
    var str = '您完成了拼图 ' + gameName + '\r\n请点击右上角，查看公众号，\r\n关注我们后您将获得更多功能';

    this.resultSprite.setPosition(cc.p(size.width / 2, size.height - frameWidth - 10));
    this.resultText = cc.LabelTTF.create(str, FONT_TYPE, 16);
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
        window.location = '/picture_download?blob_id=' + downloadImgPath;
      }, this);

    this.downloadMenu = cc.Menu.create(this.downloadButton);
    this.downloadMenu.setPosition(cc.PointZero());
    this.downloadButton.setPosition(cc.p(size.width / 4 * 3,
        this.resultText.getPosition().y - 80));
    /*
     // wx button
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

    // update score button
    this.updateButton = cc.MenuItemImage.create(
      "./js/res/update_score_normal.png",
      "./js/res/update_score_pressed.png",
      function () {
        console.log('update score');
        this.updateScore(this);
      }, this);

    this.updateMenu = cc.Menu.create(this.updateButton);
    this.updateMenu.setPosition(cc.PointZero());
    this.updateButton.setPosition(cc.p(size.width / 6 * 3,
        this.resultText.getPosition().y - 60));

    // gallery button
    this.galleryButton = cc.MenuItemImage.create(
      "./js/res/gallery_normal.png",
      "./js/res/gallery_pressed.png",
      function () {
        console.log('to back to gallery');
        history.back();
      }, this);

    this.galleryMenu = cc.Menu.create(this.galleryButton);
    this.galleryMenu.setPosition(cc.PointZero());
    this.galleryButton.setPosition(cc.p(size.width / 4,
        this.resultText.getPosition().y - 80));

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
    var name = "";
    if (0 == playerStatus) {
      do {
        name = prompt("请输入您的名字(不超过5个字符)\n关注我们的公众账号创建自己的图库)", "");
      } while (name.length > 5 || name.length <= 0 ||
        validateIllegalChar('名字', name) == false);
      nickName = name;
    }
    this.updateScore(this);
    this.resultLayer.addChild(this.galleryMenu);
    this.resultLayer.addChild(this.resultSprite);
    this.resultLayer.addChild(this.resultText);
    this.addChild(this.resultLayer, 5000);

    this.gameState = STATE_FINISHED;
  },

  judgeResult: function () {
    if (this.brickModel.judgeGame() == true) {
      this.gameComplete();
    }
    return true;
  },

  displayScore: function () {
    this.scoreText = cc.LabelTTF.create('最高纪录:' + topTimeUsed + '秒(' + topTimePlayer + '), 您的成绩:' + timeUsed +
      '秒', FONT_TYPE, 16);
    this.resultLayer.addChild(this.scoreText);
    this.scoreText.setPosition(cc.p(size.width / 2,
        this.resultText.getPosition().y - 40));
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

      }
    }
  },

  onTouchesEnded: function (touches, event) {
    if (isMoving == true) {
      // prevent user operation in animation
      return;
    }
    if ('undefined' == typeof(touches[0])) {
      // prevent events generated for menus
      return;
    }
    if (('true' != picLocked && true != picLocked) && userView == 0) {
      // prevent user operation when picture is unlocked
      return;
    }
    if (('true' != picLocked && true != picLocked) && userView == 1 && STATE_PLAYING != this.gameState) {
      // prevent user from operating when game is not in playing state
      return;
    }
    this.isMouseDown = false;
    var mousePos = cc.p(touches[0].getLocation().x, touches[0].getLocation().y);
    this.updateTouchAction(mousePos);
  },

  onTouchesCancelled: function (touches, event) {
    console.log("onTouchesCancelled");
  },

  startPlaying: function () {
    this.gameState = STATE_PLAYING;
    this.timeStampStart = Date.parse(new Date());
    this.resetGame();
  },

  // ajaxes
  createBricksGame: function (gameInstance) {
    $.ajax({
      url: '/create_bricks',
      data: {game_name: gameName, owner_id: userID, picture_id: pictureID,
        icon_id: iconPath, bricks_layout: JSON.stringify(userMatrix), pub: pub},
      type: "POST",
      timeout: 20000,
      success: function (data) {
        // update author variables
        picLocked = false;
        // why should here re-init userMatrix ?
        userMatrix = gameInstance.brickModel.getArrayFromBrickMatrix();
        gameInstance.resetGame();
        //console.log('update picture information success, update for picture with index = ' + currentImageIndex);
        //pictures[currentImageIndex].locked = false;
        //pictures[currentImageIndex].bricksLayout = JSON.stringify(userMatrix);
        //showGalleryByOwner();
      },
      error: function (data) {
        picLocked = true;
        console.log('create bricks game failed');
      }
    });
  },

  updateScore: function (gameInstance) {
    if (0 == playerStatus) {
      $.ajax({
        url: '/bricks_update',
        data: {bricks_id: bricksID, time_used: timeUsed, nick_name: nickName, player_id: playerID,
          player_avatar: '', new_player: 1},
        type: "POST",
        timeout: 20000,
        success: function (data) {
          // update author variables
          console.log(data);
          var objData = JSON.parse(data);
          topTimeUsed = objData.topTime;
          topTimePlayer = objData.topTimePlayer;
          gameInstance.displayScore();
          localStorage.setItem('user_wx_id', playerID);
        },
        error: function (data) {
          alert('score updating only failed');
        }
      });
    } else {
      $.ajax({
        url: '/bricks_update',
        data: {bricks_id: bricksID, time_used: timeUsed, nick_name: nickName, player_id: playerID,
          player_avatar: avatarID, new_player: 0},
        type: "POST",
        timeout: 20000,
        success: function (data) {
          // update author variables
          console.log(data);
          var objData = JSON.parse(data);
          topTimeUsed = objData.topTime;
          topTimePlayer = objData.topTimePlayer;
          gameInstance.displayScore();
        },
        error: function (data) {
          alert('score updating failed');
        }
      });
    }
  }
});

var BricksEditorScene = cc.Scene.extend({
  onEnter: function () {
    this._super();
    var layer = new BricksEditor();
    layer.init();
    this.addChild(layer);
  }
});