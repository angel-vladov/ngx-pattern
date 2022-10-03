# ngx-pattern
![ngx-pattern](https://img.shields.io/badge/ngx--pattern-1.0.0-brightgreen.svg)
[![License](http://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)

`ngx-pattern` is a small directive you can use to filter allowed input with regular expressions.

Check **[examples here](https://git.io/JeCwF)**.

### Installation

To use **ngx-pattern** in your project install it via:

* NPM
    ```sh
    npm install ngx-pattern --save
    ```

* Yarn
    ```sh
    yarn add ngx-pattern
    ```
  
After installing, include `NgxPatternModule` in your application module like:
  
```ts
  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { NgxDatatableModule } from 'ngx-pattern';

  import { AppComponent } from './app.component';

  @NgModule({
    declarations: [AppComponent],
    imports: [NgxPattern, BrowserModule],
    bootstrap: [AppComponent]
  })
  export class AppModule { }
```

# Usage

* You can set up the pattern using a string

    ```html
    <input type="text" [(ngModel)]="lowerCaseText" ngxPattern="[a-z]*">
    <input type="text" [(ngModel)]="lowerCaseText" [ngxPattern]="'[a-z]*'">
    ```
 
* Or a RegEx

    ```html
    numbersOnly = /^[0-9]*$/;
  
    ...
  
    <input type="text" [ngxPattern]="numbersOnly">
    ```

## FAQ

#### Working on an older pre Angular 9 app or not using Ivy?

Switch to version `0.2.1`

Versions prior to `1.0.0` are compiled to work with the legacy ViewEngine 

#### Changelog

##### 1.0.0
* Changed supported Angular versions to `9+`
* Update incorrect keydown handling of special keys
* Improved unit tests coverage
* Project switched to `strict` mode

##### 0.2.1
* Support for Angular 12
* Working detection on Android mobile browser

##### 0.1.3
* support for Angular 10 and 11

##### 0.1.2
* updated readme

##### 0.1.0
* string and regex pattern support
