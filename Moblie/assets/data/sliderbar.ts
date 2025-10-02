export type SliderItem = {
    id: string;
    title: string;
    src: any;
}

export const SLIDER_ITEMS: SliderItem[] = [
  {
    id: '1',
    title: 'Sản phẩm 1',
    src: require('@/assets/images/banner1.jpg'),
  },
  {
    id: '2',
    title: 'Sản phẩm 2',
    src: require('@/assets/images/banner2.jpg'),
  },
  {
    id: '3',
    title: 'Sản phẩm 3',
    src: require('@/assets/images/banner3.jpg'),
  },
];
