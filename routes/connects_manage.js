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
var Connects = require('../model/Connects.js');
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
var TYPE_CONNECTS = 3;

var NAME_CONNECTS = '连连看';

exports.createConnects = function (req, res) {
  var gameName = req.body.game_name;
  var ownerID = req.body.owner_id;
  // ID pointing to associated blob data
  var pictureIDs = req.body.picture_id;
  var iconID = req.body.icon_id;
  var public = req.body.pub;
  var createDate = new Date().getTime();

  var connects = new schema.Connects({
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
    status: 1
  });
  connects.save(function (err, savedConnects) {
    if (err) {
      logger.log('create connects error : ' + err);
      res.end(err);
      throw err;
    } else {
      logger.log('connects saved successfully');
      var pictureIDArray = eval(pictureIDs);
      gameManager.updateLatestGame(ownerID, TYPE_CONNECTS, createDate, savedConnects._id, pictureIDArray, iconID,
        "", gameName);
      res.send(savedConnects);
      res.end();
    }
  });
};

exports.getConnects = function (req, res) {
  var ownerID = req.query.owner_id;
  var from = req.query.from;
  var count = req.query.count;
  var connectsList = new Array();

  schema.Connects.find({ ownerID: ownerID, status: 1 })
    .sort({createDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, connects) {
      if (err) {
        logger.log('connects find error');
        res.end(err);
      } else {
        logger.log('connects find successfully');
        for (var i = 0; i < connects.length; i++) {
          var connect = new Connects(connects[i]._id, connects[i].gameName, connects[i].ownerID,
            connects[i].createDate, connects[i].pictureIDs, connects[i].iconID, connects[i].public,
            connects[i].playedTimes, connects[i].topScore, connects[i].topScorePlayer,
            connects[i].lastPlayers, "", "", connects[i].status);
          connectsList.push(connect);
        }
        res.contentType('json');
        res.send(connectsList);
        res.end();
      }
    });
};

exports.updateConnectsScore = function (req, res) {
  var connectsID = req.body.connects_id;
  var score = req.body.score;
  var playerName = req.body.nick_name;
  var currentPlayedTimes;
  var currentTopScore;
  var currentTopScorePlayer;
  var currentLastPlayers;
  schema.Connects.findById(connectsID, function (err, connects) {
    if (err) {
      logger.log('connects find error, in update connects');
      res.end(err);
    } else {
      currentTopScore = connects.topScore;
      currentTopScorePlayer = connects.topScorePlayer;
      currentPlayedTimes = connects.playedTimes;
      if (currentTopScore == 0 || score >= currentTopScore) {
        currentTopScore = score;
        currentTopScorePlayer = playerName;
      }
      // update last players
      currentLastPlayers = eval(connects.lastPlayers);
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
      var conditions = { _id: connectsID };
      var update = { $set: {
        topScore: currentTopScore,
        topScorePlayer: currentTopScorePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Connects.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update connects score error : ' + err);
        } else {
          logger.log('update connects score, record number affected = ' + numAffected);
          logger.log('update connects game record successfully');
          var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
          //res.contentType('json');
          res.send(ret);
          res.end();
        }
      });
    }
  });
};

exports.updateConnects = function (req, res) {
  var connectsID = req.body.connects_id;
  var score = req.body.score;
  var playerName = req.body.nick_name;
  var playerID = req.body.player_id;
  var playerAvatar = req.body.player_avatar;
  var newPlayer = req.body.new_player;

  if (typeof playerAvatar == 'undefined' || null == playerAvatar || '' == playerAvatar) {
    playerAvatar = '';
  }

  var currentPlayedTimes;
  var currentTopScore;
  var currentTopScorePlayer;
  var currentLastPlayers;
  schema.Connects.findById(connectsID, function (err, connects) {
    if (err) {
      logger.log('connects find error, in update connects');
      res.end(err);
    } else {
      currentTopScore = connects.topScore;
      currentTopScorePlayer = connects.topScorePlayer;
      currentPlayedTimes = connects.playedTimes;
      if (currentTopScore == 0 || score >= currentTopScore) {
        currentTopScore = score;
        currentTopScorePlayer = playerName;
      }
      // update last players
      currentLastPlayers = eval(connects.lastPlayers);
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
      var conditions = { _id: connectsID };
      var update = { $set: {
        topScore: currentTopScore,
        topScorePlayer: currentTopScorePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Connects.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update connects score error : ' + err);
        } else {
          var recordCondition;
          if (0 == newPlayer) {
            recordCondition = { playerID: playerID, gameID: connectsID };
            logger.log('update connects score, record number affected = ' + numAffected);
            // update user highest score in this game
            schema.GameRecord.findOne({ playerID: playerID, gameID: connectsID }, function (err, gameRecord) {
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
                        logger.log('update connects game record error : ' + recErr);
                        res.send(recErr);
                        res.end();
                        throw recErr;
                      } else {
                        logger.log('update connects game record successfully');
                        var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
                        //res.contentType('json');
                        res.send(ret);
                        res.end();
                      }
                    });
                  } else {
                    logger.log('no more higher score to save');
                    logger.log('update connects game record successfully');
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
                    gameID: connectsID
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
                      logger.log('update connects game record successfully');
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
              score: 1000
            });
            logger.log("playerName+" + playerName);
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
                  gameID: connectsID
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
                    logger.log('update connects game record successfully');
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

exports.getConnectsById = function (req, res) {
  var connectsID = req.query.connects_id;
  var g_pictureArray = [];
  // a dangerous declaration of stack array
  var images = [];
  schema.Connects.findById(connectsID, function (err, connects) {
    if (err) {
      logger.log("connects not found : " + err);
    } else {
      if (null != connects) {
        // pictureIDs of Connects is an array of pictureID
        var pictureIDs = connects.pictureIDs;
        var pictureIDList = eval(pictureIDs);
        loadPictures(g_pictureArray, pictureIDList).then(
          function success() {
            // do with the global g_pictureArray
            logger.log('load pictures successfully');
            logger.log('pictures count = ' + g_pictureArray.length);
          },
          function failed(err) {
            logger.log('load all pictures of connects game failed ' + err);
            throw err;
          }
        ).then(
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
            logger.log(thumbnailIdJson);
            var ret = new Connects(connects._id, connects.gameName, connects.ownerID, connects.createDate, connects.pictureIDs,
              thumbnailId[0], connects.public, connects.playedTimes, connects.topScore, connects.topScorePlayer,
              connects.lastPlayers, fullImageBlobIdJson, thumbnailIdJson, connects.status);
            res.contentType('json');
            res.send(ret);
            res.end();
          }
        );
      } else {
        logger.log('connects is empty');
      }
    }
  });
};

exports.deleteConnects = function (req, res) {
  var connectsID = req.query.connects_id;
  schema.Connects.findByIdAndUpdate(connectsID, {$set: {status: 0}}, function (err, connects) {
    if (err) {
      logger.log("delete connects error, in delete connects : " + err);
    }
    logger.log("delete connects successfully.");
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
      deferred.resolve(picture);
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