import { DocumentComment, UserAccount } from './entity';

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

export interface UserSimpleDTO {
  uid: number;
  userName: string;
  userDetails: {
    id?: number;
    avatarURL: string;
  };
}

export interface DocumentViewData {
  id: number;
  title: string;
  contentAbstract: string;
  content: string;
  creator: UserSimpleDTO;
  thumbUpUsers: UserSimpleDTO[];
  collaborators: UserSimpleDTO[];
  comments: DocumentComment<UserSimpleDTO>[];
  thumbsUped: boolean;
  inWiki: {
    id: number;
    name: string;
    private: boolean;
  };
}
