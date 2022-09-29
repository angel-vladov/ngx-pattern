import { NgxPatternDirective } from './ngx-pattern.directive';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({template: `<input type="text" [ngxPattern]="pattern">`})
class TestNgxPatternComponent {
  @ViewChild(NgxPatternDirective) directive!: NgxPatternDirective;
  pattern?: RegExp | string;
}

describe('NgxPatternDirective', () => {
  let component!: TestNgxPatternComponent;
  let directive!: NgxPatternDirective;
  let fixture!: ComponentFixture<TestNgxPatternComponent>;
  let inputDebugEl!: DebugElement;
  let inputNativeEl!: HTMLInputElement;

  function sendEventToInput(event: Event, options: {delta: string, when: 'beforeEvent' | 'afterEvent' | 'ignore'}): Promise<unknown> {
    if (options.when === 'beforeEvent') {
      inputNativeEl.value += options.delta;
    }

    const cancelled = !inputNativeEl.dispatchEvent(event);
    fixture.detectChanges();

    if (!cancelled && options.when === 'afterEvent') {
      inputNativeEl.value = inputNativeEl.value + options.delta;
    }

    fixture.detectChanges();
    return fixture.whenStable();
  }

  function keyboardEvent(type: string, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent(type, {key, ctrlKey: false, cancelable: true, ...init});
    spyOn(event, 'preventDefault').and.callThrough();
    return event;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestNgxPatternComponent, NgxPatternDirective]
    });

    fixture = TestBed.createComponent(TestNgxPatternComponent);
    component = fixture.componentInstance;
    inputDebugEl = fixture.debugElement.query(By.css('input'));
    inputNativeEl = inputDebugEl.nativeElement;
    fixture.detectChanges();
    directive = component.directive;
  });

  it('should create an instance', () => {
    expect(component.directive).toBeTruthy();
  });

  it('reads current value', () => {
    const value = Math.random().toString();
    inputDebugEl.nativeElement.value = value;
    fixture.detectChanges();
    expect(directive.currentValue).toEqual(value);
  });

  it('converts strings to RegEx', () => {
    const pattern = '(?:[a-z]-?)*';
    component.pattern = pattern;
    fixture.detectChanges();
    expect(directive.regExPattern).not.toBeUndefined();
    expect(directive.regExPattern?.source).toEqual(`^${pattern}$`);
    expect(directive.regExPattern?.flags).toEqual('g');
  });

  it('keeps regex as is without modifying them', () => {
    const regex = /^[0-9]*$/;
    component.pattern = regex;
    fixture.detectChanges();
    expect(directive.regExPattern).toEqual(regex);
  });

  it('preserves only allowed characters on keydown', async () => {
    component.pattern = /^[0-9]*$/;
    fixture.detectChanges();

    const validEvent = keyboardEvent('keydown', '1');
    await sendEventToInput(validEvent, {delta: validEvent.key, when: 'afterEvent'});
    expect(validEvent.preventDefault).not.toHaveBeenCalled();
    expect(inputNativeEl.value).toEqual(validEvent.key);

    const valueBefore = inputNativeEl.value;
    const invalidEvent = keyboardEvent('keydown', 'b');
    await sendEventToInput(invalidEvent, {delta: invalidEvent.key, when: 'afterEvent'});
    expect(invalidEvent.preventDefault).toHaveBeenCalled();
    expect(inputNativeEl.value).toEqual(valueBefore);
  });

  // See https://developer.mozilla.org/bg/docs/Web/API/KeyboardEvent/key/Key_Values
  it('ignores special characters on keydown', async () => {
    component.pattern = /^[0-9]*$/;
    fixture.detectChanges();

    inputNativeEl.value = (Math.ceil(Math.random() * 1000)).toString();
    fixture.detectChanges();

    const specialKeyEvent = keyboardEvent('keydown', 'Hyper');
    await sendEventToInput(specialKeyEvent, {delta: '', when: 'ignore'});
    expect(specialKeyEvent.preventDefault).not.toHaveBeenCalled();

    const ctrlKeyEvent = keyboardEvent('keydown', '3', {ctrlKey: true});
    await sendEventToInput(specialKeyEvent, {delta: '', when: 'ignore'});
    expect(ctrlKeyEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('preserves only allowed characters on input and uses undo', async () => {
    const document = TestBed.inject(DOCUMENT);
    const execCommand = spyOn(document, 'execCommand').and.returnValue(true);

    component.pattern = /^[0-9]*$/;
    fixture.detectChanges();

    const validInput = '453';
    const validEvent = new InputEvent('input', {data: validInput, cancelable: true});
    await sendEventToInput(validEvent, {delta: validInput, when: 'beforeEvent'});
    expect(document.execCommand).not.toHaveBeenCalledWith('undo');
    expect(inputNativeEl.value).toEqual(validInput);
    execCommand.calls.reset();

    const invalidInput = 'ab34fds';
    const invalidEvent = new InputEvent('input', {data: invalidInput, cancelable: true});
    await sendEventToInput(invalidEvent, {delta: invalidInput, when: 'beforeEvent'});
    expect(document.execCommand).toHaveBeenCalledWith('undo');
  });

  it('preserves only allowed characters on paste', () => {

  });

  it('ignores paste event if clipboard data is missing', async () => {
    component.pattern = /^[0-9]*$/;
    fixture.detectChanges();

    inputNativeEl.value = '123';
    fixture.detectChanges();

    const invalidEvent = new ClipboardEvent('paste');
    await sendEventToInput(invalidEvent, {delta: '456', when: 'ignore'});
    expect(invalidEvent.preventDefault).not.toHaveBeenCalled();
    expect(inputNativeEl.value).toEqual('123');
  });

  it('preserves only allowed characters on drag & drop', () => {

  });

});
