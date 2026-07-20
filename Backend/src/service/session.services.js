import * as sessionRepository from "../repositories/session.repository.js";

export const createSession = async (userId, storeId) => {
  return await sessionRepository.create(userId, storeId);
};

export const findSession = async (sessionId) => {
  return await sessionRepository.findSessionById(sessionId);
};

export const revokeActiveSession = async (userId, storeId) => {
  return await sessionRepository.revokeActiveSession(userId, storeId);
};

export const revokeSession = async(sessionId)=>{
    return await sessionRepository.revokeSession(sessionId)
}

export const updateRefreshToken = async(sessionId, refreshToken)=>{
  return await sessionRepository.updateRefreshToken(sessionId, refreshToken);
}