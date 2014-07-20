function Bubbles(_id, _gameName, _ownerID, _createDate, _pictureIDs, _iconID, _public, _playedTimes, _topScore, _topScorePlayer, _lastPlayers, _fullImageBlobId, _thumbnailId, _status, _deadLine, _valid) {
  this.id = _id;
  this.gameName = _gameName;
  this.ownerID = _ownerID;
  this.createDate = _createDate;
  this.pictureID = _pictureIDs;
  this.iconID = _iconID;
  this.pub = _public;
  this.playedTimes = _playedTimes;
  this.topScore = _topScore;
  this.topScorePlayer = _topScorePlayer;
  this.lastPlayers = _lastPlayers;
  this.fullImageBlobId = _fullImageBlobId;
  this.thumbnailId = _thumbnailId;
  this.status = _status;
  this.deadLine = _deadLine;
  this.valid = _valid;
}

module.exports = Bubbles;