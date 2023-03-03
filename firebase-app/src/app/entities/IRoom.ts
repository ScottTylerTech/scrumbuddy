import { Timestamp, FieldValue } from '@firebase/firestore-types';
import { IUser } from './IUser';

export interface IRoom {
  createTime: string;
  host: string;
  key: string;
  roomName: string;
  users: IUser[];
}
