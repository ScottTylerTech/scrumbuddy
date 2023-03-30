export interface IUser {
  uid: string;
  name: string;
  points: number;
  amHost?: boolean;
  votingHistory: number[];
}
