import { UserDataAccess } from "@/model/User.mjs";
import { logger } from "@/log/Logger.mjs";
import { PasswordHasher } from "@/util/PasswordHasher.mjs";

export async function createDefaultAdmin() {
  const loggerContext = "CreateDefaultAdmin";
  const userDAO = UserDataAccess.getInstance();
  const passwordHasher = new PasswordHasher({});

  try {
    const adminExists = await userDAO.findByUsername({ username: "esnadmin" });
    if (adminExists) {
      logger.info({ context: loggerContext }, "Admin user already exists.");
      return;
    }

    // Create admin user
    await userDAO.create({
      username: "esnadmin",
      password: await passwordHasher.hash("admin"),
      status: "OK",
      isOnline: false,
      privilege: "administrator"
    });

    logger.info({ context: loggerContext }, "Default admin user created.");
  } catch (error) {
    logger.error(
      { context: loggerContext },
      `Error creating default admin user: ${error.message}`
    );
  }
}
