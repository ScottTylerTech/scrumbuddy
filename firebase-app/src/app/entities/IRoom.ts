import { Timestamp, FieldValue } from '@firebase/firestore-types';
export interface IRoom {
    name: string;
    dateCreated: Number | Timestamp | FieldValue;
}