export interface Lecturer {
  id: string;
  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;
}

export type LecturerSummary = Omit<Lecturer, 'password'>;
export type NewLecturer = Omit<Lecturer, 'id'>;
