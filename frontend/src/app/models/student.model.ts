export interface Student {
  id: string;
  username: string;
  password: string;
  name: string;
  surname: string;
  course: string;
  email: string;
}

export type StudentSummary = Omit<Student, 'password'>;
export type NewStudent = Omit<Student, 'id'>;
