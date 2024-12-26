export enum permissionsTypes  {
    admin = 0,
    endUser = 1,
}

export interface userType {
    username: String,
    name: String,
    email: String,
    password: String,
    role: [Number], //0=> admin, 1=>enduser
    profile_pic_path: String,
}