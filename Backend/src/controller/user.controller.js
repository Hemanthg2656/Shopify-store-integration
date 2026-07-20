import {
  updateUserSchema,
} from "../validators/user.validation.js";

import * as userService from "../service/user.services.js";

export const getAllUsers = async (req, res) => {
  try {
    const queryResult = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      usersCount: queryResult.rowCount,
      users: queryResult.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const queryResult = await userService.getUserById(userId);

    if (queryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: queryResult.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const queryResult = await userService.updateUser(
      req.params.userId,
      validationResult.data
    );

    if (queryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: queryResult.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const queryResult = await userService.deleteUser(userId);

    if (queryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: queryResult.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};