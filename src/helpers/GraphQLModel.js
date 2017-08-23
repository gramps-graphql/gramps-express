/**
 * An abstract class to lay groundwork for data models.
 */
export default class GraphQLModel {
  /**
   * Sets up required props for the class
   * @constructs GraphQLModel
   * @param  {object} config an object containing the connector instance
   */
  constructor({ connector }) {
    if (new.target === GraphQLModel) {
      throw new TypeError('Cannot construct GraphQLModel classes directly');
    }

    this.connector = connector;
  }
}
