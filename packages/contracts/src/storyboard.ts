export interface StoryboardScene {
  id: string;
  narration: string;
  visualPrompt: string;
  durationMs: number;
}
export interface Storyboard {
  projectId: string;
  scenes: StoryboardScene[];
}
