/**
 * @file Defines the PromptGroup class for composing multiple PromptModules.
 * @author TheCodingSoup
 * @license MIT
 */

import {
    PromptModule,
    PromptMetadata,
    PromptRenderInput,
  } from './PromptModule';
  
  /**
   * Represents a collection of named PromptModule instances.
   *
   * This class acts as a container to organize, manage, and render
   * related prompts, such as a chain of prompts for a multi-step task
   * or a set of variants for A/B testing.
   */
  export class PromptGroup {
    /** The name of the prompt group, used for identification. */
    public readonly name: string;
    /** Metadata associated with the prompt group. */
    public readonly metadata: PromptMetadata;
    /** A map of prompt modules, keyed by their metadata name. */
    private readonly modules: Map<string, PromptModule>;
  
    /**
     * Constructs a new PromptGroup instance.
     * @param name - A unique identifier for the group.
     * @param modules - An optional initial array of PromptModule instances to add.
     */
    constructor(name: string, modules: PromptModule[] = []) {
      if (!name || typeof name !== 'string') {
        throw new Error('PromptGroup constructor requires a non-empty string for a name.');
      }
      this.name = name;
      this.metadata = { name }; // Use the group name as the default metadata name
      this.modules = new Map<string, PromptModule>();
  
      for (const module of modules) {
        this.add(module);
      }
    }
  
    /**
     * Adds a PromptModule to the group. The module is keyed by its metadata name.
     * @param module - The PromptModule instance to add.
     * @throws {Error} If a module with the same name already exists in the group.
     * @throws {Error} If the module does not have a name in its metadata.
     */
    public add(module: PromptModule): void {
      const moduleName = module.metadata?.name;
      if (!moduleName) {
        throw new Error('Cannot add a PromptModule without a "name" property in its metadata.');
      }
      if (this.modules.has(moduleName)) {
        throw new Error(`A PromptModule with the name "${moduleName}" already exists in the group "${this.name}".`);
      }
      this.modules.set(moduleName, module);
    }
  
    /**
     * Retrieves a PromptModule from the group by its name.
     * @param moduleName - The name of the module to retrieve.
     * @returns The PromptModule instance, or undefined if it's not found.
     */
    public get(moduleName: string): PromptModule | undefined {
      return this.modules.get(moduleName);
    }
  
    /**
     * Checks if a module with the given name exists in the group.
     * @param moduleName - The name of the module to check.
     * @returns True if the module exists, false otherwise.
     */
    public has(moduleName: string): boolean {
      return this.modules.has(moduleName);
    }
  
    /**
     * Renders a specific prompt within the group by its name. This is a
     * convenience method that finds and renders a module in one step.
     * @param moduleName - The name of the prompt module to render.
     * @param input - The input data for rendering the prompt.
     * @returns The rendered prompt string.
     * @throws {Error} If the specified module is not found in the group.
     */
    public render(moduleName: string, input: PromptRenderInput): string {
      const module = this.get(moduleName);
      if (!module) {
        throw new Error(`Module "${moduleName}" not found in PromptGroup "${this.name}".`);
      }
      return module.render(input);
    }
  
    /**
     * Returns an array of the names of all modules currently in this group.
     * @returns An array of string names.
     */
    public listModules(): string[] {
      return Array.from(this.modules.keys());
    }
  
    /**
     * Validates all modules within the group by calling their individual
     * `validate` methods. This is useful for ensuring the integrity of the
     * entire prompt collection.
     * @throws {Error} If any module in the group fails its validation check.
     */
    public validateAll(): void {
      for (const [name, module] of this.modules) {
        try {
          module.validate();
        } catch (error) {
          const originalError = error instanceof Error ? error.message : String(error);
          throw new Error(`Validation failed for module "${name}" in group "${this.name}": ${originalError}`);
        }
      }
    }
  }
  