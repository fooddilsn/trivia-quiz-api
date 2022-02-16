import { random } from '../../common/test';
import { AuthUser } from '../auth.interfaces';

export const mockAuthUser = (): AuthUser => ({
  id: random.id(),
  email: random.email(),
});
