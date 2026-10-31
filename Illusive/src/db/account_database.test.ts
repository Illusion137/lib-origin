import { describe, expect, it } from 'vitest';
import { AccountDatabase } from './account_database';
import { default_db_path } from './database';

describe('AccountDatabase.plan', () => {
	it('gives the first account the existing database', () => {
		expect(AccountDatabase.plan('', 'user-a')).toEqual({ file: default_db_path, claim: true });
	});
	it('keeps the owner on the default database', () => {
		expect(AccountDatabase.plan('user-a', 'user-a')).toEqual({ file: default_db_path, claim: false });
	});
	it('gives another account its own file', () => {
		const plan = AccountDatabase.plan('user-a', 'user-b');
		expect(plan.claim).toBe(false);
		expect(plan.file).not.toBe(default_db_path);
		expect(plan.file).toContain('user-b');
	});
});
