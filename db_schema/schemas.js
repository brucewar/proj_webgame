var mongoose = require('mongoose');
var Schema = mongoose.Schema;   //一种模型骨架，不具备数据库操作的能力
mongoose.connect('mongodb://127.0.0.1/gd_webgame');

// schema definition

var Blob = mongoose.model('blob', {
  content: Buffer,
  contentType: String,
  size: Number,
  status: Number
});

var Picture = mongoose.model('picture', {
  userID: String,
  pictureName: String,
  uploadDate: Date,
  contentType: String,
  fullImageBlobId: String,
  thumbnailId: String,
  blur: Number,
  isAvatar: Number,
  status: Number
});

var Bricks = mongoose.model('brick', {
  gameName: String,
  ownerID: String,
  createDate: Date,
  pictureID: String,
  iconID: String, // icon directly points to the blob
  bricksLayout: String, // json of pictureID
  public: Number,
  playedTimes: Number,
  topTime: Number,
  topTimePlayer: String,
  lastPlayers: String,
  status: Number
});

var Bubbles = mongoose.model('bubble', {
  gameName: String,
  ownerID: String,
  createDate: Date,
  pictureIDs: String, // json of id of array
  iconID: String, // icon directly points to the blob
  public: Number,
  playedTimes: Number,
  topScore: Number,
  topScorePlayer: String,
  lastPlayers: String,
  status: Number,
  deadLine: String
});

var Bandits = mongoose.model('bandits', {
  gameName: String,
  ownerID: String,
  createDate: Date,
  pictureID: String, // json of pictureID
  iconID: String, // icon directly points to the blob
  public: Number,
  playedTimes: Number,
  topScore: Number,
  topScorePlayer: String,
  lastPlayers: String,
  status: Number
});

var Connects = mongoose.model('connect', {
  gameName: String,
  ownerID: String,
  ownerName: String,
  createDate: Date,
  pictureIDs: String, // json of id of array
  iconID: String, // icon directly points to the blob
  public: Number,
  playedTimes: Number,
  topScore: Number,
  topScorePlayer: String,
  lastPlayers: String,
  status: Number
});

var Game = mongoose.model('game', {
  ownerID: String,
  ownerName: String,
  gameType: Number,
  createDate: Date,
  gameName: String,
  pictureID: String,
  iconID: String,
  bricksLayout: String,
  gameID: String,
  status: Number
});

var User = mongoose.model('user', {
  userID: String,
  nickName: String,
  avatarId: String,
  score: Number,
  diamond: Number,
  status: Number
});

var History = mongoose.model('history', {
  ownerID: String,
  playerID: String,
  gameType: Number,
  playDate: Date,
  status: Number
});

var GameRecord = mongoose.model('gameRecord', {
  gameID: String,
  playerID: String,
  playerName: String,
  playerAvatar: String,
  score: Number
});

var Diamond = mongoose.model('diamond', {
  diamondToGold: Number,
  oneMoneyToDiamond: Number
});

exports.Blob = Blob;
exports.Picture = Picture;
exports.User = User;
exports.Game = Game;
exports.Bricks = Bricks;
exports.Bubbles = Bubbles;
exports.Bandits = Bandits;
exports.Connects = Connects;
exports.History = History;
exports.GameRecord = GameRecord;
exports.Diamond = Diamond;