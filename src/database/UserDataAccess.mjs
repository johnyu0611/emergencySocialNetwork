import { UserModel } from "@/model/User.mjs";

class UserDataAccess {
    static instance = null;

    constructor() {
        if (UserDataAccess.instance) {
        return UserDataAccess.instance;
        }

        UserDataAccess.instance = this;
    }
    async createUser(user) {
        return await new UserModel(user).save();
    }

    async getUserByUsername(username) {
        return await UserModel.findOne(username);
    }

    async getUserOnline(username) {
        return await UserModel.findOneAndUpdate(username , { status: "online" });
    }

    async getUserOffline(username) {
        return await UserModel.findOneAndUpdate(username, { status: "offline" });
    }
}

export const userDAO = new UserDataAccess();