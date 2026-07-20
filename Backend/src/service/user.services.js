import * as userRepository from "../repositories/user.repository.js";

export const getAllUsers = async () => {
  return await userRepository.findAll();
};

export const getUserById = async (userId) => {
  return await userRepository.findById(userId);
};

export const updateUser = async (userId, updates) => {
  return await userRepository.update(userId, updates);
};

export const deleteUser = async (userId) => {
  return await userRepository.remove(userId);
};