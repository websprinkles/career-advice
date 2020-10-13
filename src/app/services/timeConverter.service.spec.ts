/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TimeConverterService } from './timeConverter.service';

describe('Service: TimeConverter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeConverterService]
    });
  });

  it('should ...', inject([TimeConverterService], (service: TimeConverterService) => {
    expect(service).toBeTruthy();
  }));
});
