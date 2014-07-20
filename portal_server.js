var express = require('express');
var picture_manager = require('./routes/picture_manage');
var user_manager = require('./routes/user_manage');
var game_manager = require('./routes/game_manage');
var bricks_manager = require('./routes/bricks_manage');
var bubbles_manager = require('./routes/bubbles_manage');
var bandits_manager = require('./routes/bandits_manage');
var connects_manager = require('./routes/connects_manage');
var diamond_manager = require('./routes/diamond_manage');
var logger = require('tracer').dailyfile({root: './tracer_log'});

var app = express();

//app.use(useragent.express());

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use("/", express.static(__dirname));
});

// routes

// picture operation
app.post('/picture_upload', picture_manager.uploadPicture);
app.post('/upload_picture_via_wx', picture_manager.uploadPictureViaWeixin);
app.post('/picture_crop_upload', picture_manager.uploadCroppedPicture);
app.post('/picture_delete', picture_manager.deletePicture);
app.get('/picture_get', picture_manager.getPicture);
app.get('/picture_get_cropped', picture_manager.getCroppedPicture);
app.get('/picture_content', picture_manager.serveBlobById);
app.get('/picture_get_by_id', picture_manager.getPictureById);
app.get('/picture_download', picture_manager.downloadBlobById);

// user operation
app.post('/user_update', user_manager.updateUser);
app.post('/user_update_name', user_manager.updateUserName);
app.get('/user_get', user_manager.getUserByID);
app.post('/user_update_score', user_manager.updateScore);

// game operation
app.post('/create_game', game_manager.createGame);
// handle bricks creation separately
app.post('/create_bricks', bricks_manager.createBricks);
app.get('/game_get', game_manager.getGameByTypeAndOwner);
app.get('/game_get_user_last', game_manager.getOwnerLatestGame);
app.get('/game_rank_get', game_manager.getGameRank);

app.get('/bricks_get', bricks_manager.getBricks);
app.get('/bubbles_get', bubbles_manager.getBubbles);
app.get('/bandits_get', bandits_manager.getBandits);
app.get('/connects_get', connects_manager.getConnects);

app.get('/bricks_get_by_id', bricks_manager.getBricksById);
app.get('/bubbles_get_by_id', bubbles_manager.getBubblesById);
app.get('/bandits_get_by_id', bandits_manager.getBanditsById);
app.get('/connects_get_by_id', connects_manager.getConnectsById);

app.post('/bricks_update', bricks_manager.updateBricks);
app.post('/bubbles_update', bubbles_manager.updateBubbles);
app.post('/bandits_update', bandits_manager.updateBandits);
app.post('/connects_update', connects_manager.updateConnects);

//app.post('/bricks_update_score_only', bricks_manager.updateBricksScore);
//app.post('/bubbles_update_score_only', bubbles_manager.updateBubblesScore);
//app.post('/bandits_update_score_only', bandits_manager.updateBanditsScore);
//app.post('/connects_update_score_only', connects_manager.updateConnectsScore);

app.post('/ceateDiamond', diamond_manager.createDiamond);
app.post('/updateDiamond', diamond_manager.updateDiamond);
app.post('/updateUserDiamond', diamond_manager.updateUserDiamond);
app.post('/diamondExchangeGold', diamond_manager.diamondExchangeGold);


app.post('/bandits_getResult', bandits_manager.getResult);
logger.log('portal_server listening at port 8080');
// common game operation
app.listen(8080);
