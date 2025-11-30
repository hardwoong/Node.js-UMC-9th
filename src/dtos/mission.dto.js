export const bodyToMission = (body) => {
  return {
    storeId: parseInt(body.storeId),
    region: body.region,
    missionMoney: parseInt(body.missionMoney),
    missionPoint: parseInt(body.missionPoint)
  };
};

export const responseFromMission = (mission) => {
  return {
    missionId: mission.missionId,
    storeId: mission.storeId,
    region: mission.region,
    missionMoney: mission.missionMoney,
    missionPoint: mission.missionPoint,
    createdAt: mission.createdAt
  };
};

export const bodyToMissionSuccess = (body) => {
  return {
    challengeMissionId: parseInt(body.challengeMissionId)
  };
};

export const responseFromMissionSuccess = (verificationCode) => {
  return {
    verificationCode: verificationCode
  };
};

export const responseFromMyOngoingMissions = (userMissions, nextCursor) => {
  return {
    missions: userMissions.map(userMission => ({
      challengeMissionId: userMission.challengeMissionId,
      missionId: userMission.missionId,
      storeName: userMission.storeName,
      storeAddress: userMission.storeAddress,
      region: userMission.region,
      missionMoney: userMission.missionMoney,
      missionPoint: userMission.missionPoint,
      status: userMission.status,
      createdAt: userMission.createdAt
    })),
    pagination: {
      cursor: nextCursor
    }
  };
};

export const responseFromStoreMissions = (missions, nextCursor) => {
  return {
    missions: missions.map(mission => ({
      missionId: mission.missionId,
      storeName: mission.storeName,
      storeAddress: mission.storeAddress,
      region: mission.region,
      missionMoney: mission.missionMoney,
      missionPoint: mission.missionPoint,
      createdAt: mission.createdAt
    })),
    pagination: {
      cursor: nextCursor
    }
  };
};