<<<<<<< Updated upstream
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
=======
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
>>>>>>> Stashed changes
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
