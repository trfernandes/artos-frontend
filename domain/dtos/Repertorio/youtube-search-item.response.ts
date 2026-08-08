export type ResponseYoutubeSearchItemDto = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt?: string | null;
  watchUrl: string;
};
