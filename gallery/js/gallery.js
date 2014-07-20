var g_imgURL = "";
var g_link = "";
var g_title = "";
var g_desc = "";
var g_hideOption = true;

var GAME_TYPE_BRICKS = "拼图";
var GAME_TYPE_BUBBLES = "消除";
var GAME_TYPE_BANDITS = "老虎机";
var GAME_TYPE_CONNECTS = "连连看";

var pictures = {};
var tmpPictures = {};
var selectedPictures = new Array();
var userID = "";
var gameID = "";
var gameType = 1;
var userWXID = "";

var minCropWidth = 0;
var minCropCWidth = 0;
var scaleRatio = 0;
var scaleCRatio = 0;

var currentImageIndex = 0;

var from = 0;
var count = 10;
var more = true;
var refresh = true;
var isLoading = false;

// variables used to identify if this phone is Android or IOS
var isIphone = false;
var isAndroid = false;

var pictureSelectionNeed = 1;
var pictureSelected = 0;

// gallery mode record
/*
 * 0 - view mode
 * 1 - edit mode
 * 2 - game creation mode
 */
var galleryMode = 0;

var processedImageContent = "";

var fullImageContent = "";
var thumbnailContent = "";
var contentType = "";
var pictureBlur = "";

var cropThumbnailContent = "";
var cropContentType = "";
var cropPictureBlur = "";
var cropPictureID = "";

function getPictures(callback) {
  if (more == false) {
    console.log('no more pictures, return directly');
    return false;
  }
  tmpPictures.length = 0;
  var randChar = randomChar(16);
  var getURL = "/picture_get?user_id=" + userID + "&from=" + from + "&count=" + count + "&rand=" + randChar;
  console.log('get picture begins');
  $.ajax({
    url: getURL,
    type: "GET",
    timeout: 20000,
    success: function (data) {
      console.log('get pictures success');
      tmpPictures = eval(data);
      if (from == 0) {
        pictures.length = 0;
        pictures = new Array();
      }
      for (var index = 0; index < tmpPictures.length; index++) {
        pictures.push(tmpPictures[index]);
      }
      // WARNING !! push operation generates 2d array when param is a 1d array
      //pictures.push(tmpPictures);
      // update from
      if (tmpPictures.length < count) {
        more = false;
      } else {
        more = true;
      }
      from += tmpPictures.length;
      if (callback) {
        callback();
      }
    },
    error: function (data) {
      isLoading = false;
      console.log('get pictures error');
    }
  });
}

function showGalleryByOwner() {
  var columnNumber = 0;
  var pictureContent = "";
  var cropPictureTags = "";
  var imgContent = "";
  var checkBoxProperties = "";
  console.log('show picture by owner');
  for (var i = 0; i < tmpPictures.length; i++) {
    columnNumber = i + 1 % 2;
    var uniqueID = tmpPictures[i]._id;
    var editButtonStyle = (1 == galleryMode ? "style='display:block;'" : "style='display:none;'");
    if (typeof tmpPictures[i].thumbnailId == 'undefined' ||
      null == tmpPictures[i].thumbnailId ||
      '' == tmpPictures[i].thumbnailId ||
      0 == tmpPictures[i].thumbnailId) {
      cropPictureTags = "<a href='#' onclick='cropPicture(\"" + uniqueID + "\", \"" + tmpPictures[i].contentType + "\")' " +
        "id='crop_button_" + uniqueID + "' class='crop_button' " + editButtonStyle + ">" +
        "<img src='../public_res/area.png' style='width: 16px; height: 16px; float: right'></a>";
    } else {
      cropPictureTags = "";
    }
    if (2 == galleryMode) {
      if (typeof tmpPictures[i].thumbnailId == 'undefined' ||
        null == tmpPictures[i].thumbnailId ||
        '' == tmpPictures[i].thumbnailId ||
        0 == tmpPictures[i].thumbnailId) {
        imgContent = "../public_res/crop_first.png";
        checkBoxProperties = "disabled='true'";
      } else {
        imgContent = "/picture_content?blob_id=" + tmpPictures[i].thumbnailId;
        checkBoxProperties = "";
      }
    } else {
      imgContent = "/picture_content?blob_id=" + tmpPictures[i].fullImageBlobId;
      checkBoxProperties = "disabled='true'";
    }

    pictureContent += "<div style='display:none;' class='box shadow " + columnNumber + "' align='center' " +
      " name='picture_box' id='img_box_" + uniqueID + "'>" +
      "<a href='#' onclick='deletePicture(\"" + uniqueID + "\")' id='' class='delete_button' " + editButtonStyle + ">" +
      "<img src='../public_res/delete-file.png' style='width: 16px; height: 16px; float: left;'></a>" +
      cropPictureTags +
      "<label for='" + uniqueID + "'>" +
      //"<a id='img_outer_"+uniqueID+"' href='#popup_picture' data-position-to='window' data-transition='fade' " +
      //    " data-rel='popup' onclick='popupPic(\""+uniqueID+"\", \""+tmpPictures[i].fullImageBlobId+"\")'>" +
      "<img id='img_tag_" + uniqueID + "' class='rounded' " +
      "src='" + imgContent + "' onload='showPictureBox(\"" + uniqueID + "\")'/>" +
      //"</a>" +
      "</label>" +
      "<input style='display:none' type='checkbox' id='" + uniqueID + "' name='picture_cb'" +
      "onchange='setChecked(this, \"" + uniqueID + "\")' " + checkBoxProperties + "/>" +
      "</div>";
  }
  $("#container").append(pictureContent);
  // update refresh flag after all images are flushed
  if (from > 0) {
    refresh = false;
  } else {
    refresh = true;
  }
  isLoading = false;
}

// picture functions

function popupPic(pictureID, imagePath) {
  if (0 != galleryMode) {
    $("#img_outer_" + pictureID).removeAttr('data-position-to');
    $("#img_outer_" + pictureID).removeAttr('data-transition');
    $("#img_outer_" + pictureID).removeAttr('data-rel');
    $("#img_outer_" + pictureID).removeAttr('href');
    return false;
  } else {
    console.log("popup picture " + imagePath);
    var popupPicture = document.getElementById("popup_picture_content");
    popupPicture.src = "/picture_content?blob_id=" + imagePath;
    $("#img_outer_" + pictureID).attr('data-position-to', 'window');
    $("#img_outer_" + pictureID).attr('data-transition', 'fade');
    $("#img_outer_" + pictureID).attr('data-rel', 'popup');
    $("#img_outer_" + pictureID).attr('href', '#popup_picture');
  }
}

function showPictureBox(pictureID) {
  var pictureBox = document.getElementById("img_box_" + pictureID);
  pictureBox.style.display = "block";
}

function findPictureById(pictureID) {
  for (var i = 0; i < pictures.length; i++) {
    if (pictures[i]._id == pictureID) {
      return pictures[i];
    }
  }
  return null;
}

function updatePictureThumbnailById(pictureID, thumbnailId) {
  for (var i = 0; i < pictures.length; i++) {
    if (pictures[i]._id == pictureID) {
      pictures[i].thumbnailId = thumbnailId;
      return;
    }
  }
}

function changeImageSource(showThumbnail) {
  var pictureElement;
  var cbElemenet;
  if (showThumbnail) {
    for (var i = 0; i < pictures.length; i++) {
      pictureElement = document.getElementById("img_tag_" + pictures[i]._id);
      cbElemenet = document.getElementById(pictures[i]._id);
      if (typeof pictures[i].thumbnailId == 'undefined' ||
        null == pictures[i].thumbnailId ||
        '' == pictures[i].thumbnailId ||
        0 == pictures[i].thumbnailId) {
        pictureElement.src = "../public_res/crop_first.png";
        cbElemenet.disabled = true;
      } else {
        pictureElement.src = "/picture_content?blob_id=" + pictures[i].thumbnailId;
        cbElemenet.disabled = false;
      }
    }
  } else {
    for (var i = 0; i < pictures.length; i++) {
      pictureElement = document.getElementById("img_tag_" + pictures[i]._id);
      pictureElement.src = "/picture_content?blob_id=" + pictures[i].fullImageBlobId;
    }
  }
}

function removePictureFromList(pictureID) {
  var index = pictures.indexOf(pictureID);
  console.log('index of picture = ' + index);
  pictures.splice(index, 1);
}

// create mode function
function setChecked(cb, uniqueID) {
  var pictureObj = findPictureById(uniqueID);
  console.log("selected picture , id = " + pictureObj._id);
  var checkedDiv = document.getElementById("img_box_" + uniqueID);

  if (cb.checked) {
    checkedDiv.className = 'box shadow_highlight';
    selectedPictures.push(pictureObj);
    pictureSelected++;
  } else {
    checkedDiv.className = 'box shadow';
    var index = selectedPictures.indexOf(pictureObj);
    console.log('index of picture = ' + index);
    selectedPictures.splice(index, 1);
    pictureSelected--;
  }
  if ("0" == gameType || "1" == gameType || "2" == gameType) {
    // jump to cocos2d page of bricks
    if (selectedPictures.length >= 1) {
      // show create game button and switch the panel
      showSelectHint(false);
      $("#create_game_button").click();
    } else {
      showSelectHint(true);
    }
    if (selectedPictures.length > 1) {
      alert('只能选择1幅图');
      cb.checked = false;
      checkedDiv.className = 'box shadow';
      selectedPictures.length--;
      pictureSelected--;
      return false;
    }
  } else if ("3" == gameType) {
    if (selectedPictures.length >= 5) {
      // show create game button and switch the panel
      showSelectHint(false);
      $("#create_game_button").click();
    } else {
      showSelectHint(true);
    }

    // generate connects layouts ?
    if (selectedPictures.length > 5) {
      alert('只能选择5幅图');
      cb.checked = false;
      checkedDiv.className = 'box shadow';
      selectedPictures.length--;
      pictureSelected--;
      return false;
    }
  } else {
    console.log("error");
  }
}

function clearSelected() {
  resetChecked();
}

function resetChecked() {
  /*
   for(var i = selectedPictures.length-1;i >= 0;i--){
   var id = selectedPictures[i]._id;
   console.log(id);
   $("#"+id).attr('checked',false);
   selectedPictures.splice(i, 1);
   }
   */
  // user batch operation
  //var createButton = document.getElementById("create_game_frame");
  var pictureCheckBoxes = document.getElementsByName("picture_cb");
  for (var i = 0; i < pictureCheckBoxes.length; i++) {
    pictureCheckBoxes[i].checked = false;
  }
  selectedPictures.length = 0;
  pictureSelected = 0;
  //createButton.style.display = "none";
  var pictureBoxes = document.getElementsByName("picture_box");
  for (var i = 0; i < pictureBoxes.length; i++) {
    pictureBoxes[i].className = 'box shadow';
  }
  showSelectHint(true);
}

function showSelectHint(show) {
  var selectHint = document.getElementById("select_picture_hint");
  var createButton = document.getElementById("create_game_button");
  switch (parseInt(gameType)) {
    case 0:
    case 1:
    case 2:
      pictureSelectionNeed = 1;
      break;
    case 3:
      pictureSelectionNeed = 5;
      break;
    default:
      break;
  }
  selectHint.innerHTML = "选中图片: " + pictureSelected + "/" + pictureSelectionNeed;
  if (show) {
    selectHint.style.display = "block";
    createButton.style.display = "none";
  } else {
    selectHint.style.display = "none";
    createButton.style.display = "block";
  }
}

function changeGameType(sel) {
  gameType = sel.value;
  resetChecked();
}

function createGame() {
  if (selectedPictures.length == 0) {
    // TODO: exception protection
    alert("请选择至少一张图片");
    $("#create_game_button").attr('data-rel', 'null');
    return false;
  } else {
    $("#create_game_button").attr('data-position-to', 'window');
    $("#create_game_button").attr('data-rel', 'panel');
    $("#create_game_button").attr('href', '#create_game_panel');
    $("#create_game").attr('hidden', false);
    $("#game_name").val("");
  }
}

function onCreateGame() {
  if ("0" == gameType) {
    // jump to cocos2d page of bricks
    var game_name = $("#game_name").val();
    var public_or_not = $("#public_or_not").val();
    gotoBrickGame(game_name, public_or_not, selectedPictures);
  } else if ("1" == gameType) {
    // generate bubbles layouts ?
    var game_name = $("#game_name").val();
    var dead_line = new Date($("#dead_line").val()).Format("yyyy-MM-dd");
    var public_or_not = $("#public_or_not").val();
    var pictureids = new Array();
    for (var i = 0; i < selectedPictures.length; i++) {
      pictureids.push(selectedPictures[i]._id);
    }
    var iconid;
    iconid = selectedPictures[0].thumbnailId;
    var getURL = "/create_game";
    $.ajax({
      url: getURL,
      type: "post",
      data: {owner_id: userID, game_name: game_name, dead_line: dead_line, picture_id: JSON.stringify(pictureids), icon_id: iconid,
        pub: public_or_not, gameType: gameType},
      timeout: 20000,
      success: function (data) {
//                alert(game_name + "已创建");
//                $("#create_game").attr('hidden',true);
//                resetChecked();
        gotoGame(gameType, game_name, public_or_not, data._id);
        return true;
      },
      error: function (data) {
        alert("创建失败");
        console.log('create bubbles error');
      }
    });
  } else if ("2" == gameType) {
    // generate bandits with bet amount ?
    var game_name = $("#game_name").val();
    var public_or_not = $("#public_or_not").val();
    var picture_id = selectedPictures[0]._id;
    var iconid;
    iconid = selectedPictures[0].thumbnailId;
    var getURL = "/create_game";
    $.ajax({
      url: getURL,
      type: "post",
      data: {owner_id: userID, game_name: game_name, picture_id: JSON.stringify(picture_id), icon_id: iconid,
        pub: public_or_not, gameType: gameType},
      timeout: 20000,
      success: function (data) {
//                alert(game_name + "已创建");
//                $("#create_game").attr('hidden',true);
//                resetChecked();
        gotoGame(gameType, game_name, public_or_not, data._id);
        return true;
      },
      error: function (data) {
        alert("创建失败");
        console.log('create bubbles error');
      }
    });
  } else if ("3" == gameType) {
    // generate connects layouts ?
    var game_name = $("#game_name").val();
    var public_or_not = $("#public_or_not").val();
    //var picture_id = JSON.stringify(selectedPictures);
    // console.log(picture_id+"====connects");
    var pictureids = new Array();
    var iconid;
    for (var i = 0; i < selectedPictures.length; i++) {
      pictureids.push(selectedPictures[i]._id);
    }
    iconid = selectedPictures[0].thumbnailId;
    var getURL = "/create_game";
    $.ajax({
      url: getURL,
      type: "post",
      data: {owner_id: userID, game_name: game_name, picture_id: JSON.stringify(pictureids),
        icon_id: iconid, pub: public_or_not, gameType: gameType},
      timeout: 20000,
      success: function (data) {
//                alert(game_name + "已创建");
//                $("#create_game").attr('hidden',true);
//                resetChecked();
        gotoGame(gameType, game_name, public_or_not, data._id);
        return true;
      },
      error: function (data) {
        alert("创建失败");
        console.log('create connects error');
      }
    });
  } else {
    console.log("error");
  }
}

function gotoBrickGame(gameName, pub, pictureArray) {
  var picture = pictureArray[0];
  var bricksLayout = '';
  // jump to bricks game page
  var jumpTo = '../games/bricks/bricks_game.html?picture_id=' + picture._id + '&user_id=' + userID + '' +
    '&game_type=' + gameType + "&game_name=" + gameName + '&public=' + pub + "#game";
  console.log('enter bricks in owner view' + jumpTo);
  window.location = jumpTo;
}

function gotoGame(gameType, gameName, pub, gameID) {
  var jumpTo;
  if (0 == gameType) {
    jumpTo = '../games/bricks/bricks_game.html?user_id=' + userID + '' +
      '&game_type=' + gameType + "&game_id=" + gameID;
  } else if (1 == gameType) {
    jumpTo = '../games/bubbles/bubbles_game.html?user_id=' + userID + '' +
      '&game_type=' + gameType + "&game_id=" + gameID;
  } else if (2 == gameType) {
    jumpTo = '../games/bandits/bandits_game.html?user_id=' + userID + '' +
      '&game_type=' + gameType + "&game_id=" + gameID;
  } else if (3 == gameType) {
    jumpTo = '../games/connect/connect_game.html?user_id=' + userID + '' +
      '&game_type=' + gameType + "&game_id=" + gameID;
  }
  window.location = jumpTo;
}

// edit mode function
function deletePicture(pictureID) {
  if (confirm("您确定要删除这幅图片?")) {
    $.ajax({
      url: '/picture_delete',
      type: "POST",
      data: {picture_id: pictureID},
      timeout: 20000,
      success: function (data) {
        console.log('delete picture success');
        var pictureBox = document.getElementById("img_box_" + pictureID);
        pictureBox.parentNode.removeChild(pictureBox);
        removePictureFromList(pictureID);
        resetChecked();
        from -= 1;
        resetChecked();
      },
      error: function (data) {
        console.log('delete pictures error');
        resetChecked();
      }
    });
  } else {
    // Do nothing!
  }
}

// imageProcess a specific picture which is not cropped yet
function cropPicture(pictureID, contentType) {
  cropPictureID = pictureID;
  cropContentType = contentType;
  $("#crop_button_" + pictureID).attr('data-rel', 'panel');
  $("#crop_button_" + pictureID).attr('href', '#crop_picture_panel');
  // copy the src of source img to dest img
  var srcImg = document.getElementById("img_tag_" + pictureID);
  var destImg = document.getElementById("picture_crop_only_preview");
  destImg.onload = function () {
    npcWidth = destImg.naturalWidth;
    npcHeight = destImg.naturalHeight;
    console.log('np width = ' + npcWidth + ', np height = ' + npcHeight);

    if (npcWidth > imgFrameWidth) {
      scaleCRatio = npcWidth / imgFrameWidth;
      minCropCWidth = 32;
    } else {
      scaleCRatio = 1;
      if (npcWidth < 32 || npcHeight < 32) {
        if (npcWidth < npcHeight) {
          minCropCWidth = npcWidth;
        } else {
          minCropCWidth = npcHeight;
        }
      } else {
        minCropCWidth = 32;
      }
    }

    $('#picture_crop_only_preview').Jcrop({
      onSelect: updateCoordsForCropOnly,
      aspectRatio: 1 / 1,
      minSize: [minCropCWidth, minCropCWidth]
    });
  };
  destImg.src = srcImg.src;
}

function showEditControls(show) {
  var deleteButtons = document.getElementsByClassName("delete_button");
  var cropButtons = document.getElementsByClassName("crop_button");
  var uploadButton = document.getElementById("upload_picture");
  if (show) {
    for (var dbi = 0; dbi < deleteButtons.length; dbi++) {
      deleteButtons[dbi].style.display = 'block';
    }
    for (var cbi = 0; cbi < cropButtons.length; cbi++) {
      cropButtons[cbi].style.display = 'block';
    }
    uploadButton.style.display = "block";
  } else {
    for (var dbi = 0; dbi < deleteButtons.length; dbi++) {
      deleteButtons[dbi].style.display = 'none';
    }
    for (var cbi = 0; cbi < cropButtons.length; cbi++) {
      cropButtons[cbi].style.display = 'none';
    }
    uploadButton.style.display = "none";
  }
}

function showGameCreationControls(show) {
  var gameCreations = document.getElementById("game_creations");
  var pictureCheckBoxes = document.getElementsByName("picture_cb");
  var createButton = document.getElementById("create_game_frame");
  if (show) {
    gameCreations.style.display = "block";
    createButton.style.display = "block";
    for (var i = 0; i < pictureCheckBoxes.length; i++) {
      pictureCheckBoxes[i].disabled = false;
    }
  } else {
    gameCreations.style.display = "none";
    createButton.style.display = "none";
    for (var i = 0; i < pictureCheckBoxes.length; i++) {
      pictureCheckBoxes[i].disabled = true;
    }
  }
}

function showGalleryFooter(show) {
  var footer = document.getElementById("gallery_footer");
  if (show) {
    footer.style.display = "block";
  } else {
    footer.style.display = "none";
  }
}

function switchMode(mode) {
  if (galleryMode == mode) {
    // don't actually change mode if new mode equals to old one
    return;
  }

  switch (mode) {
    case 0:
      // switch to view mode
      showEditControls(false);
      showGameCreationControls(false);
      showGalleryFooter(false);
      resetChecked();
      break;
    case 1:
      // switch to edit mode
      if (false == isAndroid && 0 == userView) {
        showGalleryFooter(true);
      } else {
        showGalleryFooter(false);
      }
      showGameCreationControls(false);
      showEditControls(true);
      resetChecked();
      break;
    case 2:
      // switch to game creation mode
      showGalleryFooter(true);
      showEditControls(false);
      showGameCreationControls(true);
      showSelectHint(true);
      break;
    default:
      break;
  }
  if (!((galleryMode == 0 || galleryMode == 1) &&
    (mode == 0 || mode == 1))) {
    // do not change image sources in order to optimize performance
    changeImageSource(mode == 2);
  }
  galleryMode = mode;
}

// fake file upload without form submission
function uploadFile() {
  var pictureContent = document.getElementById("picture_content");

  if (pictureContent.value == null || pictureContent.value == "") {
    alert("请选择图片");
    return false;
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

  if (pictureContent.value != '' && (parseInt(croppedWidth) == 0 || parseInt(croppedHeight) == 0)) {
    alert("请首先裁剪图片");
    return false;
  }

  // post process image
  imageProcess();

  var blurSelect = document.getElementById("picture_blur");
  pictureBlur = blurSelect.options[blurSelect.selectedIndex].value;

  // using ajax upload instead
  //galleryForm.submit();
  $("#show_loading").click();
  isLoading = true;
  $.ajax({
    url: '/picture_upload',
    type: "POST",
    data: {full_image: fullImageContent, thumbnail: thumbnailContent, content_type: contentType, user_id: userID,
      picture_blur: pictureBlur},
    timeout: 40000,
    success: function (data) {
      var deletePictureStyle = "";
      var disableCheckBox = "";
      var cropPictureTags = "";
      var pictureContent = "";
      console.log('upload pictures success');
      // add latest picture to the top of the picture list
      var savedPicture = JSON.parse(data);
      pictures.unshift(savedPicture);
      // prepend newly added picture to gallery
      from += 1;

      var uniqueID = savedPicture._id;
      var editButtonStyle = (1 == galleryMode ? "style='display:block;'" : "style='display:none;'");
      if (typeof savedPicture.thumbnailId == 'undefined' ||
        null == savedPicture.thumbnailId ||
        '' == savedPicture.thumbnailId ||
        0 == savedPicture.thumbnailId) {
        cropPictureTags = "<a href='#' onclick='cropPicture(\"" + uniqueID + "\")' " +
          "id='crop_button_" + uniqueID + "' class='crop_button' " + editButtonStyle + ">" +
          "<img src='../public_res/area.png' style='width: 16px; height: 16px; float: right'></a>";
      } else {
        cropPictureTags = "";
      }

      if (2 != galleryMode) {
        disableCheckBox = "disabled='true'";
      } else {
        disableCheckBox = "disabled='false'";
      }

      pictureContent += "<div class='box shadow ' align='center' id='img_box_" + uniqueID + "' name='picture_box'>" +
        "<a href='#' onclick='deletePicture(\"" + uniqueID + "\")' id='' class='delete_button' " + editButtonStyle + ">" +
        "<img src='../public_res/delete-file.png' style='width: 16px; height: 16px; float: left'></a>" +
        cropPictureTags +
        "<label for='" + uniqueID + "'>" +
        //"<a id='img_outer_"+uniqueID+"' href='#popup_picture' data-position-to='window' data-transition='fade' " +
        //    " data-rel='popup' onclick='popupPic(\""+uniqueID+"\", \""+savedPicture.fullImageBlobId+"\")'>" +
        "<img id='img_tag_" + uniqueID + "' class='rounded' src='/picture_content?blob_id=" + savedPicture.fullImageBlobId + "'/>" +
        //"</a>" +
        "</label>" +
        "<input style='display:none' type='checkbox'  id='" + uniqueID + "' name='picture_cb'" +
        "onchange='setChecked(this, \"" + uniqueID + "\")' " + disableCheckBox + "/>" +
        "<h4>被" + savedPicture.status + "个游戏使用</h4>" +
        "</div>";
      $("#container").prepend(pictureContent);
      // update refresh flag after all images are flushed
      if (from > 0) {
        refresh = false;
      } else {
        refresh = true;
      }
      isLoading = false;
      $("#hide_loading").click();

      resetParameters();
      document.getElementById("picture_content").value = "";
      document.getElementById("picture_preview_frame").innerHTML =
        "<img style='max-width:200px; max-height:none' src='../public_res/default_picture.png' " +
        "id='picture_crop_preview'/>";
      resetChecked();
    },
    error: function (data) {
      console.log('upload picture error');
      resetParameters();
      document.getElementById("picture_preview_frame").innerHTML =
        "<img style='max-width:200px; max-height:none' src='../public_res/default_picture.png' " +
        "id='picture_crop_preview'/>";
      isLoading = false;
      $("#hide_loading").click();
      resetChecked();
    }
  });

  return true;
}

// fake file upload for cropped picture only
function uploadCropFile() {
  if (parseInt(croppedCWidth) == 0 || parseInt(croppedCHeight) == 0) {
    alert("请首先裁剪图片");
    return false;
  }

  // post process image
  croppedImageProcess();

  var blurSelect = document.getElementById("crop_picture_blur");
  cropPictureBlur = blurSelect.options[blurSelect.selectedIndex].value;

  // using ajax upload instead
  //galleryForm.submit();
  $("#show_loading").click();
  isLoading = true;
  $.ajax({
    url: '/picture_crop_upload',
    type: "POST",
    data: {picture_id: cropPictureID, thumbnail: cropThumbnailContent, content_type: cropContentType, user_id: userID,
      picture_blur: cropPictureBlur},
    timeout: 40000,
    success: function (data) {
      console.log('crop picture upload successfully, thumbnailId = ' + data);
      resetCropParameters();
      // refresh certain picture object with newly cropped thumbnail icon
      updatePictureThumbnailById(cropPictureID, data);

      // remove the crop button for certain picture box
      var cropButton = document.getElementById("crop_button_" + cropPictureID);
      cropButton.parentNode.removeChild(cropButton);
      document.getElementById("crop_preview_frame").innerHTML =
        "<img style='max-width:200px; max-height:none' src='../public_res/default_picture.png' " +
        "id='picture_crop_only_preview'/>";
      isLoading = false;
      $("#hide_loading").click();
      $("#close_crop_panel").click();
      resetChecked();
    },
    error: function (data) {
      console.log('upload picture error');
      resetCropParameters();
      document.getElementById("crop_preview_frame").innerHTML =
        "<img style='max-width:200px; max-height:none' src='../public_res/default_picture.png' " +
        "id='picture_crop_only_preview'/>";
      $("#hide_loading").click();
      resetChecked();
    }
  });

  return true;
}

$(document).ready(function () {
  isIphone = browser.versions.ios;
  isAndroid = browser.versions.android;
  userWXID = localStorage.getItem('user_wx_id');
  gameID = getGameID();
  /*
   * game type
   * 0 - bricks
   * 1 - bubbles
   * 2 - bandits
   * 3 - connects
   */
  userID = getUserID();
  console.log(userID);

  // userView = 0 : owner view
  // userView = 1 : player view
  if (null == userWXID || '' == userWXID) {
    // this is player
    console.log('newbee player view');
    userView = 1;
  } else if (userWXID == userID) {
    // this is gallery owner
    console.log('author view, userID = ' + userID);
    userView = 0;
  } else {
    // this is a player
    console.log('experienced player view, userID = ' + userID + ' , localstoreage id = ' + userWXID);
    userView = 1;
  }
  var addPictureButton = document.getElementById('upload_picture');
  //var editPictureButton = document.getElementById('edit_picture');

  if (isAndroid == true || 1 == userView) {
    addPictureButton.style.display = 'none';
  } else {
    addPictureButton.style.display = 'block';
  }

  /*
   if(1 == userView) {
   editPictureButton.style.display = 'none';
   } else {
   editPictureButton.style.display = 'block';
   }
   */
  if (userView == 0) {
    isLoading = true;
    console.log('start getting pictures from server');
    getPictures(showGalleryByOwner);
  } else {
    /*
     clearGalleryTitle();
     getPictures(showGalleryByGuest);
     */
    // redirect to game directly

  }
});

function goBack() {
  history.back();
}

function getMorePicture() {
  if (more == true && refresh == false && isLoading == false) {
    if (userView == 0) {
      isLoading = true;
      getPictures(showGalleryByOwner);
    }
  }
}

// refresh pictures do not wait for the window scrolling to the bottom
/*
 $(window).scroll(function() {
 if($(window).scrollTop() + $(window).height() >= $(document).height() - 300 &&
 more == true && refresh == false && isLoading == false) {
 if(userView == 0) {
 isLoading = true;
 getPictures(showGalleryByOwner);
 }
 // guest could not see this page
 }
 });
 */