var fullImageContent = "";
var thumbnailContent = "";
var contentType = "";

var g_imgURL = "";
var g_link = "";
var g_title = "";
var g_desc = "";
var g_hideOption = true;

// ajax for user
function getUserByID(_userID, callback) {
  $.ajax({
    url: '/user_get',
    type: "GET",
    data: {user_id: _userID},
    timeout: 20000,
    success: function (data) {
      if (callback) {
        callback(data);
      }
    },
    error: function (data) {
      console.log('get user nick name error ' + data);
    }
  });
}

// common handlers for user
function initPortal() {
  gameID = getGameID();
  gameType = getGameType();
  // user id resolved from URL, but is probably not the id of the current user
  userID = getUserID();
  getUserByID(userID, handleUser);
}

function handleUser(data) {
  var userData = eval(data);
  console.log('get user = ' + userData.nickName + ', is new = ' + userData.isNew);

  playerNickName = userData.nickName;

  // it is unlikely the nick name is null
  if (null == playerNickName) {
    playerNickName = localStorage.getItem('player_nick');
  }

  // it is very unlikely the nick name is null
  if (null == playerNickName) {
    playerNickName = '玩家';
  }

  playerAvatarID = userData.avatarID;

  var nickNameInput = document.getElementById('nick_name');
  var nickNameText = document.getElementById('nick_name_text');
  var avatarInput = document.getElementById('avatar');
  var nickNameDiv = document.getElementById("nick_name_div");
  var nickInputDiv = document.getElementById("nick_input_div");

  nickNameText.innerHTML = "<b>" + playerNickName + "</b>";
  nickNameInput.value = playerNickName;

  // judge if the user is new comer
  if (parseInt(userData.isNew) == 0) {
    showEdit(0);
  } else {
    showEdit(1);
  }

  if (null != playerAvatarID && '' != playerAvatarID) {
    avatarInput.innerHTML = "<img class='rounded' src='/picture_content?blob_id=" + playerAvatarID + "'/>";
  } else {
    avatarInput.innerHTML = "<img class='rounded' src='../public_res/avatars/default.png'/>";
  }
}

function showEdit(show) {
  var setAvatar = document.getElementById("set_avatar");
  var setNickName = document.getElementById("nick_input_div");
  var showNickName = document.getElementById("nick_name_div");
  var updateButton = document.getElementById("update_button");

  if (1 == show) {
    showNickName.style.display = "none";
    setNickName.style.display = "block";
    setAvatar.style.display = "block";
    updateButton.style.display = "block";
  } else {
    showNickName.style.display = "block";
    setNickName.style.display = "none";
    setAvatar.style.display = "none";
    updateButton.style.display = "none";
  }
}

function saveUser() {
  var pictureContent = document.getElementById("picture_content");
  var nickName = document.getElementById("nick_name");

  if (nickName.value == null || nickName.value == "") {
    alert("请填写昵称");
    return false;
  }
  if (false == validateLength('您的昵称', nickName.value, 1, 12) ||
    false == validateIllegalChar('您的昵称', nickName.value)) {
    return;
  }

  // directly update user nick name only if picture is not selected
  if (null == pictureContent.value || '' == pictureContent.value) {
    updateUserNameOnly(userID, nickName.value);
    return;
  }

  var pos = pictureContent.value.lastIndexOf(".");
  var lastName = pictureContent.value.substring(pos, pictureContent.value.length);
  if (lastName.toLowerCase() != ".jpg" &&
    lastName.toLowerCase() != ".png" &&
    lastName.toLowerCase() != ".bmp" &&
    lastName.toLowerCase() != ".jpeg") {
    alert("文件必须为bmp, jpg, png类型");
    return false;
  }

  /*
   * debug for jcrop
   */
  if (pictureContent.value != '' && (parseInt(croppedWidth.value) == 0 || parseInt(croppedHeight.value) == 0)) {
    alert("请先裁剪图片");
    return false;
  }
  // process image imageProcess
  imageProcess();
  var asPicture = document.getElementById("as_picture");
  var asPictureValue = asPicture.options[asPicture.selectedIndex].value;

  $("#show_loading").click();
  isLoading = true;
  $.ajax({
    url: '/user_update',
    type: "POST",
    data: {nick_name: nickName.value, full_image: fullImageContent, thumbnail: thumbnailContent,
      content_type: contentType, user_id: userID, as_picture: asPictureValue},
    timeout: 40000,
    success: function (data) {
      var retUser = JSON.parse(data);
      console.log('update user with avatar success, new name = ' + retUser.nickName);
      var avatarInput = document.getElementById('avatar');
      avatarInput.innerHTML = "<img class='rounded' src='/picture_content?blob_id=" + retUser.avatarID + "'/>";
      var setNickName = document.getElementById("nick_name");
      var showNickName = document.getElementById("nick_name_text");
      setNickName.value = retUser.nickName;
      showNickName.innerHTML = retUser.nickName;
      showEdit(0);
      resetParameters();
      document.getElementById("picture_content").value = "";
      document.getElementById("picture_preview_frame").innerHTML =
        "<img style='max-width:200px; max-height:none' src='../public_res/default_picture.png' " +
        "id='picture_crop_preview'/>";
      $("#hide_loading").click();
    },
    error: function (data) {
      console.log('upload picture error');
      $("#hide_loading").click();
    }
  });
  return true;
}

function updateUserNameOnly(userID, nickName) {
  $.ajax({
    url: '/user_update_name',
    type: "POST",
    data: {user_id: userID, nick_name: nickName},
    timeout: 20000,
    success: function (data) {
      console.log('update user nick name successfully');
      // update user nick name according to current status
      var setNickName = document.getElementById("nick_name");
      var showNickName = document.getElementById("nick_name_text");
      setNickName.value = nickName;
      showNickName.innerHTML = nickName;
      showEdit(0);
    },
    error: function (data) {
      console.log('update user nickname error ' + data);
    }
  });
}

function enterGame() {
  document.href = "http://weixin.qq.com/r/8nXPwBDEYC4fhwGjnyDW";
  var enterButton = document.getElementById("enter_button");
  var goto_wx = document.getElementById("goto_wx");
  goto_wx.style.display = "block";
  enterButton.style.display = "none";
}