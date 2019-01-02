var csInterface = new CSInterface();

function extFolder() {
  var str = csInterface.getSystemPath(SystemPath.EXTENSION);
  var parent = str.substring(str.lastIndexOf('/') + 1, str.length);
  return parent;
}

function loadJSX(fileName) {
  var root = csInterface.getSystemPath(SystemPath.EXTENSION) + "/host/";
  csInterface.evalScript('$.evalFile("' + root + fileName + '")');
}

function loadUniversalJSXLibraries() {
  var libs = ["json2.jsx", "Console.jsx"];
  var root = csInterface.getSystemPath(SystemPath.EXTENSION) + "/host/universal/";
  for (var i = 0; i < libs.length; i++)
    csInterface.evalScript('$.evalFile("' + root + libs[i] + '")');
}

/**
 * Premiere Pro Panel
 */
function toHex(color, delta) {
  function computeValue(value, delta) {
    var computedValue = !isNaN(delta) ? value + delta : value;
    if (computedValue < 0) {
      computedValue = 0;
    } else if (computedValue > 255) {
      computedValue = 255;
    }

    computedValue = Math.round(computedValue).toString(16);
    return computedValue.length == 1 ? "0" + computedValue : computedValue;
  }

  var hex = "";
  if (color) {
    with (color) {
      hex = computeValue(red, delta) + computeValue(green, delta) + computeValue(blue, delta);
    };
  }
  return "#" + hex;
}

// https://stackoverflow.com/a/11923973
function rgbToHsl(c) {
  var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  // return new Array(h, s, l);
  return new Array(h * 360, s * 100, l * 100);
}

// https://stackoverflow.com/a/44134328
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
