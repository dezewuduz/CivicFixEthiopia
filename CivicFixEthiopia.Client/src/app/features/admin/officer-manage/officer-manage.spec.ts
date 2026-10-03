import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficerManage } from './officer-manage';

describe('OfficerManage', () => {
  let component: OfficerManage;
  let fixture: ComponentFixture<OfficerManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerManage],
    }).compileComponents();

    fixture = TestBed.createComponent(OfficerManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
