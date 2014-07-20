/*
 * Googdood web game game manager
 * author : zhou_hao@googdood.com
 * date : Aug 4th, 2013
 */

var util = require('util');
var ciphering = require("./ciphering");
var schema = require('../db_schema/schemas');
var Game = require('../model/Game.js');
var gameManager = require('./game_manage.js');
var Bandits = require('../model/Bandits.js');
var Picture = require('../model/Picture.js');
var History = require('../model/History.js');
var User = require('../model/User.js');
var Utils = require('./utils.js');
var logger = require('tracer').dailyfile({root: './tracer_log'});
var userManager = require('./user_manage.js');
/*
 * game type :
 * 0 - bricks
 * 1 - bubbles
 * 2 - bandits
 * 3 - connects
 */
var TYPE_BANDITS = 2;

var NAME_BANDITS = '老虎机';

exports.createBandits = function (req, res) {
  var gameName = req.body.game_name;
  var ownerID = req.body.owner_id;
  // ID pointing to associated blob data
  var pictureID = req.body.picture_id;
  var iconID = req.body.icon_id;
  var public = req.body.pub;
  var createDate = new Date().getTime();

  var bandits = new schema.Bandits({
    gameName: gameName,
    ownerID: ownerID,
    createDate: createDate,
    pictureID: pictureID,
    iconID: iconID,
    public: public,
    playedTimes: 0,
    topScore: 0,
    topScorePlayer: '',
    lastPlayers: '',
    status: 1
  });
  bandits.save(function (err, savedBandits) {
    if (err) {
      logger.log('create bandits error : ' + err);
      res.end(err);
      throw err;
    } else {
      logger.log('bandits saved successfully');
      gameManager.updateLatestGame(ownerID, TYPE_BANDITS, createDate, savedBandits._id, pictureID, iconID,
        "", gameName);
      res.send(savedBandits);
      res.end();
    }
  });
};

exports.getBandits = function (req, res) {
  var ownerID = req.query.owner_id;
  var from = req.query.from;
  var count = req.query.count;
  var banditsList = new Array();

  schema.Bandits.find({ ownerID: ownerID, status: 1 })
    .sort({createDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, bandits) {
      if (err) {
        logger.log('bandits find error');
        res.end(err);
      } else {
        logger.log('bandits find successfully');
        for (var i = 0; i < bandits.length; i++) {
          var bandit = new Bandits(bandits[i]._id, bandits[i].gameName, bandits[i].ownerID,
            bandits[i].createDate, bandits[i].pictureID, bandits[i].iconID, bandits[i].public,
            bandits[i].playedTimes, bandits[i].topScore, bandits[i].topScorePlayer, bandits[i].lastPlayers,
            "", "", bandits[i].status);

          banditsList.push(bandit);
        }
        res.contentType('json');
        res.send(banditsList);
        res.end();
      }
    });
};

exports.updateBanditsScore = function (req, res) {
  var banditsID = req.body.bandits_id;
  var score = req.body.score;
  var playerName = req.body.nick_name;
  var currentPlayedTimes;
  var currentTopScore;
  var currentTopScorePlayer;
  var currentLastPlayers;

  schema.Bandits.findById(banditsID, function (err, bandits) {
    if (err) {
      logger.log('bandits find error, in update bandits');
      res.end(err);
    } else {
      logger.log('bandits find successfully, in update bandits');
      currentTopScore = bandits.topScore;
      currentTopScorePlayer = bandits.topScorePlayer;
      currentPlayedTimes = bandits.playedTimes;
      if (currentTopScore == 0 || score >= currentTopScore) {
        currentTopScore = score;
        currentTopScorePlayer = playerName;
      }
      // update last players
      // logger.log(bandits.lastPlayers);
      currentLastPlayers = eval(bandits.lastPlayers);
      if (typeof(currentLastPlayers) == 'undefined') {
        currentLastPlayers = new Array();
        currentLastPlayers[0] = playerName;
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

      var conditions = { _id: banditsID };
      var update = { $set: {
        topScore: currentTopScore,
        topScorePlayer: currentTopScorePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Bandits.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update bandits score error : ' + err);
          res.end(err);
        } else {
          logger.log('update bandits score, record number affected = ' + numAffected);
          // update user highest score in this game
          logger.log('update bandits game record successfully');
          var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
          //res.contentType('json');
          res.send(ret);
          res.end();
        }
      });
    }
  });
};

exports.updateBandits = function (req, res) {
  var banditsID = req.body.bandits_id;
  var score = req.body.score;
  var playerName = req.body.nick_name;
  var playerID = req.body.player_id;
  var playerAvatar = req.body.player_avatar;
  var currentPlayedTimes;
  var currentTopScore;
  var currentTopScorePlayer;
  var currentLastPlayers;

  schema.Bandits.findById(banditsID, function (err, bandits) {
    if (err) {
      logger.log('bandits find error, in update bandits');
      res.end(err);
    } else {
      logger.log('bandits find successfully, in update bandits');
      currentTopScore = bandits.topScore;
      currentTopScorePlayer = bandits.topScorePlayer;
      currentPlayedTimes = bandits.playedTimes;
      if (currentTopScore == 0 || score >= currentTopScore) {
        currentTopScore = score;
        currentTopScorePlayer = playerName;
      }
      // update last players
      // logger.log(bandits.lastPlayers);
      currentLastPlayers = eval(bandits.lastPlayers);
      if (typeof(currentLastPlayers) == 'undefined') {
        currentLastPlayers = new Array();
        currentLastPlayers[0] = playerName;
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

      var conditions = { _id: banditsID };
      var update = { $set: {
        topScore: currentTopScore,
        topScorePlayer: currentTopScorePlayer,
        lastPlayers: JSON.stringify(currentLastPlayers),
        playedTimes: currentPlayedTimes
      }};
      var options = { multi: false };
      schema.Bandits.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update bandits score error : ' + err);
          res.end(err);
        } else {
          logger.log('update bandits score, record number affected = ' + numAffected);
          // update user highest score in this game
          schema.GameRecord.findOne({ playerID: playerID, gameID: banditsID }, function (err, gameRecord) {
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
                      logger.log('update bandits game record error : ' + recErr);
                      res.send(recErr);
                      res.end();
                      throw recErr;
                    } else {
                      logger.log('update bandits game record successfully');
                      var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
                      //res.contentType('json');
                      res.send(ret);
                      res.end();
                    }
                  });
                } else {
                  logger.log('no more higher score to save');
                  logger.log('update bandits game record successfully');
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
                  gameID: banditsID
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
                    logger.log('update bandits game record successfully');
                    var ret = '{"topScore":"' + currentTopScore + '","topScorePlayer":"' + currentTopScorePlayer + '"}';
                    //res.contentType('json');
                    res.send(ret);
                    res.end();
                  }
                });
              }
            }
          });
        }
      });
    }
  });
};

exports.getBanditsById = function (req, res) {
  var banditsID = req.query.bandits_id;
  schema.Bandits.findById(banditsID, function (err, bandits) {
    if (err) {
      logger.log("get bandits by id error : " + err);
      throw err;
    } else {
      if (null != bandits) {
        // pictureID of bricks and bandits is no more than an array
        var pictureID = JSON.parse(bandits.pictureID);
        schema.Picture.findById(pictureID, function (err, picture) {
          if (err) {
            logger.log("get picture by id error : " + err);
            throw err;
          } else {
            if (null != picture) {
              var bandit = new Bandits(bandits.id, bandits.gameName, bandits.ownerID, bandits.createDate, bandits.pictureID, bandits.iconID,
                bandits.public, bandits.playedTimes, bandits.topScore, bandits.topScorePlayer,
                bandits.lastPlayers, picture.fullImageBlobId, picture.thumbnailId, bandits.status);
              logger.log();
              res.contentType('json');
              res.send(bandit);
              res.end();
            } else {
              logger.log('picture is empty');
            }
          }
        });
      } else {
        logger.log('bandits is empty');
      }
    }
  });
};

exports.deleteBandits = function (req, res) {
  var banditsID = req.query.bandits_id;
  schema.Bandits.findByIdAndUpdate(banditsID, {$set: {status: 0}}, function (err, bandits) {
    if (err) {
      logger.log("delete bandits error, in delete bandits : " + err);
    }
    logger.log("delete bandits successfully.");
    res.end();
  });
};

exports.getResult = function (req, res) {
  var bet = req.body.bet;
  var score = req.body.score;
  // var TigerNode = req.query.TigerNode;
  var userID = req.body.user_id;
  var w = [0, 1, 1, 1, 2, 2, 3, 3, 4];
  var whichOne = Math.floor(Math.random() * 9);
  var temp = [];
  var result = [];
  temp[0] = w[whichOne];
  result[0] = temp[0];
  var Other;
  for (var i = 1; i < 3; i++) {
    while (1) {
      Other = Math.floor(Math.random() * 9);
      if (Other != whichOne) {
        temp[1] = w[Other];
        break;
      }
    }
    var probability = Math.floor(Math.random() * 2)
    result[i] = temp[probability];
  }
  var mbet = 0;
  score = parseInt(score);
  if (result[0] == result[1] && result[1] == result[2]) {
    if (result[0] % 5 != 4) {
      mbet = bet * ((result[0] % 5) + 1);
      score += mbet;
    } else {
      mbet = bet * 6;
      score += mbet;
    }
  } else if ((result[0] == 4 && result[1] == 4) ||
    (result[1] == 4 && result[2] == 4) ||
    (result[0] == 4 && result[2] == 4)) {
    mbet = bet * 2;
    score += mbet;
  }
  userManager.updateUserScore(userID, score);
  result[3] = score;
  result[4] = mbet;
  res.send(result);
  res.end();
};