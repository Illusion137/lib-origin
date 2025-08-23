import Foundation;
import AVFoundation;

let args = CommandLine.arguments;

let rate = args[1];
let voice = args[2];
let texts_file_path = args[3];

let synth = AVSpeechSynthesizer();
let utterance = AVSpeechUtterance(string: "");

utterance.voice = AVSpeechSynthesisVoice(identifier: voice);
utterance.rate = Float(rate) ?? 170;
synth.speak(utterance);
