function baseRange(_0x1d502d, _0x150240, _0x2f719b, _0x20a665) {
    var _0x7c86bc = -0x1;
    var _0xd7a654 = Math.max(Math.ceil((_0x150240 - _0x1d502d) / (_0x2f719b || 0x1)), 0x0);
    const _0x38eb2e = new Array(_0xd7a654);
    for (; _0xd7a654--;) {
        _0x38eb2e[_0x20a665 ? _0xd7a654 : ++_0x7c86bc] = _0x1d502d;
        _0x1d502d += _0x2f719b;
    }
    return _0x38eb2e;
}
function toFinite(num) {
    return num ? (num = toNumber(num)) !== Infinity && num !== -Infinity ? num == num ? num : 0x0 : 0xfffffffffffff800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 * (num < 0x0 ? -0x1 : 0x1) : 0x0 === num ? num : 0x0;
}
function toNumber(_0x21ec90) {
    if ("number" == typeof _0x21ec90) {
        return _0x21ec90;
    }
    if (isSymbol(_0x21ec90)) {
        return NaN;
    }
    if ("string" != typeof (_0x21ec90 = isObject(_0x21ec90) ? isObject(_0x2fa0e5 = "function" == typeof _0x21ec90.valueOf ? _0x21ec90.valueOf() : _0x21ec90) ? '' + _0x2fa0e5 : _0x2fa0e5 : _0x21ec90)) {
        return 0x0 === _0x21ec90 ? _0x21ec90 : +_0x21ec90;
    }
    _0x21ec90 = _0x21ec90.replace(/^\s+|\s+$/g, '');
    var _0x2fa0e5 = /^0b[01]+$/i.test(_0x21ec90);
    return _0x2fa0e5 || /^0o[0-7]+$/i.test(_0x21ec90) ? parseInt(_0x21ec90.slice(0x2), _0x2fa0e5 ? 0x2 : 0x8) : /^[-+]0x[0-9a-f]+$/i.test(_0x21ec90) ? NaN : +_0x21ec90;
}
function isObject(_0x48415b) {
    var _0x2237a0 = typeof _0x48415b;
    return null != _0x48415b && ('object' == _0x2237a0 || 'function' == _0x2237a0);
}
function isSymbol(_0x321223) {
    var _0x5b165d = typeof _0x321223;
    return 'symbol' == _0x5b165d || 'object' == _0x5b165d && null != _0x321223 && "[object Symbol]" == getTag(_0x321223);
}
function createRange(_0x316523, _0x13fdc3, _0x15974b) {
    _0x316523 = toFinite(_0x316523);
    if (undefined === _0x13fdc3) {
        _0x13fdc3 = _0x316523;
        _0x316523 = 0x0;
    } else {
        _0x13fdc3 = toFinite(_0x13fdc3);
    }
    return baseRange(_0x316523, _0x13fdc3, _0x15974b = undefined === _0x15974b ? _0x316523 < _0x13fdc3 ? 0x1 : -0x1 : toFinite(_0x15974b), false);
}
function getColsInGroup(group) {
    if (0x1 === group.length) {
        return 0x1;
    }
    var _0x53021d;
    for (var _0x1b11cc = 0x0; _0x1b11cc < group.length; _0x1b11cc++) {
        if ((_0x53021d = undefined === _0x53021d ? group[_0x1b11cc].y : _0x53021d) !== group[_0x1b11cc].y) {
            return _0x1b11cc;
        }
    }
    return _0x1b11cc;
}
function getGroup(_0xef722) {
    const _0x3a0904 = {
        'slices': _0xef722.length,
        'cols': getColsInGroup(_0xef722)
    };
    _0x3a0904.rows = _0xef722.length / _0x3a0904.cols;
    _0x3a0904.x = _0xef722[0x0].x;
    _0x3a0904.y = _0xef722[0x0].y;
    return _0x3a0904;
}
function extractSeed(_0x5cb8c0) {
    return !/(number|string)/i.test(Object.prototype.toString.call(_0x5cb8c0).match(/^\[object (.*)\]$/)[0x1]) && isNaN(_0x5cb8c0) ? Number(String(this.strSeed = _0x5cb8c0).split('').map(function (_0x3eeb84) {
        return _0x3eeb84.charCodeAt(0x0);
    }).join('')) : _0x5cb8c0;
}
function seedRand(_0x40579d, _0x53d4c9, _0x278056) {
    return Math.floor(_0x40579d() * (_0x278056 - _0x53d4c9 + 0x1)) + _0x53d4c9;
}
function unShuffle(sections, inseed_val) {
    if (!Array.isArray(sections)) {
        return null;
    }
    if (Math.seedrandom) {
        seedrandom = Math.seedrandom;
    }
    inseed_val = extractSeed(inseed_val) || "none";
    var _0x79d5a3 = sections.length;
    var _0x54ebba = seedrandom(inseed_val);
    const unshuffled = [];
    const removed_sections = [];
    for (var _0x1ce019 = 0x0; _0x1ce019 < _0x79d5a3; _0x1ce019++) {
        unshuffled.push(null);
        removed_sections.push(_0x1ce019);
    }
    for (_0x1ce019 = 0x0; _0x1ce019 < _0x79d5a3; _0x1ce019++) {
        var _0x205980 = Math.floor(_0x54ebba() * (removed_sections.length - 0x1 - 0x0 + 0x1)) + 0x0;
        var _0xa98524 = removed_sections[_0x205980];
        removed_sections.splice(_0x205980, 0x1);
        unshuffled[_0xa98524] = sections[_0x1ce019];
    }
    return unshuffled;
}
!function (_0xb4cc48, _0xfe9b7e, _0x45e2bc) {
    var _0x34417a;
    var _0x2074e7 = _0x45e2bc.pow(0x100, 0x6);
    var _0xf9a1d7 = _0x45e2bc.pow(0x2, 0x34);
    var _0x5588e1 = 0x2 * _0xf9a1d7;
    function _0x4b594c(_0x33ee52, _0x23af96, _0x472699) {
        function _0x43ef8f() {
            var _0x10852a = _0x439c6c.g(0x6);
            var _0x33a6ee = _0x2074e7;
            for (var _0x2e4719 = 0x0; _0x10852a < _0xf9a1d7;) {
                _0x10852a = (_0x10852a + _0x2e4719) * 0x100;
                _0x33a6ee *= 0x100;
                _0x2e4719 = _0x439c6c.g(0x1);
            }
            for (; _0x5588e1 <= _0x10852a;) {
                _0x10852a /= 0x2;
                _0x33a6ee /= 0x2;
                _0x2e4719 >>>= 0x1;
            }
            return (_0x10852a + _0x2e4719) / _0x33a6ee;
        }
        var _0x511c4a = [];
        var _0x33ee52 = _0x1a35e8(function _0x49831c(_0x1e36dd, _0x43e24f) {
            var _0x2e2edd;
            var _0x45f210 = [];
            var _0x266fc8 = typeof _0x1e36dd;
            if (_0x43e24f && "object" == _0x266fc8) {
                for (_0x2e2edd in _0x1e36dd) try {
                    _0x45f210.push(_0x49831c(_0x1e36dd[_0x2e2edd], _0x43e24f - 0x1));
                } catch (_0x958891) { }
            }
            return _0x45f210.length ? _0x45f210 : "string" == _0x266fc8 ? _0x1e36dd : _0x1e36dd + "\0";
        }((_0x23af96 = 0x1 == _0x23af96 ? {
            'entropy': true
        } : _0x23af96 || {}).entropy ? [_0x33ee52, String.fromCharCode.apply(0x0, _0xfe9b7e)] : null == _0x33ee52 ? function () {
            try {
                var _0x34fad6;
                if (_0x34417a && (_0x34fad6 = _0x34417a.randomBytes)) {
                    _0x34fad6 = _0x34fad6(0x100);
                } else {
                    _0x34fad6 = new Uint8Array(0x100);
                    (_0xb4cc48.crypto || _0xb4cc48.msCrypto).getRandomValues(_0x34fad6);
                }
                return String.fromCharCode.apply(0x0, _0x34fad6);
            } catch (_0x5ad67e) {
                var _0x132ee8 = _0xb4cc48.navigator;
                var _0x132ee8 = _0x132ee8 && _0x132ee8.plugins;
                return [+new Date(), _0xb4cc48, _0x132ee8, _0xb4cc48.screen, String.fromCharCode.apply(0x0, _0xfe9b7e)];
            }
        }() : _0x33ee52, 0x3), _0x511c4a);
        var _0x439c6c = new _0x29ee70(_0x511c4a);
        _0x43ef8f.int32 = function () {
            return 0x0 | _0x439c6c.g(0x4);
        };
        _0x43ef8f.quick = function () {
            return _0x439c6c.g(0x4) / 0x100000000;
        };
        _0x43ef8f.double = _0x43ef8f;
        _0x1a35e8(String.fromCharCode.apply(0x0, _0x439c6c.S), _0xfe9b7e);
        return (_0x23af96.pass || _0x472699 || function (_0x2b1726, _0xfb02cf, _0x2534bf, _0x30c1e5) {
            if (_0x30c1e5) {
                if (_0x30c1e5.S) {
                    _0x271b29(_0x30c1e5, _0x439c6c);
                }
                _0x2b1726.state = function () {
                    return _0x271b29(_0x439c6c, {});
                };
            }
            return _0x2534bf ? (_0x45e2bc.random = _0x2b1726, _0xfb02cf) : _0x2b1726;
        })(_0x43ef8f, _0x33ee52, "global" in _0x23af96 ? _0x23af96.global : this == _0x45e2bc, _0x23af96.state);
    }
    function _0x29ee70(_0x2e8dbe) {
        var _0x1c4341;
        var _0x504532 = _0x2e8dbe.length;
        var _0x443fba = this;
        var _0x21cd08 = 0x0;
        var _0x29130a = _0x443fba.i = _0x443fba.j = 0x0;
        var _0x532a8a = _0x443fba.S = [];
        for (_0x504532 || (_0x2e8dbe = [_0x504532++]); _0x21cd08 < 0x100;) {
            _0x532a8a[_0x21cd08] = _0x21cd08++;
        }
        for (_0x21cd08 = 0x0; _0x21cd08 < 0x100; _0x21cd08++) {
            _0x532a8a[_0x21cd08] = _0x532a8a[_0x29130a = 255 & _0x29130a + _0x2e8dbe[_0x21cd08 % _0x504532] + (_0x1c4341 = _0x532a8a[_0x21cd08])];
            _0x532a8a[_0x29130a] = _0x1c4341;
        }
        (_0x443fba.g = function (_0x2122be) {
            var _0x32d5d0;
            var _0x487618 = 0x0;
            var _0x4f5527 = _0x443fba.i;
            var _0x5708aa = _0x443fba.j;
            for (var _0x106a6c = _0x443fba.S; _0x2122be--;) {
                _0x32d5d0 = _0x106a6c[_0x4f5527 = 255 & _0x4f5527 + 0x1];
                _0x487618 = _0x487618 * 0x100 + _0x106a6c[255 & (_0x106a6c[_0x4f5527] = _0x106a6c[_0x5708aa = 255 & _0x5708aa + _0x32d5d0]) + (_0x106a6c[_0x5708aa] = _0x32d5d0)];
            }
            _0x443fba.i = _0x4f5527;
            _0x443fba.j = _0x5708aa;
            return _0x487618;
        })(0x100);
    }
    function _0x271b29(_0x27e3c1, _0x40ffac) {
        _0x40ffac.i = _0x27e3c1.i;
        _0x40ffac.j = _0x27e3c1.j;
        _0x40ffac.S = _0x27e3c1.S.slice();
        return _0x40ffac;
    }
    function _0x1a35e8(_0x234d38, _0x5076b5) {
        var _0x4b4805;
        var _0x563715 = _0x234d38 + '';
        for (var _0x40b4de = 0x0; _0x40b4de < _0x563715.length;) {
            _0x5076b5[255 & _0x40b4de] = 255 & (_0x4b4805 ^= 0x13 * _0x5076b5[255 & _0x40b4de]) + _0x563715.charCodeAt(_0x40b4de++);
        }
        return String.fromCharCode.apply(0x0, _0x5076b5);
    }
    _0x1a35e8(_0x45e2bc.random(), _0xfe9b7e);
    if ('object' == typeof module && module.exports) {
        module.exports = _0x4b594c;
        try {
            _0x34417a = require("crypto");
        } catch (_0x2f651a) { }
    } else if ("function" == typeof define && define.amd) {
        define(function () {
            return _0x4b594c;
        });
    } else {
        _0x45e2bc.seedrandom = _0x4b594c;
    }
}("undefined" != typeof self ? self : this, [], Math);
const parseParams = _0xafb6f8 => {
    const _0x801c01 = new URLSearchParams(_0xafb6f8);
    var _0xafb6f8 = Object.fromEntries(_0x801c01.entries());
    var _0x50e042 = [];
    Object.keys(_0xafb6f8).forEach(_0x5f1151 => {
        var _0x23866b;
        var _0x49c95d = _0x801c01.get(_0x5f1151);
        if (_0x5f1151.includes('?')) {
            if (_0x23866b = _0x5f1151.split('?')[0x1]) {
                _0x50e042.push([_0x23866b, _0x49c95d]);
            }
        } else {
            _0x50e042.push([_0x5f1151, _0x49c95d]);
        }
    });
    return _0x50e042;
};
const Canvas = require('canvas');
const seedrandom = require('seedrandom');
module.exports = function imgReverser(canvas, src, box_size = 0xc8, seed = 'stay') {
    return new Promise((_0x526b3e, _0x1a8c11) => {
        const context = canvas.getContext('2d');
        var _0x36a3f1 = 0x0;
        const img = new Canvas.Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            var _0xb1c9b9 = Math.ceil(img.width / box_size) * Math.ceil(img.height / box_size);
            canvas.width = img.width;
            canvas.height = img.height;
            var _0xacf76d = Math.ceil(img.width / box_size);
            const sections = [];
            for (var _0x11cc67 = 0x0; _0x11cc67 < _0xb1c9b9; _0x11cc67++) {
                var _0x55f515 = parseInt(_0x11cc67 / _0xacf76d);
                const _0x25f249 = {
                    'x': (_0x11cc67 - _0x55f515 * _0xacf76d) * box_size,
                    'y': _0x55f515 * box_size
                };
                _0x25f249.width = box_size - (_0x25f249.x + box_size <= img.width ? 0x0 : _0x25f249.x + box_size - img.width);
                _0x25f249.height = box_size - (_0x25f249.y + box_size <= img.height ? 0x0 : _0x25f249.y + box_size - img.height);
                if (!sections[_0x25f249.width + '-' + _0x25f249.height]) {
                    sections[_0x25f249.width + '-' + _0x25f249.height] = [];
                }
                sections[_0x25f249.width + '-' + _0x25f249.height].push(_0x25f249);
            }
            for (const sections_index in sections) {
                var i;
                var val;
                var unshuffled = unShuffle(createRange(0x0, sections[sections_index].length), seed);
                var group = getGroup(sections[sections_index]);
                for ([i, val] of sections[sections_index].entries()) {
                    var bar = unshuffled[i];
                    var foo = parseInt(bar / group.cols);
                    var bar = (bar - foo * group.cols) * val.width;
                    var foo = foo * val.height;
                    context.drawImage(img, group.x + bar, group.y + foo, val.width, val.height, val.x, val.y, val.width, val.height);
                }
            }
            return _0x526b3e(canvas);
        };
        img.onerror = function () {
            if (!(_0x36a3f1 < 0x5)) {
                img.onerror = null;
                return _0x526b3e(null);
            }
            var _0xe02232 = src;
            var _0x3aed57 = parseParams(src);
            if (_0x3aed57 && 0x0 < _0x3aed57.length) {
                for (const _0x19b364 of _0x3aed57) if (!(_0xe02232.includes(_0x19b364[0x0] + '=' + _0x19b364[0x1]) || _0x19b364[0x0].toString().includes("http"))) {
                    _0xe02232 = '' + _0xe02232 + (_0xe02232.includes('?') ? '&' : '?') + _0x19b364[0x0] + '=' + _0x19b364[0x1];
                }
            }
            _0x3aed57 = Math.round(new Date().getTime() / 0x3e8);
            img.src = '' + _0xe02232 + (_0xe02232.includes('?') ? '&' : '?') + 'v=' + _0x3aed57;
            _0x36a3f1++;
        };
        img.src = src;
    });
}

var settings = {
    'readingMode': null,
    'readingDirection': "rtl",
    'quality': "medium",
    'hozPageSize': 0x1
};
const currentUrl = new URL("https://mangareader.to");
const wWidth = 0x0 < window?.innerWidth ? window?.innerWidth : 0;
function initSettings() {
    // if (Cookies.get("mr_settings") || localStorage.getItem('settings')) {
    //     settings = Cookies.get("mr_settings") || localStorage.getItem("settings");
    //     if (undefined === (settings = JSON.parse(settings)).hozPageSize) {
    //         settings.hozPageSize = 0x1;
    //     }
    // } else {
    //     saveSettings();
    // }
    processingSettings();
}
function processingSettings() {
    settings.hozPageSize = parseInt(settings.hozPageSize);
    settings.hozPageSize = wWidth <= 0x35c ? 0x1 : settings.hozPageSize;
}
function saveSettings() {
    settings.hozPageSize = parseInt(settings.hozPageSize);
    $(".read_tool").removeClass("active");
    if (isLoggedIn) {
        $.post('/ajax/user/settings', {
            'settings': settings
        }, function (_0x27dcd4) { });
    }
    localStorage.setItem('settings', JSON.stringify(settings));
    // Cookies.set("mr_settings", JSON.stringify(settings), {
    //     'path': '/',
    //     'expires': 0x16d
    // });
}
// setTimeout(function () {
//     if (!Cookies.get("mr_viewed_" + mangaId)) {
//         $.post("/ajax/manga/count-view/" + mangaId, function (_0x3341d4) {
//             Cookies.set("mr_viewed_" + mangaId, true, {
//                 'expires': new Date(new Date().getTime() + 0x36ee80)
//             });
//         });
//     }
// }, 0x4e20);
initSettings();
var $ = () => {};
var window = {};
var hozElImageNext;
var readingBy = "chap";
var continueReading = null;
var firstLoad = true;
var currentImageIndex = 0x0;
var oldImageIndex = 0x0;
var totalImage = 0x0;
var touchstartX = 0x0;
var touchstartY = 0x0;
var touchendX = 0x0;
var touchendY = 0x0;
// var gesturesZone = document.getElementById("images-content");
function handleGestures() {
    var _0x4c39d6 = touchendX - touchstartX;
    var _0x5f4489 = touchendY - touchstartY;
    if (Math.abs(_0x4c39d6) > Math.abs(_0x5f4489)) {
        (0x0 < _0x4c39d6 ? hozPrevImage : hozNextImage)();
    } else if (Math.abs(_0x4c39d6) < Math.abs(_0x5f4489)) {
        if (0x0 < _0x5f4489) {
            console.log("swipe down");
        } else {
            console.log("swipe up");
        }
    } else {
        console.log("tap");
    }
}
// gesturesZone.addEventListener('touchstart', function (_0x3d64b9) {
//     touchstartX = _0x3d64b9.touches[0x0].clientX;
//     touchstartY = _0x3d64b9.touches[0x0].clientY;
// }, false);
// gesturesZone.addEventListener("touchend", function (_0x27c862) {
//     touchendX = _0x27c862.changedTouches[0x0].clientX;
//     touchendY = _0x27c862.changedTouches[0x0].clientY;
// }, false);
// window?.addEventListener('contextmenu', function (_0x239409) {
//     _0x239409.preventDefault();
// }, false);
// window?.addEventListener('dragstart', function (_0x57bdbd) {
//     _0x57bdbd.preventDefault();
// }, false);
// window?.addEventListener("resize", function () {
//     if ("horizontal" === settings.readingMode) {
//         document.getElementById('main-wrapper').style.height = window?.innerHeight + 'px';
//     }
// });
// window?.addEventListener("orientationchange", function (_0x3acf33) {
//     if ("horizontal" === settings.readingMode) {
//         document.getElementById("main-wrapper").style.height = window?.innerHeight + 'px';
//     }
// });
// document.addEventListener('keyup', function (_0x52b61f) {
//     switch (_0x52b61f.keyCode) {
//         case 0x27:
//             ("ltr" === settings.readingDirection ? hozNextImage : hozPrevImage)();
//             break;
//         case 0x25:
//             ("ltr" === settings.readingDirection ? hozPrevImage : hozNextImage)();
//     }
// });
var curScroll;
// var doc = document.documentElement;
var prevScroll = 0;
var direction = null;
var prevDirection = null;
// var header = document.getElementById("wrapper");
function handleVerticalScroll() {
    // $(".iv-card").each(function () {
    //     var _0x29735e = $('.iv-card').index(this);
    //     if (isInViewport(this) && _0x29735e !== currentImageIndex) {
    //         currentImageIndex = _0x29735e;
    //         verShowImage();
    //     }
    // });
    curScroll = window?.scrollY || doc.scrollTop;
    direction = prevScroll < curScroll ? "down" : 'up';
    prevScroll = curScroll;
    if (direction !== prevDirection) {
        if ("down" === direction && 0x34 < curScroll) {
            header.classList.add("top-hide");
            prevDirection = direction;
        } else if ('up' === direction) {
            header.classList.remove("top-hide");
            prevDirection = direction;
        }
    }
}
function hozShowImage() {
    // if (totalImage - (currentImageIndex + 0x1) == 0x0) {
    //     if (0x0 === $(".reading-item.active").prev().length) {
    //         $(".hoz-next").addClass("disabled");
    //         $(".hoz-next-hide").hide();
    //     }
    // } else {
    //     $('.hoz-next').removeClass("disabled");
    //     $(".hoz-next-hide").show();
    // }
    // if (0x0 === currentImageIndex) {
    //     if (0x0 === $(".reading-item.active").next().length) {
    //         $(".hoz-prev").addClass("disabled");
    //         $(".hoz-prev-hide").hide();
    //     }
    // } else {
    //     $('.hoz-prev').removeClass('disabled');
    //     $('.hoz-prev-hide').show();
    // }
    // if (0x2 === settings.hozPageSize) {
    //     const _0x8b8819 = $($(".ds-image").get(currentImageIndex)).parent();
    //     $(".ds-item").removeClass('active');
    //     $(".ds-item").hide();
    //     _0x8b8819.addClass('active');
    //     _0x8b8819.show();
    //     var _0x546452;
    //     var _0x145daa = (currentImageIndex + 0x1).toString().padStart(totalImage.toString().length, '0');
    //     if (0x1 < _0x8b8819.find(".ds-image").length) {
    //         _0x546452 = (currentImageIndex + 0x2).toString().padStart(totalImage.toString().length, '0');
    //         if (currentImageIndex < totalImage - 0x2) {
    //             $(".hoz-current-index").text(_0x145daa + " - " + _0x546452);
    //         } else {
    //             $(".hoz-current-index").text(_0x145daa);
    //         }
    //     } else {
    //         $(".hoz-current-index").text(_0x145daa);
    //     }
    // } else {
    //     // var _0x363ffd = document.getElementsByClassName("ds-item").item(currentImageIndex);
    //     // $(".ds-item").removeClass("active");
    //     // $('.ds-item').hide();
    //     // $(_0x363ffd).addClass("active");
    //     // $(_0x363ffd).show();
    //     // $('.hoz-current-index').text((currentImageIndex + 0x1).toString().padStart(totalImage.toString().length, '0'));
    // }
    if (currentImageIndex < totalImage - 0x1) {
        for (var _0x51ee7f = currentImageIndex; _0x51ee7f <= currentImageIndex + 0x4 + settings.hozPageSize; _0x51ee7f++) {
            if (_0x51ee7f < totalImage - 0x1) {
                hozProcessingImage(_0x51ee7f);
            }
        }
        for (_0x51ee7f = 0x4 < totalImage - 0x2 ? 0x4 : totalImage - 0x2; 0x0 < _0x51ee7f; _0x51ee7f--) {
            var _0xdba90a = currentImageIndex - _0x51ee7f;
            hozProcessingImage(0x0 <= _0xdba90a ? _0xdba90a : _0x51ee7f);
        }
    }
}
function verShowImage() {
    if (currentImageIndex <= totalImage - 0x1) {
        for (var _0x4a244e = currentImageIndex; _0x4a244e <= currentImageIndex + 0x4; _0x4a244e++) {
            if (_0x4a244e <= totalImage - 0x1) {
                verProcessingImage(_0x4a244e);
            }
        }
        for (_0x4a244e = 0x4 < totalImage - 0x1 ? 0x4 : totalImage - 0x1; 0x0 < _0x4a244e; _0x4a244e--) {
            var _0x4552cd = currentImageIndex - _0x4a244e;
            verProcessingImage(0x0 <= _0x4552cd ? _0x4552cd : _0x4a244e);
        }
    }
}
function hozProcessingImage(_0x58dc88) {
    const _0x4a5f7d = document.getElementsByClassName("ds-image").item(_0x58dc88);
    if (_0x4a5f7d && !_0x4a5f7d.classList.contains('loaded')) {
        _0x4a5f7d.classList.add("loaded");
        createImageElement(_0x4a5f7d, $(_0x4a5f7d).data("url"), 'image-horizontal');
    }
}
function verProcessingImage(_0x4c3e2f) {
    _0x4c3e2f = document.getElementsByClassName('iv-card').item(_0x4c3e2f);
    if (_0x4c3e2f && !_0x4c3e2f.classList.contains("loaded")) {
        _0x4c3e2f.classList.add("loaded");
        createImageElement(_0x4c3e2f, $(_0x4c3e2f).data("url"), "image-vertical");
    }
}
function hozNextImage() {
    if (currentImageIndex < totalImage - 0x1) {
        const _0x17cf82 = $($(".ds-image").get(currentImageIndex)).parent();
        currentImageIndex += _0x17cf82.is(":last-child") ? settings.hozPageSize : _0x17cf82.find('.ds-image').length;
        hozShowImage();
    } else {
        nextChapterVolume();
    }
}
function hozPrevImage() {
    if (0x0 < currentImageIndex) {
        const _0x54057c = $($(".ds-image").get(currentImageIndex)).parent().prev();
        currentImageIndex -= _0x54057c.is(":last-child") ? settings.hozPageSize : _0x54057c.find(".ds-image").length;
        hozShowImage();
    } else {
        prevChapterVolume();
    }
}
function activeSettings() {
    // if (settings.readingMode) {
    //     if ("vertical" === settings.readingMode) {
    //         $('body').addClass('page-reader-ver');
    //     } else {
    //         $("body").removeClass('page-reader-ver');
    //     }
    //     $(".hr-setting").show();
    //     $(".mode-item[data-value=" + settings.readingMode + ']').addClass("active");
    //     $("#current-mode").text(settings.readingMode.charAt(0x0).toUpperCase() + settings.readingMode.slice(0x1));
    // } else {
    //     $("#first-read").show();
    // }
    // $(".direction-item[data-value=" + settings.readingDirection + ']').addClass("active");
    // $("#current-direction").text($(".direction-item.active").text());
    // $(".quality-item[data-value=" + settings.quality + ']').addClass('active');
    // $("#current-quality").text($('.quality-item.active').text());
}
function resetWhenChangeChapVol() {
    if ("vertical" === settings.readingMode) {
        $(window).scrollTo("#main-wrapper .iv-card:eq(0)", {
            'duration': 0xc8
        });
    }
    currentImageIndex = 0x0;
}
function nextChapterVolume() {
    resetWhenChangeChapVol();
    var _0x277974 = $(".reading-item.active").prev();
    if (0x0 < _0x277974.length) {
        _0x277974.click();
    }
}
function prevChapterVolume() {
    resetWhenChangeChapVol();
    var _0x4d5473 = $(".reading-item.active").next();
    if (0x0 < _0x4d5473.length) {
        _0x4d5473.click();
    }
}
// $(document).ready(function () {
//     readingListInfo("read");
//     $(document).on("click", "#vertical-content", function (_0x3f4f80) {
//         $("html, body").animate({
//             'scrollTop': $(window).scrollTop() + 0xfa
//         }, 0x1f4);
//     });
//     $(".im-toggle").click(function (_0x4c25bc) {
//         $('.c_b-list').toggleClass("active");
//     });
//     $(".ad-toggle").click(function (_0x17e6f4) {
//         $('.page-reader').toggleClass("pr-full");
//     });
//     $(".read-tips-follow").click(function (_0x30ba22) {
//         $(this).hide();
//     });
//     $('.item-hide').click(function (_0x331802) {
//         $(".read-tips-keyboard").addClass('rtk-hide');
//     });
//     $('.kb-icon').click(function (_0x339631) {
//         $(".read-tips-keyboard").removeClass("rtk-hide");
//     });
//     $(".rc-close").click(function (_0x28f661) {
//         $("body").removeClass("show-comment");
//     });
//     $(".hr-setting, #rt-close").click(function (_0x156d58) {
//         $('.read_tool').toggleClass("active");
//     });
//     $(".hr-comment, .comment-bottom-button .btn").click(function (_0x1b89e4) {
//         $("body").toggleClass("show-comment");
//     });
// });
// $(document).on('shown.bs.dropdown', "#dropdown-chapters,#dropdown-volumes", function () {
//     $(this).find(".search-reading-item").focus();
//     $(".reading-item.active").parent().scrollTo(".reading-item.active", {
//         'duration': 0x12c
//     });
// });
// $(document).on("click", ".mode-item", function (_0x1b2513) {
//     settings.readingMode = $(this).data("value");
//     if ("vertical" === settings.readingMode) {
//         $("body").addClass('page-reader-ver');
//     } else {
//         window?.removeEventListener("scroll", handleVerticalScroll);
//         $("body").removeClass("page-reader-ver");
//     }
//     $(".hr-setting").show();
//     $(".mode-item").removeClass("active");
//     $(this).addClass('active');
//     $("#current-mode").text(settings.readingMode.charAt(0x0).toUpperCase() + settings.readingMode.slice(0x1));
//     saveSettings();
//     getImages();
// });
// $(document).on('click', ".quality-item", function (_0x38ed92) {
//     settings.quality = $(this).data("value");
//     $('.quality-item').removeClass("active");
//     $(this).addClass('active');
//     $("#current-quality").text($(this).text());
//     saveSettings();
//     getImages();
// });
// $(document).on("click", ".direction-item", function (_0x5f421e) {
//     settings.readingDirection = $(this).data('value');
//     $(".direction-item").removeClass("active");
//     $(this).addClass('active');
//     $("#current-direction").text($(this).text());
//     $('.hoz-controls').hide();
//     $(".hoz-controls-" + settings.readingDirection).show();
//     $("#hoz-btn-next").removeClass("ltr");
//     $('#hoz-btn-next').removeClass("rtl");
//     $("#hoz-btn-next").addClass(settings.readingDirection);
//     saveSettings();
// });
// $(document).on("click", '.reading-item', function (_0x4875bc) {
//     _0x4875bc.preventDefault();
//     $(".reading-item").removeClass("active");
//     $(this).addClass('active');
//     if (firstLoad) {
//         firstLoad = false;
//         history.pushState({}, '', $(this).find('a').attr("href") + currentUrl.search);
//     } else {
//         history.pushState({}, '', $(this).find('a').attr("href"));
//     }
//     $("#current-chapter").text($(this).find('a').data('shortname'));
//     readingId = $(this).data('id');
//     if (0x1 === parseInt($(this).data("reading-mode"))) {
//         settings.readingMode = 'vertical';
//     }
//     const _0x33bddb = $(this).prev();
//     const _0x5147d6 = JSON.parse($("#syncData").text().trim());
//     if ("chap" === readingBy) {
//         _0x5147d6.chapter = $(this).data("number");
//         if (0x0 < _0x33bddb.length) {
//             _0x5147d6.next_chapter_url = _0x5147d6.base_url + _0x33bddb.find('.item-link').attr("href");
//         } else {
//             _0x5147d6.next_chapter_url = '';
//         }
//         delete _0x5147d6.volume;
//         delete _0x5147d6.next_volume_url;
//     } else {
//         _0x5147d6.volume = $(this).data('number');
//         if (0x0 < _0x33bddb.length) {
//             _0x5147d6.next_volume_url = _0x5147d6.base_url + _0x33bddb.find(".item-link").attr("href");
//         } else {
//             _0x5147d6.next_volume_url = '';
//         }
//         delete _0x5147d6.chapter;
//         delete _0x5147d6.next_chapter_url;
//     }
//     $("#syncData").text(JSON.stringify(_0x5147d6));
//     getImages();
// });
// $(document).on("click", ".lang-item", function (_0x59ea09) {
//     langCode = $(this).data('code');
//     var _0x83a556 = $(".reading-item.active");
//     if (0x0 < _0x83a556.length) {
//         (0x0 < (_0x83a556 = $(".reading-list.active .reading-item[data-number=\"" + _0x83a556.data("number") + "\"]")).length ? _0x83a556 : $(".reading-list.active .reading-item").last()).click();
//     }
// });
// $(document).on("click", ".nf-item", function () {
//     $(".nf-item").removeClass("active");
//     $(this).addClass('active');
//     settings.hozPageSize = $(this).hasClass("nf-double") ? 0x2 : 0x1;
//     saveSettings();
//     getImages();
// });
// $(".select-reading-by").click(function () {
//     readingId = null;
//     if (0x0 === $(".lang-item[data-code=" + langCode + ']').length) {
//         langCode = $('.lang-item').first().data('code');
//     }
//     readingBy = $(this).data("value");
//     changeReadingBy();
//     getChaptersOrVolumes();
// });
var readingId = null;
var langCode = null;
function getContinueReadingFromStorage() {
    try {
        var _0x445e4 = localStorage.getItem("mr_reading_" + mangaId);
        if (_0x445e4) {
            _0x445e4 = JSON.parse(_0x445e4);
            if (readingBy) {
                const _0x570594 = "chap" === readingBy ? 0x1 : 0x2;
                var _0x1aafbc = _0x445e4.findIndex(_0x44b752 => _0x44b752.type === _0x570594);
                return 0x0 <= _0x1aafbc ? _0x445e4[_0x1aafbc] : null;
            }
            return (_0x445e4 = _0x445e4.sort(compareValues("updated_at", "desc")))[0x0];
        }
    } catch (_0x45bdbe) { }
    return null;
}
function getChaptersOrVolumes() {
    continueReading = getContinueReadingFromStorage();
    if (null === readingId && continueReading) {
        readingBy = 0x1 === continueReading.type ? "chap" : "vol";
    }
    // $.get("/ajax/manga/reading-list/" + mangaId + "?readingBy=" + readingBy, function (_0xd7a084) {
    //     if (_0xd7a084) {
    //         $("#reading-list").html(_0xd7a084.html);
    //         if (_0xd7a084.settings) {
    //             settings = Object.assign(settings, _0xd7a084.settings);
    //             processingSettings();
    //         }
    //         if (_0xd7a084.continueReading) {
    //             continueReading = _0xd7a084.continueReading;
    //         }
    //         if (null === readingId) {
    //             if (continueReading) {
    //                 readingId = continueReading.reading_id;
    //                 langCode = continueReading.lang_code;
    //             } else {
    //                 if ('' === readingBy) {
    //                     readingBy = $('.select-reading-by').first().data("value");
    //                 }
    //                 if (null === langCode) {
    //                     langCode = 0x0 < $(".lang-item[data-code=en]").length ? 'en' : $(".lang-item").first().data("code");
    //                 }
    //             }
    //         }
    //         changeReadingBy();
    //         $(".hr-navigation").show();
    //         $(".lang-item[data-code=" + langCode + ']').click();
    //         (0x0 < (_0xd7a084 = $(".reading-list.active .reading-item[data-id=" + readingId + ']')).length ? _0xd7a084 : $(".reading-list.active .reading-item").last()).click();
    //         activeSettings();
    //     }
    // });
}
function changeReadingBy() {
    var _0x247c2c;
    if (readingBy && 0x0 < readingBy.length) {
        _0x247c2c = $(".select-reading-by[data-value=" + readingBy + ']');
        $('.select-reading-by').removeClass("active");
        _0x247c2c.addClass("active");
        $("#reading-by").text(_0x247c2c.text());
    }
}
// function getImages() {
//     if (settings.readingMode && readingId) {
//         $.get('/ajax/image/list/' + readingBy + '/' + readingId + '?mode=' + settings.readingMode + "&quality=" + settings.quality + '&hozPageSize=' + settings.hozPageSize, function (_0x57ca2f) {
//             if (_0x57ca2f) {
//                 $("#images-content").html(_0x57ca2f.html);
//                 if (continueReading && continueReading.reading_id === parseInt(readingId)) {
//                     currentImageIndex = parseInt(continueReading.image_number);
//                 }
//                 if ('horizontal' === settings.readingMode) {
//                     if (0x0 < currentImageIndex) {
//                         _0x57ca2f = $($(".ds-image").get(currentImageIndex)).parent();
//                         currentImageIndex = $(".ds-image").index(_0x57ca2f.find(".ds-image").first());
//                     }
//                     if ((totalImage = $('.ds-image').length) <= currentImageIndex) {
//                         currentImageIndex = totalImage - settings.hozPageSize;
//                     }
//                     $(".hoz-total-image").text(totalImage);
//                     $(".hoz-controls").hide();
//                     $(".hoz-controls-" + settings.readingDirection).show();
//                     (0x1 === settings.hozPageSize ? $(".nf-single") : $(".nf-double")).addClass("active");
//                     if (0x0 < (hozElImageNext = $(".reading-item.active").prev()).length) {
//                         $("#hoz-btn-next").addClass(settings.readingDirection);
//                         if (0x1 < (_0x536728 = hozElImageNext.find(".name").text().split(':')).length) {
//                             $("#text-next").html(_0x536728[0x0] + "<div class=\"name-chapt\">" + _0x536728[0x1] + "</div>");
//                         } else {
//                             $("#text-next").html(_0x536728[0x0]);
//                         }
//                     } else {
//                         $("#hoz-btn-next").hide();
//                         $("#content-end").show();
//                         $('#content-next').hide();
//                     }
//                     if ($('body').hasClass("page-reader-ver")) {
//                         $("body").removeClass("page-reader-ver");
//                     }
//                     var _0x536728 = window?.innerHeight;
//                     document.getElementById("main-wrapper").style.height = _0x536728 + 'px';
//                     hozShowImage();
//                 } else {
//                     if ((totalImage = $(".iv-card").length) <= currentImageIndex) {
//                         currentImageIndex = totalImage - 0x1;
//                     }
//                     if (0x1 === $(".reading-list.active .reading-item").length) {
//                         $(".mrt-bottom").hide();
//                     }
//                     if ($('.reading-item.active').is(":last-child")) {
//                         $('#ver-prev-cv').hide();
//                     }
//                     if ($(".reading-item.active").is(":first-child")) {
//                         $('#ver-next-cv').hide();
//                     }
//                     if (0x1 === parseInt($(".reading-item.active").data("reading-mode"))) {
//                         $(".container-reader-chapter").addClass('no-margin');
//                     }
//                     if (!$("body").hasClass('page-reader-ver')) {
//                         $("body").addClass("page-reader-ver");
//                     }
//                     verShowImage();
//                     const _0x542696 = setInterval(function () {
//                         var _0x4c7447 = $("#main-wrapper .iv-card").eq(currentImageIndex);
//                         if (_0x4c7447) {
//                             if (0x0 < _0x4c7447.find(".image-vertical").length) {
//                                 clearInterval(_0x542696);
//                                 $(window).scrollTo("#main-wrapper .iv-card:eq(" + currentImageIndex + ')');
//                                 setTimeout(function () {
//                                     window?.addEventListener('scroll', handleVerticalScroll);
//                                 }, 0x3e8);
//                             }
//                         } else {
//                             clearInterval(_0x542696);
//                             window?.addEventListener("scroll", handleVerticalScroll);
//                         }
//                     }, 0xc8);
//                 }
//                 voteInfo();
//             }
//         });
//     }
// }
getChaptersOrVolumes();
const isInViewport = _0xeedbeb => {
    var _0x392d64 = window?.innerHeight;
    var _0x392d64 = _0xeedbeb.getBoundingClientRect().top / _0x392d64;
    return 0x0 <= _0x392d64 && _0x392d64 <= 0x1;
};
// const md = new MobileDetect(window?.navigator.userAgent);
function createImageElement(_0x4bd981, _0x2c9ca0, _0x2a3582) {
    var _0x25da4e;
    if (_0x4bd981.classList.contains("shuffled")) {
        imgReverser(_0x2c9ca0).then(_0x2e2107 => {
            var _0x214eb0;
            if (_0x2e2107) {
                if (false) {
                    (_0x214eb0 = document.createElement("img")).classList.add(_0x2a3582);
                    _0x2e2107.toBlob(function (_0x2815ff) {
                        _0x214eb0.src = URL.createObjectURL(_0x2815ff);
                        _0x4bd981.appendChild(_0x214eb0);
                    }, "image/jpeg");
                } else {
                    _0x2e2107.classList.add(_0x2a3582);
                    _0x4bd981.appendChild(_0x2e2107);
                }
            }
        });
    } else {
        (_0x25da4e = document.createElement("img")).classList.add(_0x2a3582);
        _0x25da4e.src = _0x2c9ca0;
        _0x4bd981.appendChild(_0x25da4e);
    }
}
// function logReading() {
//     const _0x269d01 = $(".reading-item.active");
//     const _0x44c731 = _0x269d01.data('id');
//     const _0x580477 = _0x269d01.data("number");
//     const _0x34a8c3 = "chap" === readingBy ? 0x1 : 0x2;
//     var _0x29db2d;
//     var _0x52509d;
//     if (oldImageIndex !== currentImageIndex) {
//         continueReading = {
//             'manga_id': mangaId,
//             'reading_id': _0x44c731,
//             'reading_number': _0x580477,
//             'type': _0x34a8c3,
//             'lang_code': langCode,
//             'image_number': currentImageIndex,
//             'updated_at': Date.now()
//         };
//         oldImageIndex = currentImageIndex;
//         if (isLoggedIn) {
//             $.post("/ajax/user/log-reading", continueReading, function (_0x4e38de) { });
//         }
//         if (_0x52509d = localStorage.getItem('mr_reading_' + mangaId)) {
//             if (0x0 < (_0x52509d = JSON.parse(_0x52509d)).length) {
//                 if (0x0 <= (_0x29db2d = _0x52509d.findIndex(_0x114ea3 => _0x114ea3.type === _0x34a8c3))) {
//                     _0x52509d[_0x29db2d] = continueReading;
//                 } else {
//                     _0x52509d.push(continueReading);
//                 }
//             }
//         } else {
//             _0x52509d = [continueReading];
//         }
//         localStorage.setItem("mr_reading_" + mangaId, JSON.stringify(_0x52509d));
//     }
// }
// setInterval(logReading, 0x1388);
var cmSort = "newest";
var commentLoading = false;
var cid = null;
// $(".hr-comment").click(function () {
//     getCommentWidget();
// });
// if (currentUrl.search) {
//     const h1 = new URLSearchParams(currentUrl.search);
//     cid = h1.get("c_id");
//     // $('body').addClass("show-comment");
//     getCommentWidget();
// }
// function getReplies(_0x229c1d, _0x434d20 = null) {
//     $.get("/ajax/comment/replies/" + _0x229c1d, function (_0x1d1856) {
//         $('#replies-' + _0x229c1d).html(_0x1d1856.html);
//         $("#replies-" + _0x229c1d).slideToggle(0xc8);
//         if (_0x434d20) {
//             $("#cm-" + _0x229c1d + " .cm-btn-show-rep").addClass("active");
//             $('#cm-' + _0x434d20).addClass("comment-focus");
//             $(".comments-wrap").scrollTo($("#cm-" + _0x434d20).prev(), {
//                 'duration': 0x12c
//             });
//         }
//     });
// }
function getCommentWidget() {
    var _0xb94eee = "/ajax/comment/widget/" + mangaId + "?sort=" + cmSort;
    if (cid) {
        _0xb94eee += "&cid=" + cid;
    }
    // $.get(_0xb94eee, function (_0x32499a) {
    //     commentLoading = false;
    //     $("#content-comments").html(_0x32499a.html);
    //     if (_0x32499a.gotoId) {
    //         const _0x2076bc = $("#cm-" + _0x32499a.gotoId);
    //         if (0x0 < _0x2076bc.length) {
    //             _0x2076bc.addClass("comment-focus");
    //         } else {
    //             getReplies(_0x32499a.cParentId, _0x32499a.gotoId);
    //         }
    //     }
    // });
}
// $(document).on("click", "#cm-view-more", function () {
//     if (!commentLoading) {
//         commentLoading = true;
//         const _0x4db365 = $(this);
//         var _0x1ce77e = $(this).data("page");
//         $.get('/ajax/comment/list/' + mangaId + '?page=' + _0x1ce77e + "&sort=" + cmSort, function (_0x4b45d0) {
//             commentLoading = false;
//             if (_0x4b45d0 && _0x4b45d0.status) {
//                 if (0x0 < _0x4b45d0.nextPage) {
//                     _0x4db365.data("page", _0x4b45d0.nextPage);
//                 } else {
//                     _0x4db365.remove();
//                 }
//                 $(".cw_list").append(_0x4b45d0.html);
//             }
//         });
//     }
// });
// $(document).on("click", ".cm-sort", function () {
//     if (!commentLoading) {
//         commentLoading = true;
//         $('.cm-sort').removeClass("active");
//         $(".cm-sort .fa-check").hide();
//         $(this).addClass("active");
//         $(this).find(".fa-check").show();
//         cmSort = $(this).data("value");
//         getCommentWidget();
//     }
// });
// $(document).on('click', '.cm-action', function () {
//     const _0x2b921e = $(this).data("action");
//     const _0x3b1128 = $(this).data('id');
//     $.post("/ajax/comment/update", {
//         'id': _0x3b1128,
//         'action': _0x2b921e
//     }, function (_0x4e4bba) {
//         $('#cm-' + _0x3b1128).remove();
//         toastr.success(_0x4e4bba.msg, '', {
//             'timeOut': 0x1388
//         });
//     });
// });
// $(document).on("click", ".mute-options", function (_0xbda5c3) {
//     _0xbda5c3.stopPropagation();
// });
// $(document).on('click', ".ac-mute", function () {
//     var _0x20a0da = $(this).data("hours");
//     var _0x5a54df = $(this).parent().data("user-id");
//     $.post('/ajax/user/mute', {
//         'user_id': _0x5a54df,
//         'hours': _0x20a0da
//     }, function (_0xb0421d) {
//         toastr.success(_0xb0421d.msg, '', {
//             'timeOut': 0x1388
//         });
//     });
// });
// $(document).on("click", '.ac-block', function () {
//     var _0x59384e = $(this).data('user-id');
//     $.post("/ajax/user/block", {
//         'user_id': _0x59384e
//     }, function (_0x171086) {
//         toastr.success(_0x171086.msg, '', {
//             'timeOut': 0x1388
//         });
//     });
// });
// $(document).on("click", '.btn-spoil', function () {
//     $(this).toggleClass("active");
// });
// $(document).on("click", ".cm-btn-show-rep", function () {
//     var _0x3a19df = $(this).data('id');
//     $(this).toggleClass("active");
//     if ($(this).hasClass('active')) {
//         getReplies(_0x3a19df);
//     } else {
//         $("#replies-" + _0x3a19df).slideToggle(0xc8);
//     }
// });
// $(document).on("click", ".show-spoil", function () {
//     $(this).hide();
//     $(this).parent().removeClass('is-spoil');
// });
// $(document).on("click", ".ib-reply,.btn-close-reply", function () {
//     if (checkLogin()) {
//         $("#reply-" + $(this).data('id')).slideToggle(0x64);
//         $('#reply-' + $(this).data('id')).find(".comment-subject").focus();
//     }
// });
// $(document).on("focus", '#df-cm-content', function () {
//     if (checkLogin()) {
//         $("#df-cm-buttons").slideDown(0x64);
//     }
// });
// $(document).on("click", "#df-cm-close", function () {
//     $("#df-cm-buttons").slideUp(0x64);
// });
// $(document).on('click', ".cm-btn-vote", function () {
//     if (checkLogin() && !commentLoading) {
//         commentLoading = true;
//         const _0x17b6a4 = $(this);
//         var _0x18d986 = parseInt(_0x17b6a4.data('type'));
//         var _0x22cbfb = _0x17b6a4.data('id');
//         const _0x482d8c = $(".cm-btn-vote[data-id=" + _0x22cbfb + "].active");
//         if (0x0 < _0x482d8c.length && parseInt(_0x482d8c.data("type")) !== _0x18d986) {
//             _0x482d8c.removeClass("active");
//             if (0x0 < (_0x24f7d2 = parseInt(_0x482d8c.find('.value').text()))) {
//                 _0x24f7d2 -= 0x1;
//                 _0x482d8c.find(".value").text(0x0 < _0x24f7d2 ? _0x24f7d2 : '');
//             }
//         }
//         _0x17b6a4.toggleClass("active");
//         var _0x24f7d2 = 0x0 < (_0x24f7d2 = parseInt(_0x17b6a4.find(".value").text())) ? _0x17b6a4.hasClass("active") ? _0x24f7d2 + 0x1 : _0x24f7d2 - 0x1 : 0x1;
//         _0x17b6a4.find(".value").text(0x0 < _0x24f7d2 ? _0x24f7d2 : '');
//         $.post("/ajax/comment/vote", {
//             'id': _0x22cbfb,
//             'type': _0x18d986
//         }, function (_0x385337) {
//             commentLoading = false;
//         });
//     }
// });
// $(document).on("submit", ".comment-form", function (_0x2d7e2c) {
//     _0x2d7e2c.preventDefault();
//     if (!commentLoading) {
//         commentLoading = true;
//         const _0x54d096 = $(this);
//         const _0x4dda65 = $(this).find(".loading-absolute");
//         _0x4dda65.show();
//         var _0xaf4d3d = $(this).serializeArray();
//         _0xaf4d3d.push({
//             'name': "manga_id",
//             'value': mangaId
//         });
//         _0xaf4d3d.push({
//             'name': "is_spoil",
//             'value': $('.btn-spoil').hasClass("active") ? 0x1 : 0x0
//         });
//         grecaptcha.execute(recaptchaV3SiteKey, {
//             'action': 'add_comment'
//         }).then(function (_0x345568) {
//             _0xaf4d3d.push({
//                 'name': "_token",
//                 'value': _0x345568
//             });
//             $.post("/ajax/comment/add", _0xaf4d3d, function (_0x1c8b72) {
//                 commentLoading = false;
//                 _0x4dda65.hide();
//                 if (_0x1c8b72 && _0x1c8b72.status) {
//                     if (0x0 < parseInt(_0x1c8b72.parentId)) {
//                         $("#block-reply-" + _0x1c8b72.parentId).html(_0x1c8b72.html);
//                         $("#cm-" + _0x1c8b72.parentId + " .cm-btn-show-rep").addClass("active");
//                         $("#replies-" + _0x1c8b72.parentId).slideToggle(0x64);
//                         $('#reply-' + _0x1c8b72.parentId).slideToggle(0x64);
//                     } else {
//                         $("#df-cm-buttons").slideUp(0x64);
//                         $(".cw_list").html(_0x1c8b72.html);
//                     }
//                     _0x54d096[0x0].reset();
//                     _0x54d096.find(".btn-spoil").removeClass("active");
//                 } else {
//                     _0x54d096.find(".cm-error").text(_0x1c8b72.msg);
//                     _0x54d096.find('.cm-error').show();
//                     setTimeout(function () {
//                         _0x54d096.find('.cm-error').hide();
//                     }, 0x2710);
//                 }
//             });
//         });
//     }
// });