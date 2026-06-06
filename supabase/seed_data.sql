-- Seed data for community app

-- NOTE: The seeded profile IDs must exist in auth.users if you are enforcing the foreign key.
-- Use the service role key or Supabase CLI in the database context to run this seed file.

insert into auth.users (id, email, is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data)
values
('11111111-1111-1111-1111-111111111111', 'alice@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('22222222-2222-2222-2222-222222222222', 'brad@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('33333333-3333-3333-3333-333333333333', 'monica@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('44444444-4444-4444-4444-444444444444', 'sam@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('55555555-5555-5555-5555-555555555555', 'taylor@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('66666666-6666-6666-6666-666666666666', 'nina@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('77777777-7777-7777-7777-777777777777', 'ben@example.com', false, false, '{}'::jsonb, '{}'::jsonb),
('88888888-8888-8888-8888-888888888888', 'keisha@example.com', false, false, '{}'::jsonb, '{}'::jsonb);

insert into profiles (id, username, full_name, avatar_url, website, bio, role)
values
('11111111-1111-1111-1111-111111111111', 'alice', 'Alice Johnson', 'https://example.com/avatar-alice.png', 'https://alice.example.com', 'Community organizer and event host.', 'admin'),
('22222222-2222-2222-2222-222222222222', 'brad', 'Brad Kim', 'https://example.com/avatar-brad.png', 'https://brad.example.com', 'Member interested in networking and learning.', 'member'),
('33333333-3333-3333-3333-333333333333', 'monica', 'Monica Rivera', 'https://example.com/avatar-monica.png', 'https://monica.example.com', 'Events coordinator and local meetup curator.', 'member'),
('44444444-4444-4444-4444-444444444444', 'sam', 'Samir Patel', 'https://example.com/avatar-samir.png', 'https://samir.example.com', 'Volunteer organizer focused on workshops and panels.', 'member'),
('55555555-5555-5555-5555-555555555555', 'taylor', 'Taylor Brooks', 'https://example.com/avatar-taylor.png', 'https://taylor.example.com', 'Community strategist and content lead.', 'member'),
('66666666-6666-6666-6666-666666666666', 'nina', 'Nina Flores', 'https://example.com/avatar-nina.png', 'https://nina.example.com', 'Local educator running mentorship programs.', 'member'),
('77777777-7777-7777-7777-777777777777', 'ben', 'Ben Lawson', 'https://example.com/avatar-ben.png', 'https://ben.example.com', 'Tech meetup host and workshop facilitator.', 'member'),
('88888888-8888-8888-8888-888888888888', 'keisha', 'Keisha Moore', 'https://example.com/avatar-keisha.png', 'https://keisha.example.com', 'Community advocate for inclusive events.', 'member');

insert into categories (id, name, description)
values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Social', 'Light social gatherings, networking, and community meetups.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Workshop', 'Hands-on learning sessions and collaborative workshops.'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Panel', 'Panel discussions with guest speakers and Q&A.'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hackathon', 'Fast-paced building events and product sprints.'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Webinar', 'Online learning sessions and live presentations.'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Outdoors', 'Outdoor experiences and community excursions.'),
('99999999-9999-9999-9999-999999999999', 'Mentorship', 'Small-group mentorship and coaching sessions.');

insert into events (id, owner_id, title, description, starts_at, ends_at, location, capacity, is_public, metadata)
values
('11111111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'Community Welcome Meetup', 'An informal meetup for new community members to say hello and share goals.', '2026-07-10T18:00:00Z', '2026-07-10T20:00:00Z', 'Main Hall', 60, true, '{"notes": "Bring your favorite community project ideas."}'::jsonb),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Project Brainstorm Session', 'Collaborate on ideas for upcoming community projects.', '2026-07-15T19:00:00Z', '2026-07-15T21:00:00Z', 'Conference Room B', 30, true, '{"notes": "Whiteboards and sticky notes provided."}'::jsonb),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Volunteer Planning Circle', 'Monthly volunteer planning meeting for community leads.', '2026-07-20T18:30:00Z', '2026-07-20T20:00:00Z', 'Community Center Lounge', 40, true, '{"notes": "Open to volunteers and coordinators."}'::jsonb),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Design Sprint', 'Rapid design sprint to shape the next community workshop.', '2026-07-22T13:00:00Z', '2026-07-22T17:00:00Z', 'Studio 3', 20, false, '{"notes": "Invite-only planning session."}'::jsonb),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Remote Webinar: Community Growth', 'A live webinar on building and growing community engagement online.', '2026-07-25T16:00:00Z', '2026-07-25T17:30:00Z', 'Online', 200, true, '{"video_link": "https://example.com/webinar"}'::jsonb),
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Mentor Mixer', 'Small-group mentoring session for early-stage organizers.', '2026-07-28T18:00:00Z', '2026-07-28T20:00:00Z', 'Room 104', 16, true, '{"focus": "peer feedback"}'::jsonb),
('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'Outdoor Community Walk', 'A neighborhood walk to connect with members and discuss local initiatives.', '2026-07-30T09:30:00Z', '2026-07-30T11:00:00Z', 'City Park Pavilion', 50, true, '{"weather": "Bring water and sunscreen."}'::jsonb),
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Panel: Inclusive Event Design', 'A moderated panel featuring community leaders on inclusive programming.', '2026-08-03T17:00:00Z', '2026-08-03T19:00:00Z', 'Auditorium', 80, true, '{"speakers": ["Nina Flores", "Samir Patel", "Keisha Moore"]}'::jsonb);

insert into event_categories (event_id, category_id)
values
('11111111-aaaa-1111-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999'),
('77777777-7777-7777-7777-777777777777', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

insert into rsvps (event_id, profile_id, status)
values
('11111111-aaaa-1111-aaaa-111111111111', '22222222-2222-2222-2222-222222222222', 'attending'),
('11111111-aaaa-1111-aaaa-111111111111', '33333333-3333-3333-3333-333333333333', 'interested'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'attending'),
('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'interested'),
('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'attending'),
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'interested'),
('66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 'attending'),
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'attending');
