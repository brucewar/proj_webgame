// global vars for WS share
var g_imgURL = "http://www.googdood.cn:8080/public_res/logo_bandits.png";
var g_link = location.href;
var g_title = "";
var g_desc = "";
var g_hideOption = false;

var userID = "";
var gameID = "";
var gameType = "";
var userWXID = "";
var GAME_TYPE_BRICKS = "拼图";
var GAME_TYPE_BUBBLES = "消除";
var GAME_TYPE_BANDITS = "老虎机";
var GAME_TYPE_CONNECTS = "连连看";

var playerLatestGame = null;
var userNickName = "";
var userAvatar = "";
var pictureID;
var iconID;

function getUserById(callback) {
  var getURL = "/user_get?user_id=" + userID;
  $.ajax({
    url: getURL,
    type: "GET",
    timeout: 20000,
    success: function (data) {
      console.log('get user info success, data = ' + data);
      if (null != data && "" != data) {
        if (callback) {
          callback(data);
        }
      }
    },
    error: function (data) {
      console.log('get user error');
    }
  });
}

function showUserInfo(user) {
  userNickName = user.nickName;
  userAvatar = user.avatarID;
  var gameListDiv = document.getElementById("user_game_list");
  var userNickNameSpan = document.getElementById("user_nick_name");
  gameListDiv.style.display = "block";
  userNickNameSpan.innerHTML = userNickName + "创建的游戏";
  g_title = "咕嘟游戏 分享快乐";
  g_desc = userNickName + "的游戏空间欢迎你";
  g_imgURL = "http://www.googdood.cn:8080/picture_content?blob_id=" + userAvatar;
}

function getOwnerLatestGame(callback) {
  var randChar = randomChar(16);
  var getURL = "/game_get_user_last?owner_id=" + userID + "&rand=" + randChar;

  $.ajax({
    url: getURL,
    type: "GET",
    timeout: 20000,
    success: function (data) {
      console.log('get owner latest game success, data = ' + data);
      playerLatestGame = data;
      if (null != playerLatestGame && "" != playerLatestGame) {
        if (callback) {
          callback();
        }
      }
    },
    error: function (data) {
      console.log('get owner latest game error');
    }
  });
}

function showGame() {
  console.log('player latest game = ' + playerLatestGame.gameName);
  var liContent = "";
  // picture object is a json of picture
  gameID = playerLatestGame.gameID;
  iconID = playerLatestGame.iconID;
  var gameTypeName = "";
  switch (playerLatestGame.gameType) {
    case 0:
      gameTypeName = "拼图";
      break;
    case 1:
      gameTypeName = "消除";
      break;
    case 2:
      gameTypeName = "老虎机";
      break;
    case 3:
      gameTypeName = "连连看";
      break;
    default:
      gameTypeName = "出错啦!";
      break;
  }
  liContent += "<li data-corners='false' data-shadow='false' data-iconshadow='true' data-wrapperels='div' " +
    "data-icon='arrow-r' data-iconpos='right' data-theme='c' " +
    "class='ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-thumb ui-first-child ui-last-child ui-btn-up-c'>" +
    "<div class='ui-btn-inner ui-li'>" +
    "<div class='ui-btn-text'>" +
    "<a href='#' class='ui-link-inherit' onclick=gotoGame()>" +
    "<img src='/picture_content?blob_id=" + iconID + "' class='ui-li-thumb'>" +
    "<h2 class='ui-li-heading'>" + playerLatestGame.ownerName + "的最新游戏:</h2>" +
    "<p class='ui-li-desc'>" + gameTypeName + ":" + playerLatestGame.gameName + "</p>" +
    "</a>" +
    "</div>" +
    "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
    "</div>" +
    "</li>";
  $("#latest_game_list").append(liContent);
}

function gotoGameList(index) {
  window.location = './game_list.html?game_type=' + index + '&game_id=0&user_id=' + userID;
}

function gotoGame() {
  var jumpURL = "";
  switch (parseInt(playerLatestGame.gameType)) {
    case 0:
      jumpURL = "./bricks/bricks_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
      window.location = jumpURL;
      break;
    case 1:
      jumpURL = "./bubbles/bubbles_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
      window.location = jumpURL;
      break;
    case 2:
      jumpURL = "./bandits/bandits_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
      window.location = jumpURL;
      break;
    case 3:
      jumpURL = "./connect/connect_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
      window.location = jumpURL;
      break;
    default:
      break;
  }
}

function gotoGallery() {
  window.location = "../gallery/gallery.html?game_id=" + gameID + "&game_type=" + gameType + "&user_id=" + userID;
}

function loadgame_index() {
  /*
   if(weixingFlag == 0)
   window.location.href = "weixingError.html";
   */
  userWXID = localStorage.getItem('user_wx_id');
  /*
   * game type
   * 0 - bricks
   * 1 - bubbles
   * 2 - bandits
   * 3 - connects
   */
  userID = getUserID();
  connectsID = getConnectsID();
  console.log(connectsID);


  // initialize title according to game type
  // setGameTitle(gameType);

  // userView = 0 : owner view
  // userView = 1 : player view

  if (null == userWXID || '' == userWXID) {
    // this is player
    console.log('newbee player view');
    userView = 1;
  } else if (userWXID == userID) {
    // this is gallery owner
    console.log('author view');
    userView = 0;
  } else {
    // this is a player
    console.log('experienced player view');
    userView = 1;
  }

  // hide create game button in player mode
  if (null != userID) {
    getUserById(showUserInfo);
    getOwnerLatestGame(showGame);
  }
}
$(document).ready(function () {
  //setTimeout(function(){loadgame_index()},2000);
  loadgame_index();
});