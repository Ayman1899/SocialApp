import bcrypt from 'bcrypt'
export const Compare = async ({key, hashing}) => {
    return bcrypt.compareSync(key, hashing)
}