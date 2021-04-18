import { DocumentComment, UserAccount } from './entity';

export interface DocSimpleDto {
  id: number;
  title: string;
  contentAbstract: string;
  creator: UserSimpleDTO;
  publishedOnWiki: boolean;
  wikiName: string | null;
}
export interface WikiSimpleDto {
  id: number;
  name: string;
  description: string;
  focusCount: number;
}
export interface UserSimpleDTO {
  uid: number;
  userName: string;
  userDetails: {
    id?: number;
    avatarURL: string;
    introduce: string;
  };
  followersCount: number;
}

export interface DocumentViewData {
  id: number;
  title: string;
  contentAbstract: string;
  creator: UserSimpleDTO;
  thumbUpUsers: UserSimpleDTO[];
  collaborators: UserSimpleDTO[];
  comments: DocumentComment<UserSimpleDTO>[];
  thumbsUped: boolean;
  publicSharing: boolean;
  inWiki: {
    id: number;
    name: string;
    isPrivate: boolean;
  };
}

export type UserActivityType =
  | 'THUMBS_UP_DOC'
  | 'FOCUS_USER'
  | 'FOCUS_WIKI'
  | 'CREATE_DOC';

export type UserActivityData = DocSimpleDto | WikiSimpleDto | UserSimpleDTO;

export interface UserActivity {
  createTime: number;
  activityType: UserActivityType;
  activityData: UserActivityData;
}
