import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentManage } from './department-manage';

describe('DepartmentManage', () => {
  let component: DepartmentManage;
  let fixture: ComponentFixture<DepartmentManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentManage],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
