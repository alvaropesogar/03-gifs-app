import { Injectable, signal } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ScrollStateSevice {
    
    trendingScrollState = signal(0);
    
}