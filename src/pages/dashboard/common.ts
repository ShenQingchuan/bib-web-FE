/** 归档类型：0 个人创建 1 团队创建 2 个人创建于知识库 3 团队创建于知识库 */
export enum DocListItemArchiveType {
  UserOnly = 0,
  OrgOnly = 1,
  UserWiki = 2,
  OrgWiki = 3
}

export interface DocFilter {
  archiveType: number;
  text: string;
}

export interface DocListItem {
  title: string; // 文档标题
  creatorId: number; // 文档创建者的 uid
  creatorName: string; // 文档创建者的 userName
  createTime: number; // 文档创建时间（秒级时间戳）
  archiveType: DocListItemArchiveType;
  // 后端逻辑：仅在 “archiveType === 1” 类型时附带 organization 团队信息
  orgId?: number;
  orgName?: string;
  // 后端逻辑：仅在 “archiveType > 1” 类型时附带 wiki 信息
  wikiId?: number;
  wikiName?: string;
}
