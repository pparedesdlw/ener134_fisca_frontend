import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { InfoTecnicaCierreResponse } from '../../models/cit.model';

@Component({
  selector: 'app-info-tecnica-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatDividerModule],
  templateUrl: './info-tecnica-panel.component.html',
  styleUrl: './info-tecnica-panel.component.scss'
})
export class InfoTecnicaPanelComponent {
  @Input() data!: InfoTecnicaCierreResponse;
}
