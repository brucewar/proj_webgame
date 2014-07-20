var userID = "";
var gameID = "";
var gameType = "";
var userWXID = "";

var g_imgURL = "";
var g_link = location.href;
var g_title = "";
var g_desc = "";
var g_hideOption = false;
var g_gameGold = 100;       //required gold for playing game
var g_gameState = 0;

$(document).ready(function () {
  userWXID = localStorage.getItem('user_wx_id');
  console.log(userWXID);
  gameID = getGameID();
  gameType = getGameType();
  userID = getUserID();
  getUserInfo();
  getBubblesByID();
});

function getBubblesInfo(bubbles) {
  // author mode, generate an empty bubble game
  var thumbnailPaths = eval(bubbles.thumbnailId);
  var fullImgPaths = eval(bubbles.fullImageBlobId);
  fullImageBlod_id = fullImgPaths[0];
  stoneImgPath = '/picture_content?blob_id=' + thumbnailPaths[0];
  fullImgPath = '/picture_content?blob_id=' + fullImgPaths[0];
  recentPlayers = bubbles.lastPlayers;
  console.log('bubbles author mode : ' + stoneImgPath);
  setGameIntro();
  g_imgURL = "http://www.googdood.cn:8080/picture_content?blob_id=" + thumbnailPaths[0];
  g_link = location.href + "&from=message&isappinstalled=0";
  g_title = gameName;
  g_desc = "一起来玩消除游戏\r\n咕嘟游戏.分享快乐";
  g_hideOption = false;
}

function setGameIntro() {
  var bubblesPrizePic = document.getElementById("bubbles_prize_pic");
  bubblesPrizePic.src = fullImgPath;
  var gameIconPanel = document.getElementById("game_icon");
  var gameNamePanel = document.getElementById('game_name');
  var lastPlayersPanel = document.getElementById('last_players');
  gameIconPanel.src = stoneImgPath;
  gameNamePanel.innerHTML = gameName;
  var lastPlayed = handleRecentPlayers(recentPlayers);
  if (lastPlayed == '') {
    lastPlayersPanel.innerHTML = "最近没人玩过";
  } else {
    lastPlayersPanel.innerHTML = lastPlayed + " 最近玩过";
  }
  getGameRank(gameID, 'desc', listGameRank);
}

function getUserInfo() {
  if (null != userWXID && '' != userWXID) {
    // experienced players
    $.ajax({
      url: "/user_get?user_id=" + userWXID + "&s=" + new Date().getTime(),
      type: "GET",
      timeout: 20000,
      success: function (data) {
        console.log("get user information successfully");
        nickName = data.nickName;
        avatarID = data.avatarID;
        playerID = data.userID;
        gold = data.score;
        console.log('playerStatus = 1');
        playerStatus = 1;
      },
      error: function (data) {
        // new player
        console.log("error get user information");
        console.log('you are just in trial, the system will allocate a new name and ID for you');
        playerID = randomChar(32);
        //localStorage.setItem('user_wx_id', tempID);
        showFollow(1);
        //playerID = '';
        nickName = '';
        avatarID = '';
        playerStatus = 0;
      }
    });
  } else {
    // new player
    console.log('you are just in trial, the system will allocate a new name and ID for you');
    playerID = randomChar(32);
    //localStorage.setItem('user_wx_id', tempID);
    showFollow(1);
    //playerID = '';
    nickName = '';
    avatarID = '';
    playerStatus = 0;
  }
}

function getGameRank(gameId, sortOrder, callback) {
  var randChar = randomChar(16);
  $.ajax({
    url: "/game_rank_get?rand=" + randChar,
    data: {game_id: gameId, sort_order: sortOrder, s: new Date().getTime()},
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
      avatarIcon = "./js/res/0.png";
    }
    playerName = ranks[i].playerName;
    playerScore = ranks[i].score;
    rankContent += "<tr style='height:50px;'>" +
      "<td style='width:10%;height:48px;text-align:center'><h3>" + (i + 1) + "</h3></td>" +
      "<td style='width:20%;height:48px;'><img style='width:48px;height:48px;' src='" + avatarIcon + "'/></td>" +
      "<td style='width:40%;height:48px;'><a href='http://weibo.com/n/" + playerName + "' style='text-decoration:none;color:#14a0cd;'>@" + playerName + "</a></td>" +
      "<td style='width:30%;height:48px;'>" + playerScore + "分</td>" +
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
//    g_gameState = 1;
//    if(null == gold){
//        gold = 900;
//        $.mobile.changePage("#game", {transition:"slide", changeHash:false});
//    }else if(gold<g_gameGold){
//        alert("金币不足！");
//    }else{
//        gold -= g_gameGold;
//        $.mobile.changePage("#game", {transition:"slide", changeHash:false});
//    }
  $.mobile.changePage("#game", {transition: "slide", changeHash: false});
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

function getBubblesByID() {
  $.ajax({
    url: "/bubbles_get_by_id",
    data: {bubbles_id: gameID, s: new Date().getTime()},
    type: "GET",
    timeout: 20000,
    success: function (bubbles) {
      //pictureID = bubbles.pictureIDs[0];
      gameName = bubbles.gameName;
      pub = bubbles.pub;
      var valid = bubbles.valid;
      var playValid = document.getElementById("play_valid");
      var playInvalid = document.getElementById("play_invalid");
      var deadLine = document.getElementById("dead_line");
      if (valid == 1) {
        playValid.style.display = "block";
        playInvalid.style.display = "none";
        deadLine.innerHTML = "截止时间:<span>" + bubbles.deadLine + "</span>,本期奖品如下：";
      } else {
        playValid.style.display = "none";
        playInvalid.style.display = "block";
        if (gameID == "52553230d5c3028623000005") {
          deadLine.innerHTML = "本期奖品获得者是汞园子";
        } else {
          deadLine.innerHTML = "本期奖品获得者是" + bubbles.topScorePlayer;
        }
      }
      var tmpNickName = localStorage.getItem('player_nick');
      if (null != tmpNickName) {
        nickName = tmpNickName;
      }
      getBubblesInfo(bubbles);
    },
    error: function (data) {
      console.log("get bubbles error");
    }
  });
}
/*
 window.onbeforeunload = refresh;
 window.onunload = refresh;
 */
window.onbeforeunload = refresh;

function refresh() {
  return "游戏数据将丢失，确定要刷新吗？";
}