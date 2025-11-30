export const bodyToStore = (body) => {
  return {
    storeName: body.storeName,
    storeAddress: body.storeAddress,
    storeType: body.storeType,
    region: body.region
  };
};

export const responseFromStore = (store) => {
  return {
    storeId: store.store_id,
    storeName: store.store_name,
    storeAddress: store.store_address,
    storeType: store.store_type,
    storeScore: store.store_score,
    createdAt: store.created_at
  };
};
