import { UserAccount } from 'models';

/** --- 用户动态相关 ---  */
export interface LikedDoc {
  id: number;
  title: string;
  author: UserAccount;
}

export interface FocusedWiki {
  id: number;
  name: string;
  description: string;
  focusCount: number;
}

export interface FocusedUser extends UserAccount {
  followerCount: number;
}

export interface PublishedDoc {
  id: number;
  title: string;
  contentAbstract: string;
  publishedOnWiki: boolean;
  wikiId?: number;
}
