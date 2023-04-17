import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async () => {
  await execAsync('pnpm prisma migrate reset --force --skip-generate');
};
