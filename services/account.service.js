import bcrypt from 'bcryptjs';
import userModel from '../models/user.model.js';

const isAvailable = async (username) => {
    const user = await userModel.findByUsername(username);
    return !user;
};

const signup = async (data) => {
    const hashPassword = bcrypt.hashSync(data.password, 10);

    const user = {
        username: data.username,
        password: hashPassword,
        name: data.name,
        email: data.email,
        dob: data.birthdate,
        permission: 0,
    };

    await userModel.add(user);
};

const signin = async ({ username, password }) => {
    const user = await userModel.findByUsername(username);
    if (!user) return { success: false };

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return { success: false };

    return { success: true, user };
};

const updateProfile = async ({ id, name, email }) => {
    const user = {
        name,
        email,
    };
    await userModel.edit(id, user);
    return user;
};

const updatePassword = async ({ id, currentPassword, newPassword }, sessionUser) => {
    const match = bcrypt.compareSync(currentPassword, sessionUser.password);
    if (!match) return false;

    const hashPassword = bcrypt.hashSync(newPassword, 10);
    await userModel.edit(id, { password: hashPassword });

    sessionUser.password = hashPassword;
    return true;
};

export default {
    isAvailable,
    signup,
    signin,
    updateProfile,
    updatePassword
};
