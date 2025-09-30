import { TestBed } from '@angular/core/testing';

import { Pushlocal } from './pushlocal';

describe('Pushlocal', () => {
  let service: Pushlocal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pushlocal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
