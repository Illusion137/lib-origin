import Say from 'say';

const say = Say;
export function voice_synth_save_fs(){
    const out = "sample/roze/synth.wav";
    const text = `Hello World! How are you doing today?`;
    say.export(text, undefined, 1.0, out);
}

