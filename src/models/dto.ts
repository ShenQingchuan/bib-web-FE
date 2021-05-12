export interface DocSimpleDto {
  id: number;
  title: string;
  contentAbstract: string;
  creator: UserSimpleDto;
  inWiki: boolean;
  wikiName: string | null;
  updateTime: number;
}
export interface WikiSimpleDto {
  id: number;
  name: string;
  description: string;
  focusCount: number;
}
export interface UserSimpleDto {
  uid: number;
  userName: string;
  userDetails: {
    id?: number;
    avatarURL: string;
    introduce: string;
  };
  followersCount: number;
}

export interface UserDetailsFullDto {
  id: number;
  avatarURL: string;
  introduce: string;
  address: string;
  profession: string;
  isFollowing: boolean;
  followersCount: number;
  followingsCount: number;
}

export interface OrgSimpleDto {
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
  creator: UserSimpleDto;
  thumbUpUsers: UserSimpleDto[];
  collaborators: UserSimpleDto[]; // 合作者的 uid
  comments: DocumentCommentDto[];
  thumbsUped: boolean;
  publicSharing: boolean;
  inWiki: {
    id: number;
    name: string;
    isPrivate: boolean;
  };
}

export interface DocumentCommentDto {
  id: number;
  content: string;
  creator: UserSimpleDto;
  replyTo: DocumentCommentDto | null;
  createTime: number;
  thumbsUpCount: number;
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
  | UserSimpleDto
  | OrgSimpleDto;

export interface UserActivityDto {
  createTime: number;
  activityType: UserActivityType;
  activityData: UserActivityData;
}

export interface DocShowInWikiListDto {
  id: string;
  title: string;
  creator: UserSimpleDto;
  updateTime: number;
  publicSharing: boolean;
}

export interface WikiViewDataDto {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  joined: boolean;
  focused: boolean;
  focusCount: number;
  creator: UserSimpleDto;
  docs: DocSimpleDto[];
}
