import { Utils } from '@illusicord/player/utils'
import type { DiscordTrack } from '@illusicord/types'
function make_media(data: {title: string; media_uri: string; duration: number;}): DiscordTrack{
    return Utils.track_to_discord_track({
        uid: data.title,
        title: data.title,
        artists: [{name: "Sudo", uri: null}],
        duration: data.duration ?? 0,
        media_uri: data.media_uri,
        imported_id: "discord-imported-media"
    });
}

export const MEDIA = [
	make_media({"title":"A Wendy’s Christmas.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\A Wendy’s Christmas.m4a","duration":135}),
	make_media({"title":"BoutMyMoneyMaster.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\BoutMyMoneyMaster.m4a","duration":116}),
	make_media({"title":"BrolyTiming(otherset).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\BrolyTiming(otherset).m4a","duration":92}),
	make_media({"title":"Broly_Timing(feat. Kanesta).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Broly_Timing(feat. Kanesta).m4a","duration":160}),
	make_media({"title":"CherryBlossom(LD).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\CherryBlossom(LD).m4a","duration":134}),
	make_media({"title":"Clappin.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Clappin.m4a","duration":162}),
	make_media({"title":"FreddyKreuger(luhrevision).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\FreddyKreuger(luhrevision).m4a","duration":125}),
	make_media({"title":"FreeCrankyKong.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\FreeCrankyKong.m4a","duration":104}),
	make_media({"title":"FrightNight.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\FrightNight.m4a","duration":133}),
	make_media({"title":"Fuck SSSniperwolf (Zayboy final verse).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Fuck SSSniperwolf (Zayboy final verse).m4a","duration":210}),
	make_media({"title":"fucksniperwolf(fnl).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\fucksniperwolf(fnl).m4a","duration":210}),
	make_media({"title":"Gmail Perc.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Gmail Perc.m4a","duration":91}),
	make_media({"title":"Gogeta 2.mp3","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Gogeta 2.mp3","duration":115}),
	make_media({"title":"IRLMoneyGlitch(Good_).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\IRLMoneyGlitch(Good_).m4a","duration":105}),
	make_media({"title":"IRLMoneyGlitch.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\IRLMoneyGlitch.m4a","duration":168}),
	make_media({"title":"It’s A Popeyes Christmas.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\It’s A Popeyes Christmas.m4a","duration":135}),
	make_media({"title":"Krampus (Mastered 2).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Krampus (Mastered 2).m4a","duration":137}),
	make_media({"title":"LafouandMorty.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\LafouandMorty.m4a","duration":120}),
	make_media({"title":"Miscellaneous Christmas rap.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Miscellaneous Christmas rap.m4a","duration":105}),
	make_media({"title":"moose-final.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\moose-final.m4a","duration":126}),
	make_media({"title":"Naught List (mastered).m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Naught List (mastered).m4a","duration":105}),
	make_media({"title":"No more.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\No more.m4a","duration":99}),
	make_media({"title":"No_Liver.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\No_Liver.m4a","duration":122}),
	make_media({"title":"no_sleep - final.wav","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\no_sleep - final.wav","duration":109}),
	make_media({"title":"petethecat.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\petethecat.m4a","duration":145}),
	make_media({"title":"PinkEye.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\PinkEye.m4a","duration":144}),
	make_media({"title":"Salsa 2.mp3","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Salsa 2.mp3","duration":156}),
	make_media({"title":"Scarface v2 2.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Scarface v2 2.m4a","duration":238}),
	make_media({"title":"Shiny.wav","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Shiny.wav","duration":109}),
	make_media({"title":"SkunkyGun.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\SkunkyGun.m4a","duration":156}),
	make_media({"title":"skunky_gun - final.wav","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\skunky_gun - final.wav","duration":156}),
	make_media({"title":"triple threat done pt1.mp3","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\triple threat done pt1.mp3","duration":189}),
	make_media({"title":"Tylenol PM.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\Tylenol PM.m4a","duration":97}),
	make_media({"title":"WhereyaAuntie.m4a","media_uri":"C:\\dev\\Illusi\\lib-origin\\illusicord\\media\\WhereyaAuntie.m4a","duration":117})
];