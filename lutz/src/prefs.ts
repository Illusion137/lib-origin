export namespace Prefs {
    export interface ReadingSession {
        artwork_url: string;
        manga_id: string;
        no: number;
        id: string;
    }
    export type ReadingMode = "ver"|"hoz";
    export type Quality = "low"|"medium"|"high";
    export const prefs = {
        previous_session: {},

        reading_mode: {},
        quality: {},
    };
    export function get_pref(){
        return prefs;
    }
    export function save_pref(){
        return;
    }
    export function load_prefs(){
        return;
    }

    interface ThemeFont {fontFamily: string, fontWeight: any}
    export interface Theme {
        dark: boolean;
        colors: {
            primary: string;
            secondary: string;
            background: string;
            primary_dark: string;
            card: string;
            title: string;
            text: string;
            subtext: string;
            deeptext: string;
            border: string;
            line: string;
        },
        fonts: {
            regular: ThemeFont,
            medium: ThemeFont,
            heavy: ThemeFont,
            bold: ThemeFont,
        }
    }
    export const dark_theme: Theme = {
        dark: true,
        colors: {
            primary: "#fcba03",
            secondary: '#fc00c9',
            background: '#0d1016',
            primary_dark: '#1a184f',
            card: '#131213',
            title: '#d0d0d0',
            text: '#ffffff',
            subtext: '#8c939d',
            deeptext: '#606060',
            border: '#222222',
            line: '#303040',
        },
        fonts: {
            regular: {fontFamily: 'normal', fontWeight: 'normal'},
            medium: {fontFamily: 'normal', fontWeight: '600'},
            heavy: {fontFamily: 'normal', fontWeight: 'bold'},
            bold: {fontFamily: 'normal', fontWeight: '900'},
        }
    }
}