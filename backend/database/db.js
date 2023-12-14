import UserDB from './UserDB.js';

// connect to postgres db
const userDB = new UserDB();
userDB.connect();

export default userDB;
