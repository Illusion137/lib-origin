import { create } from 'zustand'
import type { RozHeader } from '@roze/types/roz';

interface NovelsState {
    novels: RozHeader[]
    clearNovels: () => void
    updateNovels: (new_novels: RozHeader[]) => void
}

export const useNovels = create<NovelsState>((set) => ({
    novels: [],
    clearNovels: () => set({ novels: [] }),
    updateNovels: (new_novels) => set({ novels: new_novels }),
}));