import type Roz from './roz';
import type { RozFileVersions } from './roz';
import type { StaticAssert } from './types';

export interface RozMain extends Roz {}
export type SomeRoz = RozMain;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CheckVersions = StaticAssert<SomeRoz['version'] extends RozFileVersions ? true : false>;