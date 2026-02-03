export interface IUserUpdate {
    username?: string;
    email?: string;
}

export interface IForgetPassword {
    oldPassword: string;
    newPassword: string
}