(function () {
  var d = document;

  var outerFrame = document.getElementById("outer_frame");
  var winWidth;
  var winHeight;

  // get window width and height
  winWidth = $(window).width();
  winHeight = $(window).height();

  //alert("winWidth = " + winWidth + ", winHeight = " + winHeight);

  var innerCanvas = "<canvas width='" + winWidth + "' height='" + winHeight + "' id='gameCanvas'/>";
  //var innerCanvas = "<canvas width='100%' height='100%' id='gameCanvas'/>";
  outerFrame.innerHTML = innerCanvas;

  var c = {
    COCOS2D_DEBUG: 2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
    box2d: false,
    chipmunk: false,
    showFPS: false,
    frameRate: 50,
    loadExtension: false,
    renderMode: 0, //Choose of RenderMode: 0(default), 1(Canvas only), 2(WebGL only)
    tag: 'gameCanvas', //the dom element to run cocos2d on
    //engineDir: '../../public_js/cocos2d/',
    SingleEngineFile: '../../public_js/cocos2d-html5.min.js',
    appFiles: [
      './js/CCScale9Sprite.js',
      './js/src/resource.js',
      './js/src/brick_model.js',
      './js/src/main_scene.js'
    ]
  };

  if (!d.createElement('canvas').getContext) {
    var s = d.createElement('div');
    s.innerHTML = '<h2>Your browser does not support HTML5 canvas!</h2>' +
      '<p>Google Chrome is a browser that combines a minimal design with sophisticated technology to make the web faster, safer, and easier.Click the logo to download.</p>' +
      '<a href="http://www.google.com/chrome" target="_blank"><img src="http://www.google.com/intl/zh-CN/chrome/assets/common/images/chrome_logo_2x.png" border="0"/></a>';
    var p = d.getElementById(c.tag).parentNode;
    p.style.background = 'none';
    p.style.border = 'none';
    p.insertBefore(s);

    d.body.style.background = '#ffffff';
    return;
  }

  window.addEventListener('DOMContentLoaded', function () {
    //first load engine file if specified
    var s = d.createElement('script');
    /*********Delete this section if you have packed all files into one*******/
    if (c.SingleEngineFile && !c.engineDir) {
      s.src = c.SingleEngineFile;
    }
    else if (c.engineDir && !c.SingleEngineFile) {
      s.src = c.engineDir + 'platform/jsloader.js';
    }
    else {
      alert('You must specify either the single engine file OR the engine directory in "Portal_Server.js"');
    }
    /*********Delete this section if you have packed all files into one*******/

      //s.src = 'Packed_Release_File.js'; //IMPORTANT: Un-comment this line if you have packed all files into one

    document.ccConfig = c;
    s.id = 'Googdood Game - Bricks - Author Editor';
    d.body.appendChild(s);
    //else if single file specified, load single file
  });
})();
