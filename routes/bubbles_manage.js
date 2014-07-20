/*
 * Googdood web game game manager
 * author : zhou_hao@googdood.com
 * date : Aug 4th, 2013
 */

var util = require('util');
var when = require('when');
var ciphering = require("./ciphering");
var schema = require('../db_schema/schemas');
var Game = require('../model/Game.js');
var gameManager = require('./game_manage.js');
var Bubbles = require('../model/Bubbles.js');
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
var TYPE_BUBBLES = 1;

var NAME_BUBBLES = '消除';

/* bubbles create */
exports.createBubbles = function (req, res) {

  var gameName = req.body.game_name;
  var ownerID = req.body.owner_id;
  // ID pointing to associated blob data
  var pictureIDs = req.body.picture_id;
  var iconID = req.body.icon_id;
  var public = req.body.pub;
  var createDate = new Date().getTime();
  var deadLine = req.body.dead_line;

  var bubbles = new schema.Bubbles({
    gameName: gameName,
    ownerID: ownerID,
    createDate: createDate,
    pictureIDs: pictureIDs,
    iconID: iconID,
    public: public,
    playedTimes: 0,
    topScore: 0,
    topScorePlayer: '',
    lastPlayers: '',
    status: 1,
    deadLine: deadLine
  });
  bubbles.save(function (err, savedBubbles) {
    if (err) {
      logger.log('create bubbles error : ' + err);
      res.end(err);
      throw err;
    } else {
      logger.log('bubbles saved successfully');
      gameManager.updateLatestGame(ownerID, TYPE_BUBBLES, createDate, savedBubbles._id, pictureIDs, iconID, "", gameName);
      res.send(savedBubbles);
      res.end();
    }
  });
};

exports.getBubbles = function (req, res) {
  var ownerID = req.query.owner_id;
  var from = req.query.from;
  var count = req.query.count;
  var bubblesList = new Array();
  schema.Bubbles.find({ ownerID: ownerID, status: 1 })
    .sort({createDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, bubbles) {
      if (err) {
        logger.log('bubbles find error');
        res.end(err);
      } else {
        logger.log('bubbles find successfully');
        for (var i = 0; i < bubbles.length; i++) {
          var bubble = new Bubbles(bubbles[i]._id, bubbles[i].gameName, bubbles[i].ownerID,
            bubbles[i].createDate, bubbles[i].pictureIDs, bubbles[i].iconID, bubbles[i].public,
            bubbles[i].playedTimes, bubbles[i].topScore, bubbles[i].topScorePlayer, bubbles[i].lastPlayers,
            "", "", bubbles[i].status, bubbles[i].deadLine);
          bubblesList.push(bubble);
        }
        logger.log('return get bubbles result');
        res.contentType('json');
        res.send(bubblesList);
        res.end();
      }
    });
  logger.log('end of get bubbles');
};

exports.updateBubblesScore = function (req, res) {
  var bubblesID = req.body.bubbles_id;
  var score = req.body.score;
  var playerName = req.body.nick_name;
  var currentPlayedTimes;
  var currentTopScore;
  var currentTopScorePlayer;
  var currentLastPlayers;

  schema.Bubbles.findById(bubblesID, function (err, bubbles) {
    if (err) {
      logger.log('bubbles find error, in update bubbles');
      res.end(err);
    } else {
      logger.log('bubbles find successfully, in update bubbles');
      currentTopScore = bubbles.topScore;
      currentTopScorePlayer = bubbles.topScorePlayer;
      currentPlayedTimes = bubbles.playedTimes;
      if (currentTopScore == 0 || score >= currentTopScore) {
        currentTopScore = score;
        currentTopScorePlayer = playerName;
      }
      // update last players
      currentLastPlayers = eval(bubbles.lastPlayers);
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

      var conditions = { _id: bubblesID };
      var update = { $set: {
        topScore: currentTopScore,
        topScorePlayer: currentTopScorePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Bubbles.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update bubbles score error : ' + err);
        } else {
          logger.log('update bubbles score, record number affected = ' + numAffected);
          logger.log('update bubbles game record successfully');
          var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
          //res.contentType('json');
          res.send(ret);
          res.end();
        }
      });
    }
  });
};

exports.updateBubbles = function (req, res) {
  var bubblesID = req.body.bubbles_id;
  var score = req.body.score;
  var playerName = req.body.nick_name;
  // playerID should not be 0 or empty string since we created a tempID for new user in frontend
  var playerID = req.body.player_id;
  var playerAvatar = req.body.player_avatar;
  var newPlayer = req.body.new_player;

  var date = Utils.dateFormat(new Date(), "yyyy-MM-dd");

  if (typeof playerAvatar == 'undefined' || null == playerAvatar || '' == playerAvatar) {
    playerAvatar = '';
  }

  var currentPlayedTimes;
  var currentTopScore;
  var currentTopScorePlayer;
  var currentLastPlayers;
  var deadLine;

  schema.Bubbles.findById(bubblesID, function (err, bubbles) {
    if (err) {
      logger.log('bubbles find error, in update bubbles');
      res.end(err);
    } else {
      logger.log('bubbles find successfully, in update bubbles');
      currentTopScore = bubbles.topScore;
      currentTopScorePlayer = bubbles.topScorePlayer;
      currentPlayedTimes = bubbles.playedTimes;
      deadLine = bubbles.deadLine;
      if (date > deadLine) {
        res.end("已过期");
        return;
      }
      if (currentTopScore == 0 || score >= currentTopScore) {
        currentTopScore = score;
        currentTopScorePlayer = playerName;
      }
      // update last players
      currentLastPlayers = eval(bubbles.lastPlayers);
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

      var conditions = { _id: bubblesID };
      var update = { $set: {
        topScore: currentTopScore,
        topScorePlayer: currentTopScorePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Bubbles.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update bubbles score error : ' + err);
        } else {
          logger.log('update bubbles score, record number affected = ' + numAffected);
          // update user highest score in this game
          var recordCondition;
          if (0 == newPlayer) {
            recordCondition = { playerID: playerID, gameID: bubblesID };
            schema.GameRecord.findOne(recordCondition, function (err, gameRecord) {
              if (err) {
                logger.log('game record for user ' + playerID + ' find error');
                res.end();
                throw err;
              } else {
                logger.log('user ' + playerID + ' find successfully, update highest score');
                if (null != gameRecord) {
                  var currentHighestScore = gameRecord.score;
                  if (currentHighestScore < score) {
                    // the record is refreshed
                    var update = { $set: {
                        playerID: playerID,
                        playerName: playerName,
                        playerAvatar: playerAvatar,
                        score: score
                      }}
                      , options = { multi: false };
                    schema.GameRecord.findByIdAndUpdate(gameRecord._id, update, options, function (recErr, recNumAffected) {
                      if (recErr) {
                        logger.log('update bubbles game record error : ' + recErr);
                        res.send(recErr);
                        res.end();
                        throw recErr;
                      } else {
                        logger.log('update bubbles game record successfully');
                        var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
                        //res.contentType('json');
                        res.send(ret);
                        res.end();
                      }
                    });
                  } else {
                    logger.log('no more higher score to save');
                    logger.log('update bubbles game record successfully');
                    var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
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
                    score: score,
                    gameID: bubblesID
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
                      logger.log('update bubbles game record successfully');
                      var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' +
                        currentTopScorePlayer + '"}';
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
              score: 1000      //new user gold = origin gold - game gold
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
                  score: score,
                  gameID: bubblesID
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
                    logger.log('update bubbles game record successfully');
                    var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' +
                      currentTopScorePlayer + '"}';
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

exports.getBubblesById = function (req, res) {

  var bubblesID = req.query.bubbles_id;
  var g_pictureArray = [];
  // a dangerous declaration of stack array
  var images = [];

  schema.Bubbles.findById(bubblesID, function (err, bubbles) {
    if (err) {
      logger.log("bubbles not found : " + err);
    } else {
      if (null != bubbles) {
        // pictureIDs of Bubbles is an array of pictureID
        var pictureIDs = bubbles.pictureIDs;
        var pictureIDList = eval(pictureIDs);
        loadPictures(g_pictureArray, pictureIDList).then(
          function success() {
            // do with the global g_pictureArray
            logger.log('load pictures successfully');
            logger.log('pictures count = ' + g_pictureArray.length);
          },
          function failed(err) {
            logger.log('load all pictures of bubbles game failed ' + err);
            throw err;
          }
        ).then(
          // final then
          function output() {
            var thumbnailId = [];
            var fullImageBlobId = [];
            var thumbnailIdJson;
            var fullImageBlobIdJson;
            for (var i = 0; i < g_pictureArray.length; i++) {
              thumbnailId.push(g_pictureArray[i].thumbnailId);
              fullImageBlobId.push(g_pictureArray[i].fullImageBlobId);
            }
            thumbnailIdJson = JSON.stringify(thumbnailId);
            fullImageBlobIdJson = JSON.stringify(fullImageBlobId);
            logger.log('debug var = ' + bubbles._id);
            // make JSON of bubbles
            var now = new Date();
            var nowString = Utils.dateFormat(now, "yyyy-MM-dd");
            var valid = nowString <= bubbles.deadLine ? 1 : 0;
            var ret = new Bubbles(bubbles._id, bubbles.gameName, bubbles.ownerID, bubbles.createDate, bubbles.pictureIDs,
              thumbnailId[0], bubbles.public, bubbles.playedTimes, bubbles.topScore, bubbles.topScorePlayer,
              bubbles.lastPlayers, fullImageBlobIdJson, thumbnailIdJson, bubbles.status, bubbles.deadLine, valid);
            logger.log('return response');
            res.contentType('json');
            res.send(ret);
            res.end();
          }
        );
      } else {
        logger.log('bubbles is empty');
        res.end();
      }
    }
  });
};

exports.deleteBubbles = function (req, res) {
  var bubblesID = req.query.bubbles_id;
  schema.Bubbles.findByIdAndUpdate(bubblesID, {$set: {status: 0}}, function (err, bubbles) {
    if (err) {
      logger.log("delete bubbles error, in delete bubbles : " + err);
    }
    logger.log("delete bubbles successfully.");
    res.end();
  });
};


// promise mode
function loadPicture(pictureArray, pictureID) {
  var deferred = when.defer();
  schema.Picture.findById(pictureID, function (err, picture) {
    if (!err) {
      logger.log('picture found');
      pictureArray.push(picture);
      // TODO: confirm if the resolve function is useless
      deferred.resolve();
    } else {
      logger.log('picture find error : ' + err);
      deferred.reject(new Error('picture find error'));
    }
  });
  return deferred.promise;
}

function loadPictures(pictureArray, pictureIDList) {
  // make defer
  var deffereds = [];
  for (var i = 0, len = pictureIDList.length; i < len; i++) {
    deffereds.push(loadPicture(pictureArray, pictureIDList[i]));
  }
  return when.all(deffereds);
}