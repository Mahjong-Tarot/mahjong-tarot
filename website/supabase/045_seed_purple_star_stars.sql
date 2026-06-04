-- ============================================================
-- Mahjong Tarot: Purple Star (Zi Wei Dou Shu) star registry
-- Migration: 045_seed_purple_star_stars
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- SEED: public.purple_star_stars
-- One row per iztro star key (66 total). Loads the canonical
-- mapping of iztro keys to Bill's naming scheme: hanzi, pinyin,
-- kind, element, court role, and the display name plus its status
-- (locked | draft | resting | unnamed). Only "locked" names are
-- shown publicly; every other status falls back to pinyin + hanzi.
--
-- Idempotent and re-runnable: re-running refreshes every column
-- from the seed via ON CONFLICT (iztro_key) DO UPDATE.
-- ────────────────────────────────────────────────────────────

insert into public.purple_star_stars (iztro_key, hanzi, pinyin, bill_kind, element, court_role, name, name_status, legacy_alias) values
  ('impulsive', '火星', 'Huǒ Xīng', 'Major', null, null, null, 'unnamed', 'Fire Star'),
  ('advocator', '巨门', 'Jù Mén', 'Major', 'Yin Water', 'the spokesman / mouth', 'The Voice', 'draft', 'Great Door'),
  ('judge', '廉贞', 'Lián Zhēn', 'Major', 'Yin Fire', 'the standard / propriety', 'Righteous Moral Energy', 'draft', 'Pure Virtue'),
  ('spark', '铃星', 'Líng Xīng', 'Major', null, null, null, 'unnamed', 'Bell Star'),
  ('rebel', '破军', 'Pò Jūn', 'Major', 'Yin Water', 'the demolitionist', 'Vanguard', 'draft', 'Broken Army'),
  ('driven', '擎羊', 'Qíng Yáng', 'Major', null, null, null, 'unnamed', 'Sheep Star (Destruction)'),
  ('marshal', '七杀', 'Qī Shā', 'Major', 'Yin Metal', 'the commander', 'Marshal', 'draft', 'Seven Killings'),
  ('empress', '天府', 'Tiān Fǔ', 'Major', 'Yang Earth', 'the treasury / finance minister', 'Treasury', 'draft', 'Southern Star'),
  ('advisor', '天机', 'Tiān Jī', 'Major', 'Yin Wood', 'the workings/mechanism of the court', 'The Matrix', 'locked', 'Heavenly Secret'),
  ('sage', '天梁', 'Tiān Liáng', 'Major', 'Yang Earth', 'the sheltering beam', null, 'unnamed', 'Heavenly Roof-Beam'),
  ('fortunate', '天同', 'Tiān Tóng', 'Major', 'Yang Water', 'equilibrium / balance', null, 'resting', 'Heavenly Unity'),
  ('minister', '天相', 'Tiān Xiāng', 'Major', 'Yang Water', 'keeper of the seal', 'Prime Minister', 'draft', 'Heavenly Minister'),
  ('tangled', '陀罗', 'Tuó Luó', 'Major', null, null, null, 'unnamed', 'Hump-Back Star (Obstruction)'),
  ('sun', '太阳', 'Tài Yáng', 'Major', 'Yang Fire', 'the force / energy', 'The Sun', 'locked', 'Sun'),
  ('moon', '太阴', 'Tài Yīn', 'Major', 'Yin Water', 'the revenue collector', 'Moon', 'draft', 'Moon'),
  ('wolf', '贪狼', 'Tān Láng', 'Major', 'Yang Wood', 'desire / drive', null, 'unnamed', 'Greedy Wolf'),
  ('scholar', '文昌', 'Wén Chāng', 'Major', null, null, null, 'unnamed', 'Literary Star - Literature'),
  ('artist', '文曲', 'Wén Qū', 'Major', null, null, null, 'unnamed', 'Literary Star - Music'),
  ('general', '武曲', 'Wǔ Qū', 'Major', 'Yin Metal', 'the crystallizer / barrel', 'Barrel / Chamber', 'draft', 'Military Music'),
  ('emperor', '紫微', 'Zǐ Wēi', 'Major', 'Yin Earth', 'Emperor — the controlling will', 'Purple Star', 'locked', 'Purple Star'),
  ('fickle', '地劫', 'Dì Jié', 'Minor', null, null, null, 'unnamed', 'Earth Robbery'),
  ('ideologue', '地空', 'Dì Kōng', 'Minor', null, null, null, 'unnamed', 'Heavenly Void'),
  ('attractive', '红鸾', 'Hóng Luán', 'Minor', null, null, null, 'unnamed', 'Red Phoenix'),
  ('money', '禄存', 'Lù Cún', 'Minor', null, null, null, 'unnamed', 'Heavenly Store'),
  ('assistant', '天魁', 'Tiān Kuí', 'Minor', null, null, null, 'unnamed', 'Heavenly Leader'),
  ('horse', '天马', 'Tiān Mǎ', 'Minor', null, null, null, 'unnamed', 'Traveling Star'),
  ('serious', '天刑', 'Tiān Xíng', 'Minor', null, null, null, 'unnamed', 'Heavenly Punishment'),
  ('cheerful', '天喜', 'Tiān Xǐ', 'Minor', null, null, null, 'unnamed', 'Heavenly Happiness'),
  ('aide', '天钺', 'Tiān Yuè', 'Minor', null, null, null, 'unnamed', 'Heavenly Halberd'),
  ('social', '天姚', 'Tiān Yáo', 'Minor', null, null, null, 'unnamed', 'Heavenly Beauty'),
  ('helper', '右弼', 'Yòu Bì', 'Minor', null, null, null, 'unnamed', 'Right Assistant'),
  ('officer', '左辅', 'Zuǒ Fǔ', 'Minor', null, null, null, 'unnamed', 'Left Assistant'),
  ('dignified', '八座', 'Bā Zuò', 'Adjective', null, null, null, 'unnamed', null),
  ('refined', '凤阁', 'Fèng Gé', 'Adjective', null, null, null, 'unnamed', null),
  ('instigated', '蜚廉', 'Fēi Lián', 'Adjective', null, null, null, 'unnamed', null),
  ('awarded', '封诰', 'Fēng Gào', 'Adjective', null, null, null, 'unnamed', null),
  ('lonely', '寡宿', 'Guǎ Sù', 'Adjective', null, null, null, 'unnamed', null),
  ('alone', '孤辰', 'Gū Chén', 'Adjective', null, null, null, 'unnamed', null),
  ('religious', '华盖', 'Huá Gài', 'Adjective', null, null, null, 'unnamed', null),
  ('intercepted', '截路', 'Jié Lù', 'Adjective', null, null, null, 'unnamed', null),
  ('considery', '解神', 'Jiě Shén', 'Adjective', null, null, null, 'unnamed', null),
  ('bottomless', '空亡', 'Kōng Wáng', 'Adjective', null, null, null, 'unnamed', null),
  ('talented', '龙池', 'Lóng Chí', 'Adjective', null, null, null, 'unnamed', null),
  ('considery(Y)', '年解', 'Nián Jiě', 'Adjective', null, null, null, 'unnamed', null),
  ('broken', '破碎', 'Pò Suì', 'Adjective', null, null, null, 'unnamed', null),
  ('senior', '三台', 'Sān Tái', 'Adjective', null, null, null, 'unnamed', null),
  ('gourmet', '天厨', 'Tiān Chú', 'Adjective', null, null, null, 'unnamed', null),
  ('gifted', '天才', 'Tiān Cái', 'Adjective', null, null, null, 'unnamed', null),
  ('blessed', '天德', 'Tiān Dé', 'Adjective', null, null, null, 'unnamed', null),
  ('lucky', '天福', 'Tiān Fú', 'Adjective', null, null, null, 'unnamed', null),
  ('noble', '天贵', 'Tiān Guì', 'Adjective', null, null, null, 'unnamed', null),
  ('solemn', '天官', 'Tiān Guān', 'Adjective', null, null, null, 'unnamed', null),
  ('utopian', '天空', 'Tiān Kōng', 'Adjective', null, null, null, 'unnamed', null),
  ('upset', '天哭', 'Tiān Kū', 'Adjective', null, null, null, 'unnamed', null),
  ('ageless', '天寿', 'Tiān Shòu', 'Adjective', null, null, null, 'unnamed', null),
  ('wounded', '天伤', 'Tiān Shāng', 'Adjective', null, null, null, 'unnamed', null),
  ('heaven', '天使', 'Tiān Shǐ', 'Adjective', null, null, null, 'unnamed', null),
  ('psychic', '天巫', 'Tiān Wū', 'Adjective', null, null, null, 'unnamed', null),
  ('frail', '天虚', 'Tiān Xū', 'Adjective', null, null, null, 'unnamed', null),
  ('sickly', '天月', 'Tiān Yuè', 'Adjective', null, null, null, 'unnamed', null),
  ('honorable', '台辅', 'Tái Fǔ', 'Adjective', null, null, null, 'unnamed', null),
  ('passionate', '咸池', 'Xián Chí', 'Adjective', null, null, null, 'unnamed', null),
  ('fancied', '旬空', 'Xún Kōng', 'Adjective', null, null, null, 'unnamed', null),
  ('peaceful', '月德', 'Yuè Dé', 'Adjective', null, null, null, 'unnamed', null),
  ('gloomy', '阴煞', 'Yīn Shā', 'Adjective', null, null, null, 'unnamed', null),
  ('grateful', '恩光', 'Ēn Guāng', 'Adjective', null, null, null, 'unnamed', null)
on conflict (iztro_key) do update set hanzi=excluded.hanzi, pinyin=excluded.pinyin, bill_kind=excluded.bill_kind, element=excluded.element, court_role=excluded.court_role, name=excluded.name, name_status=excluded.name_status, legacy_alias=excluded.legacy_alias;
