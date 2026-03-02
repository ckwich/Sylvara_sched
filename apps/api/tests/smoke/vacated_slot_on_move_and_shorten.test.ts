import { describe, test } from 'vitest';

describe('A9 vacated slot on move and shorten', () => {
  test.todo('Move segment 09:00-13:00 to 12:00-16:00 and assert VacatedSlot(MOVED) covers old window.');
  test.todo('Shorten segment 09:00-13:00 to 09:00-12:00 and assert VacatedSlot(SHORTENED) for 12:00-13:00.');
});
