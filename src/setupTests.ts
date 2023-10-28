import { vitest } from 'vitest';

/// extend vitest with testing library
import '@testing-library/jest-dom';

vitest.mock('aubiojs');
