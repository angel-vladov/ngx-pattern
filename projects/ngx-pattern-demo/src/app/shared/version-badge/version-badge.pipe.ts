import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'versionBadge'
})
export class VersionBadgePipe implements PipeTransform {
  readonly color = 'lightgrey';

  transform(version: string): string {
    return version ?
      `https://img.shields.io/badge/ngx--pattern-${version}-${this.color}.svg` :
      `https://img.shields.io/badge/ngx--pattern-${this.color}.svg`;
  }

}
