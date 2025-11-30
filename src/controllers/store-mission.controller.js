import { StatusCodes } from "http-status-codes";
import { getStoreMissionList } from "../services/store-mission.service.js";

export const handleGetStoreMissions = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const cursor = req.query.cursor;

    const result = await getStoreMissionList(storeId, cursor);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.missions,
      pagination: result.pagination
    });
  } catch (err) {
    console.error("가게 미션 목록 조회 실패:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message
    });
  }
};