function Game(_id, _ownerID, _ownerName, _gameType, _createDate, _gameName, _pictureID, _iconID, _bricksLayout, _gameID, _status) {
  this.id = _id;
  this.ownerID = _ownerID;
  this.ownerName = _ownerName;
  this.gameType = _gameType;
  this.gameName = _gameName;
  // picture ID for all games
  this.pictureID = _pictureID;
  this.iconID = _iconID;
  this.bricksLayout = _bricksLayout;
  this.gameID = _gameID;
  this.createDate = _createDate;
  this.status = _status;
}

module.exports = Game;