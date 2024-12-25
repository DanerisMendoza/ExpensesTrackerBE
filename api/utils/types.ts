import { permissionsTypes } from "../modules/user/types"

export interface decodedType {
    id: string
    name: string
    email: string
    username: string
    role: permissionsTypes[]
    profile_pic_path: string
    iat: Number
    exp: Number
}

declare global {
    namespace Express {
      export interface Request {
        user_id?: string; 
      }
    }
  }