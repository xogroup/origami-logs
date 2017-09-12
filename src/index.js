/**
 * Constructor for Greetings object.
 *
 * @class Greetings
 */
class Greetings {
  /**
   * Pre-defined greeting text.
   *
   * @readonly
   * @static
   * @returns {string} Pre-defined greeting text.
   *
   * @memberOf Greetings
   */
  static get greetingText() {
    return 'Hello World from github_changelog_generator!';
  }

  /**
   * Return greeting text that is pre-defined in the Greeting class.
   *
   * @static
   * @returns {string} Returns pre-defined text within the class.
   *
   * @memberOf Grettings
   */
  static init() {
    return Greetings.greetingText;
  }
}

module.exports = Greetings.init;
