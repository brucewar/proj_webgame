var userID = "";
var gameID = "";
var gameType = "";
var userWXID = "";

var g_imgURL = "";
var g_link = location.href;
var g_title = "";
var g_desc = "";
var g_hideOption = false;

function getBricksInfo() {
  if (0 == userView) {
    // author mode, generate an empty brick game
    // invoke to get picture information
    getPictureById(pictureID);
  } else if (1 == userView) {
    // player mode, get picture info only
    getBricksByID(bricksID);
  }
}

function getUserInfo() {
  if (null != userWXID && '' != userWXID) {
    $.ajax({
      url: "/user_get?user_id=" + userWXID,
      type: "GET",
      timeout: 20000,
      success: function (data) {
        console.log("get user information successfully");
        nickName = data.nickName;
        avatarID = data.avatarID;
        playerID = data.userID;
        playerStatus = 1;
      },
      error: function (data) {
        console.log("error get user information");
        showFollow(1);
        playerID = randomChar(32);
        nickName = '';
        avatarID = '';
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
  }
}

function getPictureById(pictureId) {
  $.ajax({
    url: '/picture_get_by_id?picture_id=' + pictureId,
    type: "GET",
    timeout: 20000,
    success: function (pic) {
      iconPath = pic.thumbnailId;
      downloadImgPath = pic.fullImageBlobId;
      editorImgPath = '/picture_content?blob_id=' + pic.thumbnailId;
      fullImgPath = '/picture_content?blob_id=' + pic.fullImageBlobId;
      console.log('bricks author mode : ' + editorImgPath);
      picLocked = true;
      editorPicSet = 1;

      g_imgURL = "http://www.googdood.cn:8080/picture_content?blob_id=" + iconPath;
      g_link = location.href;
      g_title = "咕嘟游戏 分享快乐";
      g_desc = "快来玩我创作的拼图游戏 - " + gameName;
      g_hideOption = false;
    },
    error: function (data) {
      // simply print error log
      console.log('create bricks game failed');
    }
  });
}

function getBricksByID(bricksId) {
  $.ajax({
    url: "/bricks_get_by_id",
    data: {bricks_id: bricksId},
    type: "GET",
    timeout: 20000,
    success: function (bricks) {
      //pictureID = bubbles.pictureIDs[0];
      gameName = bricks.gameName;
      pub = bricks.pub;
      userMatrix = eval(bricks.bricksLayout);
      downloadImgPath = bricks.fullImageBlobId;
      editorImgPath = '/picture_content?blob_id=' + bricks.thumbnailId;
      fullImgPath = '/picture_content?blob_id=' + bricks.fullImageBlobId;
      picLocked = false;
      editorPicSet = 1;
      console.log("getBricksById");
      recentPlayers = bricks.lastPlayers;

      setGameIntro();

      g_imgURL = "http://www.googdood.cn:8080/picture_content?blob_id=" + bricks.iconID;
      g_link = location.href;
      g_title = gameName;
      g_desc = "一起来玩拼图游戏\r\n咕嘟游戏.分享快乐";
      g_hideOption = false;
    },
    error: function (data) {
      console.log("get bricks error");
    }
  });
}

function setGameIntro() {
  var gameIconPanel = document.getElementById("game_icon");
  var bricksIntroPic = document.getElementById("bricks_intro_pic");
  var gameNamePanel = document.getElementById('game_name');
  var lastPlayersPanel = document.getElementById('last_players');
  gameIconPanel.src = editorImgPath;
  bricksIntroPic.src = editorImgPath;
  gameNamePanel.innerHTML = gameName;
  var lastPlayed = handleRecentPlayers(recentPlayers);
  if (lastPlayed == '') {
    lastPlayersPanel.innerHTML = "最近没人玩过";
  } else {
    lastPlayersPanel.innerHTML = lastPlayed + " 最近玩过";
  }
  getGameRank(bricksID, 'asc', listGameRank);
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
      avatarIcon = "../../../public_res/avatars/default.png";
    }
    playerName = ranks[i].playerName;
    playerScore = ranks[i].score;
    rankContent += "<tr style='height:50px;'>" +
      "<td style='width:10%;height:48px;text-align:center'><h3>" + (i + 1) + "</h3></td>" +
      "<td style='width:20%;height:48px;'><img style='width:48px;height:48px;' src='" + avatarIcon + "'/></td>" +
      "<td style='width:40%;height:48px;'><h3>" + playerName + "</h3></td>" +
      "<td style='width:30%;height:48px;'>" + playerScore + "秒</td>" +
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

function downloadImage(imageURL, img) {
  //var oImage = document.getElementById(imageURL);
  oImage = img._htmlElementObj;
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  if (typeof canvas.getContext == "undefined" || !canvas.getContext) {
    alert("browser does not support this action, sorry");
    return false;
  }

  /*try*/
  {
    var context = canvas.getContext("2d");
    var width = oImage.width;
    var height = oImage.height;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.drawImage(oImage, 0, 0, width, height);
    var rawImageData = canvas.toDataURL("image/png;base64");
    rawImageData = rawImageData.replace("image/png", "image/octet-stream");
    document.location.href = rawImageData;
    document.body.removeChild(canvas);
  }
  /*
   catch (err) {
   console.log(err);
   document.body.removeChild(canvas);
   alert("Sorry, can't download");
   }
   */
  return true;
}

$(document).ready(function () {
  userWXID = localStorage.getItem('user_wx_id');
  gameType = getGameType();
  userID = getUserID();
  // name and public are passed from gallery
  gameName = getGameName();
  pub = getPublic();

  // bricks is passed from game_list
  bricksID = getGameID();
  pictureID = getPictureID();

  /*
   var tmpNickName = localStorage.getItem('player_nick');
   if(null != tmpNickName) {
   nickName = tmpNickName;
   }
   */
  // fetch user information from server


  // userView = 0 : owner view
  // userView = 1 : player view
  // TODO: fix this logic
  if (null == bricksID || '' == bricksID) {
    console.log('bricksID is empty');
    // redirected from gallery
    if (userWXID == userID) {
      // owner mode
      console.log('userView = 0');
      userView = 0;
      // switch page directly
    } else {
      // we must redirect you to other pages since you are not owner and the game is not created yet
      window.location = '../game_list.html?game_type=0&user_id=' + userID;
    }
  } else {
    console.log('bricksID = ' + bricksID);
    // redirected from game list
    userView = 1;
  }
  getUserInfo();
  getBricksInfo();
});