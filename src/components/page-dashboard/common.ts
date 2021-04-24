import type { OrgSimpleDto } from '@/models';

/** 归档类型：0 个人创建 1 团队创建 2 个人创建于知识库 3 团队创建于知识库 */
export enum DocListItemArchiveType {
  UserOnly = 'USER_ONLY',
  UserWiki = 'USER_WIKI',
  OrgWiki = 'ORG_WIKI'
}
export enum WikiType {
  UserWiki = 'USER_WIKI',
  OrgWiki = 'ORG_WIKI'
}
export interface DocFilter {
  archiveType?: DocListItemArchiveType;
  text: string;
}
export interface WikiFilter {
  wikiType?: WikiType;
  text: string;
}

export interface DocListItem {
  id: number; // 文档唯一 id
  title: string; // 文档标题
  creatorId: number; // 文档创建者的 uid
  creatorName: string; // 文档创建者的 userName
  createTime: number; // 文档创建时间戳
  updateTime: number; // 文档更新时间戳
  editable: boolean;
  archiveType: DocListItemArchiveType;
  orgId: number | null;
  orgName: string | null;
  wikiId: number | null;
  wikiName: string | null;
}

export interface WikiListItemData {
  id: number; // wiki 唯一 id
  name: string; // wiki 名称
  description: string; // wiki 简介
  wikiType: WikiType;
  isPrivate: boolean;
  updateTime: number;
  organization: OrgSimpleDto;
}

export const docListItemFilters: DocFilter[] = [
  { text: '所有' },
  { archiveType: DocListItemArchiveType.UserOnly, text: '个人空间' },
  { archiveType: DocListItemArchiveType.UserWiki, text: '个人知识库' },
  { archiveType: DocListItemArchiveType.OrgWiki, text: '团队知识库' }
];

export const wikiTypeFilters: WikiFilter[] = [
  { text: '所有' },
  { wikiType: WikiType.UserWiki, text: '个人知识库' },
  { wikiType: WikiType.OrgWiki, text: '团队知识库' }
];
