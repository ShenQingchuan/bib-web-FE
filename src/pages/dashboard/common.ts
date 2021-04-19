/** 归档类型：0 个人创建 1 团队创建 2 个人创建于知识库 3 团队创建于知识库 */
export enum DocListItemArchiveType {
  UserOnly = 0,
  UserWiki = 1,
  OrgWiki = 2
}

export interface DocFilter {
  archiveType: number;
  text: string;
}

export interface DocListItem {
  id: number; // 文档唯一 id
  title: string; // 文档标题
  creatorId: number; // 文档创建者的 uid
  creatorName: string; // 文档创建者的 userName
  createTime: number; // 文档创建时间（秒级时间戳）
  archiveType: DocListItemArchiveType;
  orgId: number | null;
  orgName: string | null;
  wikiId: number | null;
  wikiName: string | null;
}
