import { prisma } from "../config/prisma.config.js";
import { InternalServerError } from "../errors/custom-error.js";

export const addStore = async (data) => {
  try {
    const store = await prisma.store.create({
      data: {
        storeName: data.storeName,
        storeAddress: data.storeAddress,
        storeType: data.storeType,
      }
    });

    return Number(store.storeId);
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`가게 추가 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const getStoreById = async (storeId) => {
  try {
    const store = await prisma.store.findUnique({
      where: { storeId: BigInt(storeId) }
    });

    if (!store) return null;

    return {
      ...store,
      storeId: Number(store.storeId),
      storeScore: store.storeScore ? parseFloat(store.storeScore) : null
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`가게 조회 중 오류가 발생했습니다: ${err.message}`);
  }
};
