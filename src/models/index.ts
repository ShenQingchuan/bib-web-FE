import { FocusedUser, FocusedWiki, LikedDoc, PublishedDoc } from './dto';

export * from './dto';
export interface UserAccount {
  uid: number;
  userName: string;
  phone: string;
  email: string;
  role: string;
  userDetails: UserDetails;
}

export interface UserDetails {
  detailsId: number;
  avatarURL: string;
  introduce: string;
  address: string;
  profession: string;
}

export interface Organization {
  id: number;
  name: string;
  description: string;
  scope: 'PUBLIC' | 'PRIVATE';
  avatarURL: string;
  creator: UserAccount;
  memberList: UserAccount[];
}

export type UserActivityType =
  | 'LIKE_DOC'
  | 'FOCUS_USER'
  | 'FOCUS_WIKI'
  | 'PUBLISH_DOC';

export type UserActivityData<T extends UserActivityType> = T extends 'LIKE_DOC'
  ? LikedDoc[]
  : T extends 'FOCUS_USER'
  ? FocusedUser[]
  : T extends 'FOCUS_WIKI'
  ? FocusedWiki[]
  : PublishedDoc;

export interface UserActivity<T extends UserActivityType = any> {
  activityTime: number;
  activityType: T;
  activityData: UserActivityData<T>;
}
