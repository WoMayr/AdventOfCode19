export interface MemoizedPath {
    from: [number, number];
    to: [number, number];
    key: string;
    steps: number;
    requiredKeys: string[];
}