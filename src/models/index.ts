import { FocusedUser, FocusedWiki, LikedDoc, PublishedDoc } from './dto';

export * from './dto';
export * from './entity';

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
