import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { map, tap } from 'rxjs';

import { Gif } from './../interfaces/gif.interface';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { GifMapper } from '../mapper/gif.mapper';

const loadFromLocalStorage = () => {
  const gifsFromLocalStorage = localStorage.getItem('gifs') ?? '{}';
  const gifs = JSON.parse(gifsFromLocalStorage) as Record<string, Gif[]>;
  return gifs;
};

@Injectable({
  providedIn: 'root',
})
export class GifService {
  private http = inject(HttpClient);
  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(false);
  private trendingPage = signal(0);

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];

    for (let i = 0; i < this.trendingGifs().length; i += 3) {
      groups.push(this.trendingGifs().slice(i, i + 3));
    }

    return groups;
  });

  constructor() {
    this.loadTreningGifs();
  }

  /**
   * Cada vez que se actualiza el signal de searhHistory(),
   * se ejecuta este efecto que almacena en localStorage el searchHitory()
   */
  saveGifsToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem('gifs', historyString);
  });

  loadTreningGifs() {

    if (this.trendingGifsLoading()) return;

    this.trendingGifsLoading.set(true);

    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.apiKey,
          limit: 20,
          offset: this.trendingPage() * 20
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.update(currentGifs => [
          ...currentGifs,
          ...gifs
        ]);
        this.trendingPage.update(currentPage => currentPage + 1)
        this.trendingGifsLoading.set(false);
      });
  }

  searchGifs(query: string) {
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: {
          api_key: environment.apiKey,
          limit: 20,
          q: query,
        },
      })
      .pipe(
        map(({ data }) => data),
        map((items) => GifMapper.mapGiphyItemsToGifArray(items)),

        // Historial
        tap((items) => {
          this.searchHistory.update((history) => ({
            ...history,
            [query.toLocaleLowerCase()]: items,
          }));
        }),
      );
    // .subscribe((resp) => {
    //   const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
    //   this.searchedGifs.set(gifs);
    // })
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }
}
