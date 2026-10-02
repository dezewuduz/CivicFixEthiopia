import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentDashboard } from './department-dashboard';

describe('DepartmentDashboard', () => {
  let component: DepartmentDashboard;
  let fixture: ComponentFixture<DepartmentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
