use crate::{
    constants::MAX_SPHERE_R,
    sphere::{Sphere, SphereType},
    utils::{log, rand, rand_int},
};

pub struct World {
    pub spheres: Vec<Sphere>,
}

impl World {
    pub fn new() -> World {
        World { spheres: vec![] }
    }

    pub fn init(&mut self) {
        let tmp = [SphereType::PLAYER, SphereType::FOOD, SphereType::AM];

        for _ in 0..100 {
            let tmpt = tmp[rand_int(0, tmp.len() as i32) as usize];
            let tmpc = match tmpt {
                SphereType::AM => 0u32,
                SphereType::PLAYER => rand_int(0x666666, 0xa00000) as u32,
                SphereType::FOOD => rand_int(0x333333, 0x666666) as u32,
            };

            self.spheres.push(Sphere::new(
                rand(100.0, 800.0),
                rand(100.0, 800.0),
                rand(-50.0, 50.0),
                rand(-50.0, 50.0),
                rand(10.0, 20.0),
                tmpc,
                tmpt,
            ))
        }
    }

    pub fn update(&mut self, dt: f64) {
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
        } else if bigger.r#type == SphereType::FOOD && smaller.r#type != SphereType::FOOD {
            Sphere::absorb(s1, s2, smaller, distance_sq)
        } else {
            Sphere::absorb(s1, s2, bigger, distance_sq)
        }
    }
}
