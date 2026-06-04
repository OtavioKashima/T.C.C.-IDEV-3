import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DenunciasPage } from './denuncias.page';

describe('DenunciasPage', () => {
  let component: DenunciasPage;
  let fixture: ComponentFixture<DenunciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DenunciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
