import * as FileSystem from 'expo-file-system';
import { Illusive } from '../../../illusive';

export function document_directory(path: string){ return FileSystem.documentDirectory + path; }
export function sqlite_directory(){ return document_directory(Illusive.sqlite_directory); }
export function thumbnail_directory(){ return document_directory(Illusive.thumbnail_archive_path); }
export function media_directory(){ return document_directory(Illusive.media_archive_path); }
export function lyrics_directory(){ return document_directory(Illusive.lyrics_archive_path); }