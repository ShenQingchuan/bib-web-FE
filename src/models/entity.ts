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
  scope: "PUBLIC" | "PRIVATE";
  avatarURL: string;
  creator: UserAccount;
  memberList: UserAccount[];
}

export interface Wiki {
  name: string;
  description: string;
  creator: UserAccount;
  documents: Document[];
  followers: UserAccount[];
}

export interface DocumentComment<UT = UserAccount> {
  id: number;
  content: string;
  creator: UT;
  thumbUpUsers: UT[];
  replyTo: UT | null;
  createTime: Date | number;
  updateTime: Date | number;
}

export interface Document {
  id: number;
  title: string;
  contentAbstract: string;
  creator: UserAccount;
  thumbUpUsers: UserAccount[];
  collaborators: UserAccount[];
  inWiki: Wiki | null;
  comments: DocumentComment[];
  createTime: Date | number;
  updateTime: Date | number;
}
