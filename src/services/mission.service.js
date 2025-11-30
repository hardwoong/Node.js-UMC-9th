import { responseFromMission, responseFromStoreMissions, responseFromMyOngoingMissions, responseFromMissionSuccess } from "../dtos/mission.dto.js";
import {
  addMission,
  getMissionById,
  addUserMission,
  requestMissionSuccess,
  confirmMissionSuccess,
  getStoreMissions,
  getMyOngoingMissions
} from "../repositories/mission.repository.js";

export const missionAdd = async (data) => {
  const missionId = await addMission(data);
  const mission = await getMissionById(missionId);
  
  return responseFromMission(mission);
};

export const missionChallenge = async (data) => {
  const challengeMissionId = await addUserMission(data);
  
  return {
    challengeMissionId: challengeMissionId,
    message: "미션 도전이 시작되었습니다."
  };
};

export const missionSuccessRequest = async (data) => {
  const verificationCode = await requestMissionSuccess(data);
  return responseFromMissionSuccess(verificationCode);
};

export const missionSuccessConfirm = async (data) => {
  const result = await confirmMissionSuccess(data);
  return result;
};

export const getMyOngoingMissionList = async (userId, cursor) => {
  const result = await getMyOngoingMissions(userId, cursor);

  return responseFromMyOngoingMissions(result.missions, result.nextCursor);
};

export const getStoreMissionList = async (storeId, cursor) => {
  const result = await getStoreMissions(storeId, cursor);

  return responseFromStoreMissions(result.missions, result.nextCursor);
};
