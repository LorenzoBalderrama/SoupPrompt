/**
 * @file Defines a static utility class for parsing and manipulating prompt templates.
 * @author TheCodingSoup
 * @license MIT
 */

import { PromptRenderInput } from './PromptModule';

/**
 * Defines the syntax for template placeholders.
 * The default is `{{variable}}`.
 */
export type PlaceholderSyntax = [string, string]; // e.g., ['{{', '}}']

/**
 * Provides static methods for parsing and manipulating prompt template strings.
 * This class centralizes all template-related logic, making it easy to
 * maintain and extend with more complex features like different placeholder
 * syntaxes or inline functions.
 */
export class TemplateParser {
  /**
   * The default regular expression for finding `{{variable}}` style placeholders.
   * It looks for two curly braces, followed by one or more word characters
   * (letters, numbers, underscore), and then two closing curly braces.
   */
  private static readonly DEFAULT_MUSTACHE_REGEX = /\{\{(\w+)\}\}/g;

  /**
   * Extracts all unique variable names from a given template string.
   *
   * @param template - The template string to parse.
   * @param regex - An optional custom regular expression for finding variables.
   * If not provided, the default `{{variable}}` syntax is used.
   * @returns An array of unique variable names found in the template.
   */
  public static extractVariables(template: string, regex: RegExp = this.DEFAULT_MUSTACHE_REGEX): string[] {
    const matches = template.match(regex);
    if (!matches) {
      return [];
    }
    // The `g` flag in the regex returns the full match (e.g., `{{name}}`).
    // We need to extract the group inside (the variable name itself).
    // A new regex without the 'g' flag is used to capture groups for each match.
    const variableExtractor = new RegExp(regex.source);
    const variables = matches.map(match => {
        const result = variableExtractor.exec(match);
        return result ? result[1] : ''; // result[1] is the first captured group
    }).filter(Boolean); // Filter out any empty strings

    return Array.from(new Set(variables));
  }

  /**
   * Renders a template by substituting variables with provided input values.
   *
   * @param template - The template string with placeholders.
   * @param input - An object where keys match variable names and values are their replacements.
   * @param requiredVariables - A set of variable names that must be present in the input.
   * @param regex - An optional custom regular expression for finding variables.
   * @returns The rendered string with all placeholders replaced.
   * @throws {Error} If a required variable is missing from the input object.
   */
  public static render(
    template: string,
    input: PromptRenderInput,
    requiredVariables: Set<string>,
    regex: RegExp = this.DEFAULT_MUSTACHE_REGEX
  ): string {
    let renderedText = template;

    for (const variable of requiredVariables) {
      const value = input[variable];
      if (value === undefined || value === null) {
        throw new Error(`Missing required variable for rendering: "${variable}"`);
      }

      // We need a specific regex for each variable to replace it globally.
      // Rebuilding the regex source to target a specific variable.
      const singleVarRegex = new RegExp(regex.source.replace('\\w+', variable), 'g');
      renderedText = renderedText.replace(singleVarRegex, String(value));
    }
    return renderedText;
  }

  /**
   * Validates the syntax of a template.
   *
   * @param template - The template string to validate.
   * @throws {Error} If the template contains syntactically invalid elements,
   * such as empty `{{}}` placeholders.
   */
  public static validate(template: string): void {
    // This regex looks for placeholders that are empty or contain only whitespace.
    const emptyPlaceholderRegex = /\{\{\s*\}\}/g;
    if (emptyPlaceholderRegex.test(template)) {
        throw new Error('Invalid template: Contains an empty or whitespace-only placeholder `{{}}`.');
    }

    // Future validation logic can be added here, e.g., checking for mismatched brackets.
  }
}
