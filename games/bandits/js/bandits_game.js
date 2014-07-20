var userID = "";
var gameID = "";
var gameType = "";
var userWXID = "";
var bandits = "";
var banditsGame = null;
var topScore = null;
var userScore = 0;

var g_imgURL = "";
var g_link = location.href;
var g_title = "";
var g_desc = "";
var g_hideOption = false;

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
function createInfo() {
//    var tmpPicture = bandits.pictureID;
//    if (null != tmpPicture && "" != tmpPicture) {
//        picture = JSON.parse(JSON.parse(tmpPicture)[0]);
//    }
  // picture should never be an empty string since picture json is passed from game list as well
  gameName = bandits.gameName;
  pub = bandits.pub;

  // bricks is passed from game_list
  topScore = bandits.topScore;

  // set variables for weixin share
  g_imgURL = "http://www.googdood.cn:8080/picture_content?blob_id=" + bandits.iconID;
  editorImgPath = "/picture_content?blob_id=" + bandits.thumbnailId;
  g_link = location.href;
  g_title = gameName;
  g_desc = "一起来玩老虎机\r\n咕嘟游戏.分享快乐";
  g_hideOption = false;

  // userView = 0 : owner view
  // userView = 1 : player view
  if (null == bandits || '' == bandits) {
    userView = 0;
  } else {
    userView = 1;
  }


}
$(document).ready(function () {
  userWXID = localStorage.getItem('user_wx_id');
  gameType = getGameType();
  userID = getUserID();
  gameID = getGameID();
  getBandits();
  getUserInfo();

  /*
   * You could not play bandits with others' account, since you may cause their score flying away :(
   */
});

function getBandits() {
  $.ajax({
    url: "/bandits_get_by_id?bandits_id=" + gameID,
    type: "GET",
    timeout: 20000,
    success: function (data) {
      bandits = data;
      createInfo();
    },
    error: function (data) {
      console.log("error bandits_get_by_id");
    }
  });
}

function getUserInfo() {

  if (null != userID && '' != userID) {
    console.log('you can play bandits game with your current account');
    $.ajax({
      url: "/user_get?user_id=" + userID,
      type: "GET",
      timeout: 20000,
      success: function (data) {
        nickName = data.nickName;
        avatarID = data.avatarID;
        userScore = data.score;
        playerID = data.userID;
        if (userScore == undefined) {
          userScore = 1000;
        }
        playerStatus = 1;
        console.log(userScore + "----");
      },
      error: function (data) {
        console.log("error user_get_score");
        userScore = 1000;
        playerStatus = 0;
      }
    });
  } else {
    console.log('you are just in trial');
    userScore = 100;
    playerStatus = 0;
  }
}

