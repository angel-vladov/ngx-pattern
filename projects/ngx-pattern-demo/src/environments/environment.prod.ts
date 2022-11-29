import packageJson from '../../../ngx-pattern/package.json';

export const environment = {
  production: true,
  version: packageJson.version as string,
};
