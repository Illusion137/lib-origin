import type Roz from './roz';

export interface RozMain extends Roz {}
export type SomeRoz = RozMain;

// type CheckVersions = StaticAssert<SomeRoz['version'] extends RozFileVersions ? true : false>;
