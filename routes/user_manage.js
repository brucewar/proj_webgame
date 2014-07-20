/*
 * Googdood web game player manager
 * author : zhou_hao@googdood.com
 * date : Jul 31th, 2013
 */

var fs = require('fs');
var util = require('util');
var os = require('os');
var schema = require('../db_schema/schemas');
var User = require('../model/User.js');
var Picture = require('../model/Picture.js');
var logger = require('tracer').dailyfile({root: './tracer_log'});

exports.updateUser = function (req, res) {
  var nickName = req.body.nick_name;
  var contentType = req.body.content_type;
  var useAsPicture = req.body.as_picture;
  var userID = req.body.user_id;
  var uploader = userID;
  var retUser;

  var fullImageBlobId;
  var thumbnailId;

  var imgRawData =
    req.body.full_image
      .replace(/^data:image\/png;base64,|^data:image\/jpeg;base64,|^data:image\/jpg;base64,|^data:image\/bmp;base64,/,
      "");
  var fullImageBuffer = new Buffer(imgRawData, "base64");

  var imgCropped =
    req.body.thumbnail
      .replace(/^data:image\/png;base64,|^data:image\/jpeg;base64,|^data:image\/bmp;base64,/,
      "");
  var thumbnailBuffer = new Buffer(imgCropped, "base64");

  if (typeof(imgRawData) != 'undefined' && null != imgRawData) {
    logger.log('image raw data is replaced');
    var fullImageBlob = new schema.Blob({
      content: fullImageBuffer,
      contentType: contentType,
      size: fullImageBuffer.length
    });
    // save full image
    fullImageBlob.save(function (saveFullErr, fullImageBlob) {
      if (saveFullErr) {
        logger.log('save full image error : ' + saveFullErr);
        res.end();
        throw saveFullErr;
      } else {
        logger.log('full image blob saved : ' + fullImageBlob._id);
        fullImageBlobId = fullImageBlob._id;
        var thumbnailBlob = new schema.Blob({
          content: thumbnailBuffer,
          contentType: contentType,
          size: thumbnailBuffer.length
        });
        // save thumbnail
        thumbnailBlob.save(function (saveThumbnailErr, thumbnailBlob) {
          if (saveThumbnailErr) {
            logger.log('save thumbnail error : ' + saveThumbnailErr);
            res.end();
            throw saveThumbnailErr;
          } else {
            logger.log('thumbnail image saved : ' + thumbnailBlob._id);
            thumbnailId = thumbnailBlob._id;

            // all 2 images are saved into db
            // save user (+avatar) information
            schema.User.findOne({ userID: userID }, function (err, user) {
              if (err) {
                logger.log('user find error');
                res.end();
                throw err;
              } else {
                logger.log('user find successfully, update nick name');
                if (null != user) {
                  logger.log('user found with avatar data');
                  var conditions = { _id: user._id }
                    , update = { $set: {
                      nickName: nickName,
                      avatarId: thumbnailId
                    }}
                    , options = { multi: false };

                  schema.User.update(conditions, update, options, function (err, numAffected) {
                    if (err) {
                      logger.log('update user information error : ' + err);
                      res.end();
                      throw err;
                    } else {
                      retUser = new User(user._id, user.userID, nickName, thumbnailId,
                        user.status, 0, user.score, user.diamond);
                      logger.log('user update, record number affected = ' + numAffected);
                      if (parseInt(useAsPicture) == 1) {
                        var picture = new schema.Picture({
                          userID: uploader,
                          pictureName: '',
                          uploadDate: new Date().getTime(),
                          contentType: contentType,
                          fullImageBlobId: fullImageBlobId,
                          thumbnailId: thumbnailId,
                          blur: 0,
                          isAvatar: 1,
                          status: 0
                        });
                        picture.save(function (savePicInfoErr) {
                          if (savePicInfoErr) {
                            logger.log('save picture info error : ' +
                              savePicInfoErr);
                            res.end();
                            throw savePicInfoErr;
                          } else {
                            logger.log('picture saved successfully');
                            res.end(JSON.stringify(retUser));
                          }
                        });
                      } else {
                        res.end(JSON.stringify(retUser));
                      }
                    }
                  });
                } else {
                  logger.log('user not found with avatar data');
                  nickName = '新玩家';
                  // if user does not exist, create a new one, it is not likely user is null
                  var user = new schema.User({
                    userID: userID,
                    nickName: nickName,
                    avatarId: '',
                    score: 1000,
                    diamond: 0
                  });
                  // save full image
                  user.save(function (err, savedUser) {
                    if (err) {
                      logger.log('user saving failed');
                      res.end();
                      throw err;
                    } else {
                      logger.log('user saving successfully');
                      retUser = new User(savedUser._id, savedUser.userID,
                        savedUser.nickName, savedUser.avatarId, savedUser.status, 0,
                        savedUser.score, savedUser.diamond);
                      if (parseInt(useAsPicture) == 1) {
                        var picture = new schema.Picture({
                          userID: uploader,
                          pictureName: '',
                          uploadDate: new Date().getTime(),
                          contentType: contentType,
                          fullImageBlobId: fullImageBlobId,
                          thumbnailId: thumbnailId,
                          blur: 0,
                          isAvatar: 1,
                          status: 0
                        });
                        picture.save(function (savePicInfoErr) {
                          if (savePicInfoErr) {
                            logger.log('save picture info error : ' +
                              savePicInfoErr);
                            res.end();
                            throw savePicInfoErr;
                          } else {
                            logger.log('picture saved successfully');
                            res.end(JSON.stringify(retUser));
                          }
                        });
                      } else {
                        res.end(JSON.stringify(retUser));
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  }
  /*
   else {
   // don't update avatar id when no image data is transferred
   schema.User.findOne({ userID: userID }, function (err, user) {
   if (err) {
   logger.log('user find error');
   res.end(err);
   res.end();
   } else {
   logger.log('user find successfully, update nick name');
   if(null != user) {
   logger.log('user found');
   var conditions = { _id: user._id }
   , update = { $set: {
   nickName: nickName
   }}
   , options = { multi: false };

   schema.User.update(conditions, update, options, function (err, numAffected) {
   if(err) {
   logger.log('update user information error : ' + err);
   } else {
   logger.log('user update, record number affected = ' + numAffected);
   }
   res.end();
   });
   } else {
   // if user does not exist, create a new one, it is not likely user is null
   var user = new schema.User({
   userID : userID,
   nickName : '玩家',
   avatarId : '',
   score:1000
   });
   // save raw user info
   user.save(function(err, savedUser) {
   if(err) {
   logger.log('user saving failed');
   throw err;
   res.end(err);
   } else {
   logger.log('user saving successfully');
   res.end();
   }
   });
   }
   }
   });
   }
   */
};

exports.updateUserName = function (req, res) {
  // update user name only when avatar keeps no change
  var userID = req.body.user_id;
  var nickName = req.body.nick_name;
  var conditions = { userID: userID }
    , update = { $set: {
      nickName: nickName
    }}
    , options = { multi: false };

  schema.User.update(conditions, update, options, function (err, numAffected) {
    if (err) {
      logger.log('update user nickname error : ' + err);
      res.end(err);
    } else {
      logger.log('user nickname update, record number affected = ' + numAffected);
      res.end();
    }
  });
};

exports.getUserByID = function (req, res) {
  // get user nick name which is saved previously by wei xin ID

  var userID = req.query.user_id;
  schema.User.findOne({ userID: userID }, function (err, user) {
    if (err) {
      logger.log('user find error');
      res.end(err);
    } else {
      if (null != user) {
        var retUser = new User(user._id, user.userID, user.nickName, user.avatarId, user.status, 0, user.score, user.diamond);
        //logger.log('user nick name found = ' + retUser.nickName);
        res.contentType('json');
        res.send(retUser);
        res.end();
      } else {
        var user = new schema.User({
          userID: userID,
          nickName: '玩家',
          avatarId: '',
          score: 1000,
          diamond: 0
        });
        // save full image
        user.save(function (err, savedUser) {
          if (err) {
            logger.log('user saving failed');
            throw err;
            res.end(err);
          } else {
            logger.log('user saving successfully');
            var retUser =
              new User(savedUser._id, savedUser.userID, savedUser.nickName, savedUser.avatarId,
                user.status, 1, savedUser.score, savedUser.diamond);
            res.contentType('json');
            res.send(retUser);
            res.end();
          }
        });
      }
    }
  });
};

exports.updateUserScore = function (userID, score) {
//    var userID = req.query.user_id;
//    var score =  req.query.score;
  schema.User.update({userID: userID}, { $set: {
    score: score
  }}, function (err, user) {
    if (err) {
      logger.log('update user score error : ' + err);
    }
  });
}

exports.updateScore = function (req, res) {
  var userID = req.body.user_id;
  var score = req.body.score;

  schema.User.update({userID: userID}, { $set: {
    score: score
  }}, function (err, user) {
    if (err) {
      logger.log('update user score error : ' + err);
    }
  });
  res.end();
}

