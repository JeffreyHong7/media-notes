-- create table with reviews --
create table shows (IMDb_id varchar(15) primary key, title varchar(30), release_date date, watch_date date);
-- create table with reviews --
create table reviews (id serial primary key, rating int, review text, show_id varchar(15) unique, foreign key (show_id) references shows(IMDB_id));
-- default entry --
insert into shows values ('tt11239552', 'Itaewon Class', '2020-01-31', '2020-12-31');
insert into reviews (rating, review, show_id) values (10, 'My favorite show ever!', 'tt11239552');
-- check default entry --
select * from reviews inner join shows on show_id = IMDB_id;