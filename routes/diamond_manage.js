/**
 * Created with JetBrains WebStorm.
 * User: dell
 * Date: 13-10-9
 * Time: 下午1:52
 * To change this template use File | Settings | File Templates.
 */
var schema = require('../db_schema/schemas');
var logger = require('tracer').dailyfile({root: './tracer_log'});

exports.createDiamond = function (req, res) {
  var diamondToGold = req.body.diamondToGold;
  var oneMoneyToDiamond = req.body.oneMoneyToDiamond;
  var savediamond = schema.Diamond({
    diamondToGold: diamondToGold,
    oneMoneyToDiamond: oneMoneyToDiamond
  });
  savediamond.save(function (err, saveObject) {
    if (err) {
      logger.log('Diamond saving failed');
      throw err;
      res.end(err);
    } else {
      logger.log('Diamond saving successfully');
      res.end();
    }
  });
}

exports.updateDiamond = function (req, res) {
  var DiamondID = req.body.diamondID;
  var diamondToGold = req.body.diamondToGold;
  var oneMoneyToDiamond = req.body.oneMoneyToDiamond;
  var conditions = { DiamondID: DiamondID }
    , update = { $set: {
      diamondToGold: diamondToGold,
      oneMoneyToDiamond: oneMoneyToDiamond
    }}
    , options = { multi: false };
  schema.Diamond.update(conditions, update, options, function (err, numAffected) {
    if (err) {
      logger.log('update Diamond error : ' + err);
      res.end(err);
    } else {
      logger.log('Diamond update, record number affected = ' + numAffected);
      res.end();
    }
  });
}

exports.updateUserDiamond = function (req, res) {
  var userID = req.body.userID;
  var diamondNumber = req.body.diamondNumber;
  var conditions = { userID: userID }
    , update = { $set: {
      diamond: diamondNumber
    }}
    , options = { multi: false };
  schema.User.update(conditions, update, options, function (err, numAffected) {
    if (err) {
      logger.log('update UserDiamond error : ' + err);
      res.end(err);
    } else {
      logger.log('UserDiamond update, record number affected = ' + numAffected);
      res.end();
    }
  });
}

exports.diamondExchangeGold = function (req, res) {
  var userID = req.body.userID;
  var diamondID = req.body.diamondID;
  var exchangeNumber = 1;
  var diamondToGold;
  schema.Diamond.findById(diamondID, function (err, diamond) {
    if (diamond != null) {
      diamondToGold = diamond.diamondToGold * exchangeNumber;
      schema.User.findById(userID, function (err, user) {
        if (err) {
          logger.log('diamondExchangeGold get user error : ' + err);
          res.end(err);
        } else {
          if (user != null) {
            var gold = user.score;
            var diamond = user.diamond;
            if (diamond > 0) {
              schema.User.update({userID: userID}, { $set: {
                score: gold + diamondToGold
              }}, {multi: false }, function (err, numAffected) {
                if (err) {
                  logger.log('diamondExchangeGold error : ' + err);
                  res.end(err);
                } else {
                  logger.log('diamondExchangeGold, record number affected = ' + numAffected);
                  res.end();
                }
              });
            } else {
              logger.log('diamondExchangeGold,Not enough diamond!');

            }
          } else {
            logger.log('diamondExchangeGold  user not exist ');

          }
        }
      });
    }
  });
}
