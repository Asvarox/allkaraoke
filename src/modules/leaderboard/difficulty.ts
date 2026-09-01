const difficultyNames = ['Hard', 'Medium', 'Easy'];

/** `tolerance` on a sing setup is 1-based; anything outside the shipped range renders as nothing. */
export const difficultyName = (tolerance: number) => difficultyNames[tolerance - 1];
