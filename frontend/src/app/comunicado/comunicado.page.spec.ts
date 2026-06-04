import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunicadoPage } from './comunicado.page';

describe('ComunicadoPage', () => {
  let component: ComunicadoPage;
  let fixture: ComponentFixture<ComunicadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunicadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
