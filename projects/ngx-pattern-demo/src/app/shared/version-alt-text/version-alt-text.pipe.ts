import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'versionAltText'
})
export class VersionAltTextPipe implements PipeTransform {
  private readonly appName = 'ngx-pattern';

  transform(version: string): string {
    return version ? `${this.appName} ${version}` : this.appName;
  }
}
