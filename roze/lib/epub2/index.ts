/* eslint-disable @typescript-eslint/unbound-method */
/**
 * Created by user on 2018/2/1/001.
 */

import path from 'path';
import type xml2js from 'react-native-xml2js';

import { EPub as libEPub } from './lib/epub';
import type { TocElement } from './lib/epub/const';

export { SYMBOL_RAW_DATA } from './lib/types';

export class EPub extends libEPub
{
	static async createAsync(epubfile: string, imagewebroot?: string, chapterwebroot?: string, ...argv: unknown[]): Promise<EPub>
	{
		return new Promise<EPub>((resolve, reject) =>
		{
			const epub = this.create(epubfile, imagewebroot, chapterwebroot, ...argv) as EPub;

			const cb_err = (err: Error) =>
			{
				(err as Error & { epub: EPub }).epub = epub;
				return reject(err);
			};

			epub.on('error', cb_err);
			epub.on('end', function (err?: Error)
			{
				if (err)
				{
					cb_err(err);
				}
				else
				{
					resolve(epub);
				}
			});

			epub.parse();
		});
	}

	protected async _p_method_cb<T>(method: (...args: any[]) => void, options: { multiArgs?: boolean } | null, ...argv: unknown[]): Promise<T>
	{
		return new Promise<T>((resolve, reject) =>
		{
			method.call(this, ...argv, (err: Error | null, ...results: unknown[]) =>
			{
				if (err) return reject(err);
				resolve(options?.multiArgs ? results as T : results[0] as T);
			});
		});
	}

	public async getChapterAsync(chapterId: string): Promise<string>
	{
		return this._p_method_cb<string>(this.getChapter, null, chapterId);
	}

	public async getChapterRawAsync(chapterId: string): Promise<string>
	{
		return this._p_method_cb<string>(this.getChapterRaw, null, chapterId);
	}

	public async getFileAsync(id: string): Promise<[Buffer, string]>
	{
		return this._p_method_cb<[Buffer, string]>(this.getFile, { multiArgs: true }, id);
	}

	public async getImageAsync(id: string): Promise<[Buffer, string]>
	{
		return this._p_method_cb<[Buffer, string]>(this.getImage, { multiArgs: true }, id);
	}

	listImage(): TocElement[]
	{
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const epub = this;
		const mimes = [
			'image/jpeg',
		];
		const exts = [
			'jpg',
			'png',
			'gif',
			'webp',
			'tif',
			'bmp',
			//'jxr',
			//'psd'
		];

		return Object.keys(epub.manifest)
			.reduce(function (a: TocElement[], id)
			{
				const elem = epub.manifest[id];
				const mime = (elem['media-type'] || elem.mediaType) ?? '';

				if (mimes.includes(mime) || mime.startsWith('image') || exts.includes(path.extname(elem.href ?? '')))
				{
					a.push(elem)
				}

				return a;
			}, [])
			;
	}

	static override xml2jsOptions = Object.assign({}, libEPub.xml2jsOptions, {
		normalize: null,
	}) as xml2js.Options;

}

export default EPub;
