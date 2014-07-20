function Picture(_id, _userID, _pictureName, _uploadDate, _contentType, _fullImageBlobId, _maskImageBlobId, _thumbnailId, _blur, _isAvatar, _status) {
  this.id = _id;
  this.userID = _userID;
  // default picture name is ""
  this.pictureName = _pictureName;
  this.uploadDate = _uploadDate;
  this.contentType = _contentType;
  this.fullImageBlobId = _fullImageBlobId;
  this.maskImageBlobId = _maskImageBlobId;
  this.thumbnailId = _thumbnailId;
  this.blur = _blur;
  this.isAvatar = _isAvatar;
  this.status = _status;
}

module.exports = Picture;