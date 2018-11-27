INSERT INTO public.role (id, role_type) VALUES (1, 'ROLE_ADMIN');
INSERT INTO public.role (id, role_type) VALUES (2, 'ROLE_PREMIUM_USER');
INSERT INTO public.role (id, role_type) VALUES (3, 'ROLE_REGULAR_USER');

INSERT INTO public.app_user (id, account_status_type, first_name, last_name, password, status_type, username, home_location_id) VALUES (-1, 'ACTIVE', 'Cristian', 'Macarie', '$2a$10$Lc8KKuppO1odH.mjhJ329.e7iwELC8HTVJUbEku0GfdQt7REYL3eK', 'AVAILABLE', 'macarc', null);
INSERT INTO public.app_user (id, account_status_type, first_name, last_name, password, status_type, username, home_location_id) VALUES (-2, 'ACTIVE', 'firstn1', 'lastn1', '$2a$10$Lc8KKuppO1odH.mjhJ329.e7iwELC8HTVJUbEku0GfdQt7REYL3eK', 'AVAILABLE', 'user1', null);
INSERT INTO public.app_user (id, account_status_type, first_name, last_name, password, status_type, username, home_location_id) VALUES (-3, 'ACTIVE', 'firstn2', 'lastn2', '$2a$10$Lc8KKuppO1odH.mjhJ329.e7iwELC8HTVJUbEku0GfdQt7REYL3eK', 'AVAILABLE', 'user2', null);

INSERT INTO public.app_user_roles (app_user_id, roles_id) VALUES (-1, 1);
INSERT INTO public.app_user_roles (app_user_id, roles_id) VALUES (-1, 2);
INSERT INTO public.app_user_roles (app_user_id, roles_id) VALUES (-1, 3);
INSERT INTO public.app_user_roles (app_user_id, roles_id) VALUES (-2, 2);
INSERT INTO public.app_user_roles (app_user_id, roles_id) VALUES (-3, 3);