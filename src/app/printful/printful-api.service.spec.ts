import { TestBed } from '@angular/core/testing';

import { PrintfulAPIService } from './printful-api.service';

describe('PrintfulAPIService', () => {
  let service: PrintfulAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintfulAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
