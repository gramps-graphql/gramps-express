export default {
  queryResolvers: {
    ExternalTwo: (_, { bar }, context) =>
      new Promise((resolve, reject) => {
        context.ExternalTwo.getDataById(bar).then(resolve).catch(reject);
      }),
  },
  dataResolvers: {},
  /* no mock resolvers so we can test that use case */
};
