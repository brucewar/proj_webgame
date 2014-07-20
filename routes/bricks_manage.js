/*
 * Googdood web game game manager
 * author : zhou_hao@googdood.com
 * date : Aug 4th, 2013
 */

var util = require('util');
var ciphering = require("./ciphering");
var schema = require('../db_schema/schemas');
var gameManager = require('./game_manage.js');
var Game = require('../model/Game.js');
var Bricks = require('../model/Bricks.js');
var Picture = require('../model/Picture.js');
var History = require('../model/History.js');
var User = require('../model/User.js');
var Utils = require('./utils.js');
var logger = require('tracer').dailyfile({root: './tracer_log'});

/*
 * game type :
 * 0 - bricks
 * 1 - bubbles
 * 2 - bandits
 * 3 - connects
 */
var TYPE_BRICKS = 0;

var NAME_BRICKS = '拼图';

/* bricks create */
exports.createBricks = function (req, res) {
  var gameName = req.body.game_name;
  var ownerID = req.body.owner_id;
  // ID pointing to associated blob data
  var pictureID = req.body.picture_id;
  var iconID = req.body.icon_id;
  var bricksLayout = req.body.bricks_layout;
  var public = req.body.pub;
  public = public.substring(0, 1);
  var createDate = new Date().getTime();
  var bricks = new schema.Bricks({
    gameName: gameName,
    ownerID: ownerID,
    createDate: createDate,
    pictureID: pictureID,
    iconID: iconID,
    bricksLayout: bricksLayout, // json of array
    public: public,
    playedTimes: 0,
    topTime: 0,
    topTimePlayer: '',
    lastPlayers: '',
    status: 1
  });
  bricks.save(function (err, savedBricks) {
    if (err) {
      logger.log('create bricks error : ' + err);
      res.end(err);
      throw err;
    } else {
      logger.log('bricks saved successfully');
      gameManager.updateLatestGame(ownerID, TYPE_BRICKS, createDate, savedBricks._id, pictureID, iconID, bricksLayout, gameName);
      res.end();
    }
  });
};

exports.getBricks = function (req, res) {
  var ownerID = req.query.owner_id;
  var from = req.query.from;
  var count = req.query.count;
  var bricksList = new Array();

  schema.Bricks.find({ ownerID: ownerID, status: 1 })
    .sort({createDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, bricks) {
      if (err) {
        logger.log('bricks find error');
        res.end(err);
      } else {
        logger.log('bricks find successfully');
        for (var i = 0; i < bricks.length; i++) {
          var brick = new Bricks(bricks[i]._id, bricks[i].gameName, bricks[i].ownerID, bricks[i].createDate,
            bricks[i].pictureID, bricks[i].iconID, bricks[i].bricksLayout, bricks[i].public,
            bricks[i].playedTimes, bricks[i].topTime, bricks[i].topTimePlayer, bricks[i].lastPlayers,
            "", "", bricks[i].status);
          bricksList.push(brick);
        }
        res.contentType('json');
        res.send(bricksList);
        res.end();
      }
    });
};

exports.updateBricksScore = function (req, res) {
  var bricksID = req.body.bricks_id;
  var timeUsed = req.body.time_used;
  var playerName = req.body.nick_name;
  var currentPlayedTimes;
  var currentTopTime;
  var currentTopTimePlayer;
  var currentLastPlayers;

  schema.Bricks.findById(bricksID, function (err, bricks) {
    if (err) {
      logger.log('bricks find error, in update bricks');
      res.end(err);
    } else {
      logger.log('bricks find successfully, in update bricks');
      currentTopTime = bricks.topTime;
      currentTopTimePlayer = bricks.topTimePlayer;
      currentPlayedTimes = bricks.playedTimes;
      if (currentTopTime == 0 || timeUsed <= currentTopTime) {
        currentTopTime = timeUsed;
        currentTopTimePlayer = playerName;
      }
      // update last players
      currentLastPlayers = eval(bricks.lastPlayers);
      if (typeof(currentLastPlayers) == 'undefined') {
        currentLastPlayers = new Array();
        currentLastPlayers.push(playerName);
      } else {
        if (!Utils.isObjInArray(currentLastPlayers, playerName)) {
          if (currentLastPlayers.length < 3) {
            currentLastPlayers.unshift(playerName);
          } else {
            for (var index = currentLastPlayers.length - 1; index > 0; index--) {
              currentLastPlayers[index] = currentLastPlayers[index - 1];
            }
            currentLastPlayers[0] = playerName;
          }
        }
      }
      currentPlayedTimes++;

      var conditions = { _id: bricksID };
      var update = { $set: {
        topTime: currentTopTime,
        topTimePlayer: currentTopTimePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Bricks.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update bricks score error : ' + err);
        } else {
          logger.log('update bricks score, record number affected = ' + numAffected);
          // update user highest score in this game
          var ret = '{"topTime":"' + currentTopTime + '","topTimePlayer":"' +
            currentTopTimePlayer + '"}';
          //res.contentType('json');
          res.send(ret);
          res.end();
        }
      });
    }
  });
};

exports.updateBricks = function (req, res) {
  var bricksID = req.body.bricks_id;
  var timeUsed = req.body.time_used;
  var playerName = req.body.nick_name;
  var playerID = req.body.player_id;
  var playerAvatar = req.body.player_avatar;
  var newPlayer = req.body.new_player;

  if (typeof playerAvatar == 'undefined' || null == playerAvatar || '' == playerAvatar) {
    playerAvatar = '';
  }

  var currentPlayedTimes;
  var currentTopTime;
  var currentTopTimePlayer;
  var currentLastPlayers;

  schema.Bricks.findById(bricksID, function (err, bricks) {
    if (err) {
      logger.log('bricks find error, in update bricks');
      res.end(err);
    } else {
      logger.log('bricks find successfully, in update bricks');
      currentTopTime = bricks.topTime;
      currentTopTimePlayer = bricks.topTimePlayer;
      currentPlayedTimes = bricks.playedTimes;
      if (currentTopTime == 0 || timeUsed <= currentTopTime) {
        currentTopTime = timeUsed;
        currentTopTimePlayer = playerName;
      }
      // update last players
      currentLastPlayers = eval(bricks.lastPlayers);
      if (typeof(currentLastPlayers) == 'undefined') {
        currentLastPlayers = new Array();
        currentLastPlayers.push(playerName);
      } else {
        if (!Utils.isObjInArray(currentLastPlayers, playerName)) {
          if (currentLastPlayers.length < 3) {
            currentLastPlayers.unshift(playerName);
          } else {
            for (var index = currentLastPlayers.length - 1; index > 0; index--) {
              currentLastPlayers[index] = currentLastPlayers[index - 1];
            }
            currentLastPlayers[0] = playerName;
          }
        }
      }
      currentPlayedTimes++;

      var conditions = { _id: bricksID };
      var update = { $set: {
        topTime: currentTopTime,
        topTimePlayer: currentTopTimePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Bricks.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update bricks score error : ' + err);
        } else {
          var recordCondition;
          if (0 == newPlayer) {
            recordCondition = { playerID: playerID, gameID: bricksID };
            logger.log('update bricks score, record number affected = ' + numAffected);
            // update user highest score in this game
            schema.GameRecord.findOne({ playerID: playerID, gameID: bricksID }, function (err, gameRecord) {
              if (err) {
                logger.log('game record for user ' + playerID + ' find error');
                res.end();
                throw err;
              } else {
                logger.log('user ' + playerID + ' find successfully, update highest score');
                if (null != gameRecord) {
                  var currentHighestScore = gameRecord.score;
                  if (currentHighestScore > timeUsed) {
                    // the record is refreshed
                    var update = { $set: {
                        playerID: playerID,
                        playerName: playerName,
                        playerAvatar: playerAvatar,
                        score: timeUsed
                      }}
                      , options = { multi: false };
                    schema.GameRecord.findByIdAndUpdate(gameRecord._id, update, options, function (recErr, recNumAffected) {
                      if (recErr) {
                        logger.log('update bricks game record error : ' + recErr);
                        res.end(recErr);
                      } else {
                        logger.log('update bricks game record successfully');
                        var ret = '{"topTime":"' + currentTopTime + '","topTimePlayer":"' +
                          currentTopTimePlayer + '"}';
                        //res.contentType('json');
                        res.send(ret);
                        res.end();
                      }
                    });
                  } else {
                    logger.log('no more higher score to save');
                    logger.log('update bricks game record successfully');
                    var ret = '{"topTime":"' + currentTopTime + '","topTimePlayer":"' +
                      currentTopTimePlayer + '"}';
                    //res.contentType('json');
                    res.send(ret);
                    res.end();
                  }
                } else {
                  // create a new game record
                  var gameRecord = new schema.GameRecord({
                    playerID: playerID,
                    playerName: playerName,
                    playerAvatar: playerAvatar,
                    score: timeUsed,
                    gameID: bricksID
                  });
                  // save game record
                  gameRecord.save(function (saveErr, savedGameRecord) {
                    if (saveErr) {
                      logger.log('game record saving failed');
                      res.end(saveErr);
                      throw err;
                    } else {
                      logger.log('add new game record for user ' + playerID);
                      logger.log('update bricks game record successfully');
                      var ret = '{"topTime":"' + currentTopTime + '","topTimePlayer":"' +
                        currentTopTimePlayer + '"}';
                      //res.contentType('json');
                      res.send(ret);
                      res.end();
                    }
                  });
                }
              }
            });
          } else {
            // this is a new temporary user, register a new user for it
            var user = new schema.User({
              userID: playerID,
              nickName: playerName,
              avatarId: '',
              score: 1000
            });
            user.save(function (err, savedUser) {
              if (err) {
                logger.log('user saving failed');
                res.end();
                throw err;
              } else {
                var gameRecord = new schema.GameRecord({
                  playerID: playerID,
                  playerName: playerName,
                  playerAvatar: playerAvatar,
                  score: timeUsed,
                  gameID: bricksID
                });
                // save game record
                gameRecord.save(function (saveErr, savedGameRecord) {
                  if (saveErr) {
                    logger.log('game record saving failed');
                    res.send(saveErr);
                    res.end();
                    throw saveErr;
                  } else {
                    logger.log('add new game record for user ' + playerID);
                    logger.log('update bricks game record successfully');
                    var ret = '{"topTime":"' + currentTopTime + '","topTimePlayer":"' +
                      currentTopTimePlayer + '"}';
                    //res.contentType('json');
                    res.send(ret);
                    res.end();
                  }
                });
              }
            });
          }
        }
      });
    }
  });
};

exports.getBricksById = function (req, res) {
  var bricksID = req.query.bricks_id;
  schema.Bricks.findById(bricksID, function (err, bricks) {
    if (err) {
      logger.log("bricks not found : " + err);
      throw err;
    } else {
      if (null != bricks) {
        var pictureID = bricks.pictureID;
        schema.Picture.findById(pictureID, function (err, picture) {
          if (err) {
            logger.log("get picture by id error : " + err);
            throw err;
          } else {
            if (null != picture) {
              var ret = new Bricks(bricks._id, bricks.gameName, bricks.ownerID, bricks.createDate,
                bricks.pictureID, bricks.iconID, bricks.bricksLayout, bricks.public, bricks.playedTimes,
                bricks.topTime, bricks.topTimePlayer, bricks.lastPlayers, picture.fullImageBlobId,
                picture.thumbnailId, bricks.status);
              res.contentType('json');
              res.send(ret);
              res.end();
            } else {
              logger.log('picture is empty');
            }
          }
        });
      } else {
        logger.log('bricks is empty');
      }
    }
  });
};

exports.deleteBricks = function (req, res) {
  var bricksID = req.query.bricks_id;
  schema.Bricks.findByIdAndUpdate(bricksID, {$set: {status: 0}}, function (err, bricks) {
    if (err) {
      logger.log("delete bricks error, in delete bricks : " + err);
    }
    logger.log("delete bricks successfully.");
    res.end();
  });
};