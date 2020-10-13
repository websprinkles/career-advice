import { TestBed } from '@angular/core/testing';

import { DatabasefireService } from './databasefire.service';

describe('DatabasefireService', () => {
  let service: DatabasefireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabasefireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
