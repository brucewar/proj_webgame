/*
 * Googdood web game game manager
 * author : zhou_hao@googdood.com
 * date : Aug 4th, 2013
 */

var util = require('util');
var ciphering = require("./ciphering");
var schema = require('../db_schema/schemas');
var Game = require('../model/Game.js');
var Bricks = require('../model/Bricks.js');
var Bubbles = require('../model/Bubbles.js');
var Bandits = require('../model/Bandits.js');
var Connects = require('../model/Connects.js');
var Picture = require('../model/Picture.js');
var History = require('../model/History.js');
var User = require('../model/User.js');
var bubbles_manage = require('./bubbles_manage.js');
var bandits_manage = require('./bandits_manage.js');
var connects_manage = require('./connects_manage.js');
var logger = require('tracer').dailyfile({root: './tracer_log'});

/*
 * game type :
 * 0 - bricks
 * 1 - bubbles
 * 2 - bandits
 * 3 - connects
 */
var TYPE_BRICKS = 0;
var TYPE_BUBBLES = 1;
var TYPE_BANDITS = 2;
var TYPE_CONNECTS = 3;

var NAME_BRICKS = '拼图';
var NAME_BUBBLES = '消除';
var NAME_BANDITS = '老虎机';
var NAME_CONNECTS = '连连看';

/* game common operations */
exports.getOwnerLatestGame = function (req, res) {
  var ownerID = req.query.owner_id;
  var gameOwner = null;
  var game;

  // find pictures of the uploader
  schema.Game.find({ ownerID: ownerID })
    .sort({createDate: 'desc'})
    .limit(1)
    .exec(function (err, games) {
      var pictureID;
      var gameID;
      if (err) {
        logger.log('latest owner game find error');
        res.end(err);
      } else {
        if (typeof games == 'undefined' || null == games || '' == games) {
          logger.log('games is empty');
          res.end();
        } else {
          logger.log('latest owner game find successfully');
          // this type of functions could be unified
          game = new Game(games[0]._id, games[0].ownerID, games[0].ownerName, games[0].gameType,
            games[0].createDate, games[0].gameName, games[0].pictureID, games[0].iconID,
            games[0].bricksLayout, games[0].gameID, games[0].status);
          res.contentType('json');
          res.send(game);
          res.end();
        }
      }
    });
};

exports.getGameByTypeAndOwner = function (req, res) {
  var ownerID = req.query.owner_id;
  var gameType = req.query.game_type;
  var from = req.query.from;
  var count = req.query.count;
  var gameList = {};

  // get a certain amount of game by owner and type
  schema.Game.find({ ownerID: ownerID })
    .where('gameType').equals(gameType)
    .sort({createDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, games) {
      if (err) {
        logger.log('game find error');
        res.end(err);
      } else {
        logger.log('game find successfully');
        for (var i = 0; i < games.length; i++) {
          var game = new Game(games[i]._id, games[i].ownerID, games[i].gameType, games[i].createDate,
            games[i].gameType, games[i].pictureID, games[i].gameID, games[i].status);
          gameList.push(game);
        }
        res.contentType('json');
        res.send(gameList);
        res.end();
      }
    });
};

exports.updateLatestGame = function (ownerID, gameType, createDate, gameID, pictureID, iconID, bricksLayout, gameName) {
  var ownerName = "";
  schema.User.findOne({userID: ownerID}, function (err, user) {
    if (err) {
      logger.log('find user by owner id error');
      throw err;
    } else {
      logger.log('find user by owner id successfully');
      if (null == user) {
        //TODO : resolve this issue of strong reference to user table
        logger.log('no user found, create game error');
      } else {
        logger.log('nick name = ' + user.nickName);
        ownerName = user.nickName;
        schema.Game.findOne({ ownerID: ownerID }, function (err, game) {
          if (err) {
            logger.log('latest game find error');
            throw err;
          } else {
            logger.log('latest game find successfully');
            if (null != game) {
              var conditions = { _id: game._id }
                , update = { $set: {
                  ownerName: ownerName,
                  gameType: gameType,
                  createDate: createDate,
                  gameID: gameID,
                  pictureID: pictureID,
                  iconID: iconID,
                  bricksLayout: bricksLayout,
                  gameName: gameName,
                  status: 1
                }}
                , options = { multi: false };

              schema.Game.update(conditions, update, options, function (err, numAffected) {
                if (err) {
                  logger.log('update latest game error : ' + err);
                } else {
                  logger.log('latest update, record number affected = ' + numAffected);
                }
              });
            } else {
              var newLatestGame = new schema.Game({
                ownerID: ownerID,
                ownerName: ownerName,
                gameType: gameType,
                createDate: createDate,
                gameID: gameID,
                pictureID: pictureID,
                iconID: iconID,
                bricksLayout: bricksLayout,
                gameName: gameName,
                status: 1
              });
              // save latest game (for the first time)
              newLatestGame.save(function (err, savedGame) {
                if (err) {
                  logger.log('latest game saving failed');
                  throw err;
                } else {
                  logger.log('latest game saving successfully');
                }
              });
            }
          }
        });
      }
    }
  });
};

exports.getGameById = function (req, res) {
  var gameID = req.query.game_id;
  schema.Game.findById(gameID, function (err, games) {
    if (err) {
      logger.log("game not found : " + err);
    }
    var game = new Game(games._id, games.ownerID, games.gameType, games.gameName,
      games.pictureID, games.gameID, games.createDate, games.status);
    res.contentType('json');
    res.send(game);
    res.end();
  });
};

exports.createGame = function (req, res) {
  var gameType = req.body.gameType;
  switch (parseInt(gameType)) {
    case 0:
      break;
    case 1:
      bubbles_manage.createBubbles(req, res);
      break;
    case 2:
      bandits_manage.createBandits(req, res);
      break;
    case 3:
      connects_manage.createConnects(req, res);
      break;
  }
};

exports.getGameRank = function (req, res) {
  logger.log("get game ranks...");
  var gameID = req.query.game_id;
  var sortOrder = req.query.sort_order;

  schema.GameRecord.find({ gameID: gameID })
    .sort({score: sortOrder})
    .limit(20)
    .exec(function (err, gameRecords) {
      if (err) {
        logger.log('game records find error');
        res.send(err);
        res.end();
        throw err;
      } else {
        logger.log('game records find successfully');
        res.contentType('json');
        res.send(gameRecords);
        res.end();
      }
    });
};
