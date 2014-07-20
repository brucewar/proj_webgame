var userID = "";
var gameID = "";
var gameType = "";
var gameName = "";
var userWXID = "";
var connects = "";
var startTimer = false;
var connect_userScore = 0;
var user_diamond = 0;
var g_imgURL = "";
var g_link = location.href;
var g_title = "";
var g_desc = "";
var g_hideOption = false;

function getConnectsByID() {
  $.ajax({
    url: "/connects_get_by_id",
    data: {connects_id: gameID},
    type: "GET",
    timeout: 20000,
    success: function (connects) {
      gameName = connects.gameName;
      pub = connects.pub;
      var tmpNickName = localStorage.getItem('player_nick');
      if (null != tmpNickName) {
        nickName = tmpNickName;
      }
      getConnectsInfo(connects);
    },
    error: function (data) {
      console.log("get connects error");
    }
  });
}

function getUserInfo() {

  if (null != userWXID && '' != userWXID) {
    $.ajax({
      url: "/user_get?user_id=" + userWXID,
      type: "GET",
      timeout: 20000,
      success: function (data) {
        console.log("get user information successfully!!!!!");
        nickName = data.nickName;
        avatarID = data.avatarID;
        playerID = data.userID;
        connect_userScore = data.score;
        user_diamond = data.diamond;
        console.log("user_diamond=" + user_diamond);
        if (connect_userScore == undefined) {
          connect_userScore = 1000;
        } else if (connect_userScore < 100) {
          alert("你的金币数不足，无法进行有效！");
          window.history.back();
        }
        if (user_diamond == undefined) {
          user_diamond = 0;
        }
        playerStatus = 1;
      },
      error: function (data) {
        console.log("error get user information");
        showFollow(1);
        playerID = randomChar(32);
        nickName = '';
        avatarID = '';
        connect_userScore = 1000;
        user_diamond = 0;
        playerStatus = 0;
      }
    });
  } else {
    console.log('you are just in trial');
    showFollow(1);
    playerID = randomChar(32);
    nickName = '';
    avatarID = '';
    playerStatus = 0;
    connect_userScore = 1000;
    user_diamond = 0;
  }
}

function getConnectsInfo(connects) {
  var thumbnailId = eval(connects.thumbnailId);
  var fullImageBlobId = eval(connects.fullImageBlobId);
  if (thumbnailId[0] != null) {
    editorImgPath = '/picture_content?blob_id=' + thumbnailId[0];
  }
  if (thumbnailId[1] != null) {
    editorImgPath1 = '/picture_content?blob_id=' + thumbnailId[1];
  }
  if (thumbnailId[2] != null) {
    editorImgPath2 = '/picture_content?blob_id=' + thumbnailId[2];
  }
  if (thumbnailId[3] != null) {
    editorImgPath3 = '/picture_content?blob_id=' + thumbnailId[3];
  }
  if (thumbnailId[4] != null) {
    editorImgPath4 = '/picture_content?blob_id=' + thumbnailId[4];
  }
  var N = Math.floor(Math.random() * 5);
  console.log(fullImageBlobId[N]);
  FullPicture = '/picture_content?blob_id=' + fullImageBlobId[N];
  fullImgPath = fullImageBlobId[N];


  recentPlayers = connects.lastPlayers;

  setGameIntro();

  g_imgURL = "http://www.googdood.cn:8080/picture_content?blob_id=" + thumbnailId[0];
  g_link = location.href;
  g_title = gameName;
  g_desc = "一起来玩连连看\r\n咕嘟游戏.分享快乐";
  g_hideOption = false;
}

function setGameIntro() {
  var gameIconPanel = document.getElementById("game_icon");
  var gameNamePanel = document.getElementById('game_name');
  var lastPlayersPanel = document.getElementById('last_players');
  gameIconPanel.src = editorImgPath;
  gameNamePanel.innerHTML = gameName;
  var lastPlayed = handleRecentPlayers(recentPlayers);
  if (lastPlayed == '') {
    lastPlayersPanel.innerHTML = "最近没人玩过";
  } else {
    lastPlayersPanel.innerHTML = lastPlayed + " 最近玩过";
  }
  getGameRank(gameID, 'desc', listGameRank);
}

function getGameRank(gameId, sortOrder, callback) {
  var randChar = randomChar(16);
  $.ajax({
    url: "/game_rank_get?rand=" + randChar,
    data: {game_id: gameId, sort_order: sortOrder},
    type: "GET",
    timeout: 20000,
    success: function (ranks) {
      if (callback) {
        console.log("game rank got");
        callback(ranks);
      }
    },
    error: function (data) {
      console.log("get game rank error");
    }
  });
}

function listGameRank(ranks) {
  var rankList = document.getElementById("game_rank_list");
  var rankContent = "";
  var avatarIcon = "";
  var playerName = "";
  var playerScore = "";
  for (var i = 0; i < ranks.length; i++) {
    if (typeof ranks[i].playerAvatar != 'undefined' &&
      null != ranks[i].playerAvatar &&
      '' != ranks[i].playerAvatar) {
      avatarIcon = "/picture_content?blob_id=" + ranks[i].playerAvatar;
    } else {
      avatarIcon = "./js/res/shit.png";
    }
    playerName = ranks[i].playerName;
    playerScore = ranks[i].score;
    rankContent += "<tr style='height:50px;'>" +
      "<td style='width:10%;height:48px;text-align:center'><h3>" + (i + 1) + "</h3></td>" +
      "<td style='width:20%;height:48px;'><img style='width:48px;height:48px;' src='" + avatarIcon + "'/></td>" +
      "<td style='width:40%;height:48px;'><h3>" + playerName + "</h3></td>" +
      "<td style='width:30%;height:48px;'>" + playerScore + "</td>" +
      "</tr>";
  }
  rankList.innerHTML = rankContent;
}

function handleRecentPlayers(lastPlayerJson) {
  var playerList = eval(lastPlayerJson);
  var playerListText = '';
  if (playerList != undefined) {
    for (var index = 0; index < playerList.length; index++) {
      playerListText += playerList[index];
      if (index < playerList.length - 1) {
        playerListText += ',';
      } else if (playerList.length == 3) {
        playerListText += '等';
      }
    }
  }
  return playerListText;
}

function enterGame() {
  $.mobile.changePage("#game", {transition: "slide", changeHash: false});
  startTimer = true;

}

function share(show) {
  var UA = "";
  if ('undefined' != typeof navigator && null != navigator) {
    UA = navigator.userAgent;
  }
  if (UA.indexOf("MicroMessenger") < 0) {
    alert('如果您喜欢，请复制本链接，并转发给好友');
    return;
  }
  var shareLayer = document.getElementById("share_layer");
  if (1 == show) {
    shareLayer.style.display = "block";
  } else {
    shareLayer.style.display = "none";
  }
}

function showFollow(show) {
  var UA = "";
  if ('undefined' != typeof navigator && null != navigator) {
    UA = navigator.userAgent;
  }
  if (UA.indexOf("MicroMessenger") < 0) {
    return;
  }
  var shareLayer = document.getElementById("follow_hint_layer");
  if (1 == show) {
    shareLayer.style.display = "block";
  } else {
    shareLayer.style.display = "none";
  }
}

$(document).ready(function () {
  userWXID = localStorage.getItem('user_wx_id');
  gameID = getGameID();
  gameType = getGameType();
  userID = getUserID();
  getUserInfo();
  getConnectsByID();
});
