import { responseFromUserSignup, responseFromUserUpdate, bodyToUserUpdate } from "../dtos/user.dto.js";
import { addUser, getUserById, updateUser } from "../repositories/user.repository.js";

export const userSignup = async (data) => {
  const userId = await addUser(data);
  const user = await getUserById(userId);
  
  return responseFromUserSignup(user);
};

export const userUpdate = async (userId, data) => {
  const updateData = bodyToUserUpdate(data);
  const user = await updateUser(userId, updateData);
  
  return responseFromUserUpdate(user);
};
