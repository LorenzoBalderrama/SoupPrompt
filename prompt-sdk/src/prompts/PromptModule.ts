/**
 * @file Defines the core PromptModule class for creating, managing,
 * and rendering individual, reusable prompt components.
 * @author TheCodingSoup
 * @license MIT
 */


export interface PromptMetadata {
    name: string;
    description?: string;
    tags?: string[];
    version?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }
  
  /**
   * Defines the structure for the input data used to render a prompt.
   * It's a key-value map where the key is the variable name.
   */
  export interface PromptRenderInput {
    [key: string]: string | number | boolean;
  }
  
  /**
   * Configuration options for creating a new PromptModule instance.
   */
  export interface PromptModuleOptions {
    /** The text template containing placeholders in the format `{{variable}}`. */
    template: string;
    /** Optional metadata to describe and categorize the prompt. */
    metadata?: PromptMetadata;
  }
  
  /**
   * Represents a single, reusable prompt component.
   * It encapsulates a template, its variables, and metadata, providing
   * methods for rendering and validation.
   */
  export class PromptModule {
    /** The text template with `{{variable}}` placeholders. */
    public readonly template: string;
    /** Optional metadata associated with the prompt. */
    public readonly metadata: PromptMetadata;
    /** A set of variable names extracted from the template. */
    private readonly requiredVariables: Set<string>;
  
    /**
     * Constructs a new PromptModule instance.
     * @param options - The configuration options for the prompt module.
     */
    constructor(options: PromptModuleOptions) {
      if (!options.template) {
        throw new Error("PromptModule constructor requires a non-empty template.");
      }
  
      this.template = options.template;
      this.metadata = options.metadata || { name: 'Untitled Prompt' };
      this.requiredVariables = new Set(this.extractVariables(this.template));
  
      // Perform an initial validation on creation.
      this.validate();
    }
  
    /**
     * Renders the prompt template by substituting placeholders with provided input values.
     * @param input - An object where keys match the variable names in the template.
     * @returns The rendered prompt string with all variables replaced.
     * @throws {Error} If a required variable is not provided in the input.
     */
    public render(input: PromptRenderInput): string {
      let renderedText = this.template;
  
      for (const variable of this.requiredVariables) {
        const value = input[variable];
  
        if (value === undefined || value === null) {
          throw new Error(`Missing required variable for rendering: "${variable}"`);
        }
  
        // Using a global regex to replace all occurrences of the placeholder.
        const placeholder = new RegExp(`{{${variable}}}`, 'g');
        renderedText = renderedText.replace(placeholder, String(value));
      }
  
      return renderedText;
    }
  
    /**
     * Validates the integrity of the prompt module.
     * It checks for inconsistencies, such as empty placeholders.
     * @throws {Error} If the template contains invalid placeholders (e.g., `{{}}`).
     */
    public validate(): void {
      const placeholders = this.template.match(/\{\{.*?\}\}/g) || [];
      for (const p of placeholders) {
          // This regex finds placeholders that are empty, e.g., {{}} or {{  }}
          if (/\{\{\s*\}\}/.test(p)) {
              throw new Error(`Invalid template: Contains an empty placeholder "{{}}".`);
          }
      }
    }
  
    /**
     * Returns an array of the required variable names for this prompt.
     * @returns An array of strings representing the variable names.
     */
    public getRequiredVariables(): string[] {
      return Array.from(this.requiredVariables);
    }
  
    /**
     * Extracts variable names from a template string.
     * @param template - The template string with `{{variable}}` placeholders.
     * @returns An array of unique variable names found in the template.
     */
    private extractVariables(template: string): string[] {
      // This regex matches any word characters inside `{{...}}`.
      const matches = template.match(/\{\{(\w+)\}\}/g);
      if (!matches) {
        return [];
      }
      // Cleans the `{{` and `}}` characters to get the variable name.
      const variables = matches.map(match => match.substring(2, match.length - 2));
      // Return a unique set of variables.
      return Array.from(new Set(variables));
    }
  }
  