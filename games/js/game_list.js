var userID = "";
var gameID = "";
var gameType = "";
var userWXID = "";
var GAME_TYPE_BRICKS = "拼图";
var GAME_TYPE_BUBBLES = "消除";
var GAME_TYPE_BANDITS = "老虎机";
var GAME_TYPE_CONNECTS = "连连看";
var from = 0;
var count = 10;
var page = 1;

var g_imgURL = "";
var g_link = location.href;
var g_title = "";
var g_desc = "";
var g_hideOption = false;

var gameList = [];
var gamePersistList = [];

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

function setUserGames(user) {
  var userNickName = user.nickName;
  var userAvatar = user.avatarID;
  if (gameType == "0") {
    g_title = "咕嘟游戏 分享快乐";
    g_desc = userNickName + "邀请你一起来玩他最新创作的拼图游戏";
    g_imgURL = "http://www.googdood.cn:8080/public_res/logo_bricks.png";
  } else if (gameType == "1") {
    g_title = "咕嘟游戏 分享快乐";
    g_desc = userNickName + "邀请你一起来玩他最新创作的消除游戏";
    g_imgURL = "http://www.googdood.cn:8080/public_res/logo_bubbles.png";
  } else if (gameType == "2") {
    g_title = "咕嘟游戏 分享快乐";
    g_desc = userNickName + "邀请你一起来玩他最新创作的老虎机";
    g_imgURL = "http://www.googdood.cn:8080/public_res/logo_bandits.png";
  } else if (gameType == "3") {
    g_title = "咕嘟游戏 分享快乐";
    g_desc = userNickName + "邀请你一起来玩他最新创作的连连看";
    g_imgURL = "http://www.googdood.cn:8080/public_res/logo_connects.png";
  } else {
    console.log("game type error");
    g_title = "游戏类型错误";
    g_desc = "游戏类型错误";
    g_imgURL = "http://www.googdood.cn:8080/public_res/logo.png";
    // prevent user from sharing this page
    g_link = "";
  }
}

function getGames(callback) {
  var getURL = "";
  gameList.length = 0;
  if (gameType == "0") {
    getURL = "/bricks_get?owner_id=" + userID + "&from=" + from + "&count=" + count;
  } else if (gameType == "1") {
    getURL = "/bubbles_get?owner_id=" + userID + "&from=" + from + "&count=" + count;
  } else if (gameType == "2") {
    getURL = "/bandits_get?owner_id=" + userID + "&from=" + from + "&count=" + count;
  } else if (gameType == "3") {
    getURL = "/connects_get?owner_id=" + userID + "&from=" + from + "&count=" + count;
  } else {
    console.log("game type error");
    return false;
  }
  var randChar = randomChar(16);
  getURL = getURL + "&rand=" + randChar;
  $.ajax({
    url: getURL,
    type: "GET",
    timeout: 20000,
    success: function (data) {
      console.log('get games success');
      gameList = eval(data);
      if (gameList.length > 0) {
        gamePersistList.push(gameList);
        if (callback) {
          callback();
          $("#game_list").listview('refresh');
        }
      } else {
        console.log("no more games found");
      }
      /*
       if(gameList.length < count) {
       $("#game_list li:gt(" + (count * (page-1)+page-1 + gameList.length-1) + ")").hide();
       }
       */
    },
    error: function (data) {
      console.log('get games error');
    }
  });
}

function gotoGame(gameID) {
  //gameInstance.pictureID = "";
  var jumpURL = "";
  if (gameType == "0") {
    jumpURL = "./bricks/bricks_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
    window.location = jumpURL;
  }
  if (gameType == "1") {
    jumpURL = "./bubbles/bubbles_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
    window.location = jumpURL;
  }
  if (gameType == "2") {
    jumpURL = "./bandits/bandits_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
    window.location = jumpURL;
  }
  if (gameType == "3") {
    jumpURL = "./connect/connect_game.html?user_id=" + userID + "&game_type=" + gameType + "&game_id=" + gameID;
    window.location = jumpURL;
  }
}

function handleRecentPlayers(lastPlayerJson) {
  var playerList = eval(lastPlayerJson);
  var playerListText = '';
  for (var index = 0; index < playerList.length; index++) {
    playerListText += playerList[index];
    if (index < playerList.length - 1) {
      playerListText += ',';
    } else if (playerList.length == 3) {
      playerListText += '等';
    }
  }
  return playerListText;
}

function listGames() {
  var liContent = "";
  var gameName;
  var gameID;
  var pictureID;
  var playedTimes;
  var lastPlayers;
  var highScore;
  var createDate;
  var liChild = "";
  if (gameType == "0") {
    for (var i = 0; i < gameList.length; i++) {
      var bricksObject = gameList[i];
      // console.log('full bricks object = ' + JSON.stringify(bricksObject));
      var iconID = bricksObject.iconID;
      liChild = "";
      if (i == 0) {
        liChild += 'ui-first-child ';
      }
      if (i == gameList.length - 1) {
        liChild += 'ui-last-child ';
      }

      liContent += "<li data-corners='false' data-shadow='false' data-iconshadow='true' data-wrapperels='div' " +
        "data-icon='arrow-r' data-iconpos='right' data-theme='c' " +
        "class='ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-thumb " + liChild + " ui-btn-up-c'>" +
        "<div class='ui-btn-inner ui-li'>" +
        "<div class='ui-btn-text'>" +
        "<a href='#' class='ui-link-inherit' onclick=gotoGame('" + gameList[i].id + "')>" +
        "<img src='/picture_content?blob_id=" + iconID + "' class='ui-li-thumb'>" +
        "<h2 class='ui-li-heading'>" + gameList[i].gameName + "</h2>";
      var src = "";
      if (gameList[i].lastPlayers != "") {
        // handle recent played
        var recentPlayers = handleRecentPlayers(gameList[i].lastPlayers);
        src = "<p class='ui-li-desc'>最优: " + gameList[i].topTime + "秒 (" + gameList[i].topTimePlayer + ")</p>" +
          "<p class='ui-li-desc'>" + recentPlayers + " 最近玩过" +
          "</p>" +
          "</a>" +
          "</div>" +
          "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
          "</div>" +
          "</li>";
      } else {
        src = "<p>还没有人玩过</p>" +
          "</a>" +
          "</div>" +
          "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
          "</div>" +
          "</li>";
      }
      liContent += src;
    }
  } else if (gameType == "1" || gameType == "3") {
    for (var i = 0; i < gameList.length; i++) {
      var iconID = gameList[i].iconID;
      liChild = "";
      if (i == 0) {
        liChild += 'ui-first-child ';
      }
      if (i == gameList.length - 1) {
        liChild += 'ui-last-child ';
      }

      liContent += "<li data-corners='false' data-shadow='false' data-iconshadow='true' data-wrapperels='div' " +
        "data-icon='arrow-r' data-iconpos='right' data-theme='c' " +
        "class='ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-thumb " + liChild + "ui-btn-up-c'>" +
        "<div class='ui-btn-inner ui-li'>" +
        "<div class='ui-btn-text'>" +
        "<a href='#' class='ui-link-inherit' onclick=gotoGame('" + gameList[i].id + "')>" +
        "<img src='/picture_content?blob_id=" + iconID + "' class='ui-li-thumb'>" +
        "<h2 class='ui-li-heading'>" + gameList[i].gameName + "</h2>"
      var src = "";
      if (gameList[i].lastPlayers != "") {
        var recentPlayers = handleRecentPlayers(gameList[i].lastPlayers);
        src = "<p class='ui-li-desc'>最优: " + gameList[i].topScore + "分 (" + gameList[i].topScorePlayer + ")" + "</p>" +
          "<p class='ui-li-desc'>" + recentPlayers + " 最近玩过</p>" +
          "</a>" +
          "</div>" +
          "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
          "</div>" +
          "</li>";
      } else {
        src = "<p>还没有人玩过</p>" +
          "</a>" +
          "</div>" +
          "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
          "</div>" +
          "</li>";
      }
      liContent += src;
    }
  } else {
    for (var i = 0; i < gameList.length; i++) {
      //var banditsObject  = JSON.parse(JSON.parse(gameList[i].pictureID));
      // console.log(gameList[i]);
      // console.log(JSON.stringify(gameList[i]));
      var iconID = gameList[i].iconID;
      liChild = "";
      if (i == 0) {
        liChild += 'ui-first-child ';
      }
      if (i == gameList.length - 1) {
        liChild += 'ui-last-child ';
      }

      liContent += "<li data-corners='false' data-shadow='false' data-iconshadow='true' data-wrapperels='div' " +
        "data-icon='arrow-r' data-iconpos='right' data-theme='c' " +
        "class='ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-thumb " + liChild + " ui-btn-up-c'>" +
        "<div class='ui-btn-inner ui-li'>" +
        "<div class='ui-btn-text'>" +
        "<a href='#' class='ui-link-inherit' onclick=gotoGame('" + gameList[i].id + "')>" +
        "<img src='/picture_content?blob_id=" + iconID + "' class='ui-li-thumb'>" +
        "<h2 class='ui-li-heading'>" + gameList[i].gameName + "</h2>"
      var src = "";
      if (gameList[i].lastPlayers != "") {
        var recentPlayers = handleRecentPlayers(gameList[i].lastPlayers);
        src = "<p class='ui-li-desc'>最高: " + gameList[i].topScore + "分 (" + gameList[i].topScorePlayer + ")" + "</p>" +
          "<p class='ui-li-desc'>" + recentPlayers + "最近玩过</p>" +
          "</a>" +
          "</div>" +
          "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
          "</div>" +
          "</li>";
      } else {
        src = "<p>还没有人玩过</p>" +
          "</a>" +
          "</div>" +
          "<span class='ui-icon ui-icon-arrow-r ui-icon-shadow'>&nbsp;</span>" +
          "</div>" +
          "</li>";
      }
      liContent += src;
    }
  }
  liContent += "<li id='gamemore' ><a onclick='onGameMore()'>更多...</a></li>";
  $("#game_list").append(liContent);
}

function onGameMore() {
  if (page == 1) {
    $("#game_list li:gt(" + (count * page - 1) + ")").hide();
  }
  else {
    $("#game_list li:gt(" + (count * page + page - 2) + ")").hide();
  }
  from = count * (page);
  getGames(listGames);
  page = page + 1;
}

function gotoGallery() {
  window.location = "./game_creator.html?game_id=" + gameID + "&game_type=" + gameType + "&user_id=" + userID;
}

function goBack() {
  history.back();
}
function loadgame_list() {
  // if(weixingFlag == 0)
  //  window.location.href = "weixingError.html" ;
  userWXID = localStorage.getItem('user_wx_id');
  gameID = getGameID();
  // alert(navigator.userAgent+"------");
  // var agentStr = "Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 MicroMessenger/4.5.255";
  // alert(navigator.userAgent);
  //alert(agentStr==navigator.userAgent);

  /*
   * game type
   * 0 - bricks
   * 1 - bubbles
   * 2 - bandits
   * 3 - connects
   */
  gameType = getGameType();
  userID = getUserID();
  connectsID = getConnectsID();

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

  getUserById(setUserGames);
  getGames(listGames);
}
$(document).ready(function () {
  loadgame_list();
  //setTimeout(function(){loadgame_list()},2000);
});