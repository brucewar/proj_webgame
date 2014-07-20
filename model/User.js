function User(_id, _userID, _nickName, _avatarID, _status, _isNew, score, diamond) {
  this.id = _id;
  this.userID = _userID;
  this.nickName = _nickName;
  this.avatarID = _avatarID;
  this.status = _status;
  this.isNew = _isNew;
  this.score = score;
  this.diamond = diamond;
}

module.exports = User;