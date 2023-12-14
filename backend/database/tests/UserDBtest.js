import UserDB from '../UserDB.js';

// connect to postgres db
const userDB = new UserDB();
userDB.connect();

const users = await userDB.getUsers();
console.log(users);