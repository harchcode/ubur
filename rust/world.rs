use crate::{
    constants::{
        AM_SPAWN_DELAY, AM_SPAWN_R_MAX, AM_SPAWN_R_MIN, FOOD_SPAWN_DELAY, FOOD_SPAWN_R_MAX,
        FOOD_SPAWN_R_MIN, MAX_SPHERE_COUNT, MAX_SPHERE_R, MAX_SPHERE_SPEED, STARTING_PLAYER_R,
        STARTING_PLAYER_R_RANDOMNESS, WORLD_SIZE,
    },
    pool::Pool,
    sphere::{Sphere, SphereType},
    utils::{log, rand, rand_color, rand_int},
};

pub struct World {
    pub spheres: Pool<Sphere>,
    food_spawn_counter: f64,
    am_spawn_counter: f64,
}

impl World {
    pub fn new() -> World {
        World {
            spheres: Pool::new(Sphere::zero, 1000),
            food_spawn_counter: 0.0,
            am_spawn_counter: 0.0,
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
            self.spawn_fake_player();
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

        // updates
        self.spheres.update();

        for id in self.spheres.alive_ids.iter() {
            let sphere = &mut self.spheres.objs[*id];

            sphere.update(dt);
        }

        // check collisions
        self.check_collision();

        for i in 0..self.spheres.alive_ids.len() {
            let id = self.spheres.alive_ids[i];
            let sphere = &mut self.spheres.objs[id];

            if sphere.r <= 0.0 {
                self.spheres.free(id);
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

        let color = rand_color(0x66, 0xcc);

        let (_, sphere) = self.spheres.obtain();
        sphere.set(x, y, 0.0, 0.0, r, color, SphereType::FOOD);
    }

    pub fn spawn_am(&mut self) {
        let r = rand(AM_SPAWN_R_MIN, AM_SPAWN_R_MAX);
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);

        if self.check_spawn_collision(x, y, r) {
            return;
        }

        let (_, sphere) = self.spheres.obtain();
        sphere.set(x, y, 0.0, 0.0, r, 0, SphereType::AM);
    }

    pub fn spawn_player(&mut self) -> usize {
        let mut r: f64;
        let mut x: f64;
        let mut y: f64;

        loop {
            r = 250.0;
            x = rand(r, WORLD_SIZE - r);
            y = rand(r, WORLD_SIZE - r);

            if !self.check_spawn_collision(x, y, r) {
                break;
            }
        }

        let color = rand_color(0x66, 0xcc);

        let speed = 100.0;
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        let vx = dirx * speed * sx;
        let vy = diry * speed * sy;

        let (id, sphere) = self.spheres.obtain();
        sphere.set(x, y, vx, vy, r, color, SphereType::PLAYER);

        return id;
    }

    pub fn spawn_fake_player(&mut self) {
        let r = rand(
            STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
            STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
        );
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);

        if self.check_spawn_collision(x, y, r) {
            return;
        }

        let color = rand_color(0x66, 0xcc);

        let speed = rand(1.0, MAX_SPHERE_SPEED * 0.9);
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        let vx = dirx * speed * sx;
        let vy = diry * speed * sy;

        let (_, sphere) = self.spheres.obtain();
        sphere.set(x, y, vx, vy, r, color, SphereType::PLAYER);
    }

    pub fn respawn_fake_player(&mut self, id: usize) {
        let mut r: f64;
        let mut x: f64;
        let mut y: f64;

        loop {
            r = rand(
                STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
                STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
            );
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
        prev.color = rand_color(0x66, 0xcc);

        let speed = rand(1.0, MAX_SPHERE_SPEED * 0.9);
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        prev.vx = dirx * speed * sx;
        prev.vy = diry * speed * sy;
    }

    fn check_collision(&mut self) {
        let n = self.spheres.alive_ids.len();

        for i in 0..(n - 1) {
            for j in (i + 1)..n {
                let id1 = self.spheres.alive_ids[i];
                let id2 = self.spheres.alive_ids[j];

                let s1 = &self.spheres.objs[id1];
                let s2 = &self.spheres.objs[id2];

                let distance_sq = (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);
                let r_total_sq = (s1.r + s2.r) * (s1.r + s2.r);

                if distance_sq <= r_total_sq {
                    let (r1, r2) = World::handle_collision(s1, s2, distance_sq);

                    {
                        let s1 = &mut self.spheres.objs[id1];

                        s1.r = r1;

                        if r1 <= 0.0 && s1.r#type == SphereType::PLAYER {
                            self.respawn_fake_player(id1);
                        }
                    }

                    {
                        let s2 = &mut self.spheres.objs[id2];

                        s2.r = r2;

                        if r2 <= 0.0 && s2.r#type == SphereType::PLAYER {
                            self.respawn_fake_player(id2);
                        }
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
