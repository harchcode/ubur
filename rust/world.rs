use std::collections::HashMap;

use crate::{
    constants::{
        AM_SPAWN_DELAY, AM_SPAWN_R_MAX, AM_SPAWN_R_MIN, BULLET_AREA_RATIO, BULLET_SPEED,
        FAKE_NAME_LEN, FOOD_SPAWN_DELAY, FOOD_SPAWN_R_MAX, FOOD_SPAWN_R_MIN, MAX_SPHERE_COUNT,
        MAX_SPHERE_SPEED, SPHERE_COLOR_MAX, SPHERE_COLOR_MIN, STARTING_PLAYER_R,
        STARTING_PLAYER_R_RANDOMNESS, WORLD_SIZE,
    },
    pool::Pool,
    sphere::{Sphere, SphereType},
    utils::{darken_color, log, rand, rand_color, rand_int},
};

pub enum Command {
    Shoot(usize, f64, f64),
}

pub struct World {
    pub spheres: Pool<Sphere>,
    pub commands: Vec<Command>,
    food_spawn_counter: f64,
    am_spawn_counter: f64,
    is_fake_player_map: HashMap<usize, bool>,
    current_uid: usize,

    // mapping the name of spheres, for now
    // just use index for fake name
    pub name_map: HashMap<usize, usize>,
}

impl World {
    pub fn new() -> World {
        World {
            spheres: Pool::new(Sphere::zero, MAX_SPHERE_COUNT),
            commands: vec![],
            food_spawn_counter: 0.0,
            am_spawn_counter: 0.0,
            is_fake_player_map: HashMap::new(),
            current_uid: 0,
            name_map: HashMap::new(),
        }
    }

    pub fn init(&mut self) {
        for _ in 0..10 {
            self.spawn_am();
        }

        for _ in 0..500 {
            self.spawn_food();
        }

        for _ in 0..99 {
            let id = self.spawn_fake_player();
            self.is_fake_player_map.insert(id, true);
        }
    }

    pub fn increment_uid(&mut self) {
        if self.current_uid == usize::MAX {
            self.current_uid = 0;
        } else {
            self.current_uid += 1;
        }
    }

    pub fn update(&mut self, dt: f64) {
        // spawn food and am
        self.food_spawn_counter += dt;
        self.am_spawn_counter += dt;

        if self.food_spawn_counter >= FOOD_SPAWN_DELAY {
            self.food_spawn_counter -= FOOD_SPAWN_DELAY;

            if self.spheres.len() < MAX_SPHERE_COUNT {
                self.spawn_food();
            }
        }

        if self.am_spawn_counter >= AM_SPAWN_DELAY {
            self.am_spawn_counter -= AM_SPAWN_DELAY;

            if self.spheres.len() < MAX_SPHERE_COUNT {
                self.spawn_am();
            }
        }

        // handle commands
        for i in 0..self.commands.len() {
            let command = &self.commands[i];

            match *command {
                Command::Shoot(shooter_id, dirx, diry) => {
                    {
                        let shooter = self.spheres.get_mut(shooter_id);
                        shooter.shoot(dirx, diry);
                    }

                    {
                        self.spawn_bullet(shooter_id, dirx, diry);
                    }
                }
            }
        }
        self.commands.clear();

        // updates
        self.spheres.update();

        for id in self.spheres.alive_ids.iter() {
            let sphere = &mut self.spheres.objs[*id];

            sphere.update(dt);
        }

        // check collisions
        self.check_collision();

        // free spheres, or respawn fake player
        for i in 0..self.spheres.alive_ids.len() {
            let id = self.spheres.alive_ids[i];
            let sphere = &mut self.spheres.objs[id];

            if sphere.r <= 0.0 {
                if sphere.r#type == SphereType::PLAYER
                    && *self.is_fake_player_map.get(&id).unwrap_or(&false)
                {
                    self.respawn_fake_player(id);
                } else {
                    self.spheres.free(id);
                }
            }
        }
    }

    fn check_spawn_collision(&self, x: f64, y: f64, r: f64) -> bool {
        let n = self.spheres.alive_ids.len();

        for i in 0..n {
            let id = self.spheres.alive_ids[i];
            let s = &self.spheres.objs[id];

            let distance_sq = (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y);
            let r_total_sq = (s.r + r) * (s.r + r);

            if distance_sq <= r_total_sq {
                return true;
            }
        }

        return false;
    }

    pub fn spawn_food(&mut self) {
        let r = rand(FOOD_SPAWN_R_MIN, FOOD_SPAWN_R_MAX);
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);

        if self.check_spawn_collision(x, y, r) {
            return;
        }

        let color = rand_color(SPHERE_COLOR_MIN, SPHERE_COLOR_MAX);

        let (_, sphere) = self.spheres.obtain();
        sphere.set(x, y, 0.0, 0.0, r, color, SphereType::FOOD, self.current_uid);
        self.increment_uid();
    }

    pub fn spawn_am(&mut self) {
        let r = rand(AM_SPAWN_R_MIN, AM_SPAWN_R_MAX);
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);

        if self.check_spawn_collision(x, y, r) {
            return;
        }

        let (_, sphere) = self.spheres.obtain();
        sphere.set(x, y, 0.0, 0.0, r, 0, SphereType::AM, self.current_uid);
        self.increment_uid();
    }

    pub fn spawn_player(&mut self, _name: String) -> (usize, usize) {
        let mut x: f64;
        let mut y: f64;

        let r = rand(
            STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
            STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
        );

        loop {
            x = rand(r, WORLD_SIZE - r);
            y = rand(r, WORLD_SIZE - r);

            if !self.check_spawn_collision(x, y, r) {
                break;
            }
        }

        let color = rand_color(SPHERE_COLOR_MIN, SPHERE_COLOR_MAX);

        let speed = 0.0;
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        let vx = dirx * speed * sx;
        let vy = diry * speed * sy;

        let (id, sphere) = self.spheres.obtain();
        let uid = self.current_uid;
        sphere.set(x, y, vx, vy, r, color, SphereType::PLAYER, uid);

        self.increment_uid();

        return (id, uid);
    }

    pub fn spawn_fake_player(&mut self) -> usize {
        let mut x: f64;
        let mut y: f64;

        let r = rand(
            STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
            STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
        );

        loop {
            x = rand(r, WORLD_SIZE - r);
            y = rand(r, WORLD_SIZE - r);

            if !self.check_spawn_collision(x, y, r) {
                break;
            }
        }

        let color = rand_color(SPHERE_COLOR_MIN, SPHERE_COLOR_MAX);

        let speed = rand(1.0, MAX_SPHERE_SPEED * 0.9);
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        let vx = dirx * speed * sx;
        let vy = diry * speed * sy;

        let (id, sphere) = self.spheres.obtain();
        sphere.set(x, y, vx, vy, r, color, SphereType::PLAYER, self.current_uid);
        self.increment_uid();

        self.name_map
            .insert(id, rand_int(0, FAKE_NAME_LEN as i32) as usize);

        return id;
    }

    pub fn respawn_fake_player(&mut self, id: usize) {
        let mut x: f64;
        let mut y: f64;

        let r = rand(
            STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
            STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
        );

        loop {
            x = rand(r, WORLD_SIZE - r);
            y = rand(r, WORLD_SIZE - r);

            if !self.check_spawn_collision(x, y, r) {
                break;
            }
        }

        let prev = self.spheres.get_mut(id);

        prev.r = r;
        prev.x = x;
        prev.y = y;
        prev.color = rand_color(SPHERE_COLOR_MIN, SPHERE_COLOR_MAX);

        let speed = rand(1.0, MAX_SPHERE_SPEED * 0.9);
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        prev.vx = dirx * speed * sx;
        prev.vy = diry * speed * sy;

        if rand_int(0, 100) >= 90 {
            self.name_map
                .insert(id, rand_int(0, FAKE_NAME_LEN as i32) as usize);
        }
    }

    pub fn spawn_bullet(&mut self, shooter_id: usize, dirx: f64, diry: f64) {
        let shooter = self.spheres.get(shooter_id);

        let r = shooter.r * BULLET_AREA_RATIO;
        let x = shooter.x + dirx * (shooter.r - r);
        let y = shooter.y + diry * (shooter.r - r);
        let vx = dirx * BULLET_SPEED;
        let vy = diry * BULLET_SPEED;
        let color = darken_color(shooter.color, 0.75);

        let (_, sphere) = self.spheres.obtain();
        sphere.set(x, y, vx, vy, r, color, SphereType::BULLET, self.current_uid);
        sphere.set_shooter(shooter_id);

        self.increment_uid();
    }

    pub fn shoot(&mut self, id: usize, x: f64, y: f64) {
        let sphere = self.spheres.get_mut(id);

        if sphere.shoot_delay > 0.0 {
            return;
        };

        sphere.reset_shoot_delay();

        let len = f64::sqrt(x * x + y * y);
        let dirx = x / len;
        let diry = y / len;

        let command = Command::Shoot(id, dirx, diry);
        self.commands.push(command);
    }

    fn check_collision(&mut self) {
        let n = self.spheres.alive_ids.len();

        for i in 0..(n - 1) {
            for j in (i + 1)..n {
                let id1 = self.spheres.alive_ids[i];
                let id2 = self.spheres.alive_ids[j];

                let s1 = &self.spheres.objs[id1];
                let s2 = &self.spheres.objs[id2];

                if s1.shooter_id == Some(id2) || s2.shooter_id == Some(id1) {
                    continue;
                }

                let distance_sq = (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);
                let r_total_sq = (s1.r + s2.r) * (s1.r + s2.r);

                if distance_sq <= r_total_sq {
                    let (r1, r2) = World::handle_collision(s1, s2, distance_sq);

                    {
                        let s1 = &mut self.spheres.objs[id1];

                        s1.r = r1;
                    }

                    {
                        let s2 = &mut self.spheres.objs[id2];

                        s2.r = r2;
                    }
                }
            }
        }
    }

    fn handle_collision(s1: &Sphere, s2: &Sphere, distance_sq: f64) -> (f64, f64) {
        let bigger: &Sphere;
        let smaller: &Sphere;

        if s1.r > s2.r {
            bigger = s1;
            smaller = s2;
        } else {
            bigger = s2;
            smaller = s1;
        }

        if s1.r#type == SphereType::AM || s2.r#type == SphereType::AM {
            Sphere::melt(s1, s2, bigger, distance_sq)
        } else if (bigger.r#type == SphereType::FOOD || bigger.r#type == SphereType::BULLET)
            && smaller.r#type != SphereType::FOOD
            && smaller.r#type != SphereType::BULLET
        {
            Sphere::absorb(s1, s2, smaller, distance_sq)
        } else {
            Sphere::absorb(s1, s2, bigger, distance_sq)
        }
    }
}
