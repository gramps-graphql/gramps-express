import GraphQLModel from '../../src/helpers/GraphQLModel';
import TestModel from '../fixtures/TestModel';

describe('GraphQLModel', () => {
  it('fails if instantiated directly', () => {
    const willThrow = () => new GraphQLModel({ connector: {} });
    expect(willThrow).toThrow(
      Error,
      'Cannot construct GraphQLModel classes directly',
    );
  });

  it('properly instantiates the model with a connector', () => {
    const tm = new TestModel({ connector: 'test connector' });

    expect(tm.connector).toBe('test connector');
  });
});
