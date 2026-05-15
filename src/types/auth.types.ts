export type RegisterUserInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type CreateUserData = {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
};
