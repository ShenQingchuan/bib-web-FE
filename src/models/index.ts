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
