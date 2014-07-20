/*
 * Googdood web game file upload handler
 * author : zhou_hao@googdood.com
 * date : Jul 17th, 2013
 */

var fs = require('fs');
var util = require('util');
var os = require('os');
var schema = require('../db_schema/schemas');
var Picture = require('../model/Picture.js');
var logger = require('tracer').dailyfile({root: './tracer_log'});

// get picture list according to uploader
/*
 * params :
 * user_id : user id of uploader
 *
 * return :
 * json of picture list
 */
exports.getPicture = function (req, res) {
  var uploader = req.query.user_id;
  var from = req.query.from;
  var count = req.query.count;
  var pictureList = {};
  console.log(">>>>>>>>>> get pictures");
  // find pictures of the uploader
  logger.log('get pictcure in reversed order for user ' + uploader);
  schema.Picture.find({ userID: uploader })
    .where('status').gt(-1)
    .sort({uploadDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, pictures) {
      if (err) {
        logger.log('picture find error');
        res.end(err);
      } else {
        logger.log('picture find successfully');
        res.contentType('json');
        console.log(">>>>>>>>>> pictures got = " + pictures.length);
        res.send(pictures);
        res.end();
      }
    });
};

exports.getCroppedPicture = function (req, res) {
  var uploader = req.query.user_id;
  var from = req.query.from;
  var count = req.query.count;
  var pictureList = {};

  // find pictures of the uploader
  logger.log('get pitcure in reversed order');
  schema.Picture.find({ userID: uploader, thumbnailId: {'$ne': '0'}})
    .where('status').gt(-1)
    .sort({uploadDate: 'desc'})
    .skip(from)
    .limit(count)
    .exec(function (err, pictures) {
      if (err) {
        logger.log('picture find error');
        res.end(err);
      } else {
        logger.log('picture find successfully');
        res.contentType('json');
        res.send(pictures);
        res.end();
      }
    });
};

// get a single picture by id
/*
 * params :
 * picture_id : id of picture
 *
 * return :
 * json of a single picture
 */
exports.getPictureById = function (req, res) {
  var pictureId = req.query.picture_id;
  logger.log('get picture with id = ' + pictureId);
  schema.Picture.findById(pictureId, function (err, picture) {
    if (err) {
      logger.log('picture find error');
      res.end(err);
    } else {
      logger.log('picture find successfully');
      res.contentType('json');
      res.send(picture);
      res.end();
    }
  });
};

// upload picture
/*
 * params :
 * user_id : user id of uploader
 *
 * return :
 * json of picture list
 */
// TODO: need to consider error handling
exports.uploadPicture = function (req, res) {
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

  var contentType = req.body.content_type;
  var blur = req.body.picture_blur;
  var uploader = req.body.user_id;
  var fullImageBlobId;
  var thumbnailId;

  // TODO: optimization
  var fullImageBlob = new schema.Blob({
    content: fullImageBuffer,
    contentType: contentType,
    size: fullImageBuffer.length
  });
  // save full image
  fullImageBlob.save(function (saveFullErr, fullImageBlob) {
    if (saveFullErr) {
      logger.log('save full image error : ' + saveFullErr);
      res.end(saveFullErr);
      throw saveFullErr;
    } else {
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
          res.end(saveThumbnailErr);
          throw saveThumbnailErr;
        } else {
          logger.log('thumbnail image saved : ' + thumbnailBlob._id);
          thumbnailId = thumbnailBlob._id;
          // both 2 images are saved into db
          // save picture information
          var picture = new schema.Picture({
            userID: uploader,
            pictureName: '',
            uploadDate: new Date().getTime(),
            contentType: contentType,
            fullImageBlobId: fullImageBlobId,
            thumbnailId: thumbnailId,
            blur: blur,
            isAvatar: 0,
            status: 0
          });
          picture.save(function (savePicInfoErr, savedPicture) {
            if (savePicInfoErr) {
              logger.log('save picture info erro : ' +
                savePicInfoErr);
              res.end(savePicInfoErr);
              throw savePicInfoErr;
            } else {
              logger.log('picture saved successfully');
              res.end(JSON.stringify(savedPicture));
            }
          });
        }
      });
    }
  });
};

exports.uploadCroppedPicture = function (req, res) {
  var imgCropped =
    req.body.thumbnail
      .replace(/^data:image\/png;base64,|^data:image\/jpeg;base64,|^data:image\/bmp;base64,/,
      "");
  var thumbnailBuffer = new Buffer(imgCropped, "base64");

  var pictureId = req.body.picture_id;
  var contentType = req.body.content_type;
  var blur = req.body.picture_blur;
  var uploader = req.body.user_id;
  var thumbnailId;

  // TODO: optimization
  var thumbnailBlob = new schema.Blob({
    content: thumbnailBuffer,
    contentType: contentType,
    size: thumbnailBuffer.length
  });
  // save thumbnail
  thumbnailBlob.save(function (saveThumbnailErr, thumbnailBlob) {
    if (saveThumbnailErr) {
      logger.log('save thumbnail error : ' + saveThumbnailErr);
      res.end(saveThumbnailErr);
      throw saveThumbnailErr;
    } else {
      logger.log('thumbnail image saved : ' + thumbnailBlob._id);
      thumbnailId = thumbnailBlob._id;
      // both 2 images are saved into db
      // update picture information
      var conditions = { _id: pictureId }
        , update = { $set: {
          thumbnailId: thumbnailId
        }}
        , options = { multi: false };

      schema.Picture.update(conditions, update, options, function (err, numAffected) {
        if (err) {
          logger.log('update thumbnail picture error : ' + err);
          res.end(err);
        } else {
          logger.log('update thumbnail picture successfully, record number affected = ' + numAffected);
          res.send(thumbnailId);
          res.end();
        }
      });
    }
  });
};

exports.uploadPictureViaWeixin = function (req, res) {
  logger.log('received request from wei xin server');
  //logger.log(req.body.image_url);
  //logger.log(req.body.user_id);
  var imageURL = req.body.image_url;
  var userID = req.body.user_id;
  logger.log('received picture from user' + userID);
  loadBase64Image(userID, imageURL, savePictureFromWXServer);
  res.end();
};

/*
 exports.testImageGet = function(req, res) {
 logger.log('test image get');
 loadBase64Image('123', 'http://mmsns.qpic.cn/mmsns/RE9mMdVVG2pROALsScods68QMn21coTsoPOYnUIM8yGWQ6zVZ3ZRNA/0',
 savePictureFromWXServer);
 res.end();
 };
 */

function savePictureFromWXServer(userID, imgRawData, imgPrefix, contentType) {
  var fullImageBuffer = new Buffer(imgRawData, "base64");
  var fullImageBlob = new schema.Blob({
    content: fullImageBuffer,
    contentType: contentType,
    size: fullImageBuffer.length
  });
  // save full image only
  fullImageBlob.save(function (saveFullErr, fullImageBlob) {
    if (saveFullErr) {
      logger.log('save full image error : ' + saveFullErr);
      throw saveFullErr;
    } else {
      fullImageBlobId = fullImageBlob._id;
      // no thumbnail if user upload file from weixin
      var picture = new schema.Picture({
        userID: userID,
        pictureName: '',
        uploadDate: new Date().getTime(),
        contentType: contentType,
        fullImageBlobId: fullImageBlobId,
        thumbnailId: 0,
        blur: 0,
        isAvatar: 0,
        status: 0
      });
      picture.save(function (savePicInfoErr) {
        if (savePicInfoErr) {
          logger.log('save picture info error : ' +
            savePicInfoErr);
          throw savePicInfoErr;
        } else {
          logger.log('picture saved successfully');
        }
      });
    }
  });
}

exports.serveBlobById = function (req, res) {
  var blobId = req.query.blob_id;
  schema.Blob.findById(blobId, function (err, pic) {
    if (err) {
      logger.log('fetch picture content error : ' + err);
      res.write('');
      res.end();
    } else {
      // logger.log('fetch picture content successfully');
      res.write(pic.content, 'binary');
      res.end();
    }
  });
};

exports.deletePicture = function (req, res) {
  var pictureId = req.body.picture_id;
  var conditions = { _id: pictureId }
    , update = { $set: {
      status: -1
    }}
    , options = { multi: false };

  schema.Picture.update(conditions, update, options, function (err, numAffected) {
    if (err) {
      logger.log('delete picture error : ' + err);
      res.end(err);
    } else {
      logger.log('picture deleted, record number affected = ' + numAffected);
      res.end();
    }
  });
};

exports.downloadBlobById = function (req, res) {
  var blobId = req.query.blob_id;
  var fileName;
  var contentType = '';
  logger.log('download picture content with id = ' + blobId);
  schema.Blob.findById(blobId, function (err, pic) {
    if (err) {
      logger.log('download picture content error : ' + err);
      res.write('');
      res.end();
    } else {
      contentType = pic.contentType;
      // ignore file name
      fileName = randomChar(16);
      if (contentType == 'image/jpeg' || contentType == 'image/jpg') {
        fileName += '.jpg';
      } else if (contentType == 'image/png') {
        fileName += '.png';
      } else if (contentType == 'image/bmp') {
        fileName += '.bmp';
      }
      logger.log('download picture content successfully');
      logger.log('filename = ' + fileName);
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-type', contentType);
      res.end(pic.content);
    }
  });
};

// util functions
function randomChar(l) {
  var x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
  var tmp = "";
  for (var i = 0; i < l; i++) {
    tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
  }
  return  tmp;
}

function loadBase64Image(userID, url, callback) {
  // Required 'request' module
  var request = require('request');

  // Make request to our image url
  request({url: url, encoding: null}, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      // So as encoding set to null then request body became Buffer object
      var base64prefix = 'data:' + res.headers['content-type'] + ';base64,'
        , image = body.toString('base64');
      //logger.log('base64 image content = ' + image);
      //logger.log('base64 prefix = ' + base64prefix);

      if (typeof callback == 'function') {
        callback(userID, image, base64prefix, res.headers['content-type']);
      }
    } else {
      throw new Error('Can not download image');
    }
  });
};