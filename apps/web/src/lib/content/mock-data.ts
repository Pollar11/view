import type { Section, Video } from "@/lib/types";

/**
 * Built-in demo content so `npm run dev` works with zero config.
 * All clips are Google's public sample HLS/MP4 assets — no ads, no trackers.
 */
export const MOCK_SECTIONS: Section[] = [
  { slug: "featured", title: "Featured", order: 0, layout: "rail" },
  { slug: "films", title: "Short Films", order: 1, layout: "rail" },
  { slug: "nature", title: "Nature", order: 2, layout: "grid" },
  { slug: "tech", title: "Technology", order: 3, layout: "rail" },
];

const HLS =
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function mp4(name: string) {
  return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}`;
}
function poster(name: string) {
  return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/${name}`;
}

export const MOCK_VIDEOS: Video[] = [
  {
    id: "big-buck-bunny",
    slug: "big-buck-bunny",
    title: "Big Buck Bunny",
    description:
      "<p>A large and lovable rabbit deals with three tiny bullies in this open-source animated short by the Blender Foundation.</p>",
    thumbnail: poster("BigBuckBunny.jpg"),
    sources: [
      { url: HLS, type: "application/x-mpegURL", label: "Auto (HLS)" },
      { url: mp4("BigBuckBunny.mp4"), type: "video/mp4", label: "720p" },
    ],
    durationSeconds: 596,
    publishedAt: "2024-11-02T00:00:00.000Z",
    views: 128394,
    sections: ["featured", "films"],
    tags: ["animation", "blender"],
  },
  {
    id: "elephants-dream",
    slug: "elephants-dream",
    title: "Elephants Dream",
    description:
      "<p>The world's first open movie — two strange characters explore a capricious and seemingly infinite machine.</p>",
    thumbnail: poster("ElephantsDream.jpg"),
    sources: [{ url: mp4("ElephantsDream.mp4"), type: "video/mp4" }],
    durationSeconds: 653,
    publishedAt: "2024-10-18T00:00:00.000Z",
    views: 88214,
    sections: ["featured", "films"],
    tags: ["animation"],
  },
  {
    id: "for-bigger-blazes",
    slug: "for-bigger-blazes",
    title: "For Bigger Blazes",
    description: "<p>A short promotional clip demonstrating HD playback.</p>",
    thumbnail: poster("ForBiggerBlazes.jpg"),
    sources: [{ url: mp4("ForBiggerBlazes.mp4"), type: "video/mp4" }],
    durationSeconds: 15,
    publishedAt: "2024-09-30T00:00:00.000Z",
    views: 20481,
    sections: ["tech"],
    tags: ["demo"],
  },
  {
    id: "for-bigger-escapes",
    slug: "for-bigger-escapes",
    title: "For Bigger Escapes",
    description: "<p>Clean-room sample footage for testing adaptive playback.</p>",
    thumbnail: poster("ForBiggerEscapes.jpg"),
    sources: [{ url: mp4("ForBiggerEscapes.mp4"), type: "video/mp4" }],
    durationSeconds: 15,
    publishedAt: "2024-09-14T00:00:00.000Z",
    views: 15903,
    sections: ["tech", "nature"],
  },
  {
    id: "for-bigger-fun",
    slug: "for-bigger-fun",
    title: "For Bigger Fun",
    description: "<p>Sample footage.</p>",
    thumbnail: poster("ForBiggerFun.jpg"),
    sources: [{ url: mp4("ForBiggerFun.mp4"), type: "video/mp4" }],
    durationSeconds: 60,
    publishedAt: "2024-08-22T00:00:00.000Z",
    views: 33120,
    sections: ["tech"],
  },
  {
    id: "for-bigger-joyrides",
    slug: "for-bigger-joyrides",
    title: "For Bigger Joyrides",
    description: "<p>Sample footage.</p>",
    thumbnail: poster("ForBiggerJoyrides.jpg"),
    sources: [{ url: mp4("ForBiggerJoyrides.mp4"), type: "video/mp4" }],
    durationSeconds: 15,
    publishedAt: "2024-08-01T00:00:00.000Z",
    views: 41022,
    sections: ["featured", "tech"],
  },
  {
    id: "sintel",
    slug: "sintel",
    title: "Sintel",
    description:
      "<p>A lonely young woman befriends and raises a baby dragon in this Durian open movie project.</p>",
    thumbnail: poster("Sintel.jpg"),
    sources: [{ url: mp4("Sintel.mp4"), type: "video/mp4" }],
    durationSeconds: 888,
    publishedAt: "2024-07-11T00:00:00.000Z",
    views: 210554,
    sections: ["featured", "films", "nature"],
    tags: ["animation"],
  },
  {
    id: "tears-of-steel",
    slug: "tears-of-steel",
    title: "Tears of Steel",
    description:
      "<p>A group of warriors and scientists gather to stop an army of robots — the Mango open movie project.</p>",
    thumbnail: poster("TearsOfSteel.jpg"),
    sources: [{ url: mp4("TearsOfSteel.mp4"), type: "video/mp4" }],
    durationSeconds: 734,
    publishedAt: "2024-06-25T00:00:00.000Z",
    views: 176300,
    sections: ["films", "tech"],
    tags: ["sci-fi"],
  },
  {
    id: "subaru-outback",
    slug: "subaru-outback-on-street-and-dirt",
    title: "Subaru Outback On Street And Dirt",
    description: "<p>Sample footage.</p>",
    thumbnail: poster("SubaruOutbackOnStreetAndDirt.jpg"),
    sources: [
      { url: mp4("SubaruOutbackOnStreetAndDirt.mp4"), type: "video/mp4" },
    ],
    durationSeconds: 30,
    publishedAt: "2024-05-19T00:00:00.000Z",
    views: 9210,
    sections: ["nature"],
  },
  {
    id: "volkswagen-gti-review",
    slug: "volkswagen-gti-review",
    title: "Volkswagen GTI Review",
    description: "<p>Sample footage.</p>",
    thumbnail: poster("VolkswagenGTIReview.jpg"),
    sources: [{ url: mp4("VolkswagenGTIReview.mp4"), type: "video/mp4" }],
    durationSeconds: 30,
    publishedAt: "2024-04-30T00:00:00.000Z",
    views: 12750,
    sections: ["tech"],
  },
  {
    id: "we-are-going-on-bullrun",
    slug: "we-are-going-on-bullrun",
    title: "We Are Going On Bullrun",
    description: "<p>Sample footage.</p>",
    thumbnail: poster("WeAreGoingOnBullrun.jpg"),
    sources: [{ url: mp4("WeAreGoingOnBullrun.mp4"), type: "video/mp4" }],
    durationSeconds: 47,
    publishedAt: "2024-03-28T00:00:00.000Z",
    views: 8800,
    sections: ["nature"],
  },
  {
    id: "what-car-can-you-get",
    slug: "what-car-can-you-get-for-a-grand",
    title: "What Car Can You Get For A Grand?",
    description: "<p>Sample footage.</p>",
    thumbnail: poster("WhatCarCanYouGetForAGrand.jpg"),
    sources: [{ url: mp4("WhatCarCanYouGetForAGrand.mp4"), type: "video/mp4" }],
    durationSeconds: 60,
    publishedAt: "2024-02-15T00:00:00.000Z",
    views: 19004,
    sections: ["nature", "tech"],
  },
];
