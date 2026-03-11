/**
 * Created by user on 2018/3/18/018.
 */

import type { EPub } from '../index';
import type { EPub as libEPub } from './epub';

export function fixToc(epub: EPub | libEPub)
{
	const manifest_keys = Object.keys(epub.manifest);

	if (!epub.toc.length)
	{
		epub.toc = Object.values(epub.manifest).filter(node => {

			if (
				['text/css', 'application/x-dtbncx+xml'].includes(node.mediaType ?? '')
				|| /^(image)/.test(node.mediaType ?? '')
			)
			{
				return false;
			}

			return true;
		});

		return epub;
	}

	epub.toc.forEach(function (toc, _idx)
	{
		if (!toc.id || !epub.manifest[toc.id])
		{
			for (const k of manifest_keys)
			{
				const row = epub.manifest[k];

				if ((row.href == toc.href) || ((row.href ?? '').replace(/#.+$/g, '') == (toc.href ?? '').replace(/#.+$/g, '')))
				{
					toc.id = k;
				}
			}
		}
	});

	return epub;
}
