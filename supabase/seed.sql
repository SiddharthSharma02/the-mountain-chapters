-- =========================================================
-- The Mountain Chapters — Sample Seed Data
-- Run this AFTER schema.sql. Safe to re-run (uses ON CONFLICT).
-- =========================================================

insert into public.destinations (name, slug, state, tagline, description, cover_image, is_popular, sort_order)
values
  ('Narkanda', 'narkanda', 'Himachal Pradesh', 'Apple orchards & pine forests', 'A quiet hill town known for its apple orchards, pine forests and views of the Sutlej valley.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop', true, 1),
  ('Sangla Valley', 'sangla-valley', 'Himachal Pradesh', 'Gateway to Kinnaur', 'A lush green valley along the Baspa river, gateway to the Kinnaur region.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', true, 2),
  ('Spiti Valley', 'spiti-valley', 'Himachal Pradesh', 'Cold desert mountains', 'A cold desert mountain valley dotted with ancient monasteries and stark landscapes.', 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop', true, 3),
  ('Chitkul', 'chitkul', 'Himachal Pradesh', 'Last village before the border', 'The last inhabited village near the Indo-Tibet border, known for its serene beauty.', 'https://images.unsplash.com/photo-1600100397608-59c0a9f7e73f?q=80&w=1200&auto=format&fit=crop', true, 4),
  ('Kalpa', 'kalpa', 'Himachal Pradesh', 'Views of Kinner Kailash', 'Perched above Reckong Peo with stunning views of the Kinner Kailash range.', 'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?q=80&w=1200&auto=format&fit=crop', true, 5),
  ('Tabo', 'tabo', 'Himachal Pradesh', 'Ajanta of the Himalayas', 'Home to the 1000-year-old Tabo Monastery, one of the oldest in the Himalayas.', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=1200&auto=format&fit=crop', false, 6),
  ('Kaza', 'kaza', 'Himachal Pradesh', 'Heart of Spiti', 'The sub-divisional headquarters of Spiti, a base for exploring the valley.', 'https://images.unsplash.com/photo-1600202605226-cd76aa2318e6?q=80&w=1200&auto=format&fit=crop', false, 7)
on conflict (slug) do nothing;

insert into public.stays (destination_id, name, slug, description, address, price_per_night, rating, review_count, cover_image, images, amenities, is_featured)
select d.id, v.name, v.slug, v.description, v.address, v.price, v.rating, v.review_count, v.cover_image, v.images, v.amenities, v.is_featured
from (values
  ('narkanda', 'The Morel House', 'the-morel-house', 'A boutique cottage nestled in a pine forest with panoramic valley views.', 'Narkanda, Himachal Pradesh', 4500.00, 4.9, 120, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1200&auto=format&fit=crop'], array['WiFi','Bonfire','Mountain View','Breakfast Included'], true),
  ('narkanda', 'The Halt Narkanda - Rooms & Rooftop Cafe', 'the-halt-narkanda', 'Cozy rooms with a rooftop cafe overlooking the apple orchards.', 'Narkanda, Himachal Pradesh', 3200.00, 4.8, 95, 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1518733057094-95b53143d2a7?q=80&w=1200&auto=format&fit=crop'], array['WiFi','Cafe','Parking'], true),
  ('narkanda', 'Gadegal Homestay', 'gadegal-homestay', 'A family-run homestay offering authentic Himachali hospitality.', 'Gadegal, Narkanda', 2500.00, 4.9, 66, 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1200&auto=format&fit=crop'], array['Home Cooked Meals','Bonfire','Mountain View'], true)
) as v(dest_slug, name, slug, description, address, price, rating, review_count, cover_image, images, amenities, is_featured)
join public.destinations d on d.slug = v.dest_slug
on conflict (slug) do nothing;

insert into public.experiences (title, slug, description, icon, sort_order)
values
  ('Trekking & Hiking', 'trekking-hiking', 'Guided treks through pine forests and alpine meadows.', '🥾', 1),
  ('Off-road Adventures', 'off-road-adventures', 'Thrilling off-road drives through mountain passes.', '🚙', 2),
  ('Camping Under Stars', 'camping-under-stars', 'Riverside and high-altitude camping experiences.', '⛺', 3),
  ('Village Walks', 'village-walks', 'Explore local Himachali villages and their way of life.', '🚶', 4),
  ('Local Food Experiences', 'local-food-experiences', 'Taste authentic Himachali cuisine with local families.', '🍲', 5),
  ('Bonfire Evenings', 'bonfire-evenings', 'Cozy evenings around a bonfire under the stars.', '🔥', 6)
on conflict (slug) do nothing;

insert into public.road_trip_chapters (title, slug, description, step_number, cover_image, distance_km, duration_days, route)
values
  ('Weekend Escape', 'weekend-escape', 'A quick 2-day escape from Chandigarh to Narkanda and back.', 1, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', 240, 2, '[{"name":"Chandigarh"},{"name":"Shimla"},{"name":"Narkanda"}]'),
  ('Apple Country Drive', 'apple-country-drive', 'Drive through the apple orchards of Kotgarh and Thanedar.', 2, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=1200&auto=format&fit=crop', 180, 3, '[{"name":"Shimla"},{"name":"Kotgarh"},{"name":"Thanedar"},{"name":"Narkanda"}]'),
  ('Spiti Expedition', 'spiti-expedition', 'The classic Spiti circuit through some of the highest motorable roads.', 3, 'https://images.unsplash.com/photo-1585116938581-e1cbb0e46acb?q=80&w=1200&auto=format&fit=crop', 650, 7, '[{"name":"Shimla"},{"name":"Sangla"},{"name":"Kalpa"},{"name":"Tabo"},{"name":"Kaza"}]'),
  ('Hidden Villages Trail', 'hidden-villages-trail', 'Discover offbeat villages tucked away in the Kinnaur valley.', 4, 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format&fit=crop', 320, 4, '[{"name":"Sangla"},{"name":"Chitkul"},{"name":"Rakcham"}]')
on conflict (slug) do nothing;

insert into public.gallery_images (image_url, caption, category, sort_order)
values
  ('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop', 'Sunrise over Narkanda', 'Landscapes', 1),
  ('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', 'Sangla Valley in monsoon', 'Landscapes', 2),
  ('https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop', 'Spiti cold desert', 'Landscapes', 3),
  ('https://images.unsplash.com/photo-1600100397608-59c0a9f7e73f?q=80&w=1200&auto=format&fit=crop', 'Chitkul village', 'Villages', 4),
  ('https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?q=80&w=1200&auto=format&fit=crop', 'Kinner Kailash range', 'Landscapes', 5),
  ('https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1200&auto=format&fit=crop', 'A stay in the pines', 'Stays', 6)
on conflict do nothing;

insert into public.map_routes (name, description, points, sort_order)
values
  ('Classic Kinnaur-Spiti Circuit', 'The most popular Himalayan road trip route.', '[{"name":"Chandigarh"},{"name":"Shimla"},{"name":"Narkanda"},{"name":"Sarahan"},{"name":"Sangla"},{"name":"Kalpa"},{"name":"Tabo"},{"name":"Kaza"}]', 1)
on conflict do nothing;

-- =========================================================
-- Sample travel story (requires a real auth user id — replace before running,
-- or skip this block and let customers submit stories via the site).
-- =========================================================
-- insert into public.travel_stories (submitted_by, author_name, title, slug, content, cover_image, status)
-- values ('<auth-user-id>', 'A. Traveller', 'Best Sunrise Points in Himachal', 'best-sunrise-points-in-himachal', 'Full story content here...', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop', 'approved');
