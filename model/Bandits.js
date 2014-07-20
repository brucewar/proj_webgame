function Bandits(_id, _gameName, _ownerID, _createDate, _pictureID, _iconID, _public, _playedTimes, _topScore, _topScorePlayer, _lastPlayers, _fullImageBlobId, _thumbnailId, _status) {
  this.id = _id;
  this.gameName = _gameName;
  this.ownerID = _ownerID;
  this.createDate = _createDate;
  this.pictureID = _pictureID;
  this.iconID = _iconID;
  this.pub = _public;
  this.playedTimes = _playedTimes;
  this.topScore = _topScore;
  this.topScorePlayer = _topScorePlayer;
  this.lastPlayers = _lastPlayers;
  this.fullImageBlobId = _fullImageBlobId;
  this.thumbnailId = _thumbnailId;
  this.status = _status;
}

module.exports = Bandits;