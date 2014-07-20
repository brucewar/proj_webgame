var userID = "";
var redirectTo = "";

var g_imgURL = "";
var g_link = "";
var g_title = "";
var g_desc = "";
var g_hideOption = true;

$(document).ready(function () {
  userID = getUserID();
  redirectTo = getRedirectTo();
  // in simple case, we consider the userID as user WX id and save it
  // enhanced on 2013-09-08: if a newbie player registered via game score updating, we make
  // a priority on local storage value
  var localUserID = localStorage.getItem('user_wx_id');
  if (null == localUserID) {
    // please confirm this statement works on all types of device !!
    localStorage.setItem('user_wx_id', userID);
  } else {
    userID = localUserID;
  }
  timeout();
});

function timeout() {
  window.setTimeout('redir()', 1000);
}

function redir() {
  if ("user" == redirectTo) {
    window.location = './index.html?user_id=' + userID;
  } else if ("gallery" == redirectTo) {
    window.location = '../gallery/gallery.html?user_id=' + userID;
  } else if ("game" == redirectTo) {
    window.location = "../games/game_index.html?user_id=" + userID;
  } else {
    alert("您目前是一位不受欢迎的来客，请关注我们的公众账号'咕嘟游戏'");
  }
}