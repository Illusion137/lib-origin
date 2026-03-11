export function isEpub(data: string, buf?: boolean): string
export function isEpub(data: Buffer, buf?: boolean): Buffer
export function isEpub(data, buf?: boolean)
export function isEpub(data, buf?: boolean)
{
	const txt = (typeof data == 'string' && !buf) ? data : data.toString("utf-8").toLowerCase().trim();

	if (txt === 'application/epub+zip')
	{
		return data as unknown;
	}

	return null;
}
