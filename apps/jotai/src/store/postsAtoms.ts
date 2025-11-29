import { atom } from 'jotai';
import type { Post } from '@post-manager/types';

export const postsAtom = atom<Post[]>([]);
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<Error | null>(null);
