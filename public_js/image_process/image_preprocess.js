var MAX_WIDTH = 640;
var MAX_HEIGHT = 640;
var CROP_WIDTH = 128;
var CROP_HEIGHT = 128;
var IMAGE_QUALITY = 1.0;
var exifOrientation;

/*
 * exif orientation type:
 * 0 - portrait
 * 1 - landscape
 * -1 - none
 */
var exifOrientationType = -1;

var preview;
var npWidth;
var npHeight;
var npcWidth;
var npcHeight;
var image = null;

var croppedWidth = 0;
var croppedHeight = 0;
var croppedX;
var croppedY;

var croppedCWidth = 0;
var croppedCHeight = 0;
var croppedCX = 0;
var croppedCY = 0;

var selectedFileType;

// TODO: frame width varies according to device screen size
var imgFrameWidth = 200;

function resetParameters() {
  croppedWidth = 0;
  croppedHeight = 0;

  fullImageContent = "";
  thumbnailContent = "";
  contentType = "";
}

function resetCropParameters() {
  croppedCWidth = 0;
  croppedCHeight = 0;

  cropThumbnailContent = "";
  cropContentType = "";
}

// this is where it starts. event triggered when user selects files
function resizeFile(_input, fileInputID, pictureFrameID) {
  if (!( window.File && window.FileReader && window.FileList && window.Blob )) {
    alert('您的浏览器不支持文件处理.');
    return false;
  }
  $("#show_loading").click();

  // reset all image parameters
  croppedWidth = 0;
  croppedHeight = 0;

  fullImageContent = "";
  thumbnailContent = "";
  contentType = "";

  var fileInput = document.getElementById(fileInputID);
  console.log('length of file = ' + fileInput.files.length);
  var file = fileInput.files[0];
  if (!( /image/i ).test(file.type)) {
    alert('您选择的 ' + file.name + ' 不是一个图片');
    return false;
  }

  // set content type
  contentType = file.type;

  // calculate scaleRatio and minCropWidth
  EXIF.getData(file, function () {
    exifOrientation = EXIF.getTag(this, "Orientation");
    if (typeof(exifOrientation) != 'undefined') {
      // extract orientation information according to JEITA CP-3451
      switch (parseInt(exifOrientation)) {
        case 1 :
        case 2 :
        case 3 :
        case 4 :
          // portrait layout
          console.log('this is a portrait image');
          exifOrientationType = 0;
          break;
        case 5 :
        case 6 :
        case 7 :
        case 8 :
          console.log('this is landscape image');
          exifOrientationType = 1;
          break;
        default :
          console.log('something wrong with the exif data');
          exifOrientationType = -1;
          break;
      }
    } else {
      console.log('this file does not contain any EXIF data');
      exifOrientationType = -1;
    }

    // MegaPixImage constructor accepts File/Blob object.
    var mpImg = new MegaPixImage(file);

    // Render resized image into image element using quality option.
    // Quality option is valid when rendering into image element.
    var resImg = document.getElementById('picture_crop_preview');
    selectedFileType = file.type;
    mpImg.render(resImg,
      { maxWidth: MAX_WIDTH, maxHeight: MAX_HEIGHT, quality: IMAGE_QUALITY, orientation: exifOrientation },
      file.type,
      pictureFrameID);
  });
}

// TODO: not completed yet
function resizeFileForCrop(srcImg, destImg) {
  $("#show_loading").click();

  // the cropped image will be placed in this input finally
  fullImageContent = "";
  thumbnailContent = "";

  // calculate scaleRatio and minCropWidth
  EXIF.getData(file, function () {
    exifOrientation = EXIF.getTag(this, "Orientation");
    if (typeof(exifOrientation) != 'undefined') {
      // extract orientation information according to JEITA CP-3451
      switch (parseInt(exifOrientation)) {
        case 1 :
        case 2 :
        case 3 :
        case 4 :
          // portrait layout
          console.log('this is a portrait image');
          exifOrientationType = 0;
          break;
        case 5 :
        case 6 :
        case 7 :
        case 8 :
          console.log('this is landscape image');
          exifOrientationType = 1;
          break;
        default :
          console.log('something wrong with the exif data');
          exifOrientationType = -1;
          break;
      }
    } else {
      console.log('this file does not contain any EXIF data');
      exifOrientationType = -1;
    }

    // MegaPixImage constructor accepts File/Blob object.
    var mpImg = new MegaPixImage(file);

    // Render resized image into image element using quality option.
    // Quality option is valid when rendering into image element.
    var resImg = document.getElementById('picture_crop_preview');
    selectedFileType = file.type;
    mpImg.render(resImg,
      { maxWidth: MAX_WIDTH, maxHeight: MAX_HEIGHT, quality: IMAGE_QUALITY, orientation: exifOrientation },
      file.type,
      pictureFrameID);
  });
}

function updateCoords(c) {
  croppedWidth = c.w * scaleRatio;
  croppedHeight = c.h * scaleRatio;
  croppedX = c.x * scaleRatio;
  croppedY = c.y * scaleRatio;
}

function updateCoordsForCropOnly(c) {
  croppedCWidth = c.w * scaleCRatio;
  croppedCHeight = c.h * scaleCRatio;
  croppedCX = c.x * scaleCRatio;
  croppedCY = c.y * scaleCRatio;
}

function imageProcess() {
  var tmpCanvas = document.createElement('canvas');
  //var tmpCanvas = document.getElementById('cropCanvas');
  var context = tmpCanvas.getContext('2d');
  var previewPicture = document.getElementById('picture_crop_preview');
  tmpCanvas.width = CROP_WIDTH;
  tmpCanvas.height = CROP_HEIGHT;
  context
    .drawImage(previewPicture, croppedX, croppedY, croppedWidth, croppedHeight, 0, 0, CROP_WIDTH, CROP_HEIGHT);

  thumbnailContent = tmpCanvas.toDataURL(selectedFileType, 1.0);
}

function croppedImageProcess(mimeType) {
  var tmpCanvas = document.createElement('canvas');
  //var tmpCanvas = document.getElementById('cropCanvas');
  var context = tmpCanvas.getContext('2d');
  var previewPicture = document.getElementById('picture_crop_only_preview');
  tmpCanvas.width = CROP_WIDTH;
  tmpCanvas.height = CROP_HEIGHT;
  context
    .drawImage(previewPicture, croppedCX, croppedCY, croppedCWidth, croppedCHeight, 0, 0, CROP_WIDTH, CROP_HEIGHT);

  cropThumbnailContent = tmpCanvas.toDataURL(cropContentType, 1.0);
  //alert(cropContentType + " length = " + cropThumbnailContent.length);
}

function cropOnly() {
  var tmpCanvas = document.createElement('canvas');
  var context = tmpCanvas.getContext('2d');
  var previewPicture = document.getElementById('picture_crop_only_preview');
  tmpCanvas.width = CROP_WIDTH;
  tmpCanvas.height = CROP_HEIGHT;
  context
    .drawImage(previewPicture, croppedX, croppedY, croppedWidth, croppedHeight, 0, 0, CROP_WIDTH, CROP_HEIGHT);
}

// picture loading overlay
$(document).on("click", ".show-page-loading-msg", function () {
  var $this = $(this),
    theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
    msgText = "努力处理中..." || $this.jqmData("msgtext") || $.mobile.loader.prototype.options.text,
    textVisible = $this.jqmData("textvisible") || $.mobile.loader.prototype.options.textVisible,
    textonly = !!$this.jqmData("textonly");
  html = $this.jqmData("html") || "";
  $.mobile.loading("show", {
    text: msgText,
    textVisible: textVisible,
    theme: theme,
    textonly: textonly,
    html: html
  });
})
  .on("click", ".hide-page-loading-msg", function () {
    $.mobile.loading("hide");
  });