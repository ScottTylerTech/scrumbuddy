import { Timestamp, FieldValue } from '@firebase/firestore-types';
import { IUser } from './IUser';

export interface IRoom {
  createTime: string;
  host: IUser;
  uid: string;
  roomName: string;
  users: IUser[];
  isVoting: boolean;
}
