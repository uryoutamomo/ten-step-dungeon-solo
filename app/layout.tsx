import type { Metadata, Viewport } from 'next';
import './globals.css';
const origin='https://uryoutamomo.github.io/ten-step-dungeon-solo';
export const metadata:Metadata={title:'10歩ダンジョン ひとり旅',description:'剣・盾・魔法のカードを組み合わせて、10歩先の宝物へ。帰るまでが冒険の、スマホで遊べる一人用カードゲーム。',openGraph:{title:'10歩ダンジョン ひとり旅',description:'あと一歩、欲ばってみる？ 帰るまでが冒険だ。',images:[origin+'/og.png'],url:origin+'/'},twitter:{card:'summary_large_image',title:'10歩ダンジョン ひとり旅',images:[origin+'/og.png']}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#204b40'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ja"><body>{children}</body></html>}
