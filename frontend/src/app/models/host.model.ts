export interface Host {
  id: string;
  name: string;
  country: string;
  city: string;
  email: string;
}

export type NewHost = Omit<Host, 'id'>;
