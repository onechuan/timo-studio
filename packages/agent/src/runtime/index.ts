export interface BusinessTool {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
}
/** Pi adapter will receive only explicitly authorized project tools. */
export interface AgentRuntime {
  run(input: {
    projectId: string;
    instruction: string;
    tools: readonly BusinessTool[];
    signal: AbortSignal;
  }): Promise<{ summary: string }>;
}
