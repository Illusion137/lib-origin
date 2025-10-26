// import { initWhisper } from 'whisper.rn';
import { TimeLog } from '@common/time_log';
import { initWhisper, type TranscribeOptions } from '@fugood/whisper.node';

const aunt_cat = `Punching shit like Mortal Kombat
She see 80 thousand on this wrist, where yo thong at
While I'm looking for the dum-dums you like where them bongs at
I'm like Obama in the hood nigga where them bombs at

Kaboom

Buddy where your mom at (where ya mom at)
In my crib giving me that mom gyat
Now you asking where your aunt at
Yeah shes at my house giving me that aunt cat
(meow meow meow)

Walk up to your girl and ask her what her name is
I'm only askin' cause I'm gettin' tired of my main bitch
I know she gettin' tired of your lame dick
knocked them ankles loose, But she sayin' that she sprained it

Purple in my cup, look like Piccolo wore it
Stupid cop comin' in my house, But he ain't got a warrant
Hidin' all the goodies up inside the warren
Yeah, I put the buffs on, bitch, I feel like Warden

200 bands in my closet, yeah, I call that hoarding
Buddy, yous a hoe, you okay with your girl whoring?
Yeah, we in the spaceship and this bitch soaring
Im in, this bitch countin' kills like my name's Zoren

Yeah, my crib is so big, you walk in, you got a tour it
I don't pay for anything, yeah, you know I'm finna torrent
Spent 20 bands on his credit card, his name was Lawrence
Nothing that I bought was useful, only thing I bought was Jordans

And a Switch, too
Not a Nintendo Switch, one, a Switch, too
And I bought a new gun and a Switch, too
And I bought some new buns for my bitch, too

That's what you get for pocket watchin' Brentlafou (must be gay)
I take your girl, now she ridin' on my Brentlafou
If the feds ask, boy, I'm turnin' into Brentlawho
I'm the Grinch takin' shit, I feel like Brentlawho (MAX)

Punching shit like Mortal Kombat
She see 80 thousand on this wrist, where yo thong at
While I'm looking for the dum-dums you like where them bongs at
I'm like Obama in the hood nigga where them bombs at

Kaboom

Buddy where your mom at (where ya mom at)
In my crib giving me that mom gyat
Now you asking where your aunt at
Yeah shes at my house giving me that aunt cat
Givin' me that aunt cat
Yeah, I'm comin' for that aunt cat, Lafou`

const fonion = `Lafubrionbrent

I got a loud mouth bitch she talking to me with funion breath
50k at my casino yeah it gave that boy minion death
You ain't got pussy in a year yeah you in hunion debt
If you putting money on my opps that dumbion bet

Yeah I'm sippin on this lean but I call it my yumion quench. 
Fitted up like I'm homeless why I sleep on that slumion bench. 
She throw me that black kitty yeah you know that's that bugion French. 
You don't get green that's why we calling you Clarkion Kent.
  
You couldn't stop this shittin even if you had a plumbion wrench.
He folded like an omelet yeah he geeked off that donion fent
you can't even buy pussy yeah you got a nunion wench.
Yo bitch suck me good yeah she like how this cumion bend.

Running uo this paper while I'm taking a blumpkin shit, 
you work graveyard on hslloween that's yo pumpkin shift
shawty going for the whole gang she be splunkin dick
Number one munch all im doing is sucklin clits.

Got her doing shit that'll have Quagmire freaked out
A little birdie told me yeah you know how he tweet out
Lace you with rhino pills now yo dick like a bean sprout
Yo girl sucking good, yeah I think ima leak out

If I tell you something and it's fake, man that's yo damn fault
Yeha I keep that chili bean bomb in my blam vault
You aint fuck with green and you saying it's Sam's fault?
If I'm feeling like a bad bitch I'm going in my glam vault

I got a loud mouth bitch she talking to me with funion breath
50k at my casino yeah it gave that boy minion death
You ain't got pussy in a year yeah you in hunion debt
If you putting money on my opps that dumbion bet

If you two faced get the fuck outta here harvion dent
Bouncing on my dick like a joey she be grubion eggs
Big Ed a crazy motherfucker tryna scrubion legs
Yeah You think yo grandma safe? Oh yeah we jumpion Beth 

Goodman boutta chop off my balls for that Marvion rent
Iron man 3 in her poot I'm on my jarvion quest
So much dogshit in my house you smell the fartion scent
Yeah I like petting cute dogs thats my barkion frien

The grim reaper coming for my ass like I'm runion fred
Yeah these bands got hella layers calling that my onion shrek
My dash cam broke in the crash and I got the Implundion dent
I asked for the a million dollar loan that's the abundionce lend

Crazy bitch want bukkake so she got that cumion drench
I'll kill carol basking cuz she took my Colombian pet
She throw that booty on me ima catch if like a huskian fetch
Yeah I got them pink bills like I got a lumpion breast 

Dirty money and I'm dripping yeah I'm like that bubblion stench 
My ex stabbed my heart, fuck that bitch did me like evlion ed
Waking up early in the morning from the cocklion hen
Ima be so cool ride to school on the noblion stead

This song was written and produced by Lafubrionbrent and Daxielienflemt

Lafou!`;

export namespace Shumil {

    interface Segment {
        text: string;
        t0: number;
        t1: number;
    }

    function normalize(text: string) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9'\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function tokenize(str: string): string[] {
        return normalize(str).split(" ");
    }

    /**
     * Align two sequences of words using dynamic programming (Levenshtein alignment)
     * Returns an array of tuples: [wordFromRough, wordFromClean]
     */
    function alignWords(roughWords: string[], cleanWords: string[]): [string | null, string | null][] {
        const m = roughWords.length;
        const n = cleanWords.length;

        const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = roughWords[i - 1] === cleanWords[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,       // deletion
                    dp[i][j - 1] + 1,       // insertion
                    dp[i - 1][j - 1] + cost // substitution
                );
            }
        }

        // backtrack to recover alignment
        const alignment: [string | null, string | null][] = [];
        let i = m;
        let j = n;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (roughWords[i - 1] === cleanWords[j - 1] ? 0 : 1)) {
                alignment.unshift([roughWords[i - 1], cleanWords[j - 1]]);
                i--; j--;
            } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
                alignment.unshift([roughWords[i - 1], null]);
                i--;
            } else {
                alignment.unshift([null, cleanWords[j - 1]]);
                j--;
            }
        }

        return alignment;
    }

    /**
     * Replace each segment's text with its aligned version from the clean lyrics.
     */
    export function alignSegments(cleanLyrics: string, segments: Segment[]): Segment[] {
        const roughText = segments.map(s => s.text).join(" ");
        const roughWords = tokenize(roughText);
        const cleanWords = tokenize(cleanLyrics);
        const alignment = alignWords(roughWords, cleanWords);

        // Build a mapping from rough-word index → clean-word index
        const roughToClean: (number | null)[] = [];
        let cleanIdx = 0;
        alignment.forEach(([r, c]) => {
            if (r != null) {
                roughToClean.push(c != null ? cleanIdx : null);
            }
            if (c != null) cleanIdx++;
        });

        // Now map each segment's range into clean lyrics
        let roughWordCursor = 0;
        const realWords = cleanLyrics.split(/\s+/);

        return segments.map(seg => {
            const segLen = tokenize(seg.text).length;
            const startCleanIdx = roughToClean[roughWordCursor];
            const endCleanIdx = roughToClean[roughWordCursor + segLen - 1];
            roughWordCursor += segLen;

            if (startCleanIdx == null || endCleanIdx == null) {
                // if alignment uncertain, we take a nearby chunk
                return { ...seg, text: seg.text };
            }

            const matched = realWords.slice(startCleanIdx, endCleanIdx + 1).join(" ");
            return { ...seg, text: matched.trim(), _ext: seg.text };
        });
    }


    export async function run_model() {
        const whisperContext = await initWhisper({
            filePath: '/Users/illusion/dev/Illusi/lib-origin/shumil/models/ggml-medium.en.bin',
            useGpu: true,
        })

        const sampleFilePath = '/Users/illusion/dev/Illusi/lib-origin/shumil/sample/fonion_Vocals.wav'
        const options: TranscribeOptions = {
            language: 'en',
            prompt: fonion,
            temperature: 0.0,
            tokenTimestamps: true,
        };
        const { promise } = whisperContext.transcribe(sampleFilePath, options);

        const result = await promise;
        await whisperContext.release();
        return result.segments;
    }
}

async function main_shumil() {
    const segments = await TimeLog.log_fn_async("Transcription ", async () => await Shumil.run_model());
    // console.log(segments);
    const aligned_lyrics = Shumil.alignSegments(fonion, segments);
    console.log(aligned_lyrics);
}
main_shumil().catch(console.error);