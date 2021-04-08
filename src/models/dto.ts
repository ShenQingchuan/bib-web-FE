import { DocumentComment, UserAccount } from './entity';

/** --- 用户动态相关 ---  */
export interface LikedDoc {
  id: number;
  title: string;
  creator: UserAccount;
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

export interface DocumentViewData {
  id: number;
  title: string;
  contentAbstract: string;
  content: string;
  creator: UserAccount;
  thumbUpUsers: UserAccount[];
  collaborators: UserAccount[];
  comments: DocumentComment[];
  stared: boolean;
  inWiki: {
    id: number;
    name: string;
    private: boolean;
  };
}
