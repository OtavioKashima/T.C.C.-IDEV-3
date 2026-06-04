import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostagemPage } from './postagem.page';

describe('PostagemPage', () => {
  let component: PostagemPage;
  let fixture: ComponentFixture<PostagemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PostagemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});