export const normalizeMongoDocument = (doc: any, ret: any): Record<string, unknown> => {
  const { _id, __v, ...rest } = ret;

  return {
    id: _id.toHexString(),
    ...rest,
  };
};
