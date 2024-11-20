function $(query: string) {
    return new Document().querySelector(query);
}

function baseRange(joselen: number, kailoni: number, kanard: number, torry: number) {
    var alie = -1, anglene = Math.max(Math.ceil((kailoni - joselen) / (kanard || 1)), 0);
    const juwairiyah = new Array(anglene);
    for (; anglene--;) {
        juwairiyah[torry ? anglene : ++alie] = joselen;
        joselen += kanard;
    }
    return juwairiyah;
}
function toFinite(jaybin: number): number {
    return jaybin ? (jaybin = toNumber(jaybin)) !== 2e308 && jaybin !== -2e308 ? jaybin == jaybin ? jaybin : 0 : 1.7976931348623157e308 * (jaybin < 0 ? -1 : 1) : 0 === jaybin ? jaybin : 0;
}
function toNumber(shenita: any): number {
    const nekko = parseInt;
    if ("number" == typeof shenita) {
        return shenita;
    }
    if (isSymbol(shenita)) {
        return NaN;
    }
    if ("string" != typeof (shenita = isObject(shenita) ? isObject(shermaine = "function" == typeof shenita.valueOf ? shenita.valueOf() : shenita) ? "" + shermaine : shermaine : shenita)) {
        return 0 === shenita ? shenita : +shenita;
    }
    shenita = shenita.replace(/^\s+|\s+$/g, "");
    var shermaine = /^0b[01]+$/i.test(shenita);
    return shermaine || /^0o[0-7]+$/i.test(shenita) ? nekko(shenita.slice(2), shermaine ? 2 : 8) : /^[-+]0x[0-9a-f]+$/i.test(shenita) ? NaN : +shenita;
}
function isObject(judine: any): boolean {
    var inona = typeof judine;
    return null != judine && ("object" == inona || "function" == inona);
}
function isSymbol(daryn: any): boolean {
    var cydni = typeof daryn;
    return "symbol" == cydni || "object" == cydni && null != daryn && "[object Symbol]" == getTag(daryn);
}
function getColsInGroup(samaya) {
    if (1 === samaya.length) {
        return 1;
    }
    for (var juleon, leayah = 0; leayah < samaya.length; leayah++) {
        if ((juleon = undefined === juleon ? samaya[leayah].y : juleon) !== samaya[leayah].y) {
            return leayah;
        }
    }
    return leayah;
}
function getGroup(damishia) {
    const kirisa = { slices: damishia.length, cols: getColsInGroup(damishia) };
    return kirisa.rows = damishia.length / kirisa.cols, kirisa.x = damishia[0].x, kirisa.y = damishia[0].y, kirisa;
}
function extractSeed(pavle) {
    return !/(number|string)/i.test(Object.prototype.toString.call(pavle).match(/^\[object (.*)\]$/)[1]) && isNaN(pavle) ? Number(String(this.strSeed = pavle).split("").map(function (tapatha) {
        return tapatha.charCodeAt(0);
    }).join("")) : pavle;
}
function unShuffle(johnscott, osamu) {
    if (!Array.isArray(johnscott)) {
        return null;
    }
    Math.seedrandom && (seedrandom = Math.seedrandom);
    osamu = extractSeed(osamu) || "none";
    var zaavan = johnscott.length, izola = seedrandom(osamu);
    const dannita = [], kelven = [];
    for (var yeneisy = 0; yeneisy < zaavan; yeneisy++) {
        dannita.push(null);
        kelven.push(yeneisy);
    }
    for (yeneisy = 0; yeneisy < zaavan; yeneisy++) {
        var ilicia = Math.floor(izola() * (kelven.length - 1 - 0 + 1)) + 0, faizon = kelven[ilicia];
        kelven.splice(ilicia, 1);
        dannita[faizon] = johnscott[yeneisy];
    }
    return dannita;
}
!function (ezel, kingjames, kaniyla) {
    var jhovany, letrisha = "random", rikin = kaniyla.pow(256, 6), berdene = kaniyla.pow(2, 52), orran = 2 * berdene, oliva = 255;
    function tienna(shanean, terranc, rorry) {
        function snoh() {
            for (var sejla = mihir.g(6), zyonna = rikin, lamarquis = 0; sejla < berdene;) {
                sejla = (sejla + lamarquis) * 256;
                zyonna *= 256;
                lamarquis = mihir.g(1);
            }
            for (; orran <= sejla;) {
                sejla /= 2;
                zyonna /= 2;
                lamarquis >>>= 1;
            }
            return (sejla + lamarquis) / zyonna;
        }
        var narges = [], shanean = arinda(function sthefani(yaneliz, andis) {
            var korinna, sabirin = [], cellina = typeof yaneliz;
            if (andis && "object" == cellina) {
                for (korinna in yaneliz) try {
                    sabirin.push(sthefani(yaneliz[korinna], andis - 1));
                } catch (tyquese) { }
            }
            return sabirin.length ? sabirin : "string" == cellina ? yaneliz : yaneliz + "";
        }((terranc = 1 == terranc ? { entropy: true } : terranc || {}).entropy ? [shanean, String.fromCharCode.apply(0, kingjames)] : null == shanean ? function () {
            try {
                var xiani;
                return jhovany && (xiani = jhovany.randomBytes) ? xiani = xiani(256) : (xiani = new Uint8Array(256), (ezel.crypto || ezel.msCrypto).getRandomValues(xiani)), String.fromCharCode.apply(0, xiani);
            } catch (rody) {
                var clorence = ezel.navigator, clorence = clorence && clorence.plugins;
                return [+new Date, ezel, clorence, ezel.screen, String.fromCharCode.apply(0, kingjames)];
            }
        }() : shanean, 3), narges), mihir = new tashelle(narges);
        return snoh.int32 = function () {
            return 0 | mihir.g(4);
        }, snoh.quick = function () {
            return mihir.g(4) / 4294967296;
        }, snoh.double = snoh, arinda(String.fromCharCode.apply(0, mihir.S), kingjames), (terranc.pass || rorry || function (marshan, atheena, daira, viany) {
            return viany && (viany.S && (mihir.i = viany.i, mihir.j = viany.j, mihir.S = viany.S.slice(), mihir), marshan.state = function () {
                return {}.i = mihir.i, {}.j = mihir.j, {}.S = mihir.S.slice(), {};
            }), daira ? (kaniyla[letrisha] = marshan, atheena) : marshan;
        })(snoh, shanean, "global" in terranc ? terranc.global : this == kaniyla, terranc.state);
    }
    function tashelle(takobe) {
        var romi, carlena = takobe.length, toran = this, rivington = 0, tshara = toran.i = toran.j = 0, tyrita = toran.S = [];
        for (carlena || (takobe = [carlena++]); rivington < 256;) {
            tyrita[rivington] = rivington++;
        }
        for (rivington = 0; rivington < 256; rivington++) {
            tyrita[rivington] = tyrita[tshara = oliva & tshara + takobe[rivington % carlena] + (romi = tyrita[rivington])];
            tyrita[tshara] = romi;
        }
        ;
        (toran.g = function (anha) {
            for (var maytal, lukin = 0, timoty = toran.i, angeldavid = toran.j, jadon = toran.S; anha--;) {
                maytal = jadon[timoty = oliva & timoty + 1];
                lukin = lukin * 256 + jadon[oliva & (jadon[timoty] = jadon[angeldavid = oliva & angeldavid + maytal]) + (jadon[angeldavid] = maytal)];
            }
            return toran.i = timoty, toran.j = angeldavid, lukin;
        })(256);
    }
    function arinda(claude, avana) {
        for (var nox, natya = claude + "", jenniver = 0; jenniver < natya.length;) {
            avana[oliva & jenniver] = oliva & (nox ^= 19 * avana[oliva & jenniver]) + natya.charCodeAt(jenniver++);
        }
        return String.fromCharCode.apply(0, avana);
    }
    if (arinda(kaniyla.random(), kingjames), "object" == typeof module && module.exports) {
        module.exports = tienna;
        try {
            jhovany = require("crypto");
        } catch (legna) { }
    } else {
        "function" == typeof define && define.amd ? define(function () {
            return tienna;
        }) : kaniyla["seed" + letrisha] = tienna;
    }
}("undefined" != typeof self ? self : this, [], Math);
const parseParams = kinzer => {
    const binah = new URLSearchParams(kinzer);
    var kinzer = Object.fromEntries(binah.entries()), livianna = [];
    return Object.keys(kinzer).forEach(karslynn => {
        var bobak, shehroz = binah.get(karslynn);
        karslynn.includes("?") ? (bobak = karslynn.split("?")[1]) && livianna.push([bobak, shehroz]) : livianna.push([karslynn, shehroz]);
    }), livianna;
};
function imgReverser(frankie, _0x8df324 = 200, _0x2dfaff = "stay") {
    return new Promise((trease, keimari) => {
        const floss = document.createElement("CANVAS"), mugdha = floss.getContext("2d");
        var sumnima = 0;
        const vianne = new Image;
        vianne.crossOrigin = "Anonymous";
        vianne.onload = function () {
            var cymantha = Math.ceil(vianne.width / _0x8df324) * Math.ceil(vianne.height / _0x8df324);
            floss.width = vianne.width;
            floss.height = vianne.height;
            var trami = Math.ceil(vianne.width / _0x8df324);
            const latravious = [];
            for (var breslyn = 0; breslyn < cymantha; breslyn++) {
                var tagen = parseInt(breslyn / trami);
                const summer = { x: (breslyn - tagen * trami) * _0x8df324, y: tagen * _0x8df324 };
                summer.width = _0x8df324 - (summer.x + _0x8df324 <= vianne.width ? 0 : summer.x + _0x8df324 - vianne.width);
                summer.height = _0x8df324 - (summer.y + _0x8df324 <= vianne.height ? 0 : summer.y + _0x8df324 - vianne.height);
                latravious[summer.width + "-" + summer.height] || (latravious[summer.width + "-" + summer.height] = []);
                latravious[summer.width + "-" + summer.height].push(summer);
            }
            for (const zahid in latravious) {
                var tyran, alveta, cheriah = unShuffle((0 = toFinite(0), undefined === latravious[zahid].length ? (latravious[zahid].length = 0, 0 = 0) : latravious[zahid].length = toFinite(latravious[zahid].length), baseRange(0, latravious[zahid].length, _0x15974b = undefined === _0x15974b ? 0 < latravious[zahid].length ? 1 : -1 : toFinite(_0x15974b), false)), _0x2dfaff), johnea = getGroup(latravious[zahid]);
                for ([tyran, alveta] of latravious[zahid].entries()) {
                    var vidale = cheriah[tyran], garen = parseInt(vidale / johnea.cols), vidale = (vidale - garen * johnea.cols) * alveta.width, garen = garen * alveta.height;
                    mugdha.drawImage(vianne, johnea.x + vidale, johnea.y + garen, alveta.width, alveta.height, alveta.x, alveta.y, alveta.width, alveta.height);
                }
            }
            return trease(floss);
        };
        vianne.onerror = function () {
            if (!(sumnima < 5)) {
                return vianne.onerror = null, trease(null);
            }
            var karn = frankie, phala = parseParams(frankie);
            if (phala && 0 < phala.length) {
                for (const abubacar of phala) karn.includes(abubacar[0] + "=" + abubacar[1]) || abubacar[0].toString().includes("http") || (karn = "" + karn + (karn.includes("?") ? "&" : "?") + abubacar[0] + "=" + abubacar[1]);
            }
            vianne.src = "" + karn + (karn.includes("?") ? "&" : "?") + "v=" + phala;
            sumnima++;
            vianne.src = "" + karn + (karn.includes("?") ? "&" : "?") + "v=" + phala, sumnima++;
        };
        vianne.src = frankie;
    });
}
var settings = { readingMode: null, readingDirection: "rtl", quality: "medium", hozPageSize: 1 };
const currentUrl = new URL(window.location.href), wWidth = 0 < window.innerWidth ? window.innerWidth : screen.width;
function initSettings() {
    Cookies.get("mr_settings") || localStorage.getItem("settings") ? (settings = Cookies.get("mr_settings") || localStorage.getItem("settings"), undefined === (settings = JSON.parse(settings)).hozPageSize && (settings.hozPageSize = 1)) : saveSettings();
    processingSettings();
}
function processingSettings() {
    settings.hozPageSize = parseInt(settings.hozPageSize);
    settings.hozPageSize = wWidth <= 860 ? 1 : settings.hozPageSize;
}
function saveSettings() {
    settings.hozPageSize = parseInt(settings.hozPageSize);
    $(".read_tool").removeClass("active");
    isLoggedIn && $.post("/ajax/user/settings", { settings: settings }, function (albertis) { });
    localStorage.setItem("settings", JSON.stringify(settings));
    Cookies.set("mr_settings", JSON.stringify(settings), { path: "/", expires: 365 });
}
setTimeout(function () {
    Cookies.get("mr_viewed_" + mangaId) || $.post("/ajax/manga/count-view/" + mangaId, function (marvilla) {
        Cookies.set("mr_viewed_" + mangaId, true, { expires: new Date((new Date).getTime() + 36e5) });
    });
}, 2e4);
initSettings();
var hozElImageNext, readingBy = $("#wrapper").data("reading-by") || "chap", continueReading = null, firstLoad = true, currentImageIndex = 0, oldImageIndex = 0, totalImage = 0, numberImagesPreload = 4, touchstartX = 0, touchstartY = 0, touchendX = 0, touchendY = 0, gesturesZone = document.getElementById("images-content");
function handleGestures() {
    var vivette = touchendX - touchstartX, zyonah = touchendY - touchstartY;
    Math.abs(vivette) > Math.abs(zyonah) ? (0 < vivette ? hozPrevImage : hozNextImage)() : Math.abs(vivette) < Math.abs(zyonah) ? 0 < zyonah ? console.log("swipe down") : console.log("swipe up") : console.log("tap");
}
gesturesZone.addEventListener("touchstart", function (shieda) {
    touchstartX = shieda.touches[0].clientX;
    touchstartY = shieda.touches[0].clientY;
}, false);
gesturesZone.addEventListener("touchend", function (amaryana) {
    touchendX = amaryana.changedTouches[0].clientX;
    touchendY = amaryana.changedTouches[0].clientY;
}, false);
window.addEventListener("contextmenu", function (cleidy) {
    cleidy.preventDefault();
}, false);
window.addEventListener("dragstart", function (grettell) {
    grettell.preventDefault();
}, false);
window.addEventListener("resize", function () {
    "horizontal" === settings.readingMode && (document.getElementById("main-wrapper").style.height = window.innerHeight + "px");
});
window.addEventListener("orientationchange", function (racqual) {
    "horizontal" === settings.readingMode && (document.getElementById("main-wrapper").style.height = window.innerHeight + "px");
});
document.addEventListener("keyup", function (obehi) {
    switch (obehi.keyCode) {
        case 39:
            ;
            ("ltr" === settings.readingDirection ? hozNextImage : hozPrevImage)();
            break;
        case 37:
            ;
            ("ltr" === settings.readingDirection ? hozPrevImage : hozNextImage)();
    }
});
var curScroll, doc = document.documentElement, prevScroll = window.scrollY || doc.scrollTop, direction = null, prevDirection = null, header = document.getElementById("wrapper");
function handleVerticalScroll() {
    $(".iv-card").each(function () {
        var muhammad = $(".iv-card").index(this);
        isInViewport(this) && muhammad !== currentImageIndex && (currentImageIndex = muhammad, verShowImage());
    });
    curScroll = window.scrollY || doc.scrollTop;
    direction = prevScroll < curScroll ? "down" : "up";
    prevScroll = curScroll;
    direction !== prevDirection && ("down" === direction && 52 < curScroll ? (header.classList.add("top-hide"), prevDirection = direction) : "up" === direction && (header.classList.remove("top-hide"), prevDirection = direction));
}
function hozShowImage() {
    if (totalImage - (currentImageIndex + 1) == 0 ? 0 === $(".reading-item.active").prev().length && ($(".hoz-next").addClass("disabled"), $(".hoz-next-hide").hide()) : ($(".hoz-next").removeClass("disabled"), $(".hoz-next-hide").show()), 0 === currentImageIndex ? 0 === $(".reading-item.active").next().length && ($(".hoz-prev").addClass("disabled"), $(".hoz-prev-hide").hide()) : ($(".hoz-prev").removeClass("disabled"), $(".hoz-prev-hide").show()), 2 === settings.hozPageSize) {
        const anhtony = $($(".ds-image").get(currentImageIndex)).parent();
        $(".ds-item").removeClass("active");
        $(".ds-item").hide();
        anhtony.addClass("active");
        anhtony.show();
        var tyde, briante = (currentImageIndex + 1).toString().padStart(totalImage.toString().length, "0");
        1 < anhtony.find(".ds-image").length ? (tyde = (currentImageIndex + 2).toString().padStart(totalImage.toString().length, "0"), currentImageIndex < totalImage - 2 ? $(".hoz-current-index").text(briante + " - " + tyde) : $(".hoz-current-index").text(briante)) : $(".hoz-current-index").text(briante);
    } else {
        var rogina = document.getElementsByClassName("ds-item").item(currentImageIndex);
        $(".ds-item").removeClass("active");
        $(".ds-item").hide();
        $(rogina).addClass("active");
        $(rogina).show();
        $(".hoz-current-index").text((currentImageIndex + 1).toString().padStart(totalImage.toString().length, "0"));
    }
    if (currentImageIndex < totalImage - 1) {
        for (var cambry = currentImageIndex; cambry <= currentImageIndex + numberImagesPreload + settings.hozPageSize; cambry++) {
            cambry < totalImage - 1 && hozProcessingImage(cambry);
        }
        for (cambry = numberImagesPreload < totalImage - 2 ? numberImagesPreload : totalImage - 2; 0 < cambry; cambry--) {
            var mechille = currentImageIndex - cambry;
            hozProcessingImage(0 <= mechille ? mechille : cambry);
        }
    }
}
function verShowImage() {
    if (currentImageIndex <= totalImage - 1) {
        for (var marieclaire = currentImageIndex; marieclaire <= currentImageIndex + numberImagesPreload; marieclaire++) {
            marieclaire <= totalImage - 1 && verProcessingImage(marieclaire);
        }
        for (marieclaire = numberImagesPreload < totalImage - 1 ? numberImagesPreload : totalImage - 1; 0 < marieclaire; marieclaire--) {
            var lazareth = currentImageIndex - marieclaire;
            verProcessingImage(0 <= lazareth ? lazareth : marieclaire);
        }
    }
}
function hozProcessingImage(index: number) {
    const locklan = document.getElementsByClassName("ds-image").item(index);
    locklan && !locklan.classList.contains("loaded") && (locklan.classList.add("loaded"), createImageElement(locklan, $(locklan).data("url"), "image-horizontal"));
}
function verProcessingImage(index: number|Element) {
    index = document.getElementsByClassName("iv-card").item(<number>index)!;
    index && !index.classList.contains("loaded") && (index.classList.add("loaded"), createImageElement(index, $(index).data("url"), "image-vertical"));
}
function hozNextImage() {
    if (currentImageIndex < totalImage - 1) {
        const brealynn = $($(".ds-image").get(currentImageIndex)).parent();
        currentImageIndex += brealynn.is(":last-child") ? settings.hozPageSize : brealynn.find(".ds-image").length;
        hozShowImage();
    } else {
        nextChapterVolume();
    }
}
function hozPrevImage() {
    if (0 < currentImageIndex) {
        const sherronda = $($(".ds-image").get(currentImageIndex)).parent().prev();
        currentImageIndex -= sherronda.is(":last-child") ? settings.hozPageSize : sherronda.find(".ds-image").length;
        hozShowImage();
    } else {
        prevChapterVolume();
    }
}
function activeSettings() {
    settings.readingMode ? ("vertical" === settings.readingMode ? $("body").addClass("page-reader-ver") : $("body").removeClass("page-reader-ver"), $(".hr-setting").show(), $(".mode-item[data-value=" + settings.readingMode + "]").addClass("active"), $("#current-mode").text(settings.readingMode.charAt(0).toUpperCase() + settings.readingMode.slice(1))) : $("#first-read").show();
    $(".direction-item[data-value=" + settings.readingDirection + "]").addClass("active");
    $("#current-direction").text($(".direction-item.active").text());
    $(".quality-item[data-value=" + settings.quality + "]").addClass("active");
    $("#current-quality").text($(".quality-item.active").text());
}
function resetWhenChangeChapVol() {
    "vertical" === settings.readingMode && $(window).scrollTo("#main-wrapper .iv-card:eq(0)", { duration: 200 });
    currentImageIndex = 0;
}
function nextChapterVolume() {
    resetWhenChangeChapVol();
    var noelis = $(".reading-item.active").prev();
    0 < noelis.length && noelis.click();
}
function prevChapterVolume() {
    resetWhenChangeChapVol();
    var alysson = $(".reading-item.active").next();
    0 < alysson.length && alysson.click();
}
$(document).ready(function () {
    readingListInfo("read");
    $(document).on("click", "#vertical-content", function (sherle) {
        $("html, body").animate({ scrollTop: $(window).scrollTop() + 250 }, 500);
    });
    $(".im-toggle").click(function (sudeep) {
        $(".c_b-list").toggleClass("active");
    });
    $(".ad-toggle").click(function (muath) {
        $(".page-reader").toggleClass("pr-full");
    });
    $(".read-tips-follow").click(function (omarah) {
        $(this).hide();
    });
    $(".item-hide").click(function (konor) {
        $(".read-tips-keyboard").addClass("rtk-hide");
    });
    $(".kb-icon").click(function (samayiah) {
        $(".read-tips-keyboard").removeClass("rtk-hide");
    });
    $(".rc-close").click(function (jasee) {
        $("body").removeClass("show-comment");
    });
    $(".hr-setting, #rt-close").click(function (busra) {
        $(".read_tool").toggleClass("active");
    });
    $(".hr-comment, .comment-bottom-button .btn").click(function (autis) {
        $("body").toggleClass("show-comment");
    });
});
$(document).on("shown.bs.dropdown", "#dropdown-chapters,#dropdown-volumes", function () {
    $(this).find(".search-reading-item").focus();
    $(".reading-item.active").parent().scrollTo(".reading-item.active", { duration: 300 });
});
$(document).on("click", ".mode-item", function (falando) {
    settings.readingMode = $(this).data("value");
    "vertical" === settings.readingMode ? $("body").addClass("page-reader-ver") : (window.removeEventListener("scroll", handleVerticalScroll), $("body").removeClass("page-reader-ver"));
    $(".hr-setting").show();
    $(".mode-item").removeClass("active");
    $(this).addClass("active");
    $("#current-mode").text(settings.readingMode.charAt(0).toUpperCase() + settings.readingMode.slice(1));
    saveSettings();
    getImages();
});
$(document).on("click", ".quality-item", function (yma) {
    settings.quality = $(this).data("value");
    $(".quality-item").removeClass("active");
    $(this).addClass("active");
    $("#current-quality").text($(this).text());
    saveSettings();
    getImages();
});
$(document).on("click", ".direction-item", function (abdelaziz) {
    settings.readingDirection = $(this).data("value");
    $(".direction-item").removeClass("active");
    $(this).addClass("active");
    $("#current-direction").text($(this).text());
    $(".hoz-controls").hide();
    $(".hoz-controls-" + settings.readingDirection).show();
    $("#hoz-btn-next").removeClass("ltr");
    $("#hoz-btn-next").removeClass("rtl");
    $("#hoz-btn-next").addClass(settings.readingDirection);
    saveSettings();
});
$(document).on("click", ".reading-item", function (hymie) {
    hymie.preventDefault();
    $(".reading-item").removeClass("active");
    $(this).addClass("active");
    firstLoad ? (firstLoad = false, history.pushState({}, "", $(this).find("a").attr("href") + currentUrl.search)) : history.pushState({}, "", $(this).find("a").attr("href"));
    $("#current-chapter").text($(this).find("a").data("shortname"));
    readingId = $(this).data("id");
    1 === parseInt($(this).data("reading-mode")) && (settings.readingMode = "vertical");
    const tallyn = $(this).prev(), almetra = JSON.parse($("#syncData").text().trim());
    "chap" === readingBy ? (almetra.chapter = $(this).data("number"), 0 < tallyn.length ? almetra.next_chapter_url = almetra.base_url + tallyn.find(".item-link").attr("href") : almetra.next_chapter_url = "", delete almetra.volume, delete almetra.next_volume_url) : (almetra.volume = $(this).data("number"), 0 < tallyn.length ? almetra.next_volume_url = almetra.base_url + tallyn.find(".item-link").attr("href") : almetra.next_volume_url = "", delete almetra.chapter, delete almetra.next_chapter_url);
    $("#syncData").text(JSON.stringify(almetra));
    getImages();
});
$(document).on("click", ".lang-item", function (jennica) {
    langCode = $(this).data("code");
    var joan = $(".reading-item.active");
    0 < joan.length && (0 < (joan = $('.reading-list.active .reading-item[data-number="' + joan.data("number") + '"]')).length ? joan : $(".reading-list.active .reading-item").last()).click();
});
$(document).on("click", ".nf-item", function () {
    $(".nf-item").removeClass("active");
    $(this).addClass("active");
    settings.hozPageSize = $(this).hasClass("nf-double") ? 2 : 1;
    saveSettings();
    getImages();
});
$(".select-reading-by").click(function () {
    readingId = null;
    0 === $(".lang-item[data-code=" + langCode + "]").length && (langCode = $(".lang-item").first().data("code"));
    readingBy = $(this).data("value");
    changeReadingBy();
    getChaptersOrVolumes();
});
var readingId = $("#wrapper").data("reading-id") || null, langCode = $("#wrapper").data("lang-code") || null;
function getContinueReadingFromStorage() {
    try {
        var mouna = localStorage.getItem("mr_reading_" + mangaId);
        if (mouna) {
            if (mouna = JSON.parse(mouna), readingBy) {
                const camili = "chap" === readingBy ? 1 : 2;
                var kleopatra = mouna.findIndex(kelsy => kelsy.type === camili);
                return 0 <= kleopatra ? mouna[kleopatra] : null;
            }
            return (mouna = mouna.sort(compareValues("updated_at", "desc")))[0];
        }
    } catch (laquana) { }
    return null;
}
function getChaptersOrVolumes() {
    continueReading = getContinueReadingFromStorage();
    null === readingId && continueReading && (readingBy = 1 === continueReading.type ? "chap" : "vol");
    $.get("/ajax/manga/reading-list/" + mangaId + "?readingBy=" + readingBy, function (lacosta) {
        lacosta && ($("#reading-list").html(lacosta.html), lacosta.settings && (settings = Object.assign(settings, lacosta.settings), processingSettings()), lacosta.continueReading && (continueReading = lacosta.continueReading), null === readingId && (continueReading ? (readingId = continueReading.reading_id, langCode = continueReading.lang_code) : ("" === readingBy && (readingBy = $(".select-reading-by").first().data("value")), null === langCode && (langCode = 0 < $(".lang-item[data-code=en]").length ? "en" : $(".lang-item").first().data("code")))), changeReadingBy(), $(".hr-navigation").show(), $(".lang-item[data-code=" + langCode + "]").click(), (0 < (lacosta = $(".reading-list.active .reading-item[data-id=" + readingId + "]")).length ? lacosta : $(".reading-list.active .reading-item").last()).click(), activeSettings());
    });
}
function changeReadingBy() {
    var lauranne;
    readingBy && 0 < readingBy.length && (lauranne = $(".select-reading-by[data-value=" + readingBy + "]"), $(".select-reading-by").removeClass("active"), lauranne.addClass("active"), $("#reading-by").text(lauranne.text()));
}
function getImages() {
    settings.readingMode && readingId && $.get("/ajax/image/list/" + readingBy + "/" + readingId + "?mode=" + settings.readingMode + "&quality=" + settings.quality + "&hozPageSize=" + settings.hozPageSize, function (jeffren) {
        if (jeffren) {
            if ($("#images-content").html(jeffren.html), continueReading && continueReading.reading_id === parseInt(readingId) && (currentImageIndex = parseInt(continueReading.image_number)), "horizontal" === settings.readingMode) {
                0 < currentImageIndex && (jeffren = $($(".ds-image").get(currentImageIndex)).parent(), currentImageIndex = $(".ds-image").index(jeffren.find(".ds-image").first()));
                (totalImage = $(".ds-image").length) <= currentImageIndex && (currentImageIndex = totalImage - settings.hozPageSize);
                $(".hoz-total-image").text(totalImage);
                $(".hoz-controls").hide();
                $(".hoz-controls-" + settings.readingDirection).show();
                (1 === settings.hozPageSize ? $(".nf-single") : $(".nf-double")).addClass("active");
                0 < (hozElImageNext = $(".reading-item.active").prev()).length ? ($("#hoz-btn-next").addClass(settings.readingDirection), 1 < (ravynn = hozElImageNext.find(".name").text().split(":")).length ? $("#text-next").html(ravynn[0] + '<div class="name-chapt">' + ravynn[1] + "</div>") : $("#text-next").html(ravynn[0])) : ($("#hoz-btn-next").hide(), $("#content-end").show(), $("#content-next").hide());
                $("body").hasClass("page-reader-ver") && $("body").removeClass("page-reader-ver");
                var ravynn = window.innerHeight;
                document.getElementById("main-wrapper").style.height = ravynn + "px";
                hozShowImage();
            } else {
                ;
                (totalImage = $(".iv-card").length) <= currentImageIndex && (currentImageIndex = totalImage - 1);
                1 === $(".reading-list.active .reading-item").length && $(".mrt-bottom").hide();
                $(".reading-item.active").is(":last-child") && $("#ver-prev-cv").hide();
                $(".reading-item.active").is(":first-child") && $("#ver-next-cv").hide();
                1 === parseInt($(".reading-item.active").data("reading-mode")) && $(".container-reader-chapter").addClass("no-margin");
                $("body").hasClass("page-reader-ver") || $("body").addClass("page-reader-ver");
                verShowImage();
                const bailee = setInterval(function () {
                    var xannon = $("#main-wrapper .iv-card").eq(currentImageIndex);
                    xannon ? 0 < xannon.find(".image-vertical").length && (clearInterval(bailee), $(window).scrollTo("#main-wrapper .iv-card:eq(" + currentImageIndex + ")"), setTimeout(function () {
                        window.addEventListener("scroll", handleVerticalScroll);
                    }, 1e3)) : (clearInterval(bailee), window.addEventListener("scroll", handleVerticalScroll));
                }, 200);
            }
            voteInfo();
        }
    });
}
getChaptersOrVolumes();
const isInViewport = jalissia => {
    var maraia = window.innerHeight, maraia = jalissia.getBoundingClientRect().top / maraia;
    return 0 <= maraia && maraia <= 1;
}, md = new MobileDetect(window.navigator.userAgent);
function createImageElement(fred, nimue, abreia) {
    var anum;
    fred.classList.contains("shuffled") ? imgReverser(nimue).then(annaleece => {
        var wyse;
        annaleece && (md.mobile() ? ((wyse = document.createElement("img")).classList.add(abreia), annaleece.toBlob(function (denzyl) {
            wyse.src = URL.createObjectURL(denzyl);
            fred.appendChild(wyse);
        }, "image/jpeg")) : (annaleece.classList.add(abreia), fred.appendChild(annaleece)));
    }) : ((anum = document.createElement("img")).classList.add(abreia), anum.src = nimue, fred.appendChild(anum));
}
function logReading() {
    const coey = $(".reading-item.active"), anterria = coey.data("id"), neomia = coey.data("number"), miral = "chap" === readingBy ? 1 : 2;
    var kamaiah, satyam;
    oldImageIndex !== currentImageIndex && (continueReading = { manga_id: mangaId, reading_id: anterria, reading_number: neomia, type: miral, lang_code: langCode, image_number: currentImageIndex, updated_at: Date.now() }, oldImageIndex = currentImageIndex, isLoggedIn && $.post("/ajax/user/log-reading", continueReading, function (dakar) { }), (satyam = localStorage.getItem("mr_reading_" + mangaId)) ? 0 < (satyam = JSON.parse(satyam)).length && (0 <= (kamaiah = satyam.findIndex(danitra => danitra.type === miral)) ? satyam[kamaiah] = continueReading : satyam.push(continueReading)) : satyam = [continueReading], localStorage.setItem("mr_reading_" + mangaId, JSON.stringify(satyam)));
}
setInterval(logReading, 5e3);
var cmSort = "newest", commentLoading = false, cid = null;
if ($(".hr-comment").click(function () {
    getCommentWidget();
}), currentUrl.search) {
    const h1 = new URLSearchParams(currentUrl.search);
    cid = h1.get("c_id");
    $("body").addClass("show-comment");
    getCommentWidget();
}
function getReplies(careese, _0x434d20 = null) {
    $.get("/ajax/comment/replies/" + careese, function (erionne) {
        $("#replies-" + careese).html(erionne.html);
        $("#replies-" + careese).slideToggle(200);
        _0x434d20 && ($("#cm-" + careese + " .cm-btn-show-rep").addClass("active"), $("#cm-" + _0x434d20).addClass("comment-focus"), $(".comments-wrap").scrollTo($("#cm-" + _0x434d20).prev(), { duration: 300 }));
    });
}
function getCommentWidget() {
    var hideo = "/ajax/comment/widget/" + mangaId + "?sort=" + cmSort;
    cid && (hideo += "&cid=" + cid);
    $.get(hideo, function (dylana) {
        if (commentLoading = false, $("#content-comments").html(dylana.html), dylana.gotoId) {
            const ermenia = $("#cm-" + dylana.gotoId);
            0 < ermenia.length ? ermenia.addClass("comment-focus") : getReplies(dylana.cParentId, dylana.gotoId);
        }
    });
}
$(document).on("click", "#cm-view-more", function () {
    if (!commentLoading) {
        commentLoading = true;
        const mckenley = $(this);
        var henley = $(this).data("page");
        $.get("/ajax/comment/list/" + mangaId + "?page=" + henley + "&sort=" + cmSort, function (tereva) {
            commentLoading = false;
            tereva && tereva.status && (0 < tereva.nextPage ? mckenley.data("page", tereva.nextPage) : mckenley.remove(), $(".cw_list").append(tereva.html));
        });
    }
});
$(document).on("click", ".cm-sort", function () {
    commentLoading || (commentLoading = true, $(".cm-sort").removeClass("active"), $(".cm-sort .fa-check").hide(), $(this).addClass("active"), $(this).find(".fa-check").show(), cmSort = $(this).data("value"), getCommentWidget());
});
$(document).on("click", ".cm-action", function () {
    const jyonna = $(this).data("action"), tarasha = $(this).data("id");
    $.post("/ajax/comment/update", { id: tarasha, action: jyonna }, function (mariadelaluz) {
        $("#cm-" + tarasha).remove();
        toastr.success(mariadelaluz.msg, "", { timeOut: 5e3 });
    });
});
$(document).on("click", ".mute-options", function (iasha) {
    iasha.stopPropagation();
});
$(document).on("click", ".ac-mute", function () {
    var machenzie = $(this).data("hours"), ginetta = $(this).parent().data("user-id");
    $.post("/ajax/user/mute", { user_id: ginetta, hours: machenzie }, function (timayah) {
        toastr.success(timayah.msg, "", { timeOut: 5e3 });
    });
});
$(document).on("click", ".ac-block", function () {
    var marabel = $(this).data("user-id");
    $.post("/ajax/user/block", { user_id: marabel }, function (lorelei) {
        toastr.success(lorelei.msg, "", { timeOut: 5e3 });
    });
});
$(document).on("click", ".btn-spoil", function () {
    $(this).toggleClass("active");
});
$(document).on("click", ".cm-btn-show-rep", function () {
    var oshyn = $(this).data("id");
    $(this).toggleClass("active");
    $(this).hasClass("active") ? getReplies(oshyn) : $("#replies-" + oshyn).slideToggle(200);
});
$(document).on("click", ".show-spoil", function () {
    $(this).hide();
    $(this).parent().removeClass("is-spoil");
});
$(document).on("click", ".ib-reply,.btn-close-reply", function () {
    checkLogin() && ($("#reply-" + $(this).data("id")).slideToggle(100), $("#reply-" + $(this).data("id")).find(".comment-subject").focus());
});
$(document).on("focus", "#df-cm-content", function () {
    checkLogin() && $("#df-cm-buttons").slideDown(100);
});
$(document).on("click", "#df-cm-close", function () {
    $("#df-cm-buttons").slideUp(100);
});
$(document).on("click", ".cm-btn-vote", function () {
    if (checkLogin() && !commentLoading) {
        commentLoading = true;
        const irieana = $(this);
        var avelyn = parseInt(irieana.data("type")), kahleya = irieana.data("id");
        const machiya = $(".cm-btn-vote[data-id=" + kahleya + "].active");
        0 < machiya.length && parseInt(machiya.data("type")) !== avelyn && (machiya.removeClass("active"), 0 < (idalynn = parseInt(machiya.find(".value").text())) && (idalynn -= 1, machiya.find(".value").text(0 < idalynn ? idalynn : "")));
        irieana.toggleClass("active");
        var idalynn = 0 < (idalynn = parseInt(irieana.find(".value").text())) ? irieana.hasClass("active") ? idalynn + 1 : idalynn - 1 : 1;
        irieana.find(".value").text(0 < idalynn ? idalynn : "");
        $.post("/ajax/comment/vote", { id: kahleya, type: avelyn }, function (dasael) {
            commentLoading = false;
        });
    }
});
$(document).on("submit", ".comment-form", function (yamilka) {
    if (yamilka.preventDefault(), !commentLoading) {
        commentLoading = true;
        const ohani = $(this), kojiro = $(this).find(".loading-absolute");
        kojiro.show();
        var khonner = $(this).serializeArray();
        khonner.push({ name: "manga_id", value: mangaId });
        khonner.push({ name: "is_spoil", value: $(".btn-spoil").hasClass("active") ? 1 : 0 });
        grecaptcha.execute(recaptchaV3SiteKey, { action: "add_comment" }).then(function (viora) {
            khonner.push({ name: "_token", value: viora });
            $.post("/ajax/comment/add", khonner, function (tira) {
                commentLoading = false;
                kojiro.hide();
                tira && tira.status ? (0 < parseInt(tira.parentId) ? ($("#block-reply-" + tira.parentId).html(tira.html), $("#cm-" + tira.parentId + " .cm-btn-show-rep").addClass("active"), $("#replies-" + tira.parentId).slideToggle(100), $("#reply-" + tira.parentId).slideToggle(100)) : ($("#df-cm-buttons").slideUp(100), $(".cw_list").html(tira.html)), ohani[0].reset(), ohani.find(".btn-spoil").removeClass("active")) : (ohani.find(".cm-error").text(tira.msg), ohani.find(".cm-error").show(), setTimeout(function () {
                    ohani.find(".cm-error").hide();
                }, 1e4));
            });
        });
    }
});
