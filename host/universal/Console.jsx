JSXEvent('Loading...', 'console')

var console = {
  log: function (data) { JSXEvent(data, 'console') }
};

function runScript(path) {
  try {
  $.evalFile(path)
  } catch (e) {
    JSXEvent(e.name + "," + e.line + "," + e + "," + e.message, "console")
  }
}

function JSXEvent(payload, eventType) {
  try {
    var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
  } catch (e) {
    JSXEvent(e, 'console')
  }
  if (xLib) {
  var eventObj = new CSXSEvent();
  eventObj.type = eventType;
  eventObj.data = payload;
  eventObj.dispatch();
  }
  return;
}

/// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
