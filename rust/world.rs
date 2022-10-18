use crate::{
    constants::{
        AM_SPAWN_DELAY, AM_SPAWN_R_MAX, AM_SPAWN_R_MIN, FOOD_SPAWN_DELAY, FOOD_SPAWN_R_MAX,
        FOOD_SPAWN_R_MIN, MAX_SPHERE_COUNT, MAX_SPHERE_R, MAX_SPHERE_SPEED, STARTING_PLAYER_R,
        STARTING_PLAYER_R_RANDOMNESS, WORLD_SIZE,
    },
    sphere::{Sphere, SphereType},
    utils::{log, rand, rand_int},
};

pub struct World {
    pub spheres: Vec<Sphere>,
    food_spawn_counter: f64,
    am_spawn_counter: f64,
}

impl World {
    pub fn new() -> World {
        World {
            spheres: vec![],
            food_spawn_counter: 0.0,
            am_spawn_counter: 0.0,
        }
    }

    pub fn init(&mut self) {
        self.spawn_player();

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

        // update spheres
        for sphere in self.spheres.iter_mut() {
            sphere.update(dt);
        }

        // check collisions
        self.check_collision();

        // cleanup
        for i in (0..self.spheres.len()).rev() {
            if self.spheres[i].r <= 1.0 {
                self.spheres.remove(i);
            }
        }
    }

    pub fn spawn_food(&mut self) {
        let r = rand(FOOD_SPAWN_R_MIN, FOOD_SPAWN_R_MAX);
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);
        let color = rand_int(0x333333, 0x666666) as u32;

        self.spheres
            .push(Sphere::new(x, y, 0.0, 0.0, r, color, SphereType::FOOD));
    }

    pub fn spawn_am(&mut self) {
        let r = rand(AM_SPAWN_R_MIN, AM_SPAWN_R_MAX);
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);

        self.spheres
            .push(Sphere::new(x, y, 0.0, 0.0, r, 0, SphereType::AM));
    }

    pub fn spawn_player(&mut self) -> &Sphere {
        let r = 20.0;
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);
        let color = rand_int(0x333333, 0x666666) as u32;

        let speed = 50.0;
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        let vx = dirx * speed * sx;
        let vy = diry * speed * sy;

        self.spheres
            .push(Sphere::new(x, y, vx, vy, r, color, SphereType::PLAYER));

        return &self.spheres[self.spheres.len() - 1];
    }

    pub fn spawn_fake_player(&mut self) {
        let r = rand(
            STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
            STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
        );
        let x = rand(r, WORLD_SIZE - r);
        let y = rand(r, WORLD_SIZE - r);
        let color = rand_int(0x333333, 0x666666) as u32;

        let speed = rand(1.0, MAX_SPHERE_SPEED * 0.9);
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        let vx = dirx * speed * sx;
        let vy = diry * speed * sy;

        self.spheres
            .push(Sphere::new(x, y, vx, vy, r, color, SphereType::PLAYER));
    }

    pub fn respawn_fake_player(&mut self, id: usize) {
        let prev = &mut self.spheres[id];

        let r = rand(
            STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
            STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS,
        );

        prev.r = r;
        prev.x = rand(r, WORLD_SIZE - r);
        prev.y = rand(r, WORLD_SIZE - r);
        prev.color = rand_int(0x333333, 0x666666) as u32;

        let speed = rand(1.0, MAX_SPHERE_SPEED * 0.9);
        let dirx = rand(0.0, 1.0);
        let diry = f64::sqrt(1.0 - dirx);

        let sx = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };
        let sy = if rand_int(0, 2) == 0 { -1.0 } else { 1.0 };

        prev.vx = dirx * speed * sx;
        prev.vy = diry * speed * sy;
    }

    fn check_collision(&mut self) {
        let n = self.spheres.len();

        for i in 0..(n - 1) {
            for j in (i + 1)..n {
                let s1 = &self.spheres[i];
                let s2 = &self.spheres[j];

                let distance_sq = (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);
                let r_total_sq = (s1.r + s2.r) * (s1.r + s2.r);

                if distance_sq <= r_total_sq {
                    (self.spheres[i].r, self.spheres[j].r) =
                        World::handle_collision(s1, s2, distance_sq);

                    if self.spheres[i].r <= 0.0 && self.spheres[i].r#type == SphereType::PLAYER {
                        self.respawn_fake_player(i);
                    }

                    if self.spheres[j].r <= 0.0 && self.spheres[j].r#type == SphereType::PLAYER {
                        self.respawn_fake_player(j);
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
