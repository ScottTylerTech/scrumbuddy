import { Timestamp, FieldValue } from '@firebase/firestore-types';
import { IUser } from './IUser';

export interface IRoom {
  createTime: Date;
  host: string;
  key: string;
  roomName: string;
  users: IUser[];
}
