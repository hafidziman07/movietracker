-- =====================================================
-- MovieTracker — Data film demo
-- Jalankan SETELAH sql/schema.sql
-- =====================================================
insert into movies (judul, tahun_rilis, genre, durasi, rating_umur, deskripsi, poster_url) values
('Avengers: Endgame', 2019, 'Action', 181, '13+', 'Para Avengers yang tersisa berusaha membalikkan kehancuran yang ditimbulkan Thanos.', 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg'),
('Inception', 2010, 'Sci-Fi', 148, '13+', 'Seorang pencuri yang menyusup ke dalam mimpi untuk mencuri rahasia mendapat misi terbalik: menanamkan ide.', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'),
('Interstellar', 2014, 'Sci-Fi', 169, '13+', 'Sebuah tim penjelajah melakukan perjalanan melalui wormhole demi mencari rumah baru bagi umat manusia.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'),
('The Dark Knight', 2008, 'Action', 152, '13+', 'Batman menghadapi musuh terbesarnya, Joker, yang ingin melihat Gotham jatuh ke dalam kekacauan.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
('Parasite', 2019, 'Drama', 132, '17+', 'Keluarga miskin yang menembus rumah keluarga kaya menemukan rahasia gelap yang tak terduga.', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'),
('Your Name', 2016, 'Animation', 106, '13+', 'Seorang siswa SMA di Tokyo dan seorang gadis di pedesaan tiba-tiba bertukar tubuh tanpa alasan.', 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg'),
('Laskar Pelangi', 2008, 'Drama', 124, '13+', 'Kisah sepuluh anak Belitung yang berjuang meraih pendidikan di sekolah Muhammadiyah yang hampir bubar.', 'https://image.tmdb.org/t/p/w500/nmUuVKQTRV1ZRkfeOZ4pS1O7TdL.jpg'),
('Dilan 1990', 2018, 'Romance', 115, '13+', 'Kisah cinta remaja antara Dilan, anggota geng motor, dan Milea yang baru pindah ke Bandung.', 'https://image.tmdb.org/t/p/w500/yQTHzyyCsjTVUDeMDBQiwQoqF2x.jpg')
on conflict do nothing;
