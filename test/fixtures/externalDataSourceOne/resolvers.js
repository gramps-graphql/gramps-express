export default {
  queryResolvers: {
    ExternalOne: (_, { foo }, context) =>
      new Promise((resolve, reject) => {
        context.ExternalOne.getDataById(foo).then(resolve).catch(reject);
      }),
  },
  dataResolvers: {},
  mockResolvers: {
    ExternalOne: () => ({
      id: 1234,
      name: 'John Doe',
    }),
  },
};
