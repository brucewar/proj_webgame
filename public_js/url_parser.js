function truncate(str, len) {
  if (str.length > len)
    return str.substring(0, len) + "...";
  else
    return str;
}

function getQueryStringRegExp(name) {
  var reg = new RegExp("(^|\\?|&|)" + name + "=([^&]*)(\\s|&|$|)", "i");
  if (reg.test(decodeURI(location.href))) return unescape(RegExp.$2.replace(/\+/g, " "));
  return "";
}

function getGameID() {
  return getQueryStringRegExp("game_id");
}

function getGameType() {
  return getQueryStringRegExp("game_type");
}

function getUserID() {
  return decodeURI(getQueryStringRegExp("user_id"));
}

function getNickname() {
  return decodeURI(getQueryStringRegExp("nickname"));
}

function getOwnerName() {
  return decodeURI(getQueryStringRegExp("owner_name"));
}

function getPictureID() {
  return getQueryStringRegExp("picture_id");
}

function getGameName() {
  return decodeURI(getQueryStringRegExp("game_name"));
}

function getUserMatrix() {
  return decodeURI(getQueryStringRegExp("bricks_layout"));
}

function getPicture() {
  return decodeURI(getQueryStringRegExp("picture"));
}

// game associated
function getBricks() {
  var tmpBricks = getQueryStringRegExp("bricks");
  console.log('bricks after decode = ' + tmpBricks);
  return tmpBricks;
}

function getBandits() {
  var tmpBandits = getQueryStringRegExp("bandits");
  return tmpBandits;
}

function getBubbles() {
  var tmpBubbles = getQueryStringRegExp("bubbles");
  return tmpBubbles;
}
function getConnects() {
  var tmpConnects = getQueryStringRegExp("connects");
  return tmpConnects;
}

function getPublic() {
  return decodeURI(getQueryStringRegExp("public"));
}

function getBricksID() {
  return decodeURI(getQueryStringRegExp("bricks_id"));
}

function getBubblesID() {
  return decodeURI(getQueryStringRegExp("bubbles_id"));
}

function getBanditsID() {
  return decodeURI(getQueryStringRegExp("bandits_id"));
}

function getConnectsID() {
  return decodeURI(getQueryStringRegExp("connects_id"));
}

function getRedirectTo() {
  return decodeURI(getQueryStringRegExp("re_dir_to"));
}
