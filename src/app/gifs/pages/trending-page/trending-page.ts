import { GifService } from './../../services/gif.service';
import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
// import { GifList } from '../../components/gif-list/gif-list';
import { ScrollStateSevice } from 'src/app/shared/services/scroll-state.service';

// const imageUrls: string[] = [
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-6.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-7.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-8.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-9.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-10.jpg',
//   'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-11.jpg',
// ];

@Component({
  selector: 'app-trending-page',
  // imports: [GifList],
  templateUrl: './trending-page.html',
})
export default class TrendingPage implements AfterViewInit {
  gifService = inject(GifService);
  scrollStateService = inject(ScrollStateSevice);

  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');

  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;

    scrollDiv.scrollTop = this.scrollStateService.trendingScrollState();
  }

  onScroll($event: Event) {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
    const scrollHeight = scrollDiv.scrollHeight;

    const isAtBottom = clientHeight + scrollTop + 300 >= scrollHeight;

    if (isAtBottom) {
      this.gifService.loadTreningGifs();
    }

    this.scrollStateService.trendingScrollState.set(scrollTop);

    console.log({
      scrollTop: scrollTop,
      clientHeight: clientHeight,
      scrollHeight: scrollHeight,
      scrollTotal: scrollTop + scrollHeight,
      isAtBottom: isAtBottom
    })
  }
}
