export interface StoryboardIssue { level: 'red' | 'yellow'; page?: string; beat?: number; msg: string }
export declare function lintStoryboard(sb: unknown, opts?: { source?: string }): StoryboardIssue[];
