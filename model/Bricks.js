function Bricks(_id, _gameName, _ownerID, _createDate, _pictureID, _iconID, _bricksLayout, _public, _playedTimes, _topTime, _topTimePlayer, _lastPlayers, _fullImageBlobId, _thumbnailId, _status) {
  this.id = _id;
  this.gameName = _gameName;
  this.ownerID = _ownerID;
  this.createDate = _createDate;
  this.pictureID = _pictureID;
  this.iconID = _iconID;
  this.bricksLayout = _bricksLayout;
  this.pub = _public;
  this.playedTimes = _playedTimes;
  this.topTime = _topTime;
  this.topTimePlayer = _topTimePlayer;
  this.lastPlayers = _lastPlayers;
  this.fullImageBlobId = _fullImageBlobId;
  this.thumbnailId = _thumbnailId;
  this.status = _status;
}

module.exports = Bricks;