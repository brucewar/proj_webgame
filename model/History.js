function History(_id, _ownerID, _playerID, _gameType, _playDate, _status) {
  this.id = _id;
  this.ownerID = _ownerID;
  this.playerID = _playerID;
  this.gameType = _gameType;
  this.playDate = _playDate;
  this.status = _status;
}

module.exports = History;