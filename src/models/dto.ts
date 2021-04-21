import { DocumentComment, UserAccount } from './entity';

export interface DocSimpleDto {
  id: number;
  title: string;
  contentAbstract: string;
  creator: UserSimpleDTO;
  inWiki: boolean;
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

export interface OrgSimpleDTO {
  id: number;
  name: string;
  desc: string;
  avatarURL: string;
  creatorId: number;
  creatorName: string;
  memberCount: number;
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

export enum UserActivityType {
  THUMBS_UP_DOC = 'THUMBS_UP_DOC',
  FOCUS_USER = 'FOCUS_USER',
  FOCUS_WIKI = 'FOCUS_WIKI',
  CREATE_DOC = 'CREATE_DOC',
  CREATE_WIKI = 'CREATE_WIKI',
  CREATE_ORG = 'CREATE_ORG'
}

export type UserActivityData =
  | DocSimpleDto
  | WikiSimpleDto
  | UserSimpleDTO
  | OrgSimpleDTO;

export interface UserActivityDto {
  createTime: number;
  activityType: UserActivityType;
  activityData: UserActivityData;
}
