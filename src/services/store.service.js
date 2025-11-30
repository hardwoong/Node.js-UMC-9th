import { responseFromStore } from "../dtos/store.dto.js";
import { addStore, getStoreById } from "../repositories/store.repository.js";

export const storeAdd = async (data) => {
  const storeId = await addStore(data);
  const store = await getStoreById(storeId);
  
  return responseFromStore(store);
};
